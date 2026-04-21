import { useEffect, useMemo, useRef, useState } from "react";
import { Link, createSearchParams, useSearchParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { HeartIcon } from "../components/HeartIcon";
import { FilterPanel } from "../components/FilterPanel";
import { LabList } from "../components/LabList";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useCurrentLocation } from "../hooks/useCurrentLocation";
import { useLabs } from "../hooks/useLabs";
import type { LabService, NoteMap } from "../types";
import "./HomePage.css";

type HomePageProps = {
  favoriteIds: string[];
  notesByLabId: NoteMap;
  savedCount: number;
  onToggleFavorite: (id: string) => void;
};

const validServices = new Set<LabService>(["develop", "scan", "prints", "sameDay"]);
const heroImageSrc = `${import.meta.env.BASE_URL}Train-photo.jpg`;

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
  savedCount,
  onToggleFavorite,
}: HomePageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [matchCount, setMatchCount] = useState(0);
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);
  const browseRef = useRef<HTMLDivElement | null>(null);
  const query = searchParams.get("q") ?? "";
  const servicesParam = searchParams.get("services");
  const activeServices = useMemo(() => parseServices(servicesParam), [servicesParam]);
  const latitudeParam = searchParams.get("lat");
  const longitudeParam = searchParams.get("lng");
  const parsedLatitude = latitudeParam ? Number(latitudeParam) : null;
  const parsedLongitude = longitudeParam ? Number(longitudeParam) : null;
  const latitude = Number.isFinite(parsedLatitude) ? parsedLatitude : null;
  const longitude = Number.isFinite(parsedLongitude) ? parsedLongitude : null;
  const hasCurrentLocation = latitude !== null && longitude !== null;
  const debouncedQuery = useDebouncedValue(query, 350);
  const { clearLocationError, isLocating, locationError, requestCurrentLocation } = useCurrentLocation();
  const { error, isLoading, labs } = useLabs(
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

  useEffect(() => {
    setMatchCount(filteredLabs.length);
  }, [filteredLabs.length]);

  function updateSearchParams(next: {
    latitude?: number | null;
    longitude?: number | null;
    q?: string;
    services?: LabService[];
  }) {
    const params = createSearchParams();

    const nextQuery = next.q ?? query;
    const nextServices = next.services ?? activeServices;
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

  function handleStartBrowsing() {
    browseRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const detailSearch = searchParams.toString().length > 0 ? `?${searchParams.toString()}` : "";

  return (
    <main className="home-page">
      <section className="home-page__hero">
        <a
          className="home-page__credit"
          href="https://mykeram.github.io/Mykes-Photog/"
          target="_blank"
          rel="noreferrer"
        >
          Developed by Michael Ramirez
        </a>

        <div className="home-page__hero-copy">
          <h1 className="home-page__hero-title" aria-label="Search and compare photo labs in NYC">
            <span className="home-page__hero-title-line home-page__hero-title-line--first">
              Search and compare
            </span>
            <span className="home-page__hero-title-line home-page__hero-title-line--second">
              photo labs in NYC
            </span>
          </h1>
          <p className="home-page__copy">
            Search by borough, neighborhood, ZIP, or your current location inside New York City,
            then compare nearby labs on a live map with a synced results list and saved notes.
          </p>
          <button type="button" className="home-page__hero-link" onClick={handleStartBrowsing}>
            Start browsing
          </button>
        </div>

        <div className="home-page__hero-media" aria-hidden="true">
          <img className="home-page__hero-image" src={heroImageSrc} alt="" loading="eager" />
        </div>
      </section>

      <div className="home-page__layout" id="browse" ref={browseRef}>
        <aside className="home-page__controls">
          <FilterPanel
            activeServices={activeServices}
            hasCurrentLocation={hasCurrentLocation}
            isLocating={isLocating}
            locationError={locationError}
            onClearCurrentLocation={handleClearCurrentLocation}
            onToggleService={handleToggleService}
            onUseCurrentLocation={handleUseCurrentLocation}
          />

          <section className="home-page__stats">
            <div className="home-page__stat home-page__stat--live">
              <span>Live nearby</span>
              <strong>{matchCount}</strong>
            </div>
            <Link className="home-page__stat home-page__stat--link" to="/saved">
              <span className="home-page__stat-label">
                <HeartIcon className="home-page__stat-icon" />
                Saved Labs
              </span>
              <strong>{savedCount}</strong>
            </Link>
          </section>
        </aside>

        <section className="home-page__results" aria-live="polite">
          {isLoading ? (
            <LoadingSpinner label="Fetching the current lab list and preparing the map view." />
          ) : null}

          {!isLoading && error ? (
            <EmptyState title="Unable to load labs" body={error} />
          ) : null}

          {!isLoading && !error ? (
          <LabList
            activeServices={activeServices}
            activeLatitude={latitude}
            activeLongitude={longitude}
            detailSearch={detailSearch}
            favoriteIds={favoriteIds}
            labs={filteredLabs}
            hasCurrentLocation={hasCurrentLocation}
            isLocating={isLocating}
            locationError={locationError}
            notesByLabId={notesByLabId}
            savedCount={savedCount}
            onHoverLab={setSelectedLabId}
            onMatchCountChange={setMatchCount}
            onClearCurrentLocation={handleClearCurrentLocation}
            onPlaceSelect={(nextLatitude, nextLongitude) =>
              updateSearchParams({
                latitude: nextLatitude,
                longitude: nextLongitude,
                q: "",
              })
            }
            onToggleService={handleToggleService}
            onUseCurrentLocation={handleUseCurrentLocation}
            onToggleFavorite={onToggleFavorite}
            selectedLabId={selectedLabId}
          />
          ) : null}
        </section>
      </div>
    </main>
  );
}
