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
        <span>Compare NYC photo labs without losing your shortlist.</span>
      </Link>

      <div className="app-header__summary">
        <Link className="app-header__summary-item app-header__summary-item--link" to="/saved">
          <span>Saved Labs</span>
          <strong>{savedCount}</strong>
        </Link>
      </div>
    </header>
  );
}
