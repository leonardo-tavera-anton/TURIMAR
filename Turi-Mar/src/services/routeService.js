const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function generarRutaIA(preferences = {}) {
  const response = await fetch(`${API_URL}/api/routes/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      preferencias_comida: preferences.foods ?? [],
      tipo_acompanante: preferences.companion ?? "solo",
      presupuesto_nivel: preferences.budget ?? "medio",
      tiempo_disponible_horas: preferences.hours ?? 4,
      ubicacion_origen: preferences.location ?? null,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "No se pudo generar la ruta");
  }

  return response.json();
}
