const ROUTING_URL = "https://router.project-osrm.org/route/v1/driving";

function getInstruction(step) {
  const maneuver = step.maneuver ?? {};
  const road = step.name ? ` por ${step.name}` : "";
  if (maneuver.type === "arrive") return "Llegaste a tu destino";
  if (maneuver.type === "depart") return `Inicia el recorrido${road}`;
  const instructions = {
    left: "Gira a la izquierda",
    right: "Gira a la derecha",
    straight: "Continúa recto",
    "slight left": "Gira ligeramente a la izquierda",
    "slight right": "Gira ligeramente a la derecha",
    "sharp left": "Gira pronunciadamente a la izquierda",
    "sharp right": "Gira pronunciadamente a la derecha",
    uturn: "Haz un retorno",
  };
  const label = instructions[maneuver.modifier] ?? "Continúa";
  return `${label}${road}`;
}

export async function getDrivingRoute(origin, destination, signal) {
  const coordinates = [
    `${origin.longitude},${origin.latitude}`,
    `${destination.longitude},${destination.latitude}`,
  ].join(";");
  const params = new URLSearchParams({ overview: "full", geometries: "geojson", steps: "true" });
  const response = await fetch(`${ROUTING_URL}/${coordinates}?${params}`, { signal });
  if (!response.ok) throw new Error("El servicio de rutas no está disponible ahora.");

  const data = await response.json();
  if (data.code !== "Ok" || !data.routes?.[0]) {
    throw new Error("No se encontró un camino entre tu ubicación y este destino.");
  }

  const route = data.routes[0];
  const steps = (route.legs ?? []).flatMap((leg) => leg.steps ?? []).map((step) => ({
    instruction: getInstruction(step),
    distance: step.distance,
  }));

  return {
    coordinates: route.geometry.coordinates.map(([longitude, latitude]) => [latitude, longitude]),
    distanceMeters: route.distance,
    durationSeconds: route.duration,
    steps,
  };
}