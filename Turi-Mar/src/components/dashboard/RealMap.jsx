import { useEffect, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
  ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const CHIMBOTE_CENTER = [-9.075, -78.594];

function MapPositionController({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 14, { duration: 1.2 });
    }
  }, [map, position]);

  return null;
}

function getLocationPosition(location, index) {
  if (location.latitude && location.longitude) {
    return [location.latitude, location.longitude];
  }

  // Posiciones temporales hasta registrar las coordenadas reales de cada lugar.
  return [
    CHIMBOTE_CENTER[0] + (index - 1) * 0.006,
    CHIMBOTE_CENTER[1] + (index - 1) * 0.008,
  ];
}

export default function RealMap({
  locations = [],
  activeLocation,
  onSelectLocation = () => {},
  showToolbar = true,
  locationEnabled = true,
  onToggleLocation = () => {},
}) {
  const [userPosition, setUserPosition] = useState(null);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    if (!locationEnabled) {
      setUserPosition(null);
      setLocationError("");
      return undefined;
    }

    if (!navigator.geolocation) {
      setLocationError("Tu navegador no permite obtener la ubicación.");
      return undefined;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserPosition([coords.latitude, coords.longitude]);
        setLocationError("");
      },
      () => setLocationError("Activa el permiso de ubicación para mostrarte en el mapa."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, [locationEnabled]);

  const center = userPosition ?? CHIMBOTE_CENTER;

  return (
    <div className="real-map-wrapper">
      {locationEnabled ? (
        <MapContainer
          center={center}
          zoom={13}
          zoomControl={false}
          className="real-map"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomControl position="topright" />
          <MapPositionController position={userPosition} />

          {userPosition && (
            <CircleMarker
              center={userPosition}
              radius={9}
              pathOptions={{ color: "#ffffff", weight: 3, fillColor: "#087eaa", fillOpacity: 1 }}
            >
              <Popup>Tu ubicación actual</Popup>
            </CircleMarker>
          )}

          {locations.map((location, index) => {
            const position = getLocationPosition(location, index);
            const isActive = activeLocation?.name === location.name;

            return (
              <CircleMarker
                key={location.name}
                center={position}
                radius={isActive ? 11 : 8}
                pathOptions={{
                  color: "#ffffff",
                  weight: 2,
                  fillColor: isActive ? "#e35d24" : "#087eaa",
                  fillOpacity: 1,
                }}
                eventHandlers={{ click: () => onSelectLocation(location) }}
              >
                <Popup>
                  <strong>{location.name}</strong>
                  <br />
                  {location.address}
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      ) : (
        <div className="location-paused">
          <div className="location-paused-icon">⌁</div>
          <div>
            <strong>Ubicación en Pausa</strong>
            <p>Explora la información de la bahía y activa tu GPS para navegar en vivo con tus rutas a pie o en combi.</p>
          </div>
          <button onClick={onToggleLocation}>◉ Reactivar Navegación GPS</button>
        </div>
      )}
      {showToolbar && (
        <div className="real-map-toolbar">
          <span className="real-map-destination">
            ● Destino: {activeLocation?.name ?? "Selecciona un lugar"}
          </span>
          {locationError && <small>{locationError}</small>}
          {!userPosition && !locationError && <small>Solicitando tu ubicación...</small>}
        </div>
      )}
    </div>
  );
}
