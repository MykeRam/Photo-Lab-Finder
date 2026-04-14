import { getDb } from "../db/mongo.mjs";
import { decodeLabId, isCoordinateWithinNyc } from "../lib/place-utils.mjs";
import { findLabBySourceId, upsertLabs } from "../repositories/labs.mjs";
import { getFoursquareLabById, searchFoursquareLabs } from "../providers/foursquare.mjs";
import { getGoogleLabById, searchGoogleLabs } from "../providers/google.mjs";

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
          return { provider: "google", labs };
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

  return {
    provider: getProviderOrder()[0] === "foursquare" ? "foursquare" : "google",
    labs: [],
  };
}

export async function getLabById(encodedId) {
  const db = await getDb();
  const { provider, sourceId } = decodeLabId(encodedId);

  if (!["google", "foursquare"].includes(provider)) {
    return null;
  }

  try {
    if (provider === "google" && process.env.GOOGLE_PLACES_API_KEY) {
      const lab = await getGoogleLabById({
        apiKey: process.env.GOOGLE_PLACES_API_KEY,
        sourceId,
      });

      if (lab) {
        const cachedLab = await findLabBySourceId(db, provider, sourceId);
        const mergedLab =
          cachedLab && lab.services.length === 0
            ? {
                ...lab,
                services: cachedLab.services.length > 0 ? cachedLab.services : lab.services,
                specialties:
                  cachedLab.specialties.length > lab.specialties.length
                    ? cachedLab.specialties
                    : lab.specialties,
                description: lab.description || cachedLab.description,
                turnaround: lab.turnaround || cachedLab.turnaround,
                priceTier: lab.priceTier || cachedLab.priceTier,
                hours: lab.hours || cachedLab.hours,
                imageUrl: lab.imageUrl || cachedLab.imageUrl,
                website: lab.website || cachedLab.website,
                mapsUrl: lab.mapsUrl || cachedLab.mapsUrl,
                phone: lab.phone || cachedLab.phone,
              }
            : lab;

        await upsertLabs(db, [mergedLab]);
        return mergedLab;
      }
    }

    if (provider === "foursquare" && process.env.FOURSQUARE_API_KEY) {
      const lab = await getFoursquareLabById({
        apiKey: process.env.FOURSQUARE_API_KEY,
        sourceId,
      });

      if (lab) {
        const cachedLab = await findLabBySourceId(db, provider, sourceId);
        const mergedLab =
          cachedLab && lab.services.length === 0
            ? {
                ...lab,
                services: cachedLab.services.length > 0 ? cachedLab.services : lab.services,
                specialties:
                  cachedLab.specialties.length > lab.specialties.length
                    ? cachedLab.specialties
                    : lab.specialties,
                description: lab.description || cachedLab.description,
                turnaround: lab.turnaround || cachedLab.turnaround,
                priceTier: lab.priceTier || cachedLab.priceTier,
                hours: lab.hours || cachedLab.hours,
                imageUrl: lab.imageUrl || cachedLab.imageUrl,
                website: lab.website || cachedLab.website,
                mapsUrl: lab.mapsUrl || cachedLab.mapsUrl,
                phone: lab.phone || cachedLab.phone,
              }
            : lab;

        await upsertLabs(db, [mergedLab]);
        return mergedLab;
      }
    }
  } catch (error) {
    console.error(`[detail:${provider}]`, error);
  }

  const cachedLab = await findLabBySourceId(db, provider, sourceId);
  if (cachedLab) return cachedLab;

  return null;
}
