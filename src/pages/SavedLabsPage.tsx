import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { HeartIcon } from "../components/HeartIcon";
import { LabCard } from "../components/LabCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { fetchLabById } from "../services/labsApi";
import type { NoteMap, PhotoLab } from "../types";
import "./SavedLabsPage.css";

const logoSrc = `${import.meta.env.BASE_URL}NYC-Photo-Lab-Logo.png`;

type SavedLabsPageProps = {
  favoriteIds: string[];
  notesByLabId: NoteMap;
  onToggleFavorite: (id: string) => void;
};

type SavedLabsState = {
  error: string | null;
  isLoading: boolean;
  labs: PhotoLab[];
};

export function SavedLabsPage({
  favoriteIds,
  notesByLabId,
  onToggleFavorite,
}: SavedLabsPageProps) {
  const [state, setState] = useState<SavedLabsState>({
    error: null,
    isLoading: favoriteIds.length > 0,
    labs: [],
  });

  useEffect(() => {
    if (favoriteIds.length === 0) {
      setState({
        error: null,
        isLoading: false,
        labs: [],
      });
      return;
    }

    const controller = new AbortController();

    setState((current) => ({
      ...current,
      error: null,
      isLoading: true,
    }));

    Promise.allSettled(favoriteIds.map((labId) => fetchLabById(labId, controller.signal)))
      .then((results) => {
        if (controller.signal.aborted) {
          return;
        }

        const labs = results
          .filter((result): result is PromiseFulfilledResult<PhotoLab> => result.status === "fulfilled")
          .map((result) => result.value);
        const missingCount = results.length - labs.length;

        setState({
          error:
            missingCount > 0
              ? `${missingCount} saved lab${missingCount === 1 ? "" : "s"} could not be loaded.`
              : null,
          isLoading: false,
          labs,
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
        });
      });

    return () => {
      controller.abort();
    };
  }, [favoriteIds]);

  if (state.isLoading) {
    return (
      <main className="saved-labs-page">
        <LoadingSpinner label="Loading saved labs." />
      </main>
    );
  }

  return (
    <main className="saved-labs-page">
      <div className="saved-labs-page__header">
        <img className="saved-labs-page__logo" src={logoSrc} alt="NYC Photo Lab Finder" />
        <h1 className="saved-labs-page__title">
          <HeartIcon className="saved-labs-page__title-icon" />
          Saved Labs
        </h1>
        <Link className="saved-labs-page__back-link" to="/">
          Back to search
        </Link>
      </div>

      {state.error ? <EmptyState title="Some saved labs are unavailable" body={state.error} /> : null}

      {!state.error && state.labs.length === 0 ? (
        <EmptyState
          title="No saved labs yet"
          body="Save a lab from the live map results to keep it in your shortlist."
        />
      ) : null}

      {state.labs.length > 0 ? (
        <section className="saved-labs-page__grid">
          {state.labs.map((lab) => (
            <LabCard
              key={lab.id}
              detailHref={`/labs/${lab.id}`}
              isFavorite={favoriteIds.includes(lab.id)}
              lab={lab}
              layout="card"
              note={notesByLabId[lab.id]}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </section>
      ) : null}
    </main>
  );
}
