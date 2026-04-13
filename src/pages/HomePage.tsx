import { useEffect, useMemo, useState } from "react";
import { createSearchParams, useSearchParams } from "react-router-dom";
import { FilterGroup } from "../components/FilterGroup";
import { LabCard } from "../components/LabCard";
import { LocationControls } from "../components/LocationControls";
import { MapPanel } from "../components/MapPanel";
import { SearchBar } from "../components/SearchBar";
import { StatePanel } from "../components/StatePanel";
import { ViewToggle } from "../components/ViewToggle";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useCurrentLocation } from "../hooks/useCurrentLocation";
import { useLabs } from "../hooks/useLabs";
import type { LabService, NoteMap, ViewMode } from "../types";

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
    <main className="page-content">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Core MVP</p>
          <h1>Compare NYC photo labs without losing your shortlist.</h1>
        </div>
        <p className="hero-panel__copy">
          Search by borough, neighborhood, ZIP, or your current location inside New York City, switch
          between cards and a map/list split, then save labs and keep personal notes for the next roll.
        </p>
      </section>

      <div className="workspace-layout">
        <aside className="control-column">
          <section className="panel">
            <SearchBar
              query={query}
              onQueryChange={(value) =>
                updateSearchParams({
                  latitude: null,
                  longitude: null,
                  q: value,
                })
              }
            />
            <LocationControls
              hasCurrentLocation={hasCurrentLocation}
              isLocating={isLocating}
              locationError={locationError}
              onClearCurrentLocation={handleClearCurrentLocation}
              onUseCurrentLocation={handleUseCurrentLocation}
            />
            <FilterGroup activeServices={activeServices} onToggle={handleToggleService} />
            <ViewToggle value={viewMode} onChange={(mode) => updateSearchParams({ view: mode })} />
          </section>

          <section className="stats-grid">
            <div className="panel panel--stat">
              <span>Matches</span>
              <strong>{filteredLabs.length}</strong>
            </div>
            <div className="panel panel--stat">
              <span>Saved</span>
              <strong>{favoriteIds.length}</strong>
            </div>
            <div className="panel panel--stat">
              <span>Provider</span>
              <strong>{provider ?? "..."}</strong>
            </div>
            <div className="panel panel--stat">
              <span>Search Mode</span>
              <strong>{hasCurrentLocation ? "Nearby" : "Area"}</strong>
            </div>
            <div className="panel panel--stat">
              <span>Fallback</span>
              <strong>{usedFallback ? "On" : "Off"}</strong>
            </div>
          </section>
        </aside>

        <section className="results-column" aria-live="polite">
          {isLoading ? (
            <StatePanel
              title="Loading labs"
              body="Fetching the current lab list and preparing the map view."
            />
          ) : null}

          {!isLoading && error ? (
            <StatePanel title="Unable to load labs" body={error} />
          ) : null}

          {!isLoading && !error && filteredLabs.length === 0 ? (
            <StatePanel
              title="No matching labs"
              body="Try a different NYC area, another ZIP code, your current location, or fewer service filters."
            />
          ) : null}

          {!isLoading && !error && filteredLabs.length > 0 && viewMode === "cards" ? (
            <div className="results-grid">
              {filteredLabs.map((lab) => (
                <LabCard
                  key={lab.id}
                  detailHref={`/labs/${lab.id}${detailSearch}`}
                  isFavorite={favoriteIds.includes(lab.id)}
                  lab={lab}
                  layout="card"
                  note={notesByLabId[lab.id]}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          ) : null}

          {!isLoading && !error && filteredLabs.length > 0 && viewMode === "map" ? (
            <div className="map-list-layout">
              <MapPanel detailSearch={detailSearch} labs={filteredLabs} selectedLabId={selectedLabId} />

              <div className="results-list">
                {filteredLabs.map((lab) => (
                  <div
                    key={lab.id}
                    className={selectedLabId === lab.id ? "result-row result-row--active" : "result-row"}
                    onFocusCapture={() => setSelectedLabId(lab.id)}
                    onMouseEnter={() => setSelectedLabId(lab.id)}
                  >
                    <LabCard
                      detailHref={`/labs/${lab.id}${detailSearch}`}
                      isFavorite={favoriteIds.includes(lab.id)}
                      lab={lab}
                      layout="row"
                      note={notesByLabId[lab.id]}
                      onToggleFavorite={onToggleFavorite}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
