const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";
const PHOTON_URL = "https://photon.komoot.io/api/";
const BIG_DATA_CLOUD_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

function distanceInMeters(origin, destination) {
  const radians = (degrees) => degrees * Math.PI / 180;
  const latitudeDelta = radians(destination.latitude - origin.latitude);
  const longitudeDelta = radians(destination.longitude - origin.longitude);
  const value = Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(origin.latitude)) * Math.cos(radians(destination.latitude)) *
    Math.sin(longitudeDelta / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function formatPhotonPlace(feature, origin) {
  const properties = feature.properties ?? {};
  const [longitude, latitude] = feature.geometry?.coordinates ?? [];
  if (!properties.name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const distance = distanceInMeters(origin, { latitude, longitude });
  if (distance > 2500) return null;

  const address = [properties.street, properties.housenumber, properties.city]
    .filter(Boolean)
    .join(" ");

  return {
    id: `${properties.osm_type ?? "place"}-${properties.osm_id ?? `${latitude}-${longitude}`}`,
    name: properties.name,
    type: properties.osm_value ?? properties.type ?? "lugar",
    address,
    latitude,
    longitude,
    distance,
  };
}

async function findNearbyRestaurants(latitude, longitude, signal) {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    q: "restaurant",
    limit: "30",
  });
  const response = await fetch(`${PHOTON_URL}?${params}`, { signal });
  if (!response.ok) throw new Error("No se pudieron buscar restaurantes cercanos.");

  const data = await response.json();
  return (data.features ?? [])
    .map((feature) => formatPhotonPlace(feature, { latitude, longitude }))
    .filter(Boolean)
    .sort((first, second) => first.distance - second.distance)
    .slice(0, 8);
}

export async function reverseGeocode(latitude, longitude, signal) {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(latitude),
    lon: String(longitude),
    zoom: "18",
    addressdetails: "1",
  });
  try {
    const response = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: { "Accept-Language": "es" },
      signal,
    });
    if (!response.ok) throw new Error("No se pudo identificar el lugar seleccionado.");

    const result = await response.json();
    const address = result.address ?? {};
    const name = result.name || address.amenity || address.shop || address.road ||
      address.neighbourhood || result.display_name?.split(",")[0] || "Lugar seleccionado";

    return { name, address: result.display_name ?? "" };
  } catch (error) {
    if (signal?.aborted) throw error;

    try {
      const fallbackParams = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        localityLanguage: "es",
      });
      const fallbackResponse = await fetch(`${BIG_DATA_CLOUD_URL}?${fallbackParams}`, { signal });
      if (fallbackResponse.ok) {
        const fallback = await fallbackResponse.json();
        const locality = fallback.locality || fallback.city || "";
        if (locality) {
          return {
            name: locality,
            address: [locality, fallback.principalSubdivision, fallback.countryName]
              .filter(Boolean)
              .join(", "),
          };
        }
      }
    } catch {
      if (signal?.aborted) throw error;
    }

    const photonParams = new URLSearchParams({ lat: String(latitude), lon: String(longitude) });
    const fallbackResponse = await fetch(`https://photon.komoot.io/reverse/?${photonParams}`, { signal });
    if (!fallbackResponse.ok) throw error;

    const feature = (await fallbackResponse.json()).features?.[0];
    const properties = feature?.properties ?? {};
    const name = properties.street || properties.locality || properties.name || "Punto seleccionado";
    const address = [properties.street, properties.locality, properties.city]
      .filter(Boolean)
      .join(", ");

    return { name, address };
  }
}

export async function identifyMapLocation(latitude, longitude, signal) {
  const results = await Promise.allSettled([
    reverseGeocode(latitude, longitude, signal),
    findNearbyRestaurants(latitude, longitude, signal),
  ]);

  return {
    place: results[0].status === "fulfilled" ? results[0].value : null,
    nearby: results[1].status === "fulfilled" ? results[1].value : [],
    searchFailed: results.every((result) => result.status === "rejected"),
  };
}