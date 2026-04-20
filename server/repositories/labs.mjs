import { calculateDistanceMiles } from "../lib/place-utils.mjs";

function extractZip(address) {
  const match = address.match(/\b(\d{5})(?:-\d{4})?\b/);
  return match ? match[1] : "";
}

function splitStreet(address) {
  return address.split(",")[0]?.trim() ?? address;
}

function inferFlagsFromText(text) {
  const normalized = text.toLowerCase();

  return {
    format35mm: /35mm/.test(normalized),
    format120: /\b120\b|medium format/.test(normalized),
    disposableCamera: /disposable/.test(normalized),
    mailIn: /mail-in|mail in/.test(normalized),
    walkIn: /walk-in|walk in|storefront|pickup|drop-off|drop off/.test(normalized),
    c41: /c-41|color negative/.test(normalized),
    bw: /black-and-white|black and white|b&w|\bbw\b/.test(normalized),
    e6: /\be-6\b|\be6\b|slide film/.test(normalized),
  };
}

function deriveTags(lab, inferred) {
  const tags = [];

  if (lab.priceTier === "$" && lab.services.includes("develop")) {
    tags.push("budget-friendly");
  }

  if (lab.services.includes("scan") && lab.rating >= 4.6) {
    tags.push("best-for-high-quality-scans");
  }

  if (lab.services.includes("develop") && inferred.format35mm && lab.priceTier !== "$$$") {
    tags.push("best-for-beginners");
  }

  if (inferred.mailIn && !inferred.walkIn) {
    tags.push("mail-in-only");
  } else {
    tags.push("walk-in");
  }

  return tags;
}

function toEstimatedTurnaround(turnaround) {
  switch (turnaround) {
    case "same-day":
      return { estimatedDaysMin: 0, estimatedDaysMax: 1 };
    case "1-2 days":
      return { estimatedDaysMin: 1, estimatedDaysMax: 2 };
    case "2-3 days":
      return { estimatedDaysMin: 2, estimatedDaysMax: 3 };
    default:
      return { estimatedDaysMin: 4, estimatedDaysMax: 7 };
  }
}

function mapPriceTierToNotes(priceTier) {
  if (priceTier === "$") return "Budget-friendly pricing tier.";
  if (priceTier === "$$$") return "Premium pricing tier.";
  return "Mid-range pricing tier.";
}

export function toLabDocument(lab, { curated = false } = {}) {
  const now = new Date();
  const inferred = inferFlagsFromText(
    [lab.description, lab.hours, ...lab.specialties, ...lab.services].join(" "),
  );
  const turnaroundEstimate = toEstimatedTurnaround(lab.turnaround);
  const zip = extractZip(lab.address);

  return {
    placeSource: lab.source,
    placeId: lab.sourceId,
    name: lab.name,
    borough: lab.borough,
    neighborhood: lab.neighborhood,
    address: {
      street: splitStreet(lab.address),
      city: "New York",
      state: "NY",
      zip,
      formatted: lab.address,
    },
    location: {
      lat: lab.coordinates.lat,
      lng: lab.coordinates.lng,
    },
    locationGeo: {
      type: "Point",
      coordinates: [lab.coordinates.lng, lab.coordinates.lat],
    },
    contact: {
      phone: lab.phone,
      website: lab.website,
      googleMapsUrl: lab.mapsUrl,
    },
    rating: lab.rating,
    reviewCount: 0,
    hours: {
      weekdayText: [lab.hours],
      openNow: null,
    },
    photos: lab.imageUrl
      ? [
          {
            source: lab.source,
            ref: lab.imageUrl,
            url: lab.imageUrl,
            alt: lab.name,
          },
        ]
      : [],
    services: {
      developFilm: lab.services.includes("develop"),
      scanning: lab.services.includes("scan"),
      prints: lab.services.includes("prints"),
      darkroom: false,
      mailIn: inferred.mailIn,
      sameDay: lab.services.includes("sameDay"),
    },
    formats: {
      format35mm: inferred.format35mm,
      format120: inferred.format120,
      sheetFilm: false,
      disposableCamera: inferred.disposableCamera,
    },
    processing: {
      c41: inferred.c41,
      bw: inferred.bw,
      e6: inferred.e6,
    },
    access: {
      walkIn: !inferred.mailIn || inferred.walkIn,
      mailInOnly: inferred.mailIn && !inferred.walkIn,
    },
    turnaround: {
      ...turnaroundEstimate,
      notes: lab.turnaround,
    },
    pricing: {
      currency: "USD",
      devOnlyCents: null,
      devScanCents: null,
      notes: mapPriceTierToNotes(lab.priceTier),
    },
    tags: deriveTags(lab, inferred),
    verified: curated,
    lastCuratedUpdate: curated ? now : null,
    lastExternalSync: curated ? null : now,
    runtime: {
      sourceLabel: lab.sourceLabel,
      description: lab.description,
      services: lab.services,
      turnaround: lab.turnaround,
      priceTier: lab.priceTier,
      specialties: lab.specialties,
      hoursText: lab.hours,
    },
    createdAt: now,
    updatedAt: now,
  };
}

function mapDocumentServices(doc) {
  const services = [];
  if (doc.services?.developFilm) services.push("develop");
  if (doc.services?.scanning) services.push("scan");
  if (doc.services?.prints) services.push("prints");
  if (doc.services?.sameDay) services.push("sameDay");
  return services;
}

function mapDocumentPriceTier(doc) {
  if (doc.runtime?.priceTier) return doc.runtime.priceTier;
  if (doc.pricing?.notes?.includes("Premium")) return "$$$";
  if (doc.pricing?.notes?.includes("Budget")) return "$";
  return "$$";
}

function mapDocumentTurnaround(doc) {
  if (doc.runtime?.turnaround) return doc.runtime.turnaround;
  const max = doc.turnaround?.estimatedDaysMax;
  if (max <= 1) return "same-day";
  if (max <= 2) return "1-2 days";
  if (max <= 3) return "2-3 days";
  return "4-7 days";
}

export function mapDocumentToPhotoLab(doc, origin = null, geoDistanceMeters = null) {
  const coordinates = {
    lat: doc.location.lat,
    lng: doc.location.lng,
  };
  const distanceMiles =
    typeof geoDistanceMeters === "number"
      ? geoDistanceMeters / 1609.344
      : calculateDistanceMiles(origin, coordinates);

  return {
    id: Buffer.from(`${doc.placeSource}:${doc.placeId}`).toString("base64url"),
    source: doc.placeSource,
    sourceId: doc.placeId,
    sourceLabel:
      doc.runtime?.sourceLabel ||
      (doc.placeSource === "google" ? "Google Places" : "External Provider"),
    name: doc.name,
    borough: doc.borough,
    neighborhood: doc.neighborhood,
    address: doc.address.formatted,
    description: doc.runtime?.description ?? "",
    services: mapDocumentServices(doc),
    turnaround: mapDocumentTurnaround(doc),
    priceTier: mapDocumentPriceTier(doc),
    rating: Number(doc.rating ?? 0),
    coordinates,
    distanceMiles,
    imageUrl: doc.photos?.[0]?.url ?? null,
    specialties: doc.runtime?.specialties ?? doc.tags ?? [],
    hours: doc.runtime?.hoursText ?? doc.hours?.weekdayText?.[0] ?? "Hours not listed",
    website: doc.contact?.website ?? null,
    mapsUrl: doc.contact?.googleMapsUrl ?? null,
    phone: doc.contact?.phone ?? null,
  };
}

function buildServiceFilter(services) {
  if (services.length === 0) return {};

  const serviceFieldMap = {
    develop: "services.developFilm",
    scan: "services.scanning",
    prints: "services.prints",
    sameDay: "services.sameDay",
  };

  return {
    $and: services.map((service) => ({
      [serviceFieldMap[service]]: true,
    })),
  };
}

function buildTextFilter(query) {
  const trimmed = query.trim();
  if (!trimmed) return {};

  const regex = new RegExp(trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

  return {
    $or: [
      { name: regex },
      { borough: regex },
      { neighborhood: regex },
      { "address.formatted": regex },
      { "address.zip": regex },
    ],
  };
}

export async function upsertLabs(db, labs, options = {}) {
  if (!db || labs.length === 0) return 0;

  const collection = db.collection("labs");
  const operations = labs.map((lab) => {
    const document = toLabDocument(lab, options);

    return {
      updateOne: {
        filter: { placeSource: document.placeSource, placeId: document.placeId },
        update: {
          $set: { ...document, updatedAt: new Date() },
          $setOnInsert: { createdAt: new Date() },
        },
        upsert: true,
      },
    };
  });

  const result = await collection.bulkWrite(operations, { ordered: false });
  return result.upsertedCount + result.modifiedCount;
}

export async function findLabBySourceId(db, placeSource, placeId) {
  if (!db) return null;

  const doc = await db.collection("labs").findOne({ placeSource, placeId });
  return doc ? mapDocumentToPhotoLab(doc) : null;
}
