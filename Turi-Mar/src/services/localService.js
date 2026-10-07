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
    throw new Error(message || `Error ${response.status} al comunicarse con el backend`);
  }

  return data;
}

export function getOwnerLocals(userId) {
  return request(`/api/v1/locales/usuario/${encodeURIComponent(userId)}`);
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
  });
}

export function deleteLocal(localId) {
  return request(`/api/v1/locales/${encodeURIComponent(localId)}`, {
    method: "DELETE",
  });
}