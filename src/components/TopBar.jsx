import { Link, useLocation } from "react-router-dom";
import logo from '../assets/chess-game-knight-icon.svg'; // import logo from assets

export default function TopBar() {
  const location = useLocation();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <img src={logo} alt="Logo" className="topbar-logo" />
        <span className="topbar-title">Chess Insights</span>
      </div>

      <nav className="topbar-nav">
        <Link className={location.pathname === '/' ? 'active' : ''} to="/">Dashboard</Link>
        <Link className={location.pathname.startsWith('/game') ? 'active' : ''} to="/game/123">Game Detail</Link>
      </nav>
    </header>
  );
}
