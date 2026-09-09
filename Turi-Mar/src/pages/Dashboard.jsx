import { useState } from 'react';
import './Dashboard.css';

const DEFAULT_NOTICE = 'GPS sincronizado: Caleta & Malecón Miguel Grau';

const guides = [
  { icon: '🗺️', tag: 'Pelícano de Bahía', color: 'blue', title: 'Plan de Ruta', text: 'Arma tu recorrido entre Caleta Colorada, Vesique y la bahía costera.', details: ['Vesique & Colorada', 'Vivero Forestal'], action: 'Crear Rutas' },
  { icon: '🦑', tag: 'Cangrejo & Anchoveta', color: 'orange', title: 'Cebicherías', text: 'El pescado más fresco: cebiche de cabrilla y conchitas a la chalaca.', note: 'Top recomendado:', noteText: 'Huachafaría Marina · Bolognesi', action: 'Explorar' },
  { icon: '🏛️', tag: 'Lobo Marino Costero', color: 'indigo', title: 'Atractivos Turísticos', text: 'Cerro de la Paz, Museo Huaca San Pedro, Vivero Forestal y Malecón.', details: ['Huaca San Pedro', 'Mirador de la Paz'], extra: ['Cultura Mochica', 'Vista 360°'], action: 'Explorar' },
  { icon: '🚌', tag: 'Gaviota Gris Costera', color: 'slate', title: 'Pasajes & Colectivos', text: 'Combis y colectivos: Línea 50, Línea 31. Al Nuevo Chimbote y Vesique.', details: ['Chimbote ⇄ N. Chimbote', 'Colectivo Vesique'], extra: ['S/ 2.50', 'S/ 5.00'], action: 'Calcular Rutas' },
  { icon: '🏖️', tag: 'Delfín Nariz Botella', color: 'cyan', title: 'Ruta de Playas', text: 'Kayak tranquilo en Samanco, paseos en bote y olas en El Dorado.', details: ['Botes y kayak disponibles'], action: 'Tours Costeros' },
  { icon: '🎪', tag: 'Piquero Camanay', color: 'purple', title: 'Eventos Locales', text: 'Patronales en San Pedrito en Junio, peñas y bulla veras gastronómicos.', note: 'Próximo:', noteText: 'Feria San Pedrito · Festivales y ferias vivas', action: 'Calendario Local' },
  { icon: '🏨', tag: 'Tortuga Marina', color: 'green', title: 'Hostales', text: 'Hospedajes frente al mar y alojamientos en Chimbote y Nuevo Chimbote.', details: ['Frente al Malecón', 'Habitaciones con WiFi'], extra: ['Desde S/ 60', '24 hrs'], action: 'Hostales' },
  { icon: '🍲', tag: 'Nutria Marina', color: 'red', title: 'Puntos de Comida', text: 'Huaríques de comida criolla, caldos de mariscos, chicharronerías y café.', details: ['Caldos y Chifas', 'Chicharrones Caleta'], extra: ['Mañana y noche', 'Tradición'], action: 'Descubrir' },
];

const locationsByGuide = {
  'Plan de Ruta': [
    { name: 'Caleta Colorada', type: 'Punto de partida', address: 'Costa de Chimbote', price: 'Acceso libre', rating: '4.8', icon: '🏖️' },
    { name: 'Vesique', type: 'Ruta costera', address: 'Bahía El Ferrol', price: 'A 15 min', rating: '4.7', icon: '🛶' },
    { name: 'Vivero Forestal', type: 'Atractivo natural', address: 'Nuevo Chimbote', price: 'Acceso libre', rating: '4.6', icon: '🌿' },
  ],
  'Cebicherías': [
    { name: 'Huachafaría Marina', type: 'Cebichería', address: 'Av. Bolognesi, Chimbote', price: 'Desde S/ 25', rating: '4.8', icon: '🦑' },
    { name: 'El Gran Ferrol', type: 'Mariscos', address: 'Malecón Grau', price: 'Desde S/ 30', rating: '4.6', icon: '🐟' },
    { name: 'Cevichería El Ancla', type: 'Cocina marina', address: 'Caleta Chimbote', price: 'Desde S/ 22', rating: '4.5', icon: '⚓' },
  ],
  'Atractivos Turísticos': [
    { name: 'Cerro de la Paz', type: 'Mirador', address: 'Chimbote', price: 'Acceso libre', rating: '4.7', icon: '⛰️' },
    { name: 'Huaca San Pedro', type: 'Sitio arqueológico', address: 'Nuevo Chimbote', price: 'Desde S/ 8', rating: '4.5', icon: '🏛️' },
    { name: 'Vivero Forestal', type: 'Área recreativa', address: 'Av. Argentina', price: 'Acceso libre', rating: '4.6', icon: '🌿' },
  ],
  'Pasajes & Colectivos': [
    { name: 'Paradero Línea 50', type: 'Combi', address: 'Av. Pardo, Chimbote', price: 'S/ 2.50', rating: '4.4', icon: '🚌' },
    { name: 'Colectivo Vesique', type: 'Transporte local', address: 'Malecón Grau', price: 'S/ 5.00', rating: '4.6', icon: '🚐' },
    { name: 'Terminal Nuevo Chimbote', type: 'Paradero', address: 'Panamericana Norte', price: 'S/ 3.00', rating: '4.3', icon: '🚏' },
  ],
  'Ruta de Playas': [
    { name: 'Playa Caleta Colorada', type: 'Playa', address: 'Litoral de Chimbote', price: 'Acceso libre', rating: '4.8', icon: '🏖️' },
    { name: 'Playa Vesique', type: 'Balneario', address: 'Bahía El Ferrol', price: 'Acceso libre', rating: '4.7', icon: '🌊' },
    { name: 'El Dorado', type: 'Playa', address: 'Costa de Áncash', price: 'Acceso libre', rating: '4.5', icon: '🏄' },
  ],
  'Eventos Locales': [
    { name: 'Plaza de Armas', type: 'Evento cultural', address: 'Centro de Chimbote', price: 'Entrada libre', rating: '4.6', icon: '🎪' },
    { name: 'Malecón Grau', type: 'Festival costero', address: 'Frente a la bahía', price: 'Próximamente', rating: '4.5', icon: '🎶' },
    { name: 'Parroquia San Pedrito', type: 'Festividad', address: 'Chimbote', price: 'Entrada libre', rating: '4.7', icon: '⛪' },
  ],
  'Hostales': [
    { name: 'Hostal Dos Flamingos', type: 'Hostal', address: 'Jr. Jorge Martin Guisse 475', price: 'S/ 65 / noche', rating: '4.8', icon: '🏨' },
    { name: 'Hostal Victoria', type: 'Albergue', address: 'Av. Víctor Raúl Haya de la Torre', price: 'S/ 55 / noche', rating: '4.5', icon: '🛏️' },
    { name: 'Hostal Okinawa', type: 'Hotel centro', address: 'Jr. Leoncio Prado, Chimbote', price: 'S/ 75 / noche', rating: '4.6', icon: '🏩' },
    { name: 'Bahía Grand Pacific', type: 'Hotel bahía', address: 'Malecón Miguel Grau 112', price: 'S/ 110 / noche', rating: '4.7', icon: '🌊' },
  ],
  'Puntos de Comida': [
    { name: 'Caldos Don Lucho', type: 'Caldo de mariscos', address: 'Caleta Chimbote', price: 'Desde S/ 15', rating: '4.7', icon: '🍲' },
    { name: 'Chifas del Puerto', type: 'Chifa', address: 'Av. Bolognesi', price: 'Desde S/ 18', rating: '4.5', icon: '🥡' },
    { name: 'Chicharrones La Caleta', type: 'Comida criolla', address: 'Malecón Grau', price: 'Desde S/ 20', rating: '4.6', icon: '🐟' },
  ],
};

function GuideCard({ guide, onSelect }) {
  return <article className="guide-card"><div className="guide-head"><span className="guide-icon">{guide.icon}</span><span className={`guide-tag ${guide.color}`}>{guide.tag}</span></div><h3>{guide.title}</h3><p>{guide.text}</p>{guide.note && <div className="guide-note"><strong>{guide.note}</strong><span>{guide.noteText}</span></div>}{guide.details && <div className="guide-details">{guide.details.map((detail, index) => <div key={detail}><span>•</span>{detail}{guide.extra?.[index] && <b>{guide.extra[index]}</b>}</div>)}</div>}<button className="card-action" onClick={() => onSelect(guide)}>{guide.action}</button></article>;
}

function ResultsScreen({ guide, onBack }) {
  const locations = locationsByGuide[guide.title] ?? [];
  const [activeLocation, setActiveLocation] = useState(locations[0]);

  return <div className="locations-screen"><aside className="locations-list"><div className="locations-top"><button onClick={onBack}>← Volver a guías</button><span>{locations.length} disponibles</span></div><h2>Resultados de {guide.title}</h2><div className="location-tabs"><button>Todos</button><button>Chimbote Malecón</button><button>Nuevo Chimbote</button></div><div className="location-cards">{locations.map((location) => <button className={`location-card ${activeLocation?.name === location.name ? 'active' : ''}`} key={location.name} onClick={() => setActiveLocation(location)}><span className="location-photo">{location.icon}</span><span className="location-copy"><strong>{location.name}</strong><small>★ {location.rating} · {location.type}</small><small>⌖ {location.address}</small><b>{location.price}</b></span><span className="location-direction">⌖</span></button>)}</div><div className="coast-status">⚡ Bahía El Ferrol: Óptima<br /><small>Playa y mar · Brisa ligera · 22°</small></div></aside><main className="locations-map"><div className="map-water"></div><div className="map-island">ISLA BLANCA<small>Santuario Marino</small></div><div className="map-hill">CERRO DE LA PAZ</div><div className="map-route route-main"></div><div className="map-route route-secondary"></div><div className="map-forest">Vivero Forestal</div><div className="map-tools"><button onClick={onBack}>◉</button><button>Pausar GPS</button><button>＋</button><button>−</button></div><span className="destination-chip">● Destino: {activeLocation?.name}</span>{locations.map((location, index) => <button key={location.name} className={`map-pin pin-${index} ${activeLocation?.name === location.name ? 'selected' : ''}`} onClick={() => setActiveLocation(location)}>{location.icon}<span>{location.name}</span></button>)}{activeLocation && <section className="location-detail"><button className="close-detail" onClick={onBack}>×</button><span className="detail-photo">{activeLocation.icon}</span><div><h3>{activeLocation.name} <small>★ {activeLocation.rating}</small></h3><p>{activeLocation.address}</p><b>{activeLocation.price}</b><p className="detail-meta">A 650 m · 7 min a pie</p></div><button className="navigate-button" onClick={() => window.open('https://www.google.com/maps/dir/?api=1&destination=-9.075,-78.594', '_blank')}>⌖ Iniciar navegación</button></section>}</main></div>;
}

function Radar({ notice, onAction }) {
  return <section className="radar-card"><div className="radar-header"><div className="radar-title"><span className="radar-icon">◌</span><div><h2>Radar Costero Turi-Mar <em>GPS EN VIVO</em></h2><p>Coordenadas de usuario detectadas · Malecón Miguel Grau frente a Caleta Chimbote</p></div></div><div className="radar-controls"><button className="gps" onClick={() => onAction('GPS activo y actualizado')}>GPS Activo</button><button onClick={() => onAction('Modo galería activado')}>Modo Galería</button><button className="maps" onClick={() => onAction('Ruta lista para consultar')}>● Ruta en Google Maps</button></div></div><div className="radar-map"><span className="map-label sanctuary">⚓ Isla Blanca · Santuario Marino</span><span className="map-label pier">⚓ Muelle Municipal & Malecón <i>● 450 m</i></span><span className="map-label beach">● Bahía El Ferrol (3.2 km)</span><span className="map-label food">⚑ Huaríques Costeros Bolognesi <i>● 800 m</i></span><div className="you-are-here"><b></b><strong>Tú en Malecón Grau</strong><small>RADAR ACTIVO 15M</small></div><div className="radar-footer"><span><b></b>{notice}<i> · Rumbo NNO hacia Isla Blanca</i></span><div><button onClick={() => navigator.clipboard?.writeText('-9.0744, -78.5937')}>Copiar Coordenadas</button><button onClick={() => onAction('Ruta lista para consultar')}>● Ruta en Google Maps</button></div></div></div></section>;
}

function Footer() { return <footer><div className="footer-grid"><div><div className="footer-brand"><span className="brand-mark">◒</span><strong>Turi<span>-Mar</span></strong></div><p>Tu compás inteligente para redescubrir la Bahía de Ferrol, las playas vírgenes de Nuevo Chimbote y la gastronomía marina de mayor tradición en la costa de Áncash.</p></div><div><h4>ENLACES ÚTILES</h4><a>Malecón Grau y Bahía El Ferrol</a><a>Plaza Mayor de Nuevo Chimbote</a></div><div><h4>CLIMA Y SEGURIDAD</h4><p>🌊 <b>Mar y Viento Costero</b><br />22°C · Vientos SSO 14 km/h</p></div><div><h4>COMUNIDAD COSTERA</h4><p>Comparte tus postales con <b>#TuriMar</b>.</p></div></div><div className="copyright">© 2025 Turi-Mar. Turismo Costero y Rutas de la Provincia del Santa.</div></footer>; }

export default function Dashboard({ onLogout }) {
  const [notice, setNotice] = useState(DEFAULT_NOTICE);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const showNotice = (message) => { setNotice(message); window.setTimeout(() => setNotice(DEFAULT_NOTICE), 2800); };

  if (selectedGuide) return <ResultsScreen guide={selectedGuide} onBack={() => setSelectedGuide(null)} />;

  return <div className="turimar-page"><header className="topbar"><button className="brand"><span className="brand-mark">◒</span><strong>Turi<span>-Mar</span></strong></button><nav><button onClick={() => showNotice('Explorando el mapa costero')}>🗺️ Explorar Mapa</button><button className="routes" onClick={() => showNotice('Tus rutas guardadas están listas')}>⌯ Ver Rutas</button><span className="avatar">JR</span><button className="logout" onClick={onLogout}>Salir</button></nav></header><main className="content"><Radar notice={notice} onAction={showNotice} /><section className="guides-section"><div className="section-title"><div><span>MÓDULOS DE AVENTURA COSTERA</span><h1>Guías Temáticas Turi-Mar</h1></div><p>Explora las rutas más representativas de la bahía y la costa<br />custodiadas por su fauna marina.</p></div><div className="guides-grid">{guides.map((guide) => <GuideCard key={guide.title} guide={guide} onSelect={setSelectedGuide} />)}</div></section></main><Footer /></div>;
}
