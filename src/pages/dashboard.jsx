import { useState } from "react";
import { useLichessApi } from "../hooks/useLichessApi";
import PlayerSearch from "../components/PlayerSearch";

export default function Dashboard() {
  const { fetchPlayer, loading, error } = useLichessApi();
  const [playerData, setPlayerData] = useState(null);

  const handleSearch = async (username) => {
    const data = await fetchPlayer(username);
    setPlayerData(data);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Chess Insights Dashboard</h1>

      <PlayerSearch onSearch={handleSearch} />

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {playerData && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold">{playerData.profile.username}</h2>
          <p>Rating: {playerData.profile.perfs.blitz.rating} (blitz)</p>
          <p>Games loaded: {playerData.games.length}</p>
        </div>
      )}
    </div>
  );
}
