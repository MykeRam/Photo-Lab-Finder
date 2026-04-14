import { serviceLabels } from "../data/labs";
import type { LabService, ViewMode } from "../types";
import { LocationButton } from "./LocationButton";
import { SearchBar } from "./SearchBar";
import { ViewToggle } from "./ViewToggle";
import "./FilterPanel.css";

type FilterPanelProps = {
  activeServices: LabService[];
  hasCurrentLocation: boolean;
  isLocating: boolean;
  locationError: string | null;
  onClearCurrentLocation: () => void;
  onQueryChange: (value: string) => void;
  onToggleService: (service: LabService) => void;
  onUseCurrentLocation: () => void;
  onViewChange: (mode: ViewMode) => void;
  query: string;
  viewMode: ViewMode;
};

const services = Object.keys(serviceLabels) as LabService[];

export function FilterPanel({
  activeServices,
  hasCurrentLocation,
  isLocating,
  locationError,
  onClearCurrentLocation,
  onQueryChange,
  onToggleService,
  onUseCurrentLocation,
  onViewChange,
  query,
  viewMode,
}: FilterPanelProps) {
  return (
    <section className="filter-panel">
      <SearchBar query={query} onQueryChange={onQueryChange} />

      <div>
        <LocationButton
          active={hasCurrentLocation}
          disabled={isLocating}
          label={isLocating ? "Locating..." : hasCurrentLocation ? "Nearby Labs On" : "Use Current Location"}
          onClick={onUseCurrentLocation}
        />
        {hasCurrentLocation ? (
          <LocationButton active={false} label="Clear Nearby Search" onClick={onClearCurrentLocation} />
        ) : null}
        <p className="filter-panel__hint">
          Search by NYC borough, neighborhood, or ZIP, or use your current location to find nearby labs.
        </p>
        {locationError ? <p className="filter-panel__error">{locationError}</p> : null}
      </div>

      <section className="filter-panel__services" aria-label="Service filters">
        {services.map((service) => {
          const isActive = activeServices.includes(service);

          return (
            <button
              key={service}
              type="button"
              className={isActive ? "filter-panel__chip filter-panel__chip--active" : "filter-panel__chip"}
              onClick={() => onToggleService(service)}
            >
              {serviceLabels[service]}
            </button>
          );
        })}
      </section>

      <ViewToggle value={viewMode} onChange={onViewChange} />
    </section>
  );
}
