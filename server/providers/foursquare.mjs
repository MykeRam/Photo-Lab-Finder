import {
  buildDescription,
  calculateDistanceMiles,
  createFallbackCoordinates,
  encodeLabId,
  extractFoursquareAddressParts,
  getRequestedServices,
  inferServicesFromText,
  isWithinNyc,
  mapPriceTier,
  mapTurnaround,
  normalizeAreaQuery,
  SERVICE_LABELS,
  SERVICE_QUERY_MAP,
  uniqueLabs,
} from "../lib/place-utils.mjs";

const FOURSQUARE_SEARCH_URL = "https://api.foursquare.com/v3/places/search";
const FOURSQUARE_PLACE_URL = "https://api.foursquare.com/v3/places";

function getHeaders(apiKey) {
  return {
    Accept: "application/json",
    Authorization: apiKey,
  };
}

function mapFoursquareHours(hours) {
  if (hours?.display?.length > 0) {
    return hours.display[0];
  }

  if (hours?.open_now === true) {
    return "Open now";
  }

  return "Hours not listed";
}

function mapFoursquareImage(photos) {
  const photo = photos?.[0];

  if (!photo?.prefix || !photo?.suffix) {
    return null;
  }

  return `${photo.prefix}original${photo.suffix}`;
}

function mapFoursquareSpecialties(place, services) {
  const categoryNames = (place.categories ?? []).slice(0, 3).map((category) => category.name);
  const serviceNames = services.map((service) => SERVICE_LABELS[service]);
  return Array.from(new Set([...serviceNames, ...categoryNames]));
}

function mapFoursquarePlace(place, matchedServices, origin = null) {
  const parts = extractFoursquareAddressParts(place.location);
  const searchableText = [
    place.name,
    place.description,
    place.location?.formatted_address,
    ...(place.categories ?? []).map((category) => category.name),
  ]
    .filter(Boolean)
    .join(" ");
  const services = inferServicesFromText(searchableText, matchedServices);

  const coordinates = createFallbackCoordinates(place.geocodes?.main);

  return {
    id: encodeLabId("foursquare", place.fsq_id),
    source: "foursquare",
    sourceId: place.fsq_id,
    sourceLabel: "Foursquare Places",
    name: place.name ?? "Unnamed Lab",
    borough: parts.borough,
    neighborhood: parts.neighborhood,
    address: place.location?.formatted_address ?? "Address not listed",
    description:
      place.description ||
      buildDescription({
        matchedServices: services,
        primaryType: (place.categories ?? []).map((category) => category.name).join(", "),
        borough: parts.borough,
        neighborhood: parts.neighborhood,
        sourceLabel: "Foursquare Places",
      }),
    services,
    turnaround: mapTurnaround(services),
    priceTier: mapPriceTier(place.price),
    rating: Number(place.rating ?? 0),
    coordinates,
    distanceMiles: calculateDistanceMiles(origin, coordinates),
    imageUrl: mapFoursquareImage(place.photos),
    specialties: mapFoursquareSpecialties(place, services),
    hours: mapFoursquareHours(place.hours),
    website: place.website ?? null,
    mapsUrl: place.link ?? null,
    phone: place.tel ?? null,
  };
}

export async function searchFoursquareLabs({ apiKey, latitude, longitude, query, services }) {
  const areaQuery = normalizeAreaQuery(query);
  const requestedServices = getRequestedServices(services);
  const origin =
    latitude !== null && longitude !== null ? { lat: latitude, lng: longitude } : null;

  const requests = requestedServices.map(async (service) => {
    const url = new URL(FOURSQUARE_SEARCH_URL);
    url.searchParams.set("query", SERVICE_QUERY_MAP[service]);
    if (origin) {
      url.searchParams.set("ll", `${origin.lat},${origin.lng}`);
      url.searchParams.set("radius", "12000");
    } else {
      url.searchParams.set("near", `${areaQuery}, NY`);
    }
    url.searchParams.set("limit", "8");
    url.searchParams.set(
      "fields",
      [
        "fsq_id",
        "name",
        "description",
        "location",
        "geocodes",
        "categories",
        "rating",
        "price",
        "hours",
        "photos",
        "website",
        "link",
        "tel",
      ].join(","),
    );

    const response = await fetch(url, {
      headers: getHeaders(apiKey),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const payload = await response.json();
    const results = payload.results ?? [];

    return results
      .map((place) => {
        const parts = extractFoursquareAddressParts(place.location);

        if (!isWithinNyc(place.location?.formatted_address, parts.borough, parts.neighborhood)) {
          return null;
        }

        return mapFoursquarePlace(place, [service], origin);
      })
      .filter(Boolean);
  });

  return uniqueLabs((await Promise.all(requests)).flat(), origin);
}

export async function getFoursquareLabById({ apiKey, sourceId }) {
  const url = new URL(`${FOURSQUARE_PLACE_URL}/${sourceId}`);
  url.searchParams.set(
    "fields",
    [
      "fsq_id",
      "name",
      "description",
      "location",
      "geocodes",
      "categories",
      "rating",
      "price",
      "hours",
      "photos",
      "website",
      "link",
      "tel",
    ].join(","),
  );

  const response = await fetch(url, {
    headers: getHeaders(apiKey),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const place = await response.json();
  const parts = extractFoursquareAddressParts(place.location);

  if (!isWithinNyc(place.location?.formatted_address, parts.borough, parts.neighborhood)) {
    return null;
  }

  return mapFoursquarePlace(place, []);
}
