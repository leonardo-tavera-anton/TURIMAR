import { useMemo, useState } from "react";
import "./Dashboard.css";
import RealMap from "../components/dashboard/RealMap";
import { supabase } from "../supabaseClient";
import { crearRutaComunidad } from "../services/routeService";

const routeCategories = [
  "Todas",
  "🐟 Huariques & Cebiche",
  "⛵ Paseos en Lancha",
  "🏖️ Playas & Caletas",
  "🏛️ Cultura & Miradores",
];

const suggestedPlaces = [
  { name: "Plaza de Armas", latitude: -9.0759, longitude: -78.5936, description: "Punto de inicio del recorrido." },
  { name: "Cine Bahía", latitude: -9.0737, longitude: -78.5857, description: "Cine y punto de encuentro central." },
  { name: "Megaplaza", latitude: -9.0714, longitude: -78.5819, description: "Centro comercial y paso importante." },
  { name: "Malecón", latitude: -9.0781, longitude: -78.5984, description: "Mirador costero y paseo final." },
  { name: "Mercado Central", latitude: -9.0772, longitude: -78.5952, description: "Mercado de alimentos y recuerdos." },
  { name: "Mirador de la Bahía", latitude: -9.0824, longitude: -78.5969, description: "Vista panorámica del puerto." },
];

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

function RouteCard({ route, isSelected, onSelect }) {
  const [showAllLegs, setShowAllLegs] = useState(false);
  const [used, setUsed] = useState(false);
  const visibleLegs = showAllLegs ? route.legs : route.legs.slice(0, 3);

  return (
    <article className={`community-route-card ${isSelected ? "selected-route" : ""}`} onClick={onSelect}>
      <header className="route-card-header">
        <span className="route-avatar">{route.avatar}</span>
        <div className="route-title-copy">
          <h2>{route.title}</h2>
          <p>{route.source === "ai" ? "Generada por Turi-Mar IA según tus preferencias" : <>Publicado por <strong>{route.author}</strong> · Guía Chimbotano</>}</p>
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

export default function PlanRuta({ onBack, rutaData, routeError }) {
  const generatedRoute = useMemo(() => {
    if (!rutaData) return null;

    return {
      source: "ai",
      author: "Turi-Mar IA",
      avatar: "IA",
      title: rutaData.titulo_ruta,
      rating: "-",
      votes: 0,
      comments: 0,
      category: "Todas",
      duration: `${rutaData.duracion_total_horas}h`,
      budget: `S/ ${Number(rutaData.presupuesto_total_estimado).toFixed(2)}`,
      steps: (rutaData.paradas ?? []).map((parada) => ({
        icon: String(parada.orden),
        name: parada.nombre,
        description: parada.descripcion_actividad,
        latitude: parada.coordenadas?.lat,
        longitude: parada.coordenadas?.lng,
      })),
      legs: (rutaData.tramos ?? []).map((tramo) =>
        `${tramo.modo_transporte}: ${tramo.origen} hacia ${tramo.destino}. ` +
        `Duración aproximada: ${tramo.duracion_estimada_minutos} minutos.`
      ),
      comment: rutaData.paradas?.[0]?.tips_ia ?? "Ruta personalizada según tus preferencias.",
      commenter: "Guía IA",
    };
  }, [rutaData]);

  const [customRoutes, setCustomRoutes] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [userRole, setUserRole] = useState("cliente");
  const [selectedPoint, setSelectedPoint] = useState(suggestedPlaces[0].name);
  const [pointComment, setPointComment] = useState("");
  const [draftTitle, setDraftTitle] = useState("Ruta personalizada del cliente");
  const [draftFilters, setDraftFilters] = useState("cultural");
  const [routeSaving, setRouteSaving] = useState(false);
  const [routeMessage, setRouteMessage] = useState("");
  const [draftPoints, setDraftPoints] = useState([
    { name: "Plaza de Armas", latitude: -9.0759, longitude: -78.5936, comment: "Inicio del recorrido. Tomé la combi y llegué en 10 minutos." },
    { name: "Cine Bahía", latitude: -9.0737, longitude: -78.5857, comment: "Siguiente parada. Se puede caminar 8 minutos por el boulevard." },
    { name: "Megaplaza", latitude: -9.0714, longitude: -78.5819, comment: "Luego de la plaza tomé el recorrido por la zona comercial y el centro." },
  ]);
  const [selectedRoute, setSelectedRoute] = useState(
    generatedRoute ?? communityRoutes[0]
  );
  const [activeMapLocation, setActiveMapLocation] = useState(null);

  const availableRoutes = useMemo(() => {
    const baseRoutes = generatedRoute ? [generatedRoute, ...communityRoutes] : [...communityRoutes];
    return [...customRoutes, ...baseRoutes];
  }, [customRoutes, generatedRoute]);

  const filteredRoutes = useMemo(() => availableRoutes.filter((route) => {
    const matchesCategory = activeCategory === "Todas" || route.category === activeCategory;
    const matchesSearch = route.title.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  }), [activeCategory, availableRoutes, search]);

  const addDraftPoint = () => {
    const place = suggestedPlaces.find((item) => item.name === selectedPoint);
    if (!place) return;

    setDraftPoints((current) => [
      ...current,
      {
        name: place.name,
        latitude: place.latitude,
        longitude: place.longitude,
        comment: pointComment || `Parada extra en ${place.name}.`,
      },
    ]);
    setPointComment("");
  };

  const publishDraftRoute = async () => {
    if (!draftTitle.trim() || draftPoints.length < 2) return;
    setRouteSaving(true);
    setRouteMessage("");

    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (!user) throw new Error("Inicia sesión para publicar una ruta.");

      const duration = Math.max(1, draftPoints.length * 35 / 60);
      const budget = draftPoints.length * 12;
      const savedRoute = await crearRutaComunidad({
        usuario_id: user.id,
        titulo_ruta: draftTitle.trim(),
        descripcion: draftPoints.map((point) => point.comment).filter(Boolean).join(" "),
        categoria: draftFilters,
        duracion_total_horas: Number(duration.toFixed(2)),
        presupuesto_total_estimado: budget,
      }, draftPoints);

      const newRoute = {
        id: savedRoute.id,
      source: "user",
      author: "Tú",
      avatar: "YO",
      title: draftTitle.trim(),
      rating: "4.8",
      votes: 1,
      comments: 0,
      category: draftFilters === "playa" ? "🏖️ Playas & Caletas" : draftFilters === "cultura" ? "🏛️ Cultura & Miradores" : draftFilters === "marina" ? "⛵ Paseos en Lancha" : "🐟 Huariques & Cebiche",
      duration: `${duration.toFixed(1)}h`,
      budget: `S/ ${budget.toFixed(2)}`,
      steps: draftPoints.map((step, index) => ({
        icon: String(index + 1),
        name: step.name,
      })),
      legs: draftPoints.slice(0, -1).map((step, index) => {
        const next = draftPoints[index + 1];
        return `Tramo ${index + 1}: ${step.name} → ${next.name}. ${step.comment || "Recorrido directo y cómodo para caminar."}`;
      }),
      comment: `${draftPoints[0].name} hasta ${draftPoints[draftPoints.length - 1].name}. Ruta publicada por la comunidad.`,
      commenter: "Tú",
    };

      setCustomRoutes((current) => [newRoute, ...current]);
      setSelectedRoute(newRoute);
      setActiveMapLocation(null);
      setIsCreating(false);
      setDraftTitle("Ruta personalizada del cliente");
      setDraftFilters("cultural");
      setDraftPoints([
        { name: "Plaza de Armas", latitude: -9.0759, longitude: -78.5936, comment: "Inicio del recorrido." },
        { name: "Cine Bahía", latitude: -9.0737, longitude: -78.5857, comment: "Punto central del recorrido." },
        { name: "Megaplaza", latitude: -9.0714, longitude: -78.5819, comment: "Último punto antes del cierre del circuito." },
      ]);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "No se pudo guardar la ruta.";
      setRouteMessage(detail.includes("prepared statement")
        ? "La base de datos del servidor está fallando (SQLx). El backend debe corregir su conexión antes de poder guardar rutas."
        : `No se pudo publicar la ruta: ${detail}`);
    } finally {
      setRouteSaving(false);
    }
  };

  const mapLocations = isCreating
    ? draftPoints.map((point, index) => ({
        name: point.name,
        type: `Punto ${index + 1}`,
        address: point.comment || "Parada del recorrido del usuario.",
        latitude: point.latitude,
        longitude: point.longitude,
        icon: String(index + 1),
      }))
    : selectedRoute.steps.map((step, index) => ({
        name: step.name,
        type: `Parada ${index + 1}`,
        address: `Tramo ${index + 1} de la ruta comunitaria`,
        latitude: step.latitude,
        longitude: step.longitude,
        icon: step.icon,
      }));

  const selectedMapLocation = activeMapLocation ?? mapLocations[0];
  const routeLine = mapLocations.map((point) => [point.latitude, point.longitude]).filter(Boolean);

  return (
    <div className="route-planner-page">
      <button className="route-back" onClick={onBack}>← Volver al lobby turístico</button>
      <div className="route-role-switch">
        <button className={userRole === "cliente" ? "active" : ""} onClick={() => setUserRole("cliente")}>Cliente</button>
        <button className={userRole === "propietario" ? "active" : ""} onClick={() => setUserRole("propietario")}>Propietario</button>
      </div>
      <div className="route-content-grid">
        <div className="route-left-column">
          <section className="route-explorer-panel">
            <div className="route-explorer-title"><span>◉</span><h1>Explorar y Diseñar Rutas</h1><b>{userRole === "cliente" ? "Vista cliente" : "Vista propietario"}</b></div>
            <input className="route-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="⌕  Busca una ruta, lugar o actividad" />
            <div className="route-category-list">
              {routeCategories.map((category) => <button className={activeCategory === category ? "selected" : ""} key={category} onClick={() => setActiveCategory(category)}>{category}</button>)}
            </div>
            <button className="create-route-button" onClick={() => setIsCreating(!isCreating)}>⊕ <strong>{isCreating ? "Cerrar creador de rutas" : userRole === "cliente" ? "Crear tu propia ruta" : "Agregar mi local"}</strong></button>
            {isCreating && (
              <div className="route-builder">
                <strong>{userRole === "cliente" ? "Diseña tu ruta paso a paso" : "Gestiona tu local en el mapa"}</strong>
                {userRole === "cliente" ? (
                  <>
                    <div className="route-builder-form">
                      <input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} placeholder="Título de tu ruta" />
                      <select value={draftFilters} onChange={(event) => setDraftFilters(event.target.value)}>
                        <option value="cultural">Cultural</option>
                        <option value="playa">Playa</option>
                        <option value="marina">Marina</option>
                        <option value="gastronomia">Gastronomía</option>
                      </select>
                    </div>
                    <div className="route-builder-form">
                      <select value={selectedPoint} onChange={(event) => setSelectedPoint(event.target.value)}>
                        {suggestedPlaces.map((place) => <option key={place.name} value={place.name}>{place.name}</option>)}
                      </select>
                      <input value={pointComment} onChange={(event) => setPointComment(event.target.value)} placeholder="Comentario del tramo" />
                    </div>
                    <div className="route-builder-actions">
                      <button onClick={addDraftPoint}>Agregar punto</button>
                      <button className="primary" onClick={publishDraftRoute} disabled={routeSaving}>{routeSaving ? "Publicando…" : "Publicar ruta"}</button>
                    </div>
                    <div className="route-point-list">
                      {draftPoints.map((point, index) => (
                        <div key={`${point.name}-${index}`} className="route-point-item">
                          <span>Punto {index + 1}</span>
                          <strong>{point.name}</strong>
                          <small>{point.comment}</small>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <p>Como propietario puedes registrar tu local, cargar horarios, dirección y servicios del negocio.</p>
                    <button onClick={() => setIsCreating(false)}>Ir a mi local</button>
                  </>
                )}
              </div>
            )}
            {routeMessage && <p className="route-status" role="status">{routeMessage}</p>}
            {routeError && <div className="route-builder"><strong>No se pudo generar tu ruta</strong><p>{routeError}</p></div>}
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
            <RealMap
              locations={mapLocations}
              activeLocation={selectedMapLocation}
              onSelectLocation={setActiveMapLocation}
              routeLine={routeLine}
            />
          </div>
          <p className="route-map-caption">Selecciona una ruta o una parada para actualizar el mapa.</p>
        </aside>
      </div>
    </div>
  );
}
