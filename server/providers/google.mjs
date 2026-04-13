import {
  buildDescription,
  createFallbackCoordinates,
  encodeLabId,
  extractGoogleAddressParts,
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

const GOOGLE_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const GOOGLE_PLACE_URL = "https://places.googleapis.com/v1/places";

function getHeaders(apiKey, fieldMask) {
  return {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": apiKey,
    "X-Goog-FieldMask": fieldMask,
  };
}

async function getGooglePhotoUri(apiKey, photoName, maxWidth = 1200) {
  if (!photoName) {
    return null;
  }

  const response = await fetch(
    `${GOOGLE_PLACE_URL}/${photoName}/media?maxWidthPx=${maxWidth}&skipHttpRedirect=true&key=${encodeURIComponent(apiKey)}`,
  );

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  return payload.photoUri ?? null;
}

function mapGoogleHours(regularOpeningHours) {
  if (regularOpeningHours?.weekdayDescriptions?.length > 0) {
    return regularOpeningHours.weekdayDescriptions[0];
  }

  if (regularOpeningHours?.openNow === true) {
    return "Open now";
  }

  return "Hours not listed";
}

function mapGoogleSpecialties(place, services) {
  const typeNames = (place.types ?? [])
    .filter((type) => !["point_of_interest", "store", "establishment"].includes(type))
    .slice(0, 3)
    .map((type) => type.replaceAll("_", " "));
  const serviceNames = services.map((service) => SERVICE_LABELS[service]);

  return Array.from(new Set([...serviceNames, ...typeNames]));
}

async function mapGooglePlace(place, apiKey, matchedServices) {
  const parts = extractGoogleAddressParts(place.addressComponents, place.formattedAddress);
  const searchableText = [
    place.displayName?.text,
    place.formattedAddress,
    place.editorialSummary?.text,
    place.primaryTypeDisplayName?.text,
    ...(place.types ?? []),
  ]
    .filter(Boolean)
    .join(" ");
  const services = inferServicesFromText(searchableText, matchedServices);
  const imageUrl = place.photos?.[0]?.name ? await getGooglePhotoUri(apiKey, place.photos[0].name) : null;

  return {
    id: encodeLabId("google", place.id),
    source: "google",
    sourceId: place.id,
    sourceLabel: "Google Places",
    name: place.displayName?.text ?? "Unnamed Lab",
    borough: parts.borough,
    neighborhood: parts.neighborhood,
    address: place.formattedAddress ?? "Address not listed",
    description:
      place.editorialSummary?.text ||
      buildDescription({
        matchedServices: services,
        primaryType: place.primaryTypeDisplayName?.text ?? "",
        borough: parts.borough,
        neighborhood: parts.neighborhood,
        sourceLabel: "Google Places",
      }),
    services,
    turnaround: mapTurnaround(services),
    priceTier: mapPriceTier(place.priceLevel),
    rating: Number(place.rating ?? 0),
    coordinates: createFallbackCoordinates(place.location),
    imageUrl,
    specialties: mapGoogleSpecialties(place, services),
    hours: mapGoogleHours(place.regularOpeningHours),
    website: place.websiteUri ?? null,
    mapsUrl: place.googleMapsUri ?? null,
    phone: place.nationalPhoneNumber ?? null,
  };
}

export async function searchGoogleLabs({ apiKey, query, services }) {
  const areaQuery = normalizeAreaQuery(query);
  const requestedServices = getRequestedServices(services);

  const requests = requestedServices.map(async (service) => {
    const response = await fetch(GOOGLE_SEARCH_URL, {
      method: "POST",
      headers: getHeaders(
        apiKey,
        [
          "places.id",
          "places.displayName",
          "places.formattedAddress",
          "places.location",
          "places.rating",
          "places.priceLevel",
          "places.regularOpeningHours",
          "places.editorialSummary",
          "places.primaryTypeDisplayName",
          "places.googleMapsUri",
          "places.photos",
          "places.types",
          "places.addressComponents",
        ].join(","),
      ),
      body: JSON.stringify({
        textQuery: `${SERVICE_QUERY_MAP[service]} in ${areaQuery}`,
        languageCode: "en",
        regionCode: "US",
        maxResultCount: 6,
        locationBias: {
          circle: {
            center: {
              latitude: 40.7128,
              longitude: -74.006,
            },
            radius: 22000,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const payload = await response.json();
    const places = payload.places ?? [];

    const mapped = await Promise.all(
      places.map(async (place) => {
        const parts = extractGoogleAddressParts(place.addressComponents, place.formattedAddress);

        if (!isWithinNyc(place.formattedAddress, parts.borough, parts.neighborhood)) {
          return null;
        }

        return mapGooglePlace(place, apiKey, [service]);
      }),
    );

    return mapped.filter(Boolean);
  });

  return uniqueLabs((await Promise.all(requests)).flat());
}

export async function getGoogleLabById({ apiKey, sourceId }) {
  const response = await fetch(`${GOOGLE_PLACE_URL}/${sourceId}`, {
    headers: getHeaders(
      apiKey,
      [
        "id",
        "displayName",
        "formattedAddress",
        "location",
        "rating",
        "priceLevel",
        "regularOpeningHours",
        "editorialSummary",
        "primaryTypeDisplayName",
        "googleMapsUri",
        "websiteUri",
        "nationalPhoneNumber",
        "photos",
        "types",
        "addressComponents",
      ].join(","),
    ),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const place = await response.json();
  const parts = extractGoogleAddressParts(place.addressComponents, place.formattedAddress);

  if (!isWithinNyc(place.formattedAddress, parts.borough, parts.neighborhood)) {
    return null;
  }

  return mapGooglePlace(place, apiKey, []);
}
