import express from "express";
import { getDb } from "./db/mongo.mjs";
import { getGooglePlacePhoto } from "./providers/google.mjs";
import { getLabById, parseSearchInput, searchLabs } from "./services/labs-service.mjs";

const port = Number(process.env.PORT ?? 8787);
const app = express();

app.use(express.json());

app.get("/api/health", async (_request, response) => {
  try {
    const db = await getDb();
    response.status(200).json({
      ok: true,
      dbEnabled: Boolean(db),
    });
  } catch (error) {
    response.status(200).json({
      ok: true,
      dbEnabled: false,
      dbError: error.message,
    });
  }
});

app.get("/api/labs/search", async (request, response) => {
  try {
    const payload = await searchLabs(
      parseSearchInput({
        query: request.query.q,
        services: String(request.query.services ?? "")
          .split(",")
          .map((service) => service.trim())
          .filter(Boolean),
      }),
    );

    response.status(200).json(payload);
  } catch (error) {
    console.error("[GET /api/labs/search]", error);
    response.status(error.statusCode ?? 500).json({
      message: error.message ?? "Unable to load NYC photo labs right now.",
    });
  }
});

app.get("/api/labs/nearby", async (request, response) => {
  try {
    const latitude = Number(request.query.lat);
    const longitude = Number(request.query.lng);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      response.status(400).json({
        message: "Nearby search requires lat and lng query parameters.",
      });
      return;
    }

    const payload = await searchLabs(
      parseSearchInput({
        latitude,
        longitude,
        query: request.query.q ?? "",
        services: String(request.query.services ?? "")
          .split(",")
          .map((service) => service.trim())
          .filter(Boolean),
      }),
    );

    response.status(200).json(payload);
  } catch (error) {
    console.error("[GET /api/labs/nearby]", error);
    response.status(error.statusCode ?? 500).json({
      message: error.message ?? "Unable to load nearby NYC photo labs right now.",
    });
  }
});

app.get("/api/labs/:id", async (request, response) => {
  try {
    const lab = await getLabById(decodeURIComponent(request.params.id));

    if (!lab) {
      response.status(404).json({
        message: "Lab not found.",
      });
      return;
    }

    response.status(200).json({
      provider: lab.source,
      lab,
    });
  } catch (error) {
    console.error("[GET /api/labs/:id]", error);
    response.status(500).json({
      message: "Unable to load this NYC photo lab right now.",
    });
  }
});

app.get("/api/google-place-photo", async (request, response) => {
  try {
    const placeId = String(request.query.placeId ?? "").trim();

    if (!placeId) {
      response.status(400).json({
        message: "Google place photo requests require a placeId.",
      });
      return;
    }

    if (!process.env.GOOGLE_PLACES_API_KEY) {
      response.status(503).json({
        message: "Google Places API is not configured on the server.",
      });
      return;
    }

    const payload = await getGooglePlacePhoto({
      apiKey: process.env.GOOGLE_PLACES_API_KEY,
      placeId,
    });

    response.status(200).json(payload);
  } catch (error) {
    console.error("[GET /api/google-place-photo]", error);
    response.status(500).json({
      message: "Unable to load this Google place photo right now.",
    });
  }
});

app.use("/api", (_request, response) => {
  response.status(404).json({
    message: "Not found.",
  });
});

app.listen(port, "127.0.0.1", () => {
  console.log(`API server listening on http://127.0.0.1:${port}`);
});
