import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { PhotoLab } from "../types";
import { FavoriteButton } from "./FavoriteButton";
import { ServiceTag } from "./ServiceTag";
import "./LabCard.css";

type LabCardProps = {
  detailHref: string;
  imageOverrideUrl?: string | null;
  isFavorite: boolean;
  lab: PhotoLab;
  layout: "card" | "row";
  note?: string;
  onToggleFavorite: (id: string) => void;
  photoAttributions?: string[];
};

export function LabCard({
  detailHref,
  imageOverrideUrl,
  isFavorite,
  lab,
  layout,
  note,
  onToggleFavorite,
  photoAttributions = [],
}: LabCardProps) {
  const cardClassName = layout === "row" ? "lab-card lab-card--row" : "lab-card";
  const imageUrl = imageOverrideUrl ?? lab.imageUrl;
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  return (
    <article className={cardClassName}>
      {imageUrl && !imageFailed ? (
        <img
          className="lab-card__image"
          src={imageUrl}
          alt={lab.name}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="lab-card__image lab-card__image--placeholder">
          <span>{lab.borough}</span>
          <strong>{lab.name}</strong>
        </div>
      )}
      <div className="lab-card__content">
        <div className="lab-card__heading">
          <div>
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

        {note ? <div className="lab-card__divider" aria-hidden="true" /> : null}

        {note ? <p className="lab-card__note">Note: {note}</p> : null}

        {photoAttributions.length > 0 ? (
          <div className="lab-card__photo-attribution">
            {photoAttributions.map((attribution) => (
              <span key={attribution} dangerouslySetInnerHTML={{ __html: attribution }} />
            ))}
          </div>
        ) : null}

        <Link className="lab-card__link" to={detailHref}>
          View lab details
        </Link>
      </div>
    </article>
  );
}
