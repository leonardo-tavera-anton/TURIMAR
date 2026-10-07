import { supabase } from "../supabaseClient";

const API_URL = import.meta.env.VITE_API_URL ?? "https://turimar-backend.onrender.com";

function canUseSupabaseFallback(error) {
  return error.status === 404 || error.status === 405 || error.message.includes("prepared statement");
}

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
  return request(`/api/v1/locales/usuario/${encodeURIComponent(userId)}`).catch(async (error) => {
    if (!canUseSupabaseFallback(error)) throw error;

    const { data, error: queryError } = await supabase
      .from("locales")
      .select("*")
      .eq("usuario_id", userId)
      .order("created_at", { ascending: false });
    if (queryError) {
      throw new Error(`Render tiene un error SQLx y Supabase no permitió leer tus locales: ${queryError.message}`);
    }
    if (!data?.length) {
      throw new Error("Render tiene un error SQLx y Supabase no devolvió locales. Verifica la policy SELECT de locales para el usuario autenticado.");
    }
    return data;
  });
}

export async function getPublicLocals() {
  try {
    const data = await request("/api/v1/locales");
    const locals = [data, data?.locales, data?.locals, data?.data, data?.data?.locales]
      .find(Array.isArray);
    if (!locals) throw new Error("El backend devolvió un formato inesperado para los locales.");
    return locals.filter((local) => local.activo !== false);
  } catch (error) {
    if (!canUseSupabaseFallback(error)) throw error;
    const { data, error: queryError } = await supabase
      .from("locales")
      .select("*")
      .eq("activo", true);
    if (queryError) throw new Error(`Render tiene un error SQLx y Supabase no permitió cargar locales públicos: ${queryError.message}`);
    return data ?? [];
  }
}

export function createLocal(local) {
  return request("/api/v1/locales", {
    method: "POST",
    body: JSON.stringify(local),
  }).catch(async (error) => {
    if (!canUseSupabaseFallback(error)) throw error;
    const { data, error: insertError } = await supabase
      .from("locales")
      .insert(local)
      .select()
      .single();
    if (insertError) throw new Error(`Render no pudo guardar el local y Supabase lo rechazó: ${insertError.message}`);
    return data;
  });
}

export function updateLocal(localId, local) {
  return request(`/api/v1/locales/${encodeURIComponent(localId)}`, {
    method: "PUT",
    body: JSON.stringify(local),
  }).catch(async (error) => {
    if (!canUseSupabaseFallback(error)) throw error;
    const { data, error: updateError } = await supabase
      .from("locales")
      .update(local)
      .eq("id", localId)
      .eq("usuario_id", local.usuario_id);
    if (updateError) throw new Error(`Render no tiene habilitada la edición y Supabase rechazó el cambio: ${updateError.message}`);
    const ownedLocals = await getOwnerLocals(local.usuario_id);
    const updatedLocal = (Array.isArray(ownedLocals) ? ownedLocals : []).find((item) => String(item.id) === String(localId));
    if (!updatedLocal) throw new Error("Supabase no confirma la edición. Revisa la política RLS UPDATE para que el dueño modifique sus locales.");
    return updatedLocal;
  });
}

export function deleteLocal(localId, userId) {
  return request(`/api/v1/locales/${encodeURIComponent(localId)}`, {
    method: "DELETE",
  }).catch(async (error) => {
    if (!canUseSupabaseFallback(error)) throw error;
    const { data, error: deleteError } = await supabase
      .from("locales")
      .delete()
      .eq("id", localId)
      .eq("usuario_id", userId);
    if (deleteError) throw new Error(`Render no tiene habilitado el borrado y Supabase rechazó el cambio: ${deleteError.message}`);
    const ownedLocals = await getOwnerLocals(userId);
    const stillExists = (Array.isArray(ownedLocals) ? ownedLocals : []).some((item) => String(item.id) === String(localId));
    if (stillExists) throw new Error("Supabase no confirmó el borrado. Revisa la política RLS DELETE para que el dueño elimine sus locales.");
    return { id: localId };
  });
}

export async function getLocalMenu(localId) {
  try {
    const data = await request(`/api/v1/servicios/local/${encodeURIComponent(localId)}`);
    const services = [data, data?.servicios, data?.items, data?.data, data?.data?.servicios]
      .find(Array.isArray);
    if (!services) throw new Error("El backend devolvió un formato inesperado para la carta.");
    return services;
  } catch (error) {
    if (!canUseSupabaseFallback(error)) throw error;
    const { data, error: queryError } = await supabase
      .from("servicios")
      .select("*")
      .eq("local_id", localId)
      .eq("activo", true);
    if (queryError) throw new Error(`Render tiene un error SQLx y Supabase no permitió cargar la carta: ${queryError.message}`);
    return data ?? [];
  }
}

export function createLocalDish(localId, dish) {
  const payload = {
    local_id: localId,
    categoria: "gastronomia",
    tipo: "producto",
    ...dish,
  };

  return request("/api/v1/servicios", {
    method: "POST",
    body: JSON.stringify(payload),
  }).catch(async (error) => {
    if (!canUseSupabaseFallback(error)) throw error;
    const { data, error: insertError } = await supabase
      .from("servicios")
      .insert(payload)
      .select()
      .single();
    if (insertError) throw new Error(`Render no pudo guardar el plato y Supabase lo rechazó: ${insertError.message}`);
    return data;
  });
}