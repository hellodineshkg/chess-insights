import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import GameDetail from "./pages/GameDetail";
import TopBar from "./components/TopBar.jsx"; // make sure file is .jsx

function App() {
  return (
    <Router>
      {/* Reusable TopBar on all pages */}
      <TopBar />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/game/:gameId" element={<GameDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
