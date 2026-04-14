import { Link } from "react-router-dom";
import type { PhotoLab } from "../types";
import { FavoriteButton } from "./FavoriteButton";
import { ServiceTag } from "./ServiceTag";
import "./LabCard.css";

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
              <Link className="lab-card__title-link" to={detailHref}>
                {lab.name}
              </Link>
            </h2>
          </div>

          <FavoriteButton isFavorite={isFavorite} onClick={() => onToggleFavorite(lab.id)} />
        </div>

        <p className="lab-card__description">{lab.description}</p>

        <div className="lab-card__meta">
          <span>{lab.address}</span>
          {lab.distanceMiles !== null ? <span>{lab.distanceMiles.toFixed(1)} miles away</span> : null}
          <span>{lab.turnaround} turnaround</span>
          <span>{lab.priceTier}</span>
          <span>{lab.rating > 0 ? `${lab.rating.toFixed(1)} rating` : "No ratings yet"}</span>
          <span>{lab.sourceLabel}</span>
        </div>

        <div className="lab-card__tags">
          {lab.services.map((service) => (
            <ServiceTag key={service} label={service} />
          ))}
        </div>

        {note ? <p className="lab-card__note">Note: {note}</p> : null}

        <Link className="lab-card__link" to={detailHref}>
          View lab details
        </Link>
      </div>
    </article>
  );
}
