import { useState } from 'react';
import PlayerSearch from '../components/PlayerSearch';
import PlayerSummary from '../components/PlayerSummary';
import GamesTable from '../components/GamesTable';
import Skeleton from "../components/Skeleton";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [games, setGames] = useState([]);

  const handleSearch = async (username) => {
    setLoading(true);
    setStats(null);
    setGames([]);

    try {
      const res = await fetch(`https://lichess.org/api/user/${username}`);
      if (!res.ok) throw new Error('Player not found');
      const data = await res.json();

      // Opening stats
      let mostPlayedOpening = null;
      try {
        const openingRes = await fetch(`https://explorer.lichess.ovh/lichess?variant=standard&speeds=blitz&player=${username}`);
        const openingData = await openingRes.json();
        if (openingData.moves && openingData.moves.length > 0) {
          mostPlayedOpening = {
            name: openingData.moves[0].san || openingData.moves[0].uci,
            eco: openingData.moves[0].eco || 'N/A',
          };
        }
      } catch { mostPlayedOpening = null; }

      // Recent games
      const gamesRes = await fetch(`https://lichess.org/api/games/user/${username}?max=50&opening=true`,
        { headers: { Accept: 'application/x-ndjson' } }
      );
      const textStream = await gamesRes.text();
      const parsedGames = textStream.trim().split('\n').map(line => JSON.parse(line));

      // Compute win rates
      let whiteGames=0, whiteWins=0, blackGames=0, blackWins=0;
      parsedGames.forEach(game => {
        if (game.players.white.user?.name?.toLowerCase() === username.toLowerCase()) { whiteGames++; if(game.winner==='white') whiteWins++; }
        if (game.players.black.user?.name?.toLowerCase() === username.toLowerCase()) { blackGames++; if(game.winner==='black') blackWins++; }
      });

      const whiteWinPercent = whiteGames>0 ? ((whiteWins/whiteGames)*100).toFixed(1) : 'N/A';
      const blackWinPercent = blackGames>0 ? ((blackWins/blackGames)*100).toFixed(1) : 'N/A';

      setStats({
        username: data.username,
        gamesPlayed: data.count.all,
        wins: data.count.win,
        losses: data.count.loss,
        draws: data.count.draw,
        whiteWinPercent,
        blackWinPercent,
        mostPlayedOpening,
      });
      setGames(parsedGames);

    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Chess Dashboard</h1>
      <PlayerSearch onSearch={handleSearch} />
      <PlayerSummary stats={stats} loading={loading} />
      <GamesTable games={games} loading={loading} />
    </div>
  );
}
