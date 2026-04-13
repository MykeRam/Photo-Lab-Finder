import type { ViewMode } from "../types";

type ViewToggleProps = {
  onChange: (mode: ViewMode) => void;
  value: ViewMode;
};

export function ViewToggle({ onChange, value }: ViewToggleProps) {
  return (
    <div className="view-toggle" role="tablist" aria-label="Result view">
      <button
        type="button"
        role="tab"
        aria-selected={value === "cards"}
        className={value === "cards" ? "view-toggle__button view-toggle__button--active" : "view-toggle__button"}
        onClick={() => onChange("cards")}
      >
        Cards
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === "map"}
        className={value === "map" ? "view-toggle__button view-toggle__button--active" : "view-toggle__button"}
        onClick={() => onChange("map")}
      >
        Map + List
      </button>
    </div>
  );
}
