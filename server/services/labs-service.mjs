import { getDb } from "../db/mongo.mjs";
import { seedLabs } from "../data/seed-labs.mjs";
import { decodeLabId, isCoordinateWithinNyc } from "../lib/place-utils.mjs";
import { findCuratedLabs, findLabBySourceId, seedCuratedLabs, upsertLabs } from "../repositories/labs.mjs";
import { getFoursquareLabById, searchFoursquareLabs } from "../providers/foursquare.mjs";
import { getGoogleLabById, searchGoogleLabs } from "../providers/google.mjs";
import { getSeedLabById, searchSeedLabs } from "../providers/seed.mjs";

function getProviderOrder() {
  return (process.env.PLACES_PROVIDER_ORDER ?? "google,foursquare")
    .split(",")
    .map((provider) => provider.trim())
    .filter(Boolean);
}

export function parseSearchInput(input) {
  return {
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    query: input.query ?? "",
    services: input.services ?? [],
  };
}

export function assertNycCoordinates(latitude, longitude) {
  if (latitude === null || longitude === null) return;

  if (!isCoordinateWithinNyc(latitude, longitude)) {
    const error = new Error("Current location must be within New York City for this app.");
    error.statusCode = 400;
    throw error;
  }
}

async function getLiveProviderResults(input) {
  const providerOrder = getProviderOrder();

  for (const provider of providerOrder) {
    try {
      if (provider === "google" && process.env.GOOGLE_PLACES_API_KEY) {
        const labs = await searchGoogleLabs({
          apiKey: process.env.GOOGLE_PLACES_API_KEY,
          ...input,
        });

        if (labs.length > 0) {
          return { provider: "google", usedFallback: false, labs };
        }
      }

      if (provider === "foursquare" && process.env.FOURSQUARE_API_KEY) {
        const labs = await searchFoursquareLabs({
          apiKey: process.env.FOURSQUARE_API_KEY,
          ...input,
        });

        if (labs.length > 0) {
          return {
            provider: "foursquare",
            usedFallback: providerOrder[0] !== "foursquare",
            labs,
          };
        }
      }
    } catch (error) {
      console.error(`[search:${provider}]`, error);
    }
  }

  return null;
}

export async function searchLabs(input) {
  assertNycCoordinates(input.latitude, input.longitude);

  const db = await getDb();
  const liveResults = await getLiveProviderResults(input);

  if (liveResults) {
    await upsertLabs(db, liveResults.labs);
    return liveResults;
  }

  const curatedLabs = await findCuratedLabs(db, input);

  if (curatedLabs.length > 0) {
    return {
      provider: "seed",
      usedFallback: true,
      labs: curatedLabs,
    };
  }

  return {
    provider: "seed",
    usedFallback: true,
    labs: await searchSeedLabs(input),
  };
}

export async function getLabById(encodedId) {
  const db = await getDb();
  const { provider, sourceId } = decodeLabId(encodedId);

  try {
    if (provider === "google" && process.env.GOOGLE_PLACES_API_KEY) {
      const lab = await getGoogleLabById({
        apiKey: process.env.GOOGLE_PLACES_API_KEY,
        sourceId,
      });

      if (lab) {
        await upsertLabs(db, [lab]);
        return lab;
      }
    }

    if (provider === "foursquare" && process.env.FOURSQUARE_API_KEY) {
      const lab = await getFoursquareLabById({
        apiKey: process.env.FOURSQUARE_API_KEY,
        sourceId,
      });

      if (lab) {
        await upsertLabs(db, [lab]);
        return lab;
      }
    }
  } catch (error) {
    console.error(`[detail:${provider}]`, error);
  }

  const cachedLab = await findLabBySourceId(db, provider, sourceId);
  if (cachedLab) return cachedLab;

  if (provider === "seed") {
    return getSeedLabById(sourceId);
  }

  return null;
}

export async function runSeedCuratedLabs() {
  const db = await getDb();
  return seedCuratedLabs(db, seedLabs);
}
