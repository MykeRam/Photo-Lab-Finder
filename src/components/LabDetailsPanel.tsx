import type { NoteMap, PhotoLab } from "../types";
import { FavoriteButton } from "./FavoriteButton";
import { HoursBadge } from "./HoursBadge";
import { ServiceTag } from "./ServiceTag";
import "./LabDetailsPanel.css";

type LabDetailsPanelProps = {
  favoriteIds: string[];
  notesByLabId: NoteMap;
  onToggleFavorite: (id: string) => void;
  onUpdateNote: (labId: string, note: string) => void;
  lab: PhotoLab;
};

export function LabDetailsPanel({
  favoriteIds,
  notesByLabId,
  onToggleFavorite,
  onUpdateNote,
  lab,
}: LabDetailsPanelProps) {
  const isFavorite = favoriteIds.includes(lab.id);
  const note = notesByLabId[lab.id] ?? "";

  return (
    <article className="lab-details-panel">
      <section className="lab-details-panel__hero">
        {lab.imageUrl ? (
          <img className="lab-details-panel__image" src={lab.imageUrl} alt={lab.name} />
        ) : (
          <div className="lab-details-panel__image lab-details-panel__image--placeholder">
            <span>{lab.borough}</span>
            <strong>{lab.name}</strong>
          </div>
        )}

        <div className="lab-details-panel__content">
          <p className="eyebrow">
            {lab.borough} · {lab.neighborhood}
          </p>
          <h1>{lab.name}</h1>
          <p className="lab-details-panel__description">{lab.description}</p>

          <div className="lab-details-panel__meta-grid">
            <div className="lab-details-panel__meta-card">
              <span>Address</span>
              <strong>{lab.address}</strong>
            </div>
            <div className="lab-details-panel__meta-card">
              <span>Turnaround</span>
              <strong>{lab.turnaround}</strong>
            </div>
            <div className="lab-details-panel__meta-card">
              <span>Hours</span>
              <HoursBadge text={lab.hours} />
            </div>
            <div className="lab-details-panel__meta-card">
              <span>Rating</span>
              <strong>{lab.rating > 0 ? lab.rating.toFixed(1) : "No ratings yet"}</strong>
            </div>
            <div className="lab-details-panel__meta-card">
              <span>Source</span>
              <strong>{lab.sourceLabel}</strong>
            </div>
          </div>

          <div className="lab-details-panel__actions">
            <FavoriteButton
              defaultLabel="Save this lab"
              isFavorite={isFavorite}
              onClick={() => onToggleFavorite(lab.id)}
              savedLabel="Saved to favorites"
            />
            {lab.mapsUrl ? (
              <a className="hours-badge lab-details-panel__link" href={lab.mapsUrl} target="_blank" rel="noreferrer">
                Open map listing
              </a>
            ) : (
              <HoursBadge text={lab.hours} />
            )}
          </div>
        </div>
      </section>

      <section className="lab-details-panel__columns">
        <div className="lab-details-panel__panel">
          <h2>Services</h2>
          <div className="lab-card__tags">
            {lab.services.map((service) => (
              <ServiceTag key={service} label={service} />
            ))}
          </div>
        </div>

        <div className="lab-details-panel__panel">
          <h2>Specialties</h2>
          <ul className="lab-details-panel__list">
            {lab.specialties.map((specialty) => (
              <li key={specialty}>{specialty}</li>
            ))}
          </ul>
        </div>
      </section>

      {lab.website || lab.phone ? (
        <section className="lab-details-panel__columns">
          {lab.website ? (
            <div className="lab-details-panel__panel">
              <h2>Website</h2>
              <a className="lab-details-panel__link" href={lab.website} target="_blank" rel="noreferrer">
                {lab.website}
              </a>
            </div>
          ) : null}
          {lab.phone ? (
            <div className="lab-details-panel__panel">
              <h2>Phone</h2>
              <p className="lab-details-panel__description">{lab.phone}</p>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="lab-details-panel__panel lab-details-panel__notes">
        <div className="lab-details-panel__notes-header">
          <div>
            <h2>Personal notes</h2>
            <p>Saved locally in this browser so you can track pricing, color preferences, and pickup plans.</p>
          </div>
          <span className="lab-details-panel__status">{note.trim().length > 0 ? "Saved locally" : "No note yet"}</span>
        </div>

        <label>
          <span className="sr-only">Personal notes for {lab.name}</span>
          <textarea
            value={note}
            placeholder="Add your own notes about scan quality, pricing, turnaround, or who to ask for."
            onChange={(event) => onUpdateNote(lab.id, event.target.value)}
          />
        </label>
      </section>
    </article>
  );
}
