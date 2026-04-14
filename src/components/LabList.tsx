import type { LabService, NoteMap, PhotoLab, ViewMode } from "../types";
import { LabCard } from "./LabCard";
import { MapPanel } from "./MapPanel";
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
  viewMode: ViewMode;
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
  viewMode,
}: LabListProps) {
  if (viewMode === "cards") {
    return (
      <div className="lab-list">
        <div className="lab-list__grid">
          {labs.map((lab) => (
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
      </div>
    );
  }

  return (
    <div className="lab-list">
      <div className="lab-list__map-layout">
        <MapPanel
          activeServices={activeServices}
          activeLatitude={activeLatitude}
          activeLongitude={activeLongitude}
          detailSearch={detailSearch}
          labs={labs}
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
    </div>
  );
}
