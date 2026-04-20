import { Link } from "react-router-dom";
import "./AppHeader.css";

type AppHeaderProps = {
  savedCount: number;
};

const logoSrc = `${import.meta.env.BASE_URL}NYC-Photo-Lab-Logo.png`;

export function AppHeader({ savedCount }: AppHeaderProps) {
  return (
    <header className="app-header">
      <Link className="app-header__brand" to="/" aria-label="NYC Photo Lab Finder home">
        <img
          className="app-header__brand-logo"
          src={logoSrc}
          alt=""
          aria-hidden="true"
        />
        <span>Find photo labs in NYC</span>
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
