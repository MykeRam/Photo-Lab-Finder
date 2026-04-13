import { Link } from "react-router-dom";
import { serviceLabels } from "../data/labs";
import type { PhotoLab } from "../types";

type LabCardProps = {
  detailHref: string;
  isFavorite: boolean;
  lab: PhotoLab;
  layout: "card" | "row";
  note?: string;
  onToggleFavorite: (id: string) => void;
};

export function LabCard({
  detailHref,
  isFavorite,
  lab,
  layout,
  note,
  onToggleFavorite,
}: LabCardProps) {
  const cardClassName = layout === "row" ? "lab-card lab-card--row" : "lab-card";

  return (
    <article className={cardClassName}>
      {lab.imageUrl ? (
        <img className="lab-card__image" src={lab.imageUrl} alt={lab.name} />
      ) : (
        <div className="lab-card__image lab-card__image--placeholder">
          <span>{lab.borough}</span>
          <strong>{lab.name}</strong>
        </div>
      )}
      <div className="lab-card__content">
        <div className="lab-card__heading">
          <div>
            <p className="lab-card__eyebrow">
              {lab.borough} · {lab.neighborhood}
            </p>
            <h2>
              <Link className="text-link" to={detailHref}>
                {lab.name}
              </Link>
            </h2>
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
          <span>{lab.address}</span>
          <span>{lab.turnaround} turnaround</span>
          <span>{lab.priceTier}</span>
          <span>{lab.rating > 0 ? `${lab.rating.toFixed(1)} rating` : "No ratings yet"}</span>
          <span>{lab.sourceLabel}</span>
        </div>

        <div className="lab-card__tags">
          {lab.services.map((service) => (
            <span key={service} className="service-tag">
              {serviceLabels[service]}
            </span>
          ))}
        </div>

        {note ? <p className="lab-card__note">Note: {note}</p> : null}

        <Link className="detail-link" to={detailHref}>
          View lab details
        </Link>
      </div>
    </article>
  );
}
