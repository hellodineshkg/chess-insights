import { useState } from 'react';
import TopBar from '../components/TopBar';
import PlayerSearch from '../components/PlayerSearch';
import PlayerSummary from '../components/PlayerSummary';
import GamesTable from '../components/GamesTable';
import RatingPieChart from '../components/RatingPieChart';
import Skeleton from '../components/Skeleton';

// Enhanced Skeleton component with proper theming and animation
const InlineSkeleton = ({ className = "", width = "w-full", height = "h-4", style = {} }) => (
  <div 
    className={`skeleton ${height} ${width} ${className}`}
    style={style}
  ></div>
);

// Skeleton for PlayerSummary
const PlayerSummarySkeleton = () => (
  <div className="player-summary-skeleton">
    <div className="skeleton-header">
      <InlineSkeleton height="h-8" width="w-48" />
      <InlineSkeleton height="h-5" width="w-32" style={{ marginTop: '0.5rem' }} />
    </div>
    <div className="skeleton-stats-grid">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="skeleton-stat-item">
          <InlineSkeleton height="h-4" width="w-20" />
          <InlineSkeleton height="h-6" width="w-16" style={{ marginTop: '0.25rem' }} />
        </div>
      ))}
    </div>
  </div>
);

// Skeleton for RatingPieChart
const RatingPieChartSkeleton = () => (
  <div className="chart-skeleton">
    <InlineSkeleton height="h-6" width="w-40" style={{ marginBottom: '1rem' }} />
    <div className="skeleton-chart-container">
      <div className="skeleton-pie-chart"></div>
    </div>
    <div className="skeleton-legend">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="skeleton-legend-item">
          <div className="skeleton-legend-color"></div>
          <InlineSkeleton height="h-4" width="w-24" />
          <InlineSkeleton height="h-4" width="w-12" />
        </div>
      ))}
    </div>
  </div>
);

// Skeleton for GamesTable
const GamesTableSkeleton = () => (
  <div className="games-table-skeleton">
    <InlineSkeleton height="h-6" width="w-32" style={{ marginBottom: '1rem' }} />
    
    {/* Table container */}
    <div className="skeleton-table-container">
      {/* Table header skeleton */}
      <div className="skeleton-table-header">
        <InlineSkeleton height="h-4" width="w-16" />
        <InlineSkeleton height="h-4" width="w-24" />
        <InlineSkeleton height="h-4" width="w-20" />
        <InlineSkeleton height="h-4" width="w-16" />
        <InlineSkeleton height="h-4" width="w-20" />
        <InlineSkeleton height="h-4" width="w-24" />
      </div>
      
      {/* Table rows skeleton */}
      <div className="skeleton-table-body">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="skeleton-table-row">
            <InlineSkeleton height="h-4" width={i % 3 === 0 ? "w-12" : "w-16"} />
            <InlineSkeleton height="h-4" width={i % 2 === 0 ? "w-20" : "w-24"} />
            <InlineSkeleton height="h-4" width="w-16" />
            <InlineSkeleton height="h-4" width="w-12" />
            <InlineSkeleton height="h-4" width={i % 4 === 0 ? "w-16" : "w-20"} />
            <InlineSkeleton height="h-4" width={i % 3 === 0 ? "w-20" : "w-28"} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [games, setGames] = useState([]);

  const handleSearch = async (username) => {
    setLoading(true);
    setStats(null);
    setGames([]);
    
    try {
      // Simulate some loading time to show skeleton
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      // You might want to add error state handling here
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

        {/* Show skeleton loaders while loading */}
        {loading && (
          <div className="loading-container fade-in">
            {/* PlayerSummary and Pie Chart skeletons side-by-side */}
            <div className="horizontal-layout">
              <div className="summary-wrapper">
                <PlayerSummarySkeleton />
              </div>
              <div className="chart-wrapper">
                <RatingPieChartSkeleton />
              </div>
            </div>
            
            {/* Games table skeleton */}
            <GamesTableSkeleton />
          </div>
        )}

        {/* Show actual content when loaded */}
        {!loading && stats && games.length > 0 && (
          <div className="content-container fade-in">
            {/* PlayerSummary and Pie Chart side-by-side */}
            <div className="horizontal-layout">
              <div className="summary-wrapper">
                <PlayerSummary stats={stats} loading={false} />
              </div>
              <div className="chart-wrapper">
                <RatingPieChart games={games} username={stats.username} />
              </div>
            </div>

            {/* Games table below */}
            <GamesTable games={games} loading={false} username={stats.username} />
          </div>
        )}

        {/* Show message when no data and not loading */}
        {!loading && !stats && (
          <div className="no-data-message fade-in">
            <div className="no-data-content">
              <h3>Welcome to Chess Analytics</h3>
              <p>Search for a Lichess player to view their statistics and recent games.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}