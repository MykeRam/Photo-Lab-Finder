import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppHeader } from "./components/AppHeader";
import { HomePage } from "./pages/HomePage";
import { LabDetailPage } from "./pages/LabDetailPage";
import { SavedLabsPage } from "./pages/SavedLabsPage";
import { useLocalStorageState } from "./hooks/useLocalStorageState";
import type { NoteMap } from "./types";
import "./App.css";

function App() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
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
    <div className="app-shell">
      <AppHeader savedCount={favoriteIds.length} />
      <div className="app-content">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
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
                favoriteIds={favoriteIds}
                notesByLabId={notesByLabId}
                onToggleFavorite={toggleFavorite}
                onUpdateNote={updateNote}
              />
            }
          />
          <Route
            path="/saved"
            element={
              <SavedLabsPage
                favoriteIds={favoriteIds}
                notesByLabId={notesByLabId}
                onToggleFavorite={toggleFavorite}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {!isHomePage ? (
        <footer className="app-footer">
          <a
            className="app-footer__link"
            href="https://mykeram.github.io/Mykes-Photog/"
            target="_blank"
            rel="noreferrer"
          >
            Developed by Michael Ramirez
          </a>
        </footer>
      ) : null}
    </div>
  );
}

export default App;
