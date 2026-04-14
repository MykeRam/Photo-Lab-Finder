import { Link } from "react-router-dom";
import "./AppHeader.css";

type AppHeaderProps = {
  savedCount: number;
};

export function AppHeader({ savedCount }: AppHeaderProps) {
  return (
    <header className="app-header">
      <Link className="app-header__brand" to="/">
        <strong>NYC Film Lab Finder</strong>
      </Link>

      <div className="app-header__summary">
        <div className="app-header__summary-item">
          <span>Saved Labs</span>
          <strong>{savedCount}</strong>
        </div>
        <div className="app-header__summary-item">
          <span>Search Scope</span>
          <strong>NYC only</strong>
        </div>
      </div>
    </header>
  );
}
