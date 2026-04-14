import { useMemo, useState } from "react";
import type { LabService, NearbyMapPlace, NoteMap, PhotoLab } from "../types";
import { LabCard } from "./LabCard";
import { MapPanel } from "./MapPanel";
import { NearbyLabCard } from "./NearbyLabCard";
import "./LabList.css";

type LabListProps = {
  activeServices: LabService[];
  activeLatitude: number | null;
  activeLongitude: number | null;
  detailSearch: string;
  favoriteIds: string[];
  labs: PhotoLab[];
  notesByLabId: NoteMap;
  onHoverLab: (labId: string) => void;
  onPlaceSelect: (latitude: number, longitude: number) => void;
  onToggleFavorite: (id: string) => void;
  selectedLabId: string | null;
};

export function LabList({
  activeServices,
  activeLatitude,
  activeLongitude,
  detailSearch,
  favoriteIds,
  labs,
  notesByLabId,
  onHoverLab,
  onPlaceSelect,
  onToggleFavorite,
  selectedLabId,
}: LabListProps) {
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyMapPlace[]>([]);
  const nearbyPlacesByMatchedLabId = useMemo(
    () =>
      nearbyPlaces.reduce<Record<string, NearbyMapPlace>>((accumulator, place) => {
        if (place.matchedLabId) {
          accumulator[place.matchedLabId] = place;
        }

        return accumulator;
      }, {}),
    [nearbyPlaces],
  );

  return (
    <div className="lab-list">
      <div className="lab-list__map-layout">
        <MapPanel
          activeServices={activeServices}
          activeLatitude={activeLatitude}
          activeLongitude={activeLongitude}
          detailSearch={detailSearch}
          labs={labs}
          onNearbyPlacesChange={setNearbyPlaces}
          onPlaceSelect={onPlaceSelect}
          selectedLabId={selectedLabId}
        />

        <div className="lab-list__results">
          {labs.map((lab) => (
            <div
              key={lab.id}
              className={selectedLabId === lab.id ? "lab-list__result lab-list__result--active" : "lab-list__result"}
              onFocusCapture={() => onHoverLab(lab.id)}
              onMouseEnter={() => onHoverLab(lab.id)}
            >
              <LabCard
                detailHref={`/labs/${lab.id}${detailSearch}`}
                imageOverrideUrl={nearbyPlacesByMatchedLabId[lab.id]?.imageUrl}
                isFavorite={favoriteIds.includes(lab.id)}
                lab={lab}
                layout="row"
                note={notesByLabId[lab.id]}
                onToggleFavorite={onToggleFavorite}
                photoAttributions={nearbyPlacesByMatchedLabId[lab.id]?.photoAttributions}
              />
            </div>
          ))}

          {nearbyPlaces.length > 0 ? (
            <section className="lab-list__extra-results">
              <p className="lab-list__extra-label">More nearby labs from Google Maps</p>
              <div className="lab-list__extra-grid">
                {nearbyPlaces.map((place) => (
                  <NearbyLabCard key={place.id} place={place} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
