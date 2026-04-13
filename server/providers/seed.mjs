import { calculateDistanceMiles, encodeLabId } from "../lib/place-utils.mjs";
import { seedLabs } from "../data/seed-labs.mjs";

function mapSeedLab(lab, origin = null) {
  return {
    ...lab,
    distanceMiles: calculateDistanceMiles(origin, lab.coordinates),
    id: encodeLabId("seed", lab.sourceId),
  };
}

export async function searchSeedLabs({ latitude, longitude, query, services }) {
  const normalizedQuery = query.trim().toLowerCase();
  const origin =
    latitude !== null && longitude !== null ? { lat: latitude, lng: longitude } : null;

  return seedLabs.filter((lab) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      [lab.name, lab.borough, lab.neighborhood, lab.address].join(" ").toLowerCase().includes(normalizedQuery);

    const matchesServices =
      services.length === 0 || services.every((service) => lab.services.includes(service));

    return matchesQuery && matchesServices;
  }).map((lab) => mapSeedLab(lab, origin));
}

export async function getSeedLabById(sourceId) {
  const lab = seedLabs.find((item) => item.sourceId === sourceId);
  return lab ? mapSeedLab(lab) : null;
}
