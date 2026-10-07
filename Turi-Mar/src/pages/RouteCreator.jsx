import { useState } from "react";
import RealMap from "../components/dashboard/RealMap";
import { supabase } from "../supabaseClient";
import { crearRutaComunidad } from "../services/routeService";

const categories = [
  ["cultural", "Cultura y miradores"],
  ["playa", "Playas y caletas"],
  ["marina", "Paseos en lancha"],
  ["gastronomia", "Gastronomía"],
];

export default function RouteCreator({ onBack, routeError }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("cultural");
  const [stopName, setStopName] = useState("");
  const [stopNote, setStopNote] = useState("");
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [points, setPoints] = useState([]);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  const mapLocations = [
    ...points.map((point, index) => ({
      name: point.name,
      address: point.comment || `Parada ${index + 1}`,
      latitude: point.latitude,
      longitude: point.longitude,
    })),
    ...(selectedPosition ? [{
      name: stopName.trim() || "Nueva parada",
      address: "Punto seleccionado",
      latitude: selectedPosition.latitude,
      longitude: selectedPosition.longitude,
    }] : []),
  ];
  const routeLine = points.map(({ latitude, longitude }) => [latitude, longitude]);

  const selectPosition = (latitude, longitude) => {
    setSelectedPosition({ latitude, longitude });
    setFeedback("");
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setFeedback("Este navegador no permite obtener tu ubicación.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => selectPosition(coords.latitude, coords.longitude),
      () => setFeedback("No se pudo obtener tu ubicación. Revisa el permiso de GPS."),
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  const addPoint = () => {
    if (!selectedPosition) {
      setFeedback("Selecciona primero el punto en el mapa.");
      return;
    }
    if (!stopName.trim()) {
      setFeedback("Escribe el nombre de la parada.");
      return;
    }

    setPoints((current) => [...current, {
      name: stopName.trim(),
      comment: stopNote.trim(),
      ...selectedPosition,
    }]);
    setStopName("");
    setStopNote("");
    setSelectedPosition(null);
    setFeedback("");
  };

  const publishRoute = async () => {
    if (!title.trim()) {
      setFeedback("Escribe el nombre de la ruta.");
      return;
    }
    if (points.length < 2) {
      setFeedback("Agrega al menos dos paradas para publicar.");
      return;
    }

    setSaving(true);
    setFeedback("");
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (!user) throw new Error("Inicia sesión para publicar una ruta.");

      await crearRutaComunidad({
        usuario_id: user.id,
        titulo_ruta: title.trim(),
        descripcion: points.map((point) => point.comment).filter(Boolean).join(" "),
        categoria: category,
        duracion_total_horas: Math.max(1, Number((points.length * 35 / 60).toFixed(2))),
        presupuesto_total_estimado: points.length * 12,
      }, points);

      setTitle("");
      setCategory("cultural");
      setPoints([]);
      setFeedback("Ruta publicada correctamente.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo publicar la ruta.";
      setFeedback(message.includes("prepared statement")
        ? "La base de datos del servidor está fallando. El backend debe corregir la conexión antes de guardar rutas."
        : `No se pudo publicar la ruta: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="route-create-page">
      <header className="route-create-header">
        <button type="button" onClick={onBack}>← Volver</button>
        <span>TURI-MAR / RUTAS</span>
      </header>

      <div className="route-create-heading">
        <div>
          <p>PLANIFICA TU RECORRIDO</p>
          <h1>Crear ruta</h1>
          <span>Selecciona los lugares que quieres visitar y ordénalos en el mapa.</span>
        </div>
        <strong>{points.length} paradas</strong>
      </div>

      <div className="route-create-layout">
        <section className="route-create-map" aria-label="Mapa para seleccionar paradas">
          <div className="route-create-map-label">CHIMBOTE · SELECCIONA UNA UBICACIÓN</div>
          <RealMap
            locations={mapLocations}
            routeLine={routeLine}
            showToolbar={false}
            showUserMarker={false}
            requestUserLocation={false}
            onMapClick={selectPosition}
          />
        </section>

        <section className="route-create-form" aria-label="Datos de la ruta">
          <label>
            Nombre de la ruta
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Tarde junto a la bahía" maxLength={100} />
          </label>
          <label>
            Categoría
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>

          <div className="route-create-stop-editor">
            <div className="route-create-section-title">
              <strong>Nueva parada</strong>
              <button type="button" onClick={useCurrentLocation}>Usar mi ubicación</button>
            </div>
            <p>Haz clic en el mapa para marcarla.</p>
            <label>
              Lugar
              <input value={stopName} onChange={(event) => setStopName(event.target.value)} placeholder="Nombre del lugar" maxLength={100} />
            </label>
            <label>
              Nota <small>(opcional)</small>
              <input value={stopNote} onChange={(event) => setStopNote(event.target.value)} placeholder="Qué hacer o cómo llegar" maxLength={240} />
            </label>
            {selectedPosition && (
              <small className="route-create-coordinates">
                {selectedPosition.latitude.toFixed(6)}, {selectedPosition.longitude.toFixed(6)}
              </small>
            )}
            <button type="button" className="route-add-stop" onClick={addPoint}>＋ Añadir parada</button>
          </div>

          <div className="route-create-stops">
            <div className="route-create-section-title">
              <strong>Paradas</strong>
              <span>{points.length} / 2 mín.</span>
            </div>
            {points.length ? points.map((point, index) => (
              <div className="route-create-stop" key={`${point.latitude}-${point.longitude}-${index}`}>
                <b>{String(index + 1).padStart(2, "0")}</b>
                <div><strong>{point.name}</strong><small>{point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}</small></div>
                <button type="button" aria-label={`Quitar ${point.name}`} onClick={() => setPoints((current) => current.filter((_, pointIndex) => pointIndex !== index))}>×</button>
              </div>
            )) : <p className="route-create-empty">Aún no agregaste paradas.</p>}
          </div>

          {(feedback || routeError) && <p className="route-create-feedback" role="status">{feedback || routeError}</p>}
          <button type="button" className="route-publish" onClick={publishRoute} disabled={saving || points.length < 2}>
            {saving ? "Publicando…" : "Publicar ruta"}
          </button>
          {points.length < 2 && <small className="route-create-hint">Agrega dos paradas para habilitar la publicación.</small>}
        </section>
      </div>
    </main>
  );
}