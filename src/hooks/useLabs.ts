import { useEffect, useState } from "react";
import { fetchLabs } from "../services/labsApi";
import type { LabSearchResponse, LabService, PhotoLab } from "../types";

type UseLabsState = {
  error: string | null;
  isLoading: boolean;
  labs: PhotoLab[];
  provider: LabSearchResponse["provider"] | null;
  usedFallback: boolean;
};

export function useLabs(
  query: string,
  services: LabService[],
  latitude: number | null,
  longitude: number | null,
) {
  const [state, setState] = useState<UseLabsState>({
    error: null,
    isLoading: true,
    labs: [],
    provider: null,
    usedFallback: false,
  });

  useEffect(() => {
    const controller = new AbortController();

    setState((current) => ({
      ...current,
      error: null,
      isLoading: true,
    }));

    fetchLabs({ query, services, latitude, longitude }, controller.signal)
      .then((payload) => {
        setState({
          error: null,
          isLoading: false,
          labs: payload.labs,
          provider: payload.provider,
          usedFallback: payload.usedFallback,
        });
      })
      .catch((error: Error) => {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          error: error.message,
          isLoading: false,
          labs: [],
          provider: null,
          usedFallback: false,
        });
      });

    return () => {
      controller.abort();
    };
  }, [latitude, longitude, query, services]);

  return state;
}
