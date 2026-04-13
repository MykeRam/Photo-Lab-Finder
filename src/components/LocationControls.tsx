type LocationControlsProps = {
  hasCurrentLocation: boolean;
  isLocating: boolean;
  locationError: string | null;
  onClearCurrentLocation: () => void;
  onUseCurrentLocation: () => void;
};

export function LocationControls({
  hasCurrentLocation,
  isLocating,
  locationError,
  onClearCurrentLocation,
  onUseCurrentLocation,
}: LocationControlsProps) {
  return (
    <section className="location-controls">
      <div className="location-controls__buttons">
        <button
          type="button"
          className={hasCurrentLocation ? "action-button action-button--active" : "action-button"}
          onClick={onUseCurrentLocation}
          disabled={isLocating}
        >
          {isLocating ? "Locating..." : hasCurrentLocation ? "Nearby Labs On" : "Use Current Location"}
        </button>

        {hasCurrentLocation ? (
          <button type="button" className="action-button" onClick={onClearCurrentLocation}>
            Clear Nearby Search
          </button>
        ) : null}
      </div>

      <p className="panel__hint">
        Search by NYC borough, neighborhood, or ZIP, or use your current location to find nearby labs.
      </p>

      {locationError ? <p className="panel__error">{locationError}</p> : null}
    </section>
  );
}
