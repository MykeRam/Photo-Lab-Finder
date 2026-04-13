import { encodeLabId } from "../lib/place-utils.mjs";
import { seedLabs } from "../data/seed-labs.mjs";

function mapSeedLab(lab) {
  return {
    ...lab,
    id: encodeLabId("seed", lab.sourceId),
  };
}

export async function searchSeedLabs({ query, services }) {
  const normalizedQuery = query.trim().toLowerCase();

  return seedLabs.filter((lab) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      [lab.name, lab.borough, lab.neighborhood, lab.address].join(" ").toLowerCase().includes(normalizedQuery);

    const matchesServices =
      services.length === 0 || services.every((service) => lab.services.includes(service));

    return matchesQuery && matchesServices;
  }).map(mapSeedLab);
}

export async function getSeedLabById(sourceId) {
  const lab = seedLabs.find((item) => item.sourceId === sourceId);
  return lab ? mapSeedLab(lab) : null;
}
