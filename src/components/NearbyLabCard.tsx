import { useEffect, useState } from "react";
import type { NearbyMapPlace } from "../types";
import "./NearbyLabCard.css";

type NearbyLabCardProps = {
  place: NearbyMapPlace;
};

export function NearbyLabCard({ place }: NearbyLabCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [place.imageUrl]);

  return (
    <article className="nearby-lab-card">
      {place.imageUrl && !imageFailed ? (
        <img
          className="nearby-lab-card__image"
          src={place.imageUrl}
          alt={place.name}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="nearby-lab-card__image nearby-lab-card__image--placeholder">
          <span>Google Maps Nearby</span>
          <strong>{place.name}</strong>
        </div>
      )}
      <div className="nearby-lab-card__body">
        <p className="nearby-lab-card__eyebrow">Google Maps Nearby</p>
        <h3>{place.name}</h3>
        <p className="nearby-lab-card__address">{place.address}</p>
        <div className="nearby-lab-card__meta">
          <span>
            {place.rating !== null ? `${place.rating.toFixed(1)} rating` : "No rating listed"}
          </span>
          <span>Live map result</span>
        </div>
        {place.photoAttributions.length > 0 ? (
          <div className="nearby-lab-card__photo-attribution">
            {place.photoAttributions.map((attribution) => (
              <span key={attribution} dangerouslySetInnerHTML={{ __html: attribution }} />
            ))}
          </div>
        ) : null}
        <a className="nearby-lab-card__link" href={place.mapsUrl} rel="noreferrer" target="_blank">
          Open in Google Maps
        </a>
      </div>
    </article>
  );
}
