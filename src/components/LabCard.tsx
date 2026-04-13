import { serviceLabels } from "../data/labs";
import type { PhotoLab } from "../types";

type LabCardProps = {
  lab: PhotoLab;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
};

export function LabCard({ lab, isFavorite, onToggleFavorite }: LabCardProps) {
  return (
    <article className="lab-card">
      <img className="lab-card__image" src={lab.imageUrl} alt={lab.name} />
      <div className="lab-card__content">
        <div className="lab-card__heading">
          <div>
            <p className="lab-card__eyebrow">
              {lab.city}, {lab.region} · {lab.neighborhood}
            </p>
            <h2>{lab.name}</h2>
          </div>
          <button
            type="button"
            className={isFavorite ? "favorite-button favorite-button--active" : "favorite-button"}
            onClick={() => onToggleFavorite(lab.id)}
            aria-pressed={isFavorite}
          >
            {isFavorite ? "Saved" : "Save"}
          </button>
        </div>

        <p className="lab-card__description">{lab.description}</p>

        <div className="lab-card__meta">
          <span>{lab.distanceMiles} mi away</span>
          <span>{lab.turnaround} turnaround</span>
          <span>{lab.priceTier}</span>
          <span>{lab.rating.toFixed(1)} rating</span>
        </div>

        <div className="lab-card__tags">
          {lab.services.map((service) => (
            <span key={service} className="service-tag">
              {serviceLabels[service]}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
