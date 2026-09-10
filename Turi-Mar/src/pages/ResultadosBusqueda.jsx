import { useState } from "react";
import "./Dashboard.css";
import RealMap from "../components/dashboard/RealMap";

// Pantalla de resultados de una guía: lista, filtros, mapa visual y ficha.
export default function ResultadosBusqueda({
  guide,
  locationsByGuide,
  resultImages,
  resultDescriptions,
  resultFilters,
  onBack,
}) {
  // Busca los lugares de la guía actual; si no existe, usa una lista vacía.
  // Obtiene los lugares asociados con la guía seleccionada.
  const locations = locationsByGuide[guide.title] ?? [];

  // Lugar que aparece seleccionado inicialmente en el mapa y en la ficha.
  const [activeLocation, setActiveLocation] = useState(locations[0]);

  // Solo una pestaña de ciudad puede estar activa a la vez.
  const [activeTab, setActiveTab] = useState("Todos");

  // Controla el estado visual de los filtros secundarios.
  const [activeFilter, setActiveFilter] = useState("Más recomendados");
  // Selecciona imágenes y filtros según la categoría actual.
  const images = resultImages[guide.title] ?? resultImages["Plan de Ruta"];
  const extraFilters = resultFilters[guide.title] ?? ["Más recomendados", "Más cercanos"];

  // Filtra la lista según la ciudad seleccionada.
  const visibleLocations = locations.filter((location) => {
    if (activeTab === "Chimbote") return !location.address.toLowerCase().includes("nuevo");
    if (activeTab === "Nuevo Chimbote") return location.address.toLowerCase().includes("nuevo");
    return true;
  });

  // Renderiza el panel lateral y el mapa de resultados.
  return (
    <div className="locations-screen">
      <aside className="locations-list">
        <div className="locations-top">
          <button className="locations-back" onClick={onBack}>← Volver al lobby turístico</button>
          <span>{locations.length} disponibles</span>
        </div>
        <div className="results-search">⌕ <span>{guide.title}</span><b>×</b></div>
        <div className="results-heading">
          <div>
            <h2>Resultados de {guide.title}</h2>
            <p>{resultDescriptions[guide.title] ?? "Explora opciones seleccionadas para tu próxima ruta."}</p>
          </div>
          <span className="verified-count">✓ {locations.length} verificados</span>
        </div>
        <div className="location-tabs">
          {["Todos", "Chimbote", "Nuevo Chimbote"].map((tab) => (
            <button className={activeTab === tab ? "selected" : ""} key={tab} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>
        <div className="location-filters">
          {extraFilters.map((filter) => (
            <button className={activeFilter === filter ? "selected" : ""} key={filter} onClick={() => setActiveFilter(filter)}>
              {filter === "Más recomendados" ? "★ " : filter === "Más cercanos" ? "⌖ " : ""}{filter}
            </button>
          ))}
        </div>
        <div className="location-cards">
          {visibleLocations.length === 0 ? (
            <div className="empty-results">
              <strong>No hay resultados en esta zona</strong>
              <span>Prueba con otra ubicación para ver los lugares disponibles.</span>
            </div>
          ) : visibleLocations.map((location) => {
            const locationIndex = locations.indexOf(location);
            return (
              <button
                className={`location-card ${activeLocation?.name === location.name ? "active" : ""}`}
                key={location.name}
                onClick={() => setActiveLocation(location)}
              >
                <span className="location-photo">
                  <img src={images[locationIndex % images.length]} alt="" />
                  <em>{location.type}</em>
                </span>
                <span className="location-copy">
                  <strong>{location.name}</strong>
                  <small>★ {location.rating} · {location.type}</small>
                  <small>⌖ {location.address}</small>
                  <span className="location-price">
                    <b>{location.price}</b>
                    <i>{locationIndex === 0 ? "650 m" : locationIndex === 1 ? "1.2 km" : "A 3 cuadras"}</i>
                  </span>
                </span>
                <span className="location-direction">⌖</span>
              </button>
            );
          })}
        </div>
      </aside>
      <main className="locations-map">
        <RealMap
          locations={locations}
          activeLocation={activeLocation}
          onSelectLocation={setActiveLocation}
          onToggleLocation={() => {}}
        />
        {activeLocation && (
          <section className="location-detail">
            <button className="close-detail" onClick={onBack}>×</button>
            <span className="detail-photo">{activeLocation.icon}</span>
            <div>
              <h3>{activeLocation.name} <small>★ {activeLocation.rating}</small></h3>
              <p>{activeLocation.address}</p>
              <b>{activeLocation.price}</b>
              <p className="detail-meta">A 650 m · 7 min a pie</p>
            </div>
            <button
              className="navigate-button"
              onClick={() => window.open("https://www.google.com/maps/dir/?api=1&destination=-9.075,-78.594", "_blank")}
            >
              ⌖ Iniciar navegación
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
