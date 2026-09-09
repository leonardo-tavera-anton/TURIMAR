import { useState } from "react";
import "./Dashboard.css";
import ResultsScreen from "./ResultsScreen";
import RealMap from "../components/dashboard/RealMap";

// Mensaje inicial que aparece en el estado del radar costero.
const DEFAULT_NOTICE = "GPS sincronizado: Caleta & Malecón Miguel Grau";

// Datos de las tarjetas que se muestran en la pantalla principal.
// Cada tarjeta abre la lista de lugares de su propia categoría.
const guides = [
  {
    icon: "🗺️",
    tag: "Pelícano de Bahía",
    color: "blue",
    title: "Plan de Ruta",
    text: "Arma tu recorrido entre Caleta Colorada, Vesique y la bahía costera.",
    details: ["Vesique & Colorada", "Vivero Forestal"],
    action: "Crear Rutas",
  },
  {
    icon: "🦑",
    tag: "Cangrejo & Anchoveta",
    color: "orange",
    title: "Cebicherías",
    text: "El pescado más fresco: cebiche de cabrilla y conchitas a la chalaca.",
    note: "Top recomendado:",
    noteText: "Huachafaría Marina · Bolognesi",
    action: "Explorar",
  },
  {
    icon: "🏛️",
    tag: "Lobo Marino Costero",
    color: "indigo",
    title: "Atractivos Turísticos",
    text: "Cerro de la Paz, Museo Huaca San Pedro, Vivero Forestal y Malecón.",
    details: ["Huaca San Pedro", "Mirador de la Paz"],
    extra: ["Cultura Mochica", "Vista 360°"],
    action: "Explorar",
  },
  {
    icon: "🚌",
    tag: "Gaviota Gris Costera",
    color: "slate",
    title: "Pasajes & Colectivos",
    text: "Combis y colectivos: Línea 50, Línea 31. Al Nuevo Chimbote y Vesique.",
    details: ["Chimbote ⇄ N. Chimbote", "Colectivo Vesique"],
    extra: ["S/ 2.50", "S/ 5.00"],
    action: "Calcular Rutas",
  },
  {
    icon: "🏖️",
    tag: "Delfín Nariz Botella",
    color: "cyan",
    title: "Ruta de Playas",
    text: "Kayak tranquilo en Samanco, paseos en bote y olas en El Dorado.",
    details: ["Botes y kayak disponibles"],
    action: "Tours Costeros",
  },
  {
    icon: "🎪",
    tag: "Piquero Camanay",
    color: "purple",
    title: "Eventos Locales",
    text: "Patronales en San Pedrito en Junio, peñas y bulla veras gastronómicos.",
    note: "Próximo:",
    noteText: "Feria San Pedrito · Festivales y ferias vivas",
    action: "Calendario Local",
  },
  {
    icon: "🏨",
    tag: "Tortuga Marina",
    color: "green",
    title: "Hostales",
    text: "Hospedajes frente al mar y alojamientos en Chimbote y Nuevo Chimbote.",
    details: ["Frente al Malecón", "Habitaciones con WiFi"],
    extra: ["Desde S/ 60", "24 hrs"],
    action: "Hostales",
  },
  {
    icon: "🍲",
    tag: "Nutria Marina",
    color: "red",
    title: "Puntos de Comida",
    text: "Huaríques de comida criolla, caldos de mariscos, chicharronerías y café.",
    details: ["Caldos y Chifas", "Chicharrones Caleta"],
    extra: ["Mañana y noche", "Tradición"],
    action: "Descubrir",
  },
];

// Lugares mostrados en cada guía. 
const locationsByGuide = {
  "Plan de Ruta": [
    {
      name: "Caleta Colorada",
      type: "Punto de partida",
      address: "Costa de Chimbote",
      price: "Acceso libre",
      rating: "4.8",
      icon: "🏖️",
    },
    {
      name: "Vesique",
      type: "Ruta costera",
      address: "Bahía El Ferrol",
      price: "A 15 min",
      rating: "4.7",
      icon: "🛶",
    },
    {
      name: "Vivero Forestal",
      type: "Atractivo natural",
      address: "Nuevo Chimbote",
      price: "Acceso libre",
      rating: "4.6",
      icon: "🌿",
    },
  ],
  Cebicherías: [
    {
      name: "Cevicheria Mil Sabores",
      type: "Cebichería",
      address: "Av. Precursores, Chimbote",
      price: "Desde S/ 30",
      rating: "4.8",
      icon: "🦑",
    },
    {
      name: "Cevicheria Rico Chimbote",
      type: "Mariscos",
      address: "Jr. Enrique Palacios 701",
      price: "Desde S/ 25",
      rating: "4.2",
      icon: "🐟",
    },
    {
      name: "Cevichería Taypa",
      type: "Cocina marina",
      address: "Caleta Chimbote",
      price: "Desde S/ 22",
      rating: "4.5",
      icon: "⚓",
    },
    {
      name: "Cevicheria El Picantito",
      type: "Cebichería",
      address: "Av. Brasil, Mz C prima, Lote 7, Nuevo Chimbote",
      price: "Consultar precio",
      rating: "3.9",
      icon: "🌶️",
    },
    {
      name: "Cevichela",
      type: "Cebichería",
      address: "Frente a la Plaza Mayor, Urb. Mariscal Luzuriaga Mz C Lt. 12, Nuevo Chimbote",
      price: "Consultar precio",
      rating: "4.1",
      icon: "🐟",
    },
    {
      name: "Cevicheria El Pescadito",
      type: "Cebichería",
      address: "Urb. Santa Rosa G-26, Nuevo Chimbote",
      price: "Consultar precio",
      rating: "4.4",
      icon: "🐠",
    },
  ],
  "Atractivos Turísticos": [
    {
      name: "Cerro de la Paz",
      type: "Mirador",
      address: "Chimbote",
      price: "Acceso libre",
      rating: "4.7",
      icon: "⛰️",
    },
    {
      name: "Huaca San Pedro",
      type: "Sitio arqueológico",
      address: "Nuevo Chimbote",
      price: "Desde S/ 8",
      rating: "4.5",
      icon: "🏛️",
    },
    {
      name: "Vivero Forestal",
      type: "Área recreativa",
      address: "Av. Argentina",
      price: "Acceso libre",
      rating: "4.6",
      icon: "🌿",
    },
  ],
  "Pasajes & Colectivos": [
    {
      name: "Paradero Línea 50",
      type: "Combi",
      address: "Av. Pardo, Chimbote",
      price: "S/ 2.50",
      rating: "4.4",
      icon: "🚌",
    },
    {
      name: "Colectivo Vesique",
      type: "Transporte local",
      address: "Malecón Grau",
      price: "S/ 5.00",
      rating: "4.6",
      icon: "🚐",
    },
    {
      name: "Terminal Nuevo Chimbote",
      type: "Paradero",
      address: "Panamericana Norte",
      price: "S/ 3.00",
      rating: "4.3",
      icon: "🚏",
    },
  ],
  "Ruta de Playas": [
    {
      name: "Playa Caleta Colorada",
      type: "Playa",
      address: "Litoral de Chimbote",
      price: "Acceso libre",
      rating: "4.8",
      icon: "🏖️",
    },
    {
      name: "Playa Vesique",
      type: "Balneario",
      address: "Bahía El Ferrol",
      price: "Acceso libre",
      rating: "4.7",
      icon: "🌊",
    },
    {
      name: "El Dorado",
      type: "Playa",
      address: "Costa de Áncash",
      price: "Acceso libre",
      rating: "4.5",
      icon: "🏄",
    },
  ],
  "Eventos Locales": [
    {
      name: "Plaza de Armas",
      type: "Evento cultural",
      address: "Centro de Chimbote",
      price: "Entrada libre",
      rating: "4.6",
      icon: "🎪",
    },
    {
      name: "Malecón Grau",
      type: "Festival costero",
      address: "Frente a la bahía",
      price: "Próximamente",
      rating: "4.5",
      icon: "🎶",
    },
    {
      name: "Parroquia San Pedrito",
      type: "Festividad",
      address: "Chimbote",
      price: "Entrada libre",
      rating: "4.7",
      icon: "⛪",
    },
  ],
  Hostales: [
    {
      name: "Hostal Dos Flamingos",
      type: "Hostal",
      address: "Jr. Jorge Martin Guisse 475",
      price: "S/ 65 / noche",
      rating: "4.8",
      icon: "🏨",
    },
    {
      name: "Hostal Victoria",
      type: "Albergue",
      address: "Av. Víctor Raúl Haya de la Torre",
      price: "S/ 55 / noche",
      rating: "4.5",
      icon: "🛏️",
    },
    {
      name: "Hostal Okinawa",
      type: "Hotel centro",
      address: "Jr. Leoncio Prado, Chimbote",
      price: "S/ 75 / noche",
      rating: "4.6",
      icon: "🏩",
    },
    {
      name: "Bahía Grand Pacific",
      type: "Hotel bahía",
      address: "Malecón Miguel Grau 112",
      price: "S/ 110 / noche",
      rating: "4.7",
      icon: "🌊",
    },
  ],
  "Puntos de Comida": [
    {
      name: "Caldos Don Lucho",
      type: "Caldo de mariscos",
      address: "Caleta Chimbote",
      price: "Desde S/ 15",
      rating: "4.7",
      icon: "🍲",
    },
    {
      name: "Chifas del Puerto",
      type: "Chifa",
      address: "Av. Bolognesi",
      price: "Desde S/ 18",
      rating: "4.5",
      icon: "🥡",
    },
    {
      name: "Chicharrones La Caleta",
      type: "Comida criolla",
      address: "Malecón Grau",
      price: "Desde S/ 20",
      rating: "4.6",
      icon: "🐟",
    },
  ],
};

// Imágenes de ejemplo para las tarjetas de resultados.
const resultImages = {
  "Plan de Ruta": [
    "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=480&h=320&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=480&h=320&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=480&h=320&fit=crop&auto=format",
  ],
  Cebicherías: [
    "https://crecemosjuntos.com.pe/wp-content/uploads/2023/09/Portada-Testimonial-Mil-Sabores.webp",
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=480&h=320&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1547592180-85f173990554?w=480&h=320&fit=crop&auto=format",
  ],
  "Atractivos Turísticos": [
    "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=480&h=320&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=480&h=320&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=480&h=320&fit=crop&auto=format",
  ],
  "Pasajes & Colectivos": [
    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=480&h=320&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=480&h=320&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=480&h=320&fit=crop&auto=format",
  ],
  "Ruta de Playas": [
    "https://images.unsplash.com/photo-1507520086101-6c3f7c5e2f19?w=480&h=320&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=480&h=320&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=480&h=320&fit=crop&auto=format",
  ],
  "Eventos Locales": [
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=480&h=320&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=480&h=320&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=480&h=320&fit=crop&auto=format",
  ],
  Hostales: [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=480&h=320&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=480&h=320&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=480&h=320&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=480&h=320&fit=crop&auto=format",
  ],
  "Puntos de Comida": [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=480&h=320&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=480&h=320&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=480&h=320&fit=crop&auto=format",
  ],
};

// Descripciones que aparecen debajo del título de algunas categorías.
const resultDescriptions = {
  Cebicherías: "Sabores del mar, restaurantes verificados y cocina marina local.",
  Hostales: "Hospedajes verificados para descansar cerca de la bahía.",
  "Atractivos Turísticos": "Lugares imperdibles para conocer la historia y paisaje local.",
};

// Filtros secundarios disponibles para cada guía.
// Las pestañas de ciudad se manejan por separado dentro de ResultsScreen.
const resultFilters = {
  Hostales: ["Más recomendados", "Más cercanos", "Wi-Fi", "Cochera"],
  Cebicherías: ["Más recomendados", "Más cercanos", "Vista al mar"],
  "Atractivos Turísticos": ["Más recomendados", "Más cercanos", "Acceso libre"],
};

// Renderiza una tarjeta de la pantalla principal y notifica al componente
// Dashboard qué guía seleccionó el usuario.
function GuideCard({ guide, onSelect }) {
  return (
    <article className="guide-card">
      <div className="guide-head">
        <span className="guide-icon">{guide.icon}</span>
        <span className={`guide-tag ${guide.color}`}>{guide.tag}</span>
      </div>
      <h3>{guide.title}</h3>
      <p>{guide.text}</p>
      {guide.note && (
        <div className="guide-note">
          <strong>{guide.note}</strong>
          <span>{guide.noteText}</span>
        </div>
      )}
      {guide.details && (
        <div className="guide-details">
          {guide.details.map((detail, index) => (
            <div key={detail}>
              <span>•</span>
              {detail}
              {guide.extra?.[index] && <b>{guide.extra[index]}</b>}
            </div>
          ))}
        </div>
      )}
      <button className="card-action" onClick={() => onSelect(guide)}>
        {guide.action}
      </button>
    </article>
  );
}

// Muestra el radar costero, sus puntos de referencia y acciones rápidas.
function Radar({ notice, onAction }) {
  return (
    <section className="radar-card">
      <div className="radar-header">
        <div className="radar-title">
          <span className="radar-icon">◌</span>
          <div>
            <h2>
              Radar Costero Turi-Mar <em>GPS EN VIVO</em>
            </h2>
            <p>
              Coordenadas de usuario detectadas · Malecón Miguel Grau frente a
              Caleta Chimbote
            </p>
          </div>
        </div>
        <div className="radar-controls">
          <button
            className="gps"
            onClick={() => onAction("GPS activo y actualizado")}
          >
            GPS Activo
          </button>
          <button onClick={() => onAction("Modo galería activado")}>
            Modo Galería
          </button>
          <button
            className="maps"
            onClick={() => onAction("Ruta lista para consultar")}
          >
            ● Ruta en Google Maps
          </button>
        </div>
      </div>
      <div className="radar-map">
        <RealMap showToolbar={false} />
        <div className="radar-footer">
          <span>
            <b></b>
            {notice}
            <i> · Rumbo NNO hacia Isla Blanca</i>
          </span>
          <div>
            <button
              onClick={() =>
                navigator.clipboard?.writeText("-9.0744, -78.5937")
              }
            >
              Copiar Coordenadas
            </button>
            <button onClick={() => onAction("Ruta lista para consultar")}>
              ● Ruta en Google Maps
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Pie de página informativo del dashboard.
function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div>
          <div className="footer-brand">
            <span className="brand-mark">◒</span>
            <strong>
              Turi<span>-Mar</span>
            </strong>
          </div>
          <p>
            Tu compás inteligente para redescubrir la Bahía de Ferrol, las
            playas vírgenes de Nuevo Chimbote y la gastronomía marina de mayor
            tradición en la costa de Áncash.
          </p>
        </div>
        <div>
          <h4>ENLACES ÚTILES</h4>
          <a>Malecón Grau y Bahía El Ferrol</a>
          <a>Plaza Mayor de Nuevo Chimbote</a>
        </div>
        <div>
          <h4>CLIMA Y SEGURIDAD</h4>
          <p>
            🌊 <b>Mar y Viento Costero</b>
            <br />
            22°C · Vientos SSO 14 km/h
          </p>
        </div>
        <div>
          <h4>COMUNIDAD COSTERA</h4>
          <p>
            Comparte tus postales con <b>#TuriMar</b>.
          </p>
        </div>
      </div>
      <div className="copyright">
        © 2026 Turi-Mar. Turismo Costero y Rutas de la Provincia del Santa.
      </div>
    </footer>
  );
}

// Dashboard principal. Decide si muestra las guías o los resultados
// y mantiene los avisos temporales de los botones superiores.
export default function Dashboard({ onLogout }) {
  const [notice, setNotice] = useState(DEFAULT_NOTICE);
  const [selectedGuide, setSelectedGuide] = useState(null);

  // Muestra un aviso y lo devuelve al texto inicial después de 2.8 segundos.
  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(DEFAULT_NOTICE), 2800);
  };
  if (selectedGuide)
    return (
      <ResultsScreen
        guide={selectedGuide}
        locationsByGuide={locationsByGuide}
        resultImages={resultImages}
        resultDescriptions={resultDescriptions}
        resultFilters={resultFilters}
        onBack={() => setSelectedGuide(null)}
      />
    );
  return (
    <div className="turimar-page">
      <header className="topbar">
        <button className="brand">
          <span className="brand-mark">◒</span>
          <strong>
            Turi<span>-Mar</span>
          </strong>
        </button>
        <nav>
          <button onClick={() => showNotice("Explorando el mapa costero")}>
            🗺️ Explorar Mapa
          </button>
          <button
            className="routes"
            onClick={() => showNotice("Tus rutas guardadas están listas")}
          >
            ⌯ Ver Rutas
          </button>
          <span className="avatar">JR</span>
          <button className="logout" onClick={onLogout}>
            Salir
          </button>
        </nav>
      </header>
      <main className="content">
        <Radar notice={notice} onAction={showNotice} />
        <section className="guides-section">
          <div className="section-title">
            <div>
              <span>MÓDULOS DE AVENTURA COSTERA</span>
              <h1>Guías Temáticas Turi-Mar</h1>
            </div>
            <p>
              Explora las rutas más representativas de la bahía y la costa
              <br />
              custodiadas por su fauna marina.
            </p>
          </div>
          <div className="guides-grid">
            {guides.map((guide) => (
              <GuideCard
                key={guide.title}
                guide={guide}
                onSelect={setSelectedGuide}
              />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
