import { useEffect, useState } from "react";
import { fetchLabs } from "../services/labsApi";
import type { PhotoLab } from "../types";

type UseLabsState = {
  labs: PhotoLab[];
  isLoading: boolean;
  error: string | null;
};

export function useLabs() {
  const [state, setState] = useState<UseLabsState>({
    labs: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isActive = true;

    fetchLabs()
      .then((labs) => {
        if (!isActive) {
          return;
        }

        setState({
          labs,
          isLoading: false,
          error: null,
        });
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setState({
          labs: [],
          isLoading: false,
          error: "Unable to load photo labs right now.",
        });
      });

    return () => {
      isActive = false;
    };
  }, []);

  return state;
}
