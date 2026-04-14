import { serviceLabels } from "../data/labs";
import type { LabService } from "../types";
import "./ServiceTag.css";

type ServiceTagProps = {
  label: LabService;
};

export function ServiceTag({ label }: ServiceTagProps) {
  return <span className="service-tag">{serviceLabels[label]}</span>;
}
