import { useState, useMemo } from "react";

export default function GamesTable({ games, loading, username }) {
  const [sortOrder, setSortOrder] = useState("desc"); // default descending
  const [filterResult, setFilterResult] = useState("");
  const [filterTimeControl, setFilterTimeControl] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const sortedFilteredGames = useMemo(() => {
    if (!games) return [];

    const playerName = username?.toLowerCase();

    let filtered = games.filter(game => {
      // Determine player color
      const userColor = game.players.white.user?.name?.toLowerCase() === playerName
        ? "white"
        : game.players.black.user?.name?.toLowerCase() === playerName
          ? "black"
          : null;

      if (!userColor) return false; // skip if player not found

      game.userColor = userColor; // store for later
      game.opponent = userColor === "white" ? game.players.black : game.players.white;

      // Apply result filter
      if (filterResult) {
        if (filterResult === "draw" && game.winner) return false;
        if (filterResult === "white" && !(game.winner === "white" && userColor === "white")) return false;
        if (filterResult === "black" && !(game.winner === "black" && userColor === "black")) return false;
      }

      // Apply time control filter
      if (filterTimeControl && game.speed.toLowerCase() !== filterTimeControl.toLowerCase()) return false;

      // Apply search filter on opening
      if (searchTerm) {
        const openingMatch =
          game.opening?.eco?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          game.opening?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        if (!openingMatch) return false;
      }

      return true;
    });

    // Sort by date
    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [games, sortOrder, filterResult, filterTimeControl, searchTerm, username]);

  if (loading) return <p>Loading games...</p>;
  if (!games || games.length === 0) return <p>No games found.</p>;

  const toggleSortOrder = () => setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));

  return (
    <div className="games-table-container">
      <h2>Recent Games</h2>

      <div className="filters">
        <input
          placeholder="Search ECO/Opening"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select value={filterResult} onChange={e => setFilterResult(e.target.value)}>
          <option value="">All Results</option>
          <option value="white">Win as White</option>
          <option value="black">Win as Black</option>
          <option value="draw">Draw</option>
        </select>
        <select value={filterTimeControl} onChange={e => setFilterTimeControl(e.target.value)}>
          <option value="">All Time Controls</option>
          <option value="bullet">Bullet</option>
          <option value="blitz">Blitz</option>
          <option value="rapid">Rapid</option>
          <option value="classical">Classical</option>
        </select>
        <button onClick={toggleSortOrder}>
          Sort by Date ({sortOrder === "asc" ? "Ascending" : "Descending"})
        </button>
      </div>

      <table className="games-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Opponent</th>
            <th>Opp. Rating</th>
            <th>Color</th>
            <th>Result</th>
            <th>Time Control</th>
            <th>Opening</th>
          </tr>
        </thead>
        <tbody>
          {sortedFilteredGames.map((g, i) => (
            <tr key={i}>
              <td>{new Date(g.createdAt).toLocaleDateString()}</td>
              <td>{g.opponent.user?.name || "Anon"}</td>
              <td>{g.opponent.rating || "-"}</td>
              <td>{g.userColor === "white" ? "White" : "Black"}</td>
              <td>{g.winner ? (g.winner === g.userColor ? "Win" : "Loss") : "Draw"}</td>
              <td>{g.speed}</td>
              <td>{g.opening?.eco} – {g.opening?.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
