import { Link } from "react-router-dom";

type AppHeaderProps = {
  savedCount: number;
};

export function AppHeader({ savedCount }: AppHeaderProps) {
  return (
    <header className="app-header">
      <Link className="brand-link" to="/">
        <span className="eyebrow">Photo Lab Finder</span>
        <strong>Neighborhood-first film lab search</strong>
      </Link>

      <div className="header-summary">
        <div className="header-summary__item">
          <span>Saved Labs</span>
          <strong>{savedCount}</strong>
        </div>
        <div className="header-summary__item">
          <span>Search Scope</span>
          <strong>NYC only</strong>
        </div>
      </div>
    </header>
  );
}
