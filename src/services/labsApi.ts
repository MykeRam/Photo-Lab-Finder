import type { LabSearchInput, LabSearchResponse, PhotoLab } from "../types";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message ?? "Request failed.");
  }

  return payload as T;
}

function buildApiUrl(path: string) {
  return apiBaseUrl ? new URL(path, apiBaseUrl).toString() : path;
}

export function fetchLabs(input: LabSearchInput, signal?: AbortSignal) {
  const params = new URLSearchParams();

  if (input.query.trim()) {
    params.set("q", input.query.trim());
  }

  if (input.services.length > 0) {
    params.set("services", input.services.join(","));
  }

  if (input.latitude !== null && input.longitude !== null) {
    params.set("lat", String(input.latitude));
    params.set("lng", String(input.longitude));
  }

  const endpoint =
    input.latitude !== null && input.longitude !== null ? "/api/labs/nearby" : "/api/labs/search";

  return requestJson<LabSearchResponse>(buildApiUrl(`${endpoint}?${params.toString()}`), {
    signal,
  });
}

export async function fetchLabById(labId: string, signal?: AbortSignal) {
  const payload = await requestJson<{ lab: PhotoLab }>(
    buildApiUrl(`/api/labs/${encodeURIComponent(labId)}`),
    { signal },
  );

  return payload.lab;
}

export function fetchGooglePlacePhoto(placeId: string, signal?: AbortSignal) {
  return requestJson<{ imageUrl: string | null; photoAttributions: string[] }>(
    buildApiUrl(`/api/google-place-photo?placeId=${encodeURIComponent(placeId)}`),
    { signal },
  );
}
