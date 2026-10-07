import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../supabaseClient";
import RealMap from "../components/dashboard/RealMap";
import { createLocal, deleteLocal, getOwnerLocals, updateLocal } from "../services/localService";
import { reverseGeocode } from "../services/placeLookup";

// Navegación principal del perfil: actividad, guardados, preferencias y ajustes.
const clientTabs = [
  { id: "activity", icon: "◷", label: "Actividad" },
  { id: "saved", icon: "💗", label: "Guardados" },
  { id: "preferences", icon: "🎨", label: "Preferencias" },
  { id: "settings", icon: "⚙", label: "Configuración" },
];
const ownerTabs = [
  { id: "business", icon: "⌂", label: "Resumen" },
  { id: "my-locals", icon: "🏪", label: "Mis locales" },
  { id: "add-local", icon: "+", label: "Agregar local" },
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
  const name = profile?.user_metadata?.full_name || profile?.email?.split("@")[0] || "Usuario Turi-Mar";
  const initials = name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  const [role, setRole] = useState("propietario");
  const tabs = role === "propietario" ? ownerTabs : clientTabs;
  const [tab, setTab] = useState(role === "propietario" ? "business" : "activity");
  const [localForm, setLocalForm] = useState({
    nombre: "",
    categoria: "restaurante",
    direccion: "",
    horario: "",
    telefono: "",
    descripcion: "",
    latitud: "",
    longitud: "",
  });
  const [locals, setLocals] = useState([]);
  const [localsLoading, setLocalsLoading] = useState(false);
  const [localSaving, setLocalSaving] = useState(false);
  const [editingLocalId, setEditingLocalId] = useState(null);
  const [deletingLocalId, setDeletingLocalId] = useState(null);
  const [addressLookupStatus, setAddressLookupStatus] = useState("");
  const addressLookupController = useRef(null);
  const initialBio = profile?.user_metadata?.turimar_bio || "";
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
  useEffect(() => {
    if (role !== "propietario" || !profile?.id) return;

    let active = true;
    setLocalsLoading(true);
    getOwnerLocals(profile.id)
      .then((data) => {
        if (!active) return;
        setLocals(Array.isArray(data) ? data : data?.locales ?? data?.data ?? []);
        setMessage("");
      })
      .catch((error) => {
        if (active) {
          const detail = error.message.includes("prepared statement")
            ? "La base de datos del servidor está fallando (SQLx). El backend debe corregir su conexión."
            : error.message;
          setMessage(`No se pudieron cargar tus locales: ${detail}`);
        }
      })
      .finally(() => {
        if (active) setLocalsLoading(false);
      });

    return () => { active = false; };
  }, [role, profile?.id]);
  const memberSince = useMemo(() => {
    if (!profile?.created_at) return "Sin fecha registrada";

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
  const reloadLocals = async () => {
    const data = await getOwnerLocals(profile.id);
    setLocals(Array.isArray(data) ? data : data?.locales ?? data?.data ?? []);
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

  const switchRole = (nextRole) => {
    setRole(nextRole);
    setTab(nextRole === "propietario" ? "business" : "activity");
  };

  const resetLocalForm = () => {
    setLocalForm({ nombre: "", categoria: "restaurante", direccion: "", horario: "", telefono: "", descripcion: "", latitud: "", longitud: "" });
    setEditingLocalId(null);
  };

  const saveLocal = async () => {
    const latitude = Number(localForm.latitud);
    const longitude = Number(localForm.longitud);
    if (!profile?.id) {
      setMessage("Inicia sesión nuevamente para asociar el local a tu cuenta.");
      return;
    }
    if (!localForm.nombre.trim() || !localForm.direccion.trim()) {
      setMessage("Completa el nombre y la dirección del local.");
      return;
    }
    if (!localForm.latitud.trim() || !localForm.longitud.trim() || !Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setMessage("Selecciona la ubicación en el mapa o ingresa coordenadas válidas.");
      return;
    }

    const payload = {
      usuario_id: profile.id,
      nombre: localForm.nombre.trim(),
      categoria: localForm.categoria,
      descripcion: localForm.descripcion.trim(),
      direccion: localForm.direccion.trim(),
      horario: localForm.horario.trim(),
      telefono: localForm.telefono.trim(),
      latitud: latitude,
      longitud: longitude,
    };

    setLocalSaving(true);
    setMessage("");
    try {
      if (editingLocalId) await updateLocal(editingLocalId, payload);
      else await createLocal(payload);
      const successMessage = editingLocalId ? "Local actualizado." : "Local publicado correctamente.";
      resetLocalForm();
      setTab("my-locals");
      setMessage(successMessage);
      try {
        await reloadLocals();
      } catch {
        setMessage(`${successMessage} No se pudo actualizar la lista; vuelve a abrir Mis locales.`);
      }
    } catch (error) {
      setMessage(`No se pudo guardar el local: ${error.message}`);
    } finally {
      setLocalSaving(false);
    }
  };

  const editLocal = (local) => {
    setLocalForm({
      nombre: local.nombre ?? "",
      categoria: local.categoria ?? "restaurante",
      direccion: local.direccion ?? "",
      horario: local.horario ?? "",
      telefono: local.telefono ?? "",
      descripcion: local.descripcion ?? "",
      latitud: String(local.latitud ?? local.latitude ?? ""),
      longitud: String(local.longitud ?? local.longitude ?? ""),
    });
    setEditingLocalId(local.id);
    setMessage("");
    setTab("add-local");
  };

  const removeLocal = async (local) => {
    if (!window.confirm(`¿Eliminar ${local.nombre ?? "este local"}? Esta acción no se puede deshacer.`)) return;
    setDeletingLocalId(local.id);
    setMessage("");
    try {
      await deleteLocal(local.id);
      await reloadLocals();
      setMessage("Local eliminado.");
    } catch (error) {
      setMessage(`No se pudo eliminar el local: ${error.message}`);
    } finally {
      setDeletingLocalId(null);
    }
  };

  const selectLocalPosition = async (latitude, longitude) => {
    addressLookupController.current?.abort();
    const controller = new AbortController();
    addressLookupController.current = controller;
    setLocalForm((current) => ({
      ...current,
      latitud: latitude.toFixed(6),
      longitud: longitude.toFixed(6),
    }));
    setAddressLookupStatus("Buscando dirección…");

    try {
      const result = await reverseGeocode(latitude, longitude, controller.signal);
      if (controller.signal.aborted) return;
      const address = result.address || result.name;
      setLocalForm((current) => ({ ...current, direccion: address }));
      setAddressLookupStatus(address ? `Dirección detectada: ${result.name}` : "No se encontró una dirección; puedes escribirla manualmente.");
    } catch {
      if (!controller.signal.aborted) setAddressLookupStatus("No se pudo detectar la dirección. Puedes escribirla manualmente.");
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Este navegador no permite obtener la ubicación.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => selectLocalPosition(coords.latitude, coords.longitude),
      () => setMessage("No se pudo obtener tu ubicación. Revisa el permiso de GPS."),
      { enableHighAccuracy: true, timeout: 12000 },
    );
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
          <div className="fig-role-switch">
            <button className={role === "cliente" ? "active" : ""} onClick={() => switchRole("cliente")}>Cliente</button>
            <button className={role === "propietario" ? "active" : ""} onClick={() => switchRole("propietario")}>Propietario</button>
          </div>
          <div className="fig-identity">
            <div className="fig-avatar">
              {initials}
              <b>✓</b>
            </div>
            <div className="fig-identity-copy">
              <h1>{name}</h1>
              {profile?.email && <a>@{profile.email.split("@")[0].toLowerCase()}</a>}
              <p>
                Miembro desde {memberSince} ·
                <em>{role === "propietario" ? "Dueño de Local" : "Turista Explorador"}</em>
              </p>
            </div>
            <button className="fig-edit-profile" onClick={() => setEditingBio(true)}>
              {bio ? "Editar perfil" : "Añadir descripción"}
            </button>
          </div>

          <div className={`fig-stats ${role === "propietario" ? "owner-stats" : ""}`}>
            {role === "propietario"
              ? [
                  ["🏪", localsLoading ? "…" : String(locals.length), "Locales publicados"],
                ]
              : [
                  ["🗺️", "24", "Lugares visitados"],
                  ["⭐", "12", "Reseñas escritas"],
                  ["✅", "7", "Rutas completadas"],
                  ["💗", remainingSaved, "Guardados"],
                ]
            .map(([icon, count, label]) => (
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
        {bio && !editingBio && (
          <section className="fig-bio">
            <span>🗨️</span>
            <p>{bio}</p>
            <button onClick={() => setEditingBio(true)}>Editar</button>
          </section>
        )}

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

        {role === "propietario" && tab === "business" && (
          <section className="fig-owner-business fig-box">
            <div className="fig-owner-header">
              <h2>Panel del propietario</h2>
              <span>Conectado a Render</span>
            </div>
            <p>Administra tus locales y publica sus ubicaciones para que aparezcan en Turi-Mar.</p>
            <div className="fig-owner-actions">
              <button className="fig-secondary" onClick={() => setTab("my-locals")}>Ver mis locales</button>
              <button className="fig-primary" onClick={() => { resetLocalForm(); setTab("add-local"); }}>＋ Agregar local</button>
            </div>
          </section>
        )}

        {role === "propietario" && tab === "my-locals" && (
          <section className="fig-owner-locals fig-box">
            <div className="fig-section-title">
              <h2>Mis locales <small>({locals.length})</small></h2>
              <button onClick={() => { resetLocalForm(); setTab("add-local"); }}>＋ Agregar local</button>
            </div>
            {localsLoading ? <p className="fig-empty">Cargando locales…</p> : locals.length ? (
              <div className="fig-local-list">
                {locals.map((local) => (
                  <article className="fig-local-item" key={local.id}>
                    <div>
                      <strong>{local.nombre ?? "Local sin nombre"}</strong>
                      <small>{local.categoria ?? "Local"} · {local.direccion ?? "Sin dirección"}</small>
                      <small>{local.latitud ?? local.latitude}, {local.longitud ?? local.longitude}</small>
                    </div>
                    <div className="fig-local-actions">
                      <button className="fig-secondary" onClick={() => editLocal(local)}>Editar</button>
                      <button className="fig-danger" onClick={() => removeLocal(local)} disabled={deletingLocalId === local.id}>
                        {deletingLocalId === local.id ? "Eliminando…" : "Eliminar"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : <p className="fig-empty">Todavía no tienes locales publicados.</p>}
          </section>
        )}

        {role === "propietario" && tab === "add-local" && (
          <section className="fig-owner-card fig-add-local">
            <div className="fig-owner-header">
              <h2>{editingLocalId ? "Editar local" : "Agregar local"}</h2>
              <span>Ubicación requerida</span>
            </div>
              <div className="fig-owner-form">
                <label>
                  Nombre del local
                  <input value={localForm.nombre} onChange={(event) => setLocalForm((current) => ({ ...current, nombre: event.target.value }))} />
                </label>
                <label>
                  Categoría
                  <select value={localForm.categoria} onChange={(event) => setLocalForm((current) => ({ ...current, categoria: event.target.value }))}>
                    <option value="restaurante">Restaurante</option>
                    <option value="hotel">Hotel</option>
                    <option value="tour">Tour</option>
                    <option value="tienda">Tienda</option>
                    <option value="mirador">Mirador</option>
                    <option value="servicio">Servicio</option>
                  </select>
                </label>
                <label className="full-width">
                  Descripción
                  <textarea value={localForm.descripcion} rows={3} onChange={(event) => setLocalForm((current) => ({ ...current, descripcion: event.target.value }))} />
                </label>
                <label>
                  Dirección
                  <input value={localForm.direccion} placeholder="Haz clic en el mapa para detectar la dirección" onChange={(event) => { setLocalForm((current) => ({ ...current, direccion: event.target.value })); setAddressLookupStatus(""); }} />
                  {addressLookupStatus && <small className="fig-local-map-status" role="status">{addressLookupStatus}</small>}
                </label>
                <label>
                  Horario
                  <input value={localForm.horario} onChange={(event) => setLocalForm((current) => ({ ...current, horario: event.target.value }))} />
                </label>
                <label>
                  Teléfono
                  <input value={localForm.telefono} onChange={(event) => setLocalForm((current) => ({ ...current, telefono: event.target.value }))} />
                </label>
                <label>
                  Latitud
                  <input type="number" step="any" value={localForm.latitud} onChange={(event) => setLocalForm((current) => ({ ...current, latitud: event.target.value }))} />
                </label>
                <label>
                  Longitud
                  <input type="number" step="any" value={localForm.longitud} onChange={(event) => setLocalForm((current) => ({ ...current, longitud: event.target.value }))} />
                </label>
                <div className="fig-local-map-block full-width">
                  <div className="fig-local-map-heading">
                    <strong>Marca la ubicación exacta</strong>
                    <button type="button" className="fig-secondary" onClick={useCurrentLocation}>◎ Usar mi ubicación</button>
                  </div>
                  <div className="fig-local-map">
                    <RealMap
                      showToolbar={false}
                      showUserMarker={false}
                      requestUserLocation={false}
                      locations={localForm.latitud && localForm.longitud ? [{
                        name: localForm.nombre || "Ubicación del local",
                        address: localForm.direccion,
                        latitude: Number(localForm.latitud),
                        longitude: Number(localForm.longitud),
                      }] : []}
                      onMapClick={selectLocalPosition}
                    />
                  </div>
                  <small>Haz clic en el mapa para fijar el punto. Puedes ajustar las coordenadas en los campos.</small>
                </div>
              </div>
              <div className="fig-owner-actions">
                <button className="fig-secondary" onClick={() => { resetLocalForm(); setTab("my-locals"); }}>Cancelar</button>
                <button className="fig-primary" onClick={saveLocal} disabled={localSaving}>{localSaving ? "Guardando…" : editingLocalId ? "Guardar cambios" : "Publicar local"}</button>
              </div>
          </section>
        )}

        {role === "cliente" && tab === "activity" && <Activity />}

        {role === "cliente" && tab === "saved" && (
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

        {role === "cliente" && tab === "preferences" && (
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

        {(role === "cliente" && tab === "settings") || (role === "propietario" && tab === "settings") ? (
          <Settings settings={settings} setSettings={setSettings} />
        ) : null}
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
