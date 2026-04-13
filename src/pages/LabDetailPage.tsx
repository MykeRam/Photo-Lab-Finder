import { Link, useLocation, useParams } from "react-router-dom";
import { serviceLabels } from "../data/labs";
import { StatePanel } from "../components/StatePanel";
import type { NoteMap, PhotoLab } from "../types";

type LabDetailPageProps = {
  error: string | null;
  favoriteIds: string[];
  isLoading: boolean;
  labs: PhotoLab[];
  notesByLabId: NoteMap;
  onToggleFavorite: (id: string) => void;
  onUpdateNote: (labId: string, note: string) => void;
};

export function LabDetailPage({
  error,
  favoriteIds,
  isLoading,
  labs,
  notesByLabId,
  onToggleFavorite,
  onUpdateNote,
}: LabDetailPageProps) {
  const { labId } = useParams();
  const location = useLocation();
  const lab = labs.find((item) => item.id === labId);
  const backHref = location.search ? `/${location.search}` : "/";

  if (isLoading) {
    return (
      <main className="page-content">
        <StatePanel title="Loading lab" body="Preparing the detail page and saved notes." />
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-content">
        <StatePanel title="Unable to load lab" body={error} />
      </main>
    );
  }

  if (!lab) {
    return (
      <main className="page-content">
        <StatePanel
          title="Lab not found"
          body="This listing is missing or the saved link points to an outdated lab id."
        />
      </main>
    );
  }

  const isFavorite = favoriteIds.includes(lab.id);
  const note = notesByLabId[lab.id] ?? "";

  return (
    <main className="page-content">
      <Link className="back-link" to={backHref}>
        Back to search
      </Link>

      <article className="detail-layout">
        <section className="detail-hero">
          <img className="detail-hero__image" src={lab.imageUrl} alt={lab.name} />

          <div className="detail-hero__content">
            <p className="eyebrow">
              {lab.borough} · {lab.neighborhood}
            </p>
            <h1>{lab.name}</h1>
            <p className="detail-hero__description">{lab.description}</p>

            <div className="detail-meta-grid">
              <div className="detail-meta-card">
                <span>Address</span>
                <strong>{lab.address}</strong>
              </div>
              <div className="detail-meta-card">
                <span>Turnaround</span>
                <strong>{lab.turnaround}</strong>
              </div>
              <div className="detail-meta-card">
                <span>Hours</span>
                <strong>{lab.hours}</strong>
              </div>
              <div className="detail-meta-card">
                <span>Rating</span>
                <strong>{lab.rating.toFixed(1)}</strong>
              </div>
            </div>

            <div className="detail-actions">
              <button
                type="button"
                className={isFavorite ? "favorite-button favorite-button--active" : "favorite-button"}
                onClick={() => onToggleFavorite(lab.id)}
              >
                {isFavorite ? "Saved to favorites" : "Save this lab"}
              </button>
              <span className="detail-link detail-link--static">{lab.hours}</span>
            </div>
          </div>
        </section>

        <section className="detail-columns">
          <div className="panel">
            <h2>Services</h2>
            <div className="lab-card__tags">
              {lab.services.map((service) => (
                <span key={service} className="service-tag">
                  {serviceLabels[service]}
                </span>
              ))}
            </div>
          </div>

          <div className="panel">
            <h2>Specialties</h2>
            <ul className="detail-list">
              {lab.specialties.map((specialty) => (
                <li key={specialty}>{specialty}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="panel notes-panel">
          <div className="notes-panel__header">
            <div>
              <h2>Personal notes</h2>
              <p>Saved locally in this browser so you can track pricing, color preferences, and pickup plans.</p>
            </div>
            <span className="note-status">{note.trim().length > 0 ? "Saved locally" : "No note yet"}</span>
          </div>

          <label className="notes-panel__field">
            <span className="sr-only">Personal notes for {lab.name}</span>
            <textarea
              value={note}
              placeholder="Add your own notes about scan quality, pricing, turnaround, or who to ask for."
              onChange={(event) => onUpdateNote(lab.id, event.target.value)}
            />
          </label>
        </section>
      </article>
    </main>
  );
}
