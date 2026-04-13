import { Navigate, Route, Routes } from "react-router-dom";
import { AppHeader } from "./components/AppHeader";
import { HomePage } from "./pages/HomePage";
import { LabDetailPage } from "./pages/LabDetailPage";
import { useLabs } from "./hooks/useLabs";
import { useLocalStorageState } from "./hooks/useLocalStorageState";
import type { NoteMap } from "./types";

function App() {
  const { labs, isLoading, error } = useLabs();
  const [favoriteIds, setFavoriteIds] = useLocalStorageState<string[]>("favorite-labs", []);
  const [notesByLabId, setNotesByLabId] = useLocalStorageState<NoteMap>("lab-notes", {});

  function toggleFavorite(labId: string) {
    setFavoriteIds((current) =>
      current.includes(labId) ? current.filter((id) => id !== labId) : [...current, labId],
    );
  }

  function updateNote(labId: string, note: string) {
    setNotesByLabId((current) => {
      if (note.trim().length === 0) {
        const next = { ...current };
        delete next[labId];
        return next;
      }

      return {
        ...current,
        [labId]: note,
      };
    });
  }

  return (
    <div className="page-shell">
      <AppHeader savedCount={favoriteIds.length} />
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              labs={labs}
              isLoading={isLoading}
              error={error}
              favoriteIds={favoriteIds}
              notesByLabId={notesByLabId}
              onToggleFavorite={toggleFavorite}
            />
          }
        />
        <Route
          path="/labs/:labId"
          element={
            <LabDetailPage
              labs={labs}
              isLoading={isLoading}
              error={error}
              favoriteIds={favoriteIds}
              notesByLabId={notesByLabId}
              onToggleFavorite={toggleFavorite}
              onUpdateNote={updateNote}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
