import { useMemo, useState } from "react";
import "./Dashboard.css";
import RealMap from "../components/dashboard/RealMap";

// Categorías que el usuario puede seleccionar para filtrar las rutas.
const routeCategories = [
  "Todas",
  "🐟 Huariques & Cebiche",
  "⛵ Paseos en Lancha",
  "🏖️ Playas & Caletas",
  "🏛️ Cultura & Miradores",
];

// Datos temporales de las rutas creadas por la comunidad.
// Más adelante este arreglo puede reemplazarse por información de Supabase.
const communityRoutes = [
  {
    author: "Carlos M.",
    avatar: "CM",
    title: "Ruta Bahía, Sabor y Caleta Artesanal",
    rating: "4.9",
    votes: 86,
    comments: 18,
    category: "🐟 Huariques & Cebiche",
    duration: "3h 45m",
    budget: "S/ 85.00",
    steps: [
      { icon: "1", name: "Muelle Malecón Grau" },
      { icon: "2", name: "Hostal Dos Flamingos" },
      { icon: "3", name: "Cebichería El Cevichón" },
      { icon: "4", name: "Caleta artesanal" },
    ],
    legs: [
      "Tomar colectivo Línea 50 o colectivo blanco con franja roja (S/ 2.50). Deja en Jr. Guisse en 10 min.",
      "Pedir cebiche mixto con chinguirito norteño y chicha morada helada (S/ 38.00).",
      "Caminata guiada de 8 min por el bulevar peatonal hacia Plaza 28 de Julio.",
      "Enlace peatonal hacia el fondeadero artesanal para ver la descarga fresca de lanchas.",
    ],
    comment: "El cebiche con chinguirito de la parada 3 es el mejor de la bahía.",
    commenter: "Elena V.",
  },
  {
    author: "Lucía V.",
    avatar: "LV",
    title: "Paseo Marino Isla Blanca & Nuevo Chimbote",
    rating: "4.8",
    votes: 54,
    comments: 12,
    category: "⛵ Paseos en Lancha",
    duration: "4h 20m",
    budget: "S/ 65.00",
    steps: [
      { icon: "1", name: "Muelle Artesanal" },
      { icon: "2", name: "Lancha a Isla Blanca" },
      { icon: "3", name: "Plaza Mayor N. Chimbote" },
      { icon: "4", name: "Malecón" },
    ],
    legs: [
      "Abordar lancha artesanal en muelle desde las 8:30 AM (S/ 15 a S/ 20 ida y vuelta).",
      "Retorno a muelle y conexión en combi o colectivo directo a Plaza Mayor.",
      "Paseo peatonal de 5 min hacia la Catedral y pileta ornamental.",
    ],
    comment: "El avistamiento de aves en Isla Blanca es inigualable.",
    commenter: "Rodrigo K.",
  },
];

// Representa una ruta comunitaria con sus paradas, tramos, comentarios y acción.
function RouteCard({ route, isSelected, onSelect }) {
  // Controla si se muestran todos los tramos o solo los tres primeros.
  const [showAllLegs, setShowAllLegs] = useState(false);
  // Controla si el usuario agregó esta ruta a sus rutas personales.
  const [used, setUsed] = useState(false);
  // Calcula los tramos visibles según el estado del botón correspondiente.
  const visibleLegs = showAllLegs ? route.legs : route.legs.slice(0, 3);

  return (
    <article className={`community-route-card ${isSelected ? "selected-route" : ""}`} onClick={onSelect}>
      <header className="route-card-header">
        <span className="route-avatar">{route.avatar}</span>
        <div className="route-title-copy">
          <h2>{route.title}</h2>
          <p>Publicado por <strong>{route.author}</strong> · Guía Chimbotano</p>
        </div>
        <div className="route-rating">★ <strong>{route.rating}</strong> <small>({route.votes} votos)</small><br /><a>{route.comments} comentarios</a></div>
      </header>
      <div className="route-sequence">
        <strong>↪ SECUENCIA DIRECTA DE LA RUTA:</strong>
        <div className="route-stops">
          {route.steps.map((step, index) => (
            <span key={step.name} className="route-stop-wrap">
              <span className="route-stop"><b>{step.icon}</b>{step.name}</span>
              {index < route.steps.length - 1 && <i>➜</i>}
            </span>
          ))}
        </div>
        <div className="route-legs">
          {visibleLegs.map((leg, index) => (
            <p key={leg}><b>{index % 2 === 0 ? "▣" : "♨"}</b><strong> Tramo {index + 1} a {index + 2}:</strong> {leg}</p>
          ))}
          {route.legs.length > 3 && <button onClick={() => setShowAllLegs(!showAllLegs)}>{showAllLegs ? "Mostrar menos" : "Ver todos los tramos"}</button>}
        </div>
      </div>
      <div className="route-feedback">
        <strong>¿Hiciste esta ruta? Califícala:</strong>
        <span className="feedback-stars">☆ ☆ ☆ ☆ ☆</span>
        <p>¡Califícate con 1 estrella! Gracias por tu recomendación.</p>
        <div className="comment-form"><input placeholder="Escribe un comentario o tip para esta ruta..." /><button>Comentar</button></div>
        <div className="route-comment"><strong>{route.commenter} (hace 2 días):</strong><p>“{route.comment}”</p><a>Ver todos los comentarios ({route.comments}) ↓</a></div>
        <div className="route-feedback-footer">
          <span>Duración aprox: {route.duration} · Presupuesto: {route.budget}</span>
          <button className={used ? "route-used" : ""} onClick={(event) => { event.stopPropagation(); setUsed(!used); }}>△ {used ? "Ruta agregada" : "Usar ruta"}</button>
        </div>
      </div>
    </article>
  );
}

// Pantalla de exploración, creación y consulta de rutas comunitarias.
export default function PlanRuta({ onBack }) {
  // Categoría seleccionada en los filtros.
  const [activeCategory, setActiveCategory] = useState("Todas");
  // Texto introducido en el buscador.
  const [search, setSearch] = useState("");
  // Controla la apertura del creador de rutas.
  const [isCreating, setIsCreating] = useState(false);
  // Ruta que se muestra seleccionada en la lista y en el mapa.
  const [selectedRoute, setSelectedRoute] = useState(communityRoutes[0]);
  // Parada seleccionada dentro del mapa.
  const [activeMapLocation, setActiveMapLocation] = useState(null);

  // Filtra rutas por categoría y por el texto introducido por el usuario.
  const filteredRoutes = useMemo(() => communityRoutes.filter((route) => {
    const matchesCategory = activeCategory === "Todas" || route.category === activeCategory;
    const matchesSearch = route.title.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  }), [activeCategory, search]);

  // Convierte las paradas de la ruta en lugares compatibles con RealMap.
  const routeMapLocations = selectedRoute.steps.map((step, index) => ({
    name: step.name,
    type: `Parada ${index + 1}`,
    address: `Tramo ${index + 1} de la ruta comunitaria`,
    icon: step.icon,
  }));

  // Mantiene seleccionada la parada activa o usa la primera como predeterminada.
  const selectedMapLocation = activeMapLocation ?? routeMapLocations[0];

  return (
    <div className="route-planner-page">
      <button className="route-back" onClick={onBack}>← Volver al lobby turístico</button>
      <div className="route-content-grid">
        <div className="route-left-column">
          <section className="route-explorer-panel">
            <div className="route-explorer-title"><span>◉</span><h1>Explorar y Diseñar Rutas</h1><b>Chimbote Costero</b></div>
            <input className="route-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="⌕  Busca una ruta, lugar o actividad" />
            <div className="route-category-list">
              {routeCategories.map((category) => <button className={activeCategory === category ? "selected" : ""} key={category} onClick={() => setActiveCategory(category)}>{category}</button>)}
            </div>
            <button className="create-route-button" onClick={() => setIsCreating(!isCreating)}>⊕ <strong>{isCreating ? "Cerrar creador de rutas" : "Crear tu propia ruta"}</strong></button>
            {isCreating && <div className="route-builder"><strong>Diseña tu ruta paso a paso</strong><p>Selecciona lugares del mapa, agrega tramos y publica tu recorrido para la comunidad.</p><button onClick={() => setIsCreating(false)}>Empezar con una ruta vacía</button></div>}
          </section>
          <section className="community-routes-section">
            <header><div><h2>◉ Rutas Recomendadas de la Comunidad</h2><p>Circuitos creados por chimbotanos y viajeros reales con líneas de conexión directa, gastos exactos y tips de transporte.</p></div><span>✓ Verificadas ({filteredRoutes.length} activas)</span></header>
            <div className="community-route-list">
              {filteredRoutes.length ? filteredRoutes.map((route) => <RouteCard route={route} isSelected={selectedRoute.title === route.title} onSelect={() => { setSelectedRoute(route); setActiveMapLocation(null); }} key={route.title} />) : <div className="no-routes">No encontramos rutas para esta búsqueda.</div>}
            </div>
          </section>
        </div>
        <aside className="route-map-panel">
          <div className="route-map-panel-header"><strong>Mapa de la ruta</strong><span>En vivo</span></div>
          <div className="route-map-panel-body">
            <RealMap locations={routeMapLocations} activeLocation={selectedMapLocation} onSelectLocation={setActiveMapLocation} />
          </div>
          <p className="route-map-caption">Selecciona una ruta o una parada para actualizar el mapa.</p>
        </aside>
      </div>
    </div>
  );
}
