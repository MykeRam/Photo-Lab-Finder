const NYC_CENTER = { lat: 40.7128, lng: -74.006 };
const NYC_BOUNDS = {
  minLat: 40.4774,
  maxLat: 40.9176,
  minLng: -74.2591,
  maxLng: -73.7004,
};

export const SERVICE_QUERY_MAP = {
  develop: "film developing lab",
  scan: "film scanning lab",
  prints: "photo printing lab",
  sameDay: "same day film lab",
};

export const SERVICE_LABELS = {
  develop: "Develop",
  scan: "Scan",
  prints: "Prints",
  sameDay: "Same-Day",
};

export function getRequestedServices(services) {
  return services.length > 0 ? services : ["develop", "scan", "prints", "sameDay"];
}

export function normalizeAreaQuery(query) {
  const trimmed = query.trim();

  if (trimmed.length === 0) {
    return "New York City";
  }

  return /new york|nyc|brooklyn|queens|bronx|manhattan|staten island/i.test(trimmed)
    ? trimmed
    : `${trimmed}, New York City`;
}

export function isCoordinateWithinNyc(latitude, longitude) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= NYC_BOUNDS.minLat &&
    latitude <= NYC_BOUNDS.maxLat &&
    longitude >= NYC_BOUNDS.minLng &&
    longitude <= NYC_BOUNDS.maxLng
  );
}

export function isWithinNyc(address = "", borough = "", neighborhood = "") {
  const text = `${address} ${borough} ${neighborhood}`.toLowerCase();

  return (
    text.includes("new york") ||
    text.includes("brooklyn") ||
    text.includes("queens") ||
    text.includes("bronx") ||
    text.includes("manhattan") ||
    text.includes("staten island")
  );
}

export function encodeLabId(provider, sourceId) {
  return Buffer.from(`${provider}:${sourceId}`).toString("base64url");
}

export function decodeLabId(encoded) {
  const raw = Buffer.from(encoded, "base64url").toString("utf8");
  const separatorIndex = raw.indexOf(":");

  if (separatorIndex === -1) {
    throw new Error("Invalid lab id.");
  }

  return {
    provider: raw.slice(0, separatorIndex),
    sourceId: raw.slice(separatorIndex + 1),
  };
}

export function mapPriceTier(priceLevel) {
  if (typeof priceLevel === "number") {
    if (priceLevel <= 1) {
      return "$";
    }

    if (priceLevel === 2) {
      return "$$";
    }

    return "$$$";
  }

  const normalized = String(priceLevel ?? "").toLowerCase();

  if (normalized.includes("free") || normalized.endsWith("_cheap")) {
    return "$";
  }

  if (normalized.endsWith("_expensive") || normalized.endsWith("_very_expensive")) {
    return "$$$";
  }

  return "$$";
}

export function mapTurnaround(services) {
  if (services.includes("sameDay")) {
    return "same-day";
  }

  if (services.includes("develop") && services.includes("scan")) {
    return "1-2 days";
  }

  if (services.includes("prints")) {
    return "2-3 days";
  }

  return "4-7 days";
}

export function inferServicesFromText(text, initialServices = []) {
  const normalized = text.toLowerCase();
  const services = new Set(initialServices);

  if (/develop|processing|process|c-41|black-and-white|film lab/.test(normalized)) {
    services.add("develop");
  }

  if (/scan|scanning|noritsu|frontier|tiff|jpeg/.test(normalized)) {
    services.add("scan");
  }

  if (/print|prints|printing|giclee|c-print/.test(normalized)) {
    services.add("prints");
  }

  if (/same day|rush|express|1-hour|one hour/.test(normalized)) {
    services.add("sameDay");
  }

  return Array.from(services);
}

export function buildDescription({ matchedServices, primaryType, borough, neighborhood, sourceLabel }) {
  const serviceText =
    matchedServices.length > 0
      ? matchedServices.map((service) => SERVICE_LABELS[service]).join(", ").toLowerCase()
      : "photo lab";

  const locationText = [neighborhood, borough].filter(Boolean).join(", ");
  return `${serviceText} match in ${locationText || "New York City"} from ${sourceLabel}${primaryType ? ` · ${primaryType}` : ""}.`;
}

export function normalizeBorough(rawBorough = "", formattedAddress = "") {
  const text = `${rawBorough} ${formattedAddress}`.toLowerCase();

  if (text.includes("brooklyn")) return "Brooklyn";
  if (text.includes("queens")) return "Queens";
  if (text.includes("bronx")) return "Bronx";
  if (text.includes("staten island")) return "Staten Island";
  if (text.includes("manhattan") || /new york,\s*ny/i.test(formattedAddress)) return "Manhattan";

  return rawBorough || "New York City";
}

export function extractGoogleAddressParts(addressComponents = [], formattedAddress = "") {
  const findComponent = (...types) =>
    addressComponents.find((component) => types.some((type) => component.types?.includes(type)));

  const boroughComponent =
    findComponent("sublocality_level_1") ||
    findComponent("locality") ||
    findComponent("administrative_area_level_2");
  const neighborhoodComponent =
    findComponent("neighborhood") ||
    findComponent("sublocality_level_2") ||
    findComponent("sublocality_level_3") ||
    boroughComponent;
  const boroughText = boroughComponent?.longText || boroughComponent?.shortText || "";
  const normalizedBorough = normalizeBorough(boroughText, formattedAddress);

  return {
    borough: normalizedBorough,
    neighborhood:
      neighborhoodComponent?.longText ||
      neighborhoodComponent?.shortText ||
      normalizedBorough ||
      "New York City",
  };
}

export function extractFoursquareAddressParts(location = {}) {
  const borough = normalizeBorough(
    location.borough || location.locality || location.region || "",
    location.formatted_address || "",
  );

  return {
    borough,
    neighborhood: location.neighborhood?.[0] || borough || "New York City",
  };
}

export function createFallbackCoordinates(location) {
  return {
    lat: Number(location?.latitude ?? NYC_CENTER.lat),
    lng: Number(location?.longitude ?? NYC_CENTER.lng),
  };
}

export function calculateDistanceMiles(origin, destination) {
  if (!origin) {
    return null;
  }

  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const deltaLat = toRadians(destination.lat - origin.lat);
  const deltaLng = toRadians(destination.lng - origin.lng);
  const lat1 = toRadians(origin.lat);
  const lat2 = toRadians(destination.lat);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return 2 * earthRadiusMiles * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function uniqueLabs(labs, origin = null) {
  const merged = new Map();

  for (const lab of labs) {
    const existing = merged.get(lab.id);

    if (!existing) {
      merged.set(lab.id, lab);
      continue;
    }

    merged.set(lab.id, {
      ...existing,
      ...lab,
      services: Array.from(new Set([...existing.services, ...lab.services])),
      specialties:
        lab.specialties.length > existing.specialties.length ? lab.specialties : existing.specialties,
      description:
        existing.description.length >= lab.description.length ? existing.description : lab.description,
      imageUrl: existing.imageUrl || lab.imageUrl,
    });
  }

  return Array.from(merged.values()).sort((left, right) => {
    if (origin && left.distanceMiles !== null && right.distanceMiles !== null) {
      return left.distanceMiles - right.distanceMiles;
    }

    return right.rating - left.rating;
  });
}
