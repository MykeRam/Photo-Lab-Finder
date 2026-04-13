import { useMemo, useState } from "react";
import { FilterGroup } from "./components/FilterGroup";
import { LabCard } from "./components/LabCard";
import { SearchBar } from "./components/SearchBar";
import { useLabs } from "./hooks/useLabs";
import type { LabService } from "./types";

function App() {
  const { labs, isLoading, error } = useLabs();
  const [query, setQuery] = useState("");
  const [activeServices, setActiveServices] = useState<LabService[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const filteredLabs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return labs.filter((lab) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [lab.name, lab.city, lab.region, lab.neighborhood, lab.description]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesServices =
        activeServices.length === 0 ||
        activeServices.every((service) => lab.services.includes(service));

      return matchesQuery && matchesServices;
    });
  }, [activeServices, labs, query]);

  function toggleService(service: LabService) {
    setActiveServices((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service],
    );
  }

  function toggleFavorite(labId: string) {
    setFavoriteIds((current) =>
      current.includes(labId) ? current.filter((id) => id !== labId) : [...current, labId],
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Photo Lab Finder</p>
          <h1>Find a lab that fits your film workflow.</h1>
        </div>
        <p className="topbar__summary">
          Search by area, narrow by services, and keep a shortlist for repeat drop-offs.
        </p>
      </header>

      <main className="app-layout">
        <section className="controls-panel">
          <SearchBar query={query} onQueryChange={setQuery} />
          <FilterGroup activeServices={activeServices} onToggle={toggleService} />
          <div className="stats-row">
            <div>
              <strong>{filteredLabs.length}</strong>
              <span>matches</span>
            </div>
            <div>
              <strong>{favoriteIds.length}</strong>
              <span>saved labs</span>
            </div>
          </div>
        </section>

        <section className="results-panel" aria-live="polite">
          {isLoading ? (
            <div className="state-panel">
              <p>Loading nearby labs...</p>
            </div>
          ) : null}

          {!isLoading && error ? (
            <div className="state-panel">
              <p>{error}</p>
            </div>
          ) : null}

          {!isLoading && !error && filteredLabs.length === 0 ? (
            <div className="state-panel">
              <p>No labs match that search yet.</p>
            </div>
          ) : null}

          {!isLoading && !error && filteredLabs.length > 0 ? (
            <div className="results-grid">
              {filteredLabs.map((lab) => (
                <LabCard
                  key={lab.id}
                  lab={lab}
                  isFavorite={favoriteIds.includes(lab.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

export default App;
