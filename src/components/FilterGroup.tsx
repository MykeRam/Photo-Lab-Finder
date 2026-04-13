import { serviceLabels } from "../data/labs";
import type { LabService } from "../types";

type FilterGroupProps = {
  activeServices: LabService[];
  onToggle: (service: LabService) => void;
};

const services = Object.keys(serviceLabels) as LabService[];

export function FilterGroup({ activeServices, onToggle }: FilterGroupProps) {
  return (
    <section className="filter-group" aria-label="Service filters">
      {services.map((service) => {
        const isActive = activeServices.includes(service);

        return (
          <button
            key={service}
            type="button"
            className={isActive ? "filter-chip filter-chip--active" : "filter-chip"}
            onClick={() => onToggle(service)}
          >
            {serviceLabels[service]}
          </button>
        );
      })}
    </section>
  );
}
