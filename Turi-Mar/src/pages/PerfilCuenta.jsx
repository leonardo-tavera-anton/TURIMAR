import { useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

// Navegación principal del perfil: actividad, guardados, preferencias y ajustes.
const tabs = [
  { id: "activity", icon: "◷", label: "Actividad" },
  { id: "saved", icon: "💗", label: "Guardados" },
  { id: "preferences", icon: "🎨", label: "Preferencias" },
  { id: "settings", icon: "⚙", label: "Configuración" },
];
// Valores de ejemplo del diseño; las preferencias elegidas sí se guardan en Supabase.
const foodOptions = ["Ceviche", "Mariscos", "Chicharrones", "Postres Locales", "Comida Criolla", "Pescado Frito"];
const travelStyles = [
  { id: "familiar", label: "Familiar", emoji: "👨‍👩‍👧" },
  { id: "amigos", label: "Con Amigos", emoji: "🫂" },
  { id: "romantico", label: "Romántico", emoji: "💗" },
  { id: "solo", label: "Explorador Solo", emoji: "🎒" },
];
const defaultPlaces = [
  ["🌴", "Isla Blanca", "Santuario Marino", "4.9", "8.5 km", "mint"],
  ["🍽️", "Cebichería El Cevichón", "Cebichería", "4.8", "450 m", "peach"],
  ["🏔️", "Cerro de la Paz", "Mirador 360°", "4.8", "2.8 km", "blue"],
  ["🌿", "Vivero Forestal", "Parque Natural", "4.7", "6.2 km", "mint"],
  ["🏨", "Hostal Malecón Azul", "Hostal Frente al Mar", "4.5", "400 m", "blue"],
  ["🎪", "Festival Gastronómico", "Evento Local", "4.7", "5.1 km", "lilac"],
].map(([icon, name, type, rating, distance, color]) => ({ icon, name, type, rating, distance, color }));

// Recupera las preferencias del usuario o los valores iniciales del prototipo.
function readPrefs(profile) {
  const value = profile?.user_metadata?.turimar_preferences ?? {};
  return {
    foods:
      value.foods ?? ["Ceviche", "Mariscos", "Chicharrones", "Pescado Frito"],
    companion: value.companion ?? "amigos",
  };
}

// Contenedor principal: el encabezado y la biografía se comparten entre las pestañas.
export default function PerfilCuenta({ profile, onBack }) {
  const name = profile?.user_metadata?.full_name || "Jorge Ramírez";
  const initials = name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  const [tab, setTab] = useState("activity");
  const initialBio =
    profile?.user_metadata?.turimar_bio ||
    "Amante de la gastronomía costeña y los atardeceres en la Bahía El Ferrol. Siempre buscando el mejor ceviche.";
  const [bio, setBio] = useState(initialBio);
  const [editingBio, setEditingBio] = useState(false);
  const [prefs, setPrefs] = useState(() => readPrefs(profile));
  const places = defaultPlaces;
  const [saved, setSaved] = useState(defaultPlaces.map(() => true));
  const [settings, setSettings] = useState({ push: true, gps: true, language: "Español", currency: "Soles (PEN)" });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [newListOpen, setNewListOpen] = useState(false);
  const [newList, setNewList] = useState("");
  const [lists, setLists] = useState([]);
  const memberSince = useMemo(() => {
    if (!profile?.created_at) return "Marzo 2024";

    return new Date(profile.created_at).toLocaleDateString("es-PE", {
      month: "long",
      year: "numeric",
    });
  }, [profile?.created_at]);

  // Persiste los metadatos del perfil y comunica errores o éxito en la interfaz.
  const persist = async (metadata, success) => {
    setSaving(true); setMessage("");
    const { error } = await supabase.auth.updateUser({ data: metadata });
    setMessage(error ? error.message : success); setSaving(false);
  };
  const saveBio = async () => {
    await persist({ turimar_bio: bio }, "Tu descripción se guardó.");
    setEditingBio(false);
  };
  const toggleFood = (food) => {
    setPrefs((current) => ({
      ...current,
      foods: current.foods.includes(food)
        ? current.foods.filter((item) => item !== food)
        : [...current.foods, food],
    }));
  };
  const remainingSaved = saved.filter(Boolean).length;
  const createList = (event) => {
    event.preventDefault();
    const clean = newList.trim();
    if (!clean) return;

    setLists((current) => [...current, clean]);
    setNewList("");
    setNewListOpen(false);
  };

  return (
    <main className="fig-profile">
      <header className="fig-profile-bar">
        <div className="fig-brand">
          <span>◒</span>
          <strong>Turi<span>-Mar</span></strong>
          <i />
          Mi Perfil
        </div>
        <button onClick={onBack}>← Volver</button>
      </header>

      <section className="fig-profile-hero">
        <div className="fig-profile-inner">
          <div className="fig-identity">
            <div className="fig-avatar">
              {initials}
              <b>✓</b>
            </div>
            <div className="fig-identity-copy">
              <h1>{name} <small>✓ Verificado</small></h1>
              <a>
                @{(profile?.email?.split("@")[0] || "jorgeramirez").toLowerCase()}
              </a>
              <p>
                📍 Chimbote, Áncash · Miembro desde {memberSince} ·
                <em>Turista Explorador</em>
              </p>
            </div>
            <button className="fig-edit-profile" onClick={() => setEditingBio(true)}>
              ♢ Editar perfil
            </button>
          </div>

          <div className="fig-stats">
            {[
              ["🗺️", "24", "Lugares visitados"],
              ["⭐", "12", "Reseñas escritas"],
              ["✅", "7", "Rutas completadas"],
              ["💗", remainingSaved, "Guardados"],
            ].map(([icon, count, label]) => (
              <div key={label}>
                <span>{icon}</span>
                <strong>{count}</strong>
                <small>{label}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="fig-profile-content">
        <section className="fig-bio">
          <span>🗨️</span>
          <p>{bio}</p>
          <button onClick={() => setEditingBio(true)}>Editar</button>
        </section>

        <nav className="fig-tabs" aria-label="Secciones del perfil">
          {tabs.map((item) => (
            <button
              key={item.id}
              className={tab === item.id ? "active" : ""}
              onClick={() => {
                setTab(item.id);
                setMessage("");
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {editingBio && (
          <section className="fig-box fig-bio-editor">
            <label htmlFor="bio-editor">Sobre mí</label>
            <textarea
              id="bio-editor"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              rows={3}
            />
            <div>
              <button onClick={() => setEditingBio(false)}>Cancelar</button>
              <button onClick={saveBio} disabled={saving}>
                {saving ? "Guardando…" : "Guardar perfil"}
              </button>
            </div>
          </section>
        )}

        {message && (
          <p className="fig-feedback" role="status">{message}</p>
        )}

        {tab === "activity" && <Activity />}

        {tab === "saved" && (
          <section className="fig-saved">
            <div className="fig-section-title">
              <h2>Lugares Guardados <small>({remainingSaved})</small></h2>
              <button onClick={() => setNewListOpen((open) => !open)}>＋ Crear lista</button>
            </div>

            {newListOpen && (
              <form className="fig-list-form" onSubmit={createList}>
                <input
                  value={newList}
                  onChange={(event) => setNewList(event.target.value)}
                  placeholder="Nombre de la lista"
                  autoFocus
                />
                <button>Crear</button>
              </form>
            )}

            {lists.length > 0 && (
              <div className="fig-custom-lists">
                {lists.map((item) => <span key={item}>📁 {item}</span>)}
              </div>
            )}

            <div className="fig-place-grid">
              {places.map((place, index) =>
                saved[index] && (
                  <article className="fig-place" key={place.name}>
                    <button
                      className="fig-heart"
                      aria-label={"Quitar " + place.name + " de guardados"}
                      onClick={() =>
                        setSaved((current) =>
                          current.map((value, i) => i === index ? !value : value),
                        )
                      }
                    >
                      ♥
                    </button>
                    <span className={"fig-place-icon " + place.color}>
                      {place.icon}
                    </span>
                    <strong>{place.name}</strong>
                    <small>{place.type}</small>
                    <div>
                      <b>★ {place.rating}</b>
                      <span>🚶 {place.distance}</span>
                    </div>
                  </article>
                ),
              )}
            </div>

            {!remainingSaved && (
              <p className="fig-empty">
                Aún no tienes lugares guardados. Explora el mapa para añadir favoritos.
              </p>
            )}
          </section>
        )}

        {tab === "preferences" && (
          <Preferences
            prefs={prefs}
            setPrefs={setPrefs}
            toggleFood={toggleFood}
            save={() =>
              persist(
                { turimar_preferences: prefs },
                "Tus preferencias se guardaron.",
              )
            }
            saving={saving}
          />
        )}

        {tab === "settings" && (
          <Settings settings={settings} setSettings={setSettings} />
        )}
      </div>
    </main>
  );
}

// Actividad de muestra; se podrá conectar a una tabla de historial más adelante.
function Activity() {
  const entries = [
    ["🍽️", "peach", "Visitaste Cebichería El Cevichón", "Dejaste una reseña de 5 estrellas", "hace 2 días"],
    [
      "🏛️",
      "blue",
      "Completaste Ruta Atractivos Turísticos",
      "Cerro de la Paz · Huaca San Pedro · Malecón",
      "hace 5 días",
    ],
    ["🏝️", "mint", "Guardaste Isla Blanca", "Añadido a tu lista de playas favoritas", "hace 1 semana"],
    ["🎪", "lilac", "Asististe a la Feria San Pedrito", "Plaza Central, Chimbote · Junio 2025", "hace 3 semanas"],
  ];

  return (
    <section className="fig-activity">
      <h2>Actividad Reciente</h2>
      {entries.map(([icon, color, title, description, time]) => (
        <article key={title}>
          <span className={`fig-event-icon ${color}`}>{icon}</span>
          <div>
            <strong>{title}</strong>
            <p>{description}</p>
          </div>
          <small>{time}</small>
        </article>
      ))}
    </section>
  );
}

// Las selecciones se guardan en los metadatos del usuario de Supabase.
function Preferences({ prefs, setPrefs, toggleFood, save, saving }) {
  const favoriteRoutes = [
    ["🍽️", "Ruta Cebichera", "4x"],
    ["🏝️", "Ruta de Playas", "3x"],
    ["🏛️", "Atractivos Turísticos", "2x"],
  ];

  return (
    <div className="fig-preferences">
      <div className="fig-pref-column">
        <section className="fig-box">
          <h2>Gustos Gastronómicos</h2>
          <div className="fig-foods">
            {foodOptions.map((food) => {
              const selected = prefs.foods.includes(food);
              return (
                <button
                  key={food}
                  className={selected ? "selected" : ""}
                  onClick={() => toggleFood(food)}
                >
                  {selected ? "✓ " : ""}{food}
                </button>
              );
            })}
          </div>
        </section>

        <section className="fig-box">
          <h2>Estilo de viaje</h2>
          <div className="fig-travel">
            {travelStyles.map((style) => (
              <button
                key={style.id}
                className={prefs.companion === style.id ? "selected" : ""}
                onClick={() =>
                  setPrefs((current) => ({ ...current, companion: style.id }))
                }
              >
                <span>{style.emoji}</span>
                {style.label}
              </button>
            ))}
          </div>
        </section>

        <button className="fig-save-prefs" onClick={save} disabled={saving}>
          {saving ? "Guardando…" : "Guardar preferencias"}
        </button>
      </div>

      <section className="fig-box fig-routes">
        <h2>Rutas favoritas</h2>
        {favoriteRoutes.map(([icon, title, count]) => (
          <div key={title}>
            <span>{icon}</span>
            <strong>{title}</strong>
            <b>{count}</b>
          </div>
        ))}
      </section>
    </div>
  );
}

// Preferencias locales de privacidad y visualización; se omite cuenta y mapa.
function Settings({ settings, setSettings }) {
  const toggleSetting = (key) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <section className="fig-box fig-settings">
      <h2>Privacidad y alertas</h2>
      <Toggle
        label="Notificaciones push"
        hint="Eventos y nuevos lugares cercanos"
        checked={settings.push}
        onClick={() => toggleSetting("push")}
      />
      <Toggle
        label="GPS por defecto"
        hint="Activar ubicación al abrir la app"
        checked={settings.gps}
        onClick={() => toggleSetting("gps")}
      />
      <label className="fig-setting-select">
        <span>🌐　Idioma</span>
        <select
          value={settings.language}
          onChange={(event) =>
            setSettings((current) => ({ ...current, language: event.target.value }))
          }
        >
          <option>Español</option>
          <option>English</option>
        </select>
      </label>
      <label className="fig-setting-select">
        <span>🪙　Moneda</span>
        <select
          value={settings.currency}
          onChange={(event) =>
            setSettings((current) => ({ ...current, currency: event.target.value }))
          }
        >
          <option>Soles (PEN)</option>
          <option>Dólares (USD)</option>
        </select>
      </label>
    </section>
  );
}

function Toggle({ label, hint, checked, onClick }) {
  return (
    <div className="fig-toggle">
      <div>
        <strong>{label}</strong>
        <small>{hint}</small>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={checked ? "on" : ""}
        onClick={onClick}
      >
        <i />
      </button>
    </div>
  );
}
