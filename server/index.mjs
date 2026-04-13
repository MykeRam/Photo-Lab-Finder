import { createServer } from "node:http";
import { decodeLabId } from "./lib/place-utils.mjs";
import { getFoursquareLabById, searchFoursquareLabs } from "./providers/foursquare.mjs";
import { getGoogleLabById, searchGoogleLabs } from "./providers/google.mjs";
import { getSeedLabById, searchSeedLabs } from "./providers/seed.mjs";

const port = Number(process.env.PORT ?? 8787);

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function getProviderOrder() {
  return (process.env.PLACES_PROVIDER_ORDER ?? "google,foursquare")
    .split(",")
    .map((provider) => provider.trim())
    .filter(Boolean);
}

function getSearchInput(url) {
  return {
    query: url.searchParams.get("q") ?? "",
    services: (url.searchParams.get("services") ?? "")
      .split(",")
      .map((service) => service.trim())
      .filter(Boolean),
  };
}

async function searchLabs(input) {
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

  return {
    provider: "seed",
    usedFallback: true,
    labs: await searchSeedLabs(input),
  };
}

async function getLabById(encodedId) {
  const { provider, sourceId } = decodeLabId(encodedId);

  if (provider === "google" && process.env.GOOGLE_PLACES_API_KEY) {
    return getGoogleLabById({
      apiKey: process.env.GOOGLE_PLACES_API_KEY,
      sourceId,
    });
  }

  if (provider === "foursquare" && process.env.FOURSQUARE_API_KEY) {
    return getFoursquareLabById({
      apiKey: process.env.FOURSQUARE_API_KEY,
      sourceId,
    });
  }

  if (provider === "seed") {
    return getSeedLabById(sourceId);
  }

  return null;
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);

  if (request.method === "GET" && url.pathname === "/api/health") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/labs") {
    try {
      sendJson(response, 200, await searchLabs(getSearchInput(url)));
    } catch (error) {
      console.error("[api/labs]", error);
      sendJson(response, 500, { message: "Unable to load NYC photo labs right now." });
    }
    return;
  }

  if (request.method === "GET" && url.pathname.startsWith("/api/labs/")) {
    try {
      const encodedId = decodeURIComponent(url.pathname.replace("/api/labs/", ""));
      const lab = await getLabById(encodedId);

      if (!lab) {
        sendJson(response, 404, { message: "Lab not found." });
        return;
      }

      sendJson(response, 200, { provider: lab.source, lab });
    } catch (error) {
      console.error("[api/labs/:id]", error);
      sendJson(response, 500, { message: "Unable to load this NYC photo lab right now." });
    }
    return;
  }

  sendJson(response, 404, { message: "Not found." });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`API server listening on http://127.0.0.1:${port}`);
});
