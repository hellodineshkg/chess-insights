import { useState, useMemo } from "react";

export default function GamesTable({ games, loading }) {
  const [sortKey, setSortKey] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterResult, setFilterResult] = useState("");
  const [filterTimeControl, setFilterTimeControl] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const sortedFilteredGames = useMemo(() => {
    let filtered = games;

    if (filterResult) filtered = filtered.filter(g => g.winner === filterResult);
    if (filterTimeControl) filtered = filtered.filter(g => g.speed.toLowerCase() === filterTimeControl.toLowerCase());
    if (searchTerm) filtered = filtered.filter(g =>
      g.opening?.eco?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.opening?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      if (sortKey === "date") return sortOrder === "asc"
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });
  }, [games, sortKey, sortOrder, filterResult, filterTimeControl, searchTerm]);

  if (loading) return <p>Loading games...</p>;
  if (!games.length) return <p>No games found.</p>;

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
          <option value="">Draw</option>
        </select>
        <select value={filterTimeControl} onChange={e => setFilterTimeControl(e.target.value)}>
          <option value="">All Time Controls</option>
          <option value="bullet">Bullet</option>
          <option value="blitz">Blitz</option>
          <option value="rapid">Rapid</option>
          <option value="classical">Classical</option>
        </select>
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
          {sortedFilteredGames.map((g, i) => {
            const isWhite = g.players.white.user;
            const userColor = isWhite ? "White" : "Black";
            const opponent = userColor === "White" ? g.players.black : g.players.white;

            return (
              <tr key={i}>
                <td>{new Date(g.createdAt).toLocaleDateString()}</td>
                <td>{opponent.user?.name || "Anon"}</td>
                <td>{opponent.rating || "-"}</td>
                <td>{userColor}</td>
                <td>{g.winner ? (g.winner === userColor.toLowerCase() ? "Win" : "Loss") : "Draw"}</td>
                <td>{g.speed}</td>
                <td>{g.opening?.eco} – {g.opening?.name}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
