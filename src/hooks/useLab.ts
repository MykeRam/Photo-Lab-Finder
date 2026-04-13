import { useEffect, useState } from "react";
import { fetchLabById } from "../services/labsApi";
import type { PhotoLab } from "../types";

type UseLabState = {
  error: string | null;
  isLoading: boolean;
  lab: PhotoLab | null;
};

export function useLab(labId: string | undefined) {
  const [state, setState] = useState<UseLabState>({
    error: null,
    isLoading: Boolean(labId),
    lab: null,
  });

  useEffect(() => {
    if (!labId) {
      setState({
        error: "Missing lab id.",
        isLoading: false,
        lab: null,
      });
      return;
    }

    const controller = new AbortController();

    setState((current) => ({
      ...current,
      error: null,
      isLoading: true,
    }));

    fetchLabById(labId, controller.signal)
      .then((lab) => {
        setState({
          error: null,
          isLoading: false,
          lab,
        });
      })
      .catch((error: Error) => {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          error: error.message,
          isLoading: false,
          lab: null,
        });
      });

    return () => {
      controller.abort();
    };
  }, [labId]);

  return state;
}
