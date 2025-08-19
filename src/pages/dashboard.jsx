import { useState } from 'react';
import TopBar from '../components/TopBar';
import PlayerSearch from '../components/PlayerSearch';
import PlayerSummary from '../components/PlayerSummary';
import GamesTable from '../components/GamesTable';
import RatingPieChart from '../components/RatingPieChart';
import Skeleton from '../components/Skeleton';

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [games, setGames] = useState([]);

  const handleSearch = async (username) => {
    setLoading(true);
    setStats(null);
    setGames([]);

    try {
      // Fetch player info
      const res = await fetch(`https://lichess.org/api/user/${username}`);
      if (!res.ok) throw new Error('Player not found');
      const data = await res.json();

      // Fetch recent games
      const gamesRes = await fetch(
        `https://lichess.org/api/games/user/${username}?max=50&opening=true`,
        { headers: { Accept: 'application/x-ndjson' } }
      );
      const textStream = await gamesRes.text();
      const parsedGames = textStream.trim().split('\n').map(line => JSON.parse(line));

      // Compute win/loss/draw stats
      let whiteGames = 0, whiteWins = 0, blackGames = 0, blackWins = 0;
      parsedGames.forEach(game => {
        if (game.players.white.user?.name?.toLowerCase() === username.toLowerCase()) {
          whiteGames++;
          if (game.winner === 'white') whiteWins++;
        }
        if (game.players.black.user?.name?.toLowerCase() === username.toLowerCase()) {
          blackGames++;
          if (game.winner === 'black') blackWins++;
        }
      });

      const whiteWinPercent = whiteGames > 0 ? ((whiteWins / whiteGames) * 100).toFixed(1) : 'N/A';
      const blackWinPercent = blackGames > 0 ? ((blackWins / blackGames) * 100).toFixed(1) : 'N/A';

      setStats({
        username: data.username,
        gamesPlayed: data.count.all,
        wins: data.count.win,
        losses: data.count.loss,
        draws: data.count.draw,
        whiteWinPercent,
        blackWinPercent,
      });

      setGames(parsedGames);

    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      <div className="dashboard-container">
        <h1>Dashboard</h1>

        {/* Centered search bar */}
        <div className="search-bar-wrapper">
          <PlayerSearch onSearch={handleSearch} />
        </div>

        {/* Skeleton loaders while loading */}
        {loading && (
          <div className="horizontal-layout">
            <div className="summary-wrapper">
              <Skeleton type="summary" />
            </div>
            <div className="chart-wrapper">
              <Skeleton type="chart" />
            </div>
          </div>
        )}

        {/* PlayerSummary and Pie Chart side-by-side */}
        {!loading && stats && games.length > 0 && (
          <div className="horizontal-layout">
            <div className="summary-wrapper">
              <PlayerSummary stats={stats} loading={loading} />
            </div>
            <div className="chart-wrapper">
              <RatingPieChart games={games} username={stats.username} />
            </div>
          </div>
        )}

        {/* Games table below */}
        {!loading && stats && games.length > 0 && (
          <GamesTable games={games} loading={loading} username={stats.username} />
        )}
      </div>
    </div>
  );
}
