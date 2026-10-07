import { supabase } from "../supabaseClient";

const API_URL = import.meta.env.VITE_API_URL ?? "https://turimar-backend.onrender.com";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
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
    const error = new Error(message || `Error ${response.status} al comunicarse con el backend`);
    error.status = response.status;
    throw error;
  }

  return data;
}

export function getOwnerLocals(userId) {
  return request(`/api/v1/locales/usuario/${encodeURIComponent(userId)}`);
}

export async function getPublicLocals() {
  const data = await request("/api/v1/locales");
  const locals = [data, data?.locales, data?.locals, data?.data, data?.data?.locales]
    .find(Array.isArray);
  if (!locals) throw new Error("El backend devolvió un formato inesperado para los locales.");
  return locals.filter((local) => local.activo !== false);
}

export function createLocal(local) {
  return request("/api/v1/locales", {
    method: "POST",
    body: JSON.stringify(local),
  });
}

export function updateLocal(localId, local) {
  return request(`/api/v1/locales/${encodeURIComponent(localId)}`, {
    method: "PUT",
    body: JSON.stringify(local),
  }).catch(async (error) => {
    if (error.status !== 404) throw error;
    const { data, error: updateError } = await supabase
      .from("locales")
      .update(local)
      .eq("id", localId)
      .eq("usuario_id", local.usuario_id)
      .select()
      .maybeSingle();
    if (updateError) throw new Error(`Render no tiene habilitada la edición y Supabase rechazó el cambio: ${updateError.message}`);
    if (!data) throw new Error("No se encontró el local para esta cuenta o no tienes permiso para editarlo.");
    return data;
  });
}

export function deleteLocal(localId, userId) {
  return request(`/api/v1/locales/${encodeURIComponent(localId)}`, {
    method: "DELETE",
  }).catch(async (error) => {
    if (error.status !== 404) throw error;
    const { data, error: deleteError } = await supabase
      .from("locales")
      .delete()
      .eq("id", localId)
      .eq("usuario_id", userId)
      .select("id")
      .maybeSingle();
    if (deleteError) throw new Error(`Render no tiene habilitado el borrado y Supabase rechazó el cambio: ${deleteError.message}`);
    if (!data) throw new Error("No se encontró el local para esta cuenta o no tienes permiso para eliminarlo.");
    return data;
  });
}

export async function getLocalMenu(localId) {
  const data = await request(`/api/v1/servicios/local/${encodeURIComponent(localId)}`);
  const services = [data, data?.servicios, data?.items, data?.data, data?.data?.servicios]
    .find(Array.isArray);
  if (!services) throw new Error("El backend devolvió un formato inesperado para la carta.");
  return services;
}

export function createLocalDish(localId, dish) {
  return request("/api/v1/servicios", {
    method: "POST",
    body: JSON.stringify({
      local_id: localId,
      categoria: "gastronomia",
      ...dish,
    }),
  });
}