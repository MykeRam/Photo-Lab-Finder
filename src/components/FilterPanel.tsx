import { serviceLabels } from "../data/labs";
import type { LabService } from "../types";
import { LocationButton } from "./LocationButton";
import "./FilterPanel.css";

type FilterPanelProps = {
  activeServices: LabService[];
  hasCurrentLocation: boolean;
  isLocating: boolean;
  locationError: string | null;
  onClearCurrentLocation: () => void;
  onToggleService: (service: LabService) => void;
  onUseCurrentLocation: () => void;
};

const services = Object.keys(serviceLabels) as LabService[];

export function FilterPanel({
  activeServices,
  hasCurrentLocation,
  isLocating,
  locationError,
  onClearCurrentLocation,
  onToggleService,
  onUseCurrentLocation,
}: FilterPanelProps) {
  return (
    <section className="filter-panel">
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
          Use the Google search above the map, or use your current location to find nearby labs in NYC.
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
    </section>
  );
}
