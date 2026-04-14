import { useEffect, useMemo, useState } from "react";
import { createSearchParams, useSearchParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { FilterPanel } from "../components/FilterPanel";
import { LabList } from "../components/LabList";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useCurrentLocation } from "../hooks/useCurrentLocation";
import { useLabs } from "../hooks/useLabs";
import type { LabService, NoteMap, ViewMode } from "../types";
import "./HomePage.css";

type HomePageProps = {
  favoriteIds: string[];
  notesByLabId: NoteMap;
  onToggleFavorite: (id: string) => void;
};

const validServices = new Set<LabService>(["develop", "scan", "prints", "sameDay"]);

function parseServices(value: string | null) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item): item is LabService => validServices.has(item as LabService));
}

export function HomePage({
  favoriteIds,
  notesByLabId,
  onToggleFavorite,
}: HomePageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);
  const query = searchParams.get("q") ?? "";
  const servicesParam = searchParams.get("services");
  const activeServices = useMemo(() => parseServices(servicesParam), [servicesParam]);
  const viewMode = searchParams.get("view") === "map" ? "map" : "cards";
  const latitudeParam = searchParams.get("lat");
  const longitudeParam = searchParams.get("lng");
  const parsedLatitude = latitudeParam ? Number(latitudeParam) : null;
  const parsedLongitude = longitudeParam ? Number(longitudeParam) : null;
  const latitude = Number.isFinite(parsedLatitude) ? parsedLatitude : null;
  const longitude = Number.isFinite(parsedLongitude) ? parsedLongitude : null;
  const hasCurrentLocation = latitude !== null && longitude !== null;
  const debouncedQuery = useDebouncedValue(query, 350);
  const { clearLocationError, isLocating, locationError, requestCurrentLocation } = useCurrentLocation();
  const { error, isLoading, labs, provider, usedFallback } = useLabs(
    debouncedQuery,
    activeServices,
    latitude,
    longitude,
  );
  const filteredLabs = labs;

  useEffect(() => {
    if (filteredLabs.length === 0) {
      setSelectedLabId(null);
      return;
    }

    if (!selectedLabId || !filteredLabs.some((lab) => lab.id === selectedLabId)) {
      setSelectedLabId(filteredLabs[0].id);
    }
  }, [filteredLabs, selectedLabId]);

  function updateSearchParams(next: {
    latitude?: number | null;
    longitude?: number | null;
    q?: string;
    services?: LabService[];
    view?: ViewMode;
  }) {
    const params = createSearchParams();

    const nextQuery = next.q ?? query;
    const nextServices = next.services ?? activeServices;
    const nextView = next.view ?? viewMode;
    const nextLatitude =
      next.latitude === undefined ? latitude : next.latitude;
    const nextLongitude =
      next.longitude === undefined ? longitude : next.longitude;

    if (nextQuery.trim()) {
      params.set("q", nextQuery.trim());
    }

    if (nextServices.length > 0) {
      params.set("services", nextServices.join(","));
    }

    if (nextView === "map") {
      params.set("view", "map");
    }

    if (nextLatitude !== null && nextLongitude !== null) {
      params.set("lat", String(nextLatitude));
      params.set("lng", String(nextLongitude));
    }

    setSearchParams(params, { replace: true });
  }

  function handleToggleService(service: LabService) {
    const nextServices = activeServices.includes(service)
      ? activeServices.filter((item) => item !== service)
      : [...activeServices, service];

    updateSearchParams({ services: nextServices });
  }

  async function handleUseCurrentLocation() {
    try {
      const coordinates = await requestCurrentLocation();
      updateSearchParams({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        q: "",
      });
    } catch {
      return;
    }
  }

  function handleClearCurrentLocation() {
    clearLocationError();
    updateSearchParams({
      latitude: null,
      longitude: null,
    });
  }

  const detailSearch = searchParams.toString().length > 0 ? `?${searchParams.toString()}` : "";

  return (
    <main className="home-page">
      <section className="home-page__hero">
        <div>
          <p className="eyebrow">Core MVP</p>
          <h1>Compare NYC photo labs without losing your shortlist.</h1>
        </div>
        <p className="home-page__copy">
          Search by borough, neighborhood, ZIP, or your current location inside New York City, switch
          between cards and a map/list split, then save labs and keep personal notes for the next roll.
        </p>
      </section>

      <div className="home-page__layout">
        <aside className="home-page__controls">
          <FilterPanel
            activeServices={activeServices}
            hasCurrentLocation={hasCurrentLocation}
            isLocating={isLocating}
            locationError={locationError}
            onClearCurrentLocation={handleClearCurrentLocation}
            onQueryChange={(value) =>
              updateSearchParams({
                latitude: null,
                longitude: null,
                q: value,
              })
            }
            onToggleService={handleToggleService}
            onUseCurrentLocation={handleUseCurrentLocation}
            onViewChange={(mode) => updateSearchParams({ view: mode })}
            query={query}
            viewMode={viewMode}
          />

          <section className="home-page__stats">
            <div className="home-page__stat">
              <span>Matches</span>
              <strong>{filteredLabs.length}</strong>
            </div>
            <div className="home-page__stat">
              <span>Saved</span>
              <strong>{favoriteIds.length}</strong>
            </div>
            <div className="home-page__stat">
              <span>Provider</span>
              <strong>{provider ?? "..."}</strong>
            </div>
            <div className="home-page__stat">
              <span>Search Mode</span>
              <strong>{hasCurrentLocation ? "Nearby" : "Area"}</strong>
            </div>
            <div className="home-page__stat">
              <span>Fallback</span>
              <strong>{usedFallback ? "On" : "Off"}</strong>
            </div>
          </section>
        </aside>

        <section className="home-page__results" aria-live="polite">
          {isLoading ? (
            <LoadingSpinner label="Fetching the current lab list and preparing the map view." />
          ) : null}

          {!isLoading && error ? (
            <EmptyState title="Unable to load labs" body={error} />
          ) : null}

          {!isLoading && !error && filteredLabs.length === 0 ? (
            <EmptyState
              title="No matching labs"
              body="Try a different NYC area, another ZIP code, your current location, or fewer service filters."
            />
          ) : null}

          {!isLoading && !error && filteredLabs.length > 0 ? (
            <LabList
              activeServices={activeServices}
              activeLatitude={latitude}
              activeLongitude={longitude}
              detailSearch={detailSearch}
              favoriteIds={favoriteIds}
              labs={filteredLabs}
              notesByLabId={notesByLabId}
              onHoverLab={setSelectedLabId}
              onPlaceSelect={(nextLatitude, nextLongitude) =>
                updateSearchParams({
                  latitude: nextLatitude,
                  longitude: nextLongitude,
                  q: "",
                  view: "map",
                })
              }
              onToggleFavorite={onToggleFavorite}
              selectedLabId={selectedLabId}
              viewMode={viewMode}
            />
          ) : null}
        </section>
      </div>
    </main>
  );
}
