import { Link, useLocation, useParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { LabDetailsPanel } from "../components/LabDetailsPanel";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useLab } from "../hooks/useLab";
import type { NoteMap } from "../types";
import "./LabDetailPage.css";

type LabDetailPageProps = {
  favoriteIds: string[];
  notesByLabId: NoteMap;
  onToggleFavorite: (id: string) => void;
  onUpdateNote: (labId: string, note: string) => void;
};

export function LabDetailPage({
  favoriteIds,
  notesByLabId,
  onToggleFavorite,
  onUpdateNote,
}: LabDetailPageProps) {
  const { labId } = useParams();
  const location = useLocation();
  const { error, isLoading, lab } = useLab(labId);
  const backHref = location.search ? `/${location.search}` : "/";

  if (isLoading) {
    return (
      <main className="lab-detail-page">
        <LoadingSpinner label="Preparing the detail page and saved notes." />
      </main>
    );
  }

  if (error) {
    return (
      <main className="lab-detail-page">
        <EmptyState title="Unable to load lab" body={error} />
      </main>
    );
  }

  if (!lab) {
    return (
      <main className="lab-detail-page">
        <EmptyState
          title="Lab not found"
          body="This listing is missing or the saved link points to an outdated lab id."
        />
      </main>
    );
  }

  return (
    <main className="lab-detail-page">
      <Link className="lab-detail-page__back-link" to={backHref}>
        Back to search
      </Link>
      <LabDetailsPanel
        favoriteIds={favoriteIds}
        lab={lab}
        notesByLabId={notesByLabId}
        onToggleFavorite={onToggleFavorite}
        onUpdateNote={onUpdateNote}
      />
    </main>
  );
}
