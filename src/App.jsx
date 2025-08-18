import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import GameDetail from "./pages/GameDetail";

function App() {
  return (
    <Router>
      <nav className="p-4 bg-gray-200 flex gap-4">
        <Link to="/">Dashboard</Link>
        <Link to="/game/123">Sample Games</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/game/:gameId" element={<GameDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
