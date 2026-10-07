const API_URL = import.meta.env.VITE_API_URL ?? "https://turimar-backend.onrender.com";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const body = await response.text();
  let data = null;
  if (body) {
    try {
      data = JSON.parse(body);
    } catch {
      data = body;
    }
  }
  if (!response.ok) {
    const message = typeof data === "string" ? data : data?.message ?? data?.error;
    throw new Error(message || `Error ${response.status} del backend`);
  }
  return data;
}

export async function generarRutaIA(preferences = {}) {
  return request("/api/routes/generate", {
    method: "POST",
    body: JSON.stringify({
      preferencias_comida: preferences.foods ?? [],
      tipo_acompanante: preferences.companion ?? "solo",
      presupuesto_nivel: preferences.budget ?? "medio",
      tiempo_disponible_horas: preferences.hours ?? 4,
      ubicacion_origen: preferences.location ?? null,
    }),
  });
}

export async function crearRutaComunidad(route, points) {
  const created = await request("/api/v1/rutas", {
    method: "POST",
    body: JSON.stringify(route),
  });
  const record = created?.data ?? created?.ruta ?? created;
  const routeId = record?.id ?? record?.ruta_id ?? record?.id_ruta;
  if (!routeId) {
    throw new Error("El backend creó la solicitud, pero no devolvió el ID de la ruta.");
  }

  for (const [index, point] of points.entries()) {
    await request(`/api/v1/rutas/${encodeURIComponent(routeId)}/puntos`, {
      method: "POST",
      body: JSON.stringify({
        orden: index + 1,
        nombre: point.name,
        latitud: point.latitude,
        longitud: point.longitude,
        comentario: point.comment,
      }),
    });
  }

  return { ...record, id: routeId };
}

export async function getUserRoutes(userId) {
  const data = await request(`/api/v1/rutas/usuario/${encodeURIComponent(userId)}`);
  const routes = [data, data?.rutas, data?.routes, data?.data, data?.data?.rutas, data?.data?.routes]
    .find(Array.isArray);
  if (!Array.isArray(routes)) {
    throw new Error("El backend devolvió un formato inesperado para tus rutas.");
  }
  return routes;
}

export async function getRoutePoints(routeId) {
  const data = await request(`/api/v1/rutas/${encodeURIComponent(routeId)}/puntos`);
  return [data, data?.puntos, data?.points, data?.data, data?.data?.puntos, data?.data?.points]
    .find(Array.isArray) ?? [];
}
