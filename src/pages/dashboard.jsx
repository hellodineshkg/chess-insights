import { useState, useMemo } from "react";
import PlayerSearch from "../components/PlayerSearch";
import PlayerSummary from "../components/PlayerSummary";
import GamesTable from "../components/GamesTable";
import RatingGraph from "../components/RatingGraph";
import {
  subDays,
  subMonths,
  eachDayOfInterval,
  eachMonthOfInterval,
  format,
} from "date-fns";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [games, setGames] = useState([]);
  const [filter, setFilter] = useState("all_time");

  // --- Extract ratings [{ date, rating }] ---
  const ratings = useMemo(() => {
    if (!games || !stats) return [];
    return games
      .map((game) => {
        let playerColor = null;
        if (game.players.white.user?.name?.toLowerCase() === stats.username.toLowerCase()) {
          playerColor = "white";
        } else if (game.players.black.user?.name?.toLowerCase() === stats.username.toLowerCase()) {
          playerColor = "black";
        }
        if (!playerColor) return null;

        const playerInfo = game.players[playerColor];
        return {
          date: game.createdAt ? new Date(game.createdAt) : null,
          rating: playerInfo.rating || null,
        };
      })
      .filter((d) => d && d.rating);
  }, [games, stats]);

  // --- Timeframe filtering ---
  const getFilteredData = () => {
    const now = new Date();

    if (filter === "last_week") {
      const days = eachDayOfInterval({ start: subDays(now, 6), end: now });
      return days.map((d) => {
        const found = ratings.find(
          (r) => format(r.date, "yyyy-MM-dd") === format(d, "yyyy-MM-dd")
        );
        return { date: format(d, "MM-dd"), rating: found ? found.rating : null };
      });

    } else if (filter === "last_month") {
      const days = eachDayOfInterval({ start: subDays(now, 29), end: now });
      return days.map((d) => {
        const found = ratings.find(
          (r) => format(r.date, "yyyy-MM-dd") === format(d, "yyyy-MM-dd")
        );
        return { date: format(d, "MM-dd"), rating: found ? found.rating : null };
      });

    } else if (filter === "last_6_months") {
      const months = eachMonthOfInterval({ start: subMonths(now, 5), end: now });
      return months.map((m) => {
        const monthData = ratings.filter(
          (r) => format(r.date, "yyyy-MM") === format(m, "yyyy-MM")
        );
        const avg = monthData.length
          ? Math.round(monthData.reduce((sum, r) => sum + r.rating, 0) / monthData.length)
          : null;
        return { date: format(m, "MMM"), rating: avg };
      });

    } else {
      return ratings
        .sort((a, b) => a.date - b.date)
        .map((r) => ({ date: format(r.date, "yyyy-MM-dd"), rating: r.rating }));
    }
  };

  // --- Compute Player Summary ---
  const computeSummary = (username, games) => {
    const totalGames = games.length;
    let wins = 0, losses = 0, draws = 0;
    let whiteWins = 0, whiteGames = 0;
    let blackWins = 0, blackGames = 0;
    const openingCount = {};

    games.forEach((game) => {
      let playerColor = null;
      if (game.players.white.user?.name?.toLowerCase() === username.toLowerCase()) {
        playerColor = "white";
      } else if (game.players.black.user?.name?.toLowerCase() === username.toLowerCase()) {
        playerColor = "black";
      }
      if (!playerColor) return;

      const opponentColor = playerColor === "white" ? "black" : "white";
      const result = game.winner;

      if (result === playerColor) wins++;
      else if (result === opponentColor) losses++;
      else draws++;

      if (playerColor === "white") {
        whiteGames++;
        if (result === "white") whiteWins++;
      } else {
        blackGames++;
        if (result === "black") blackWins++;
      }

      if (game.opening) {
        const key = game.opening.name;
        openingCount[key] = (openingCount[key] || 0) + 1;
      }
    });

    const mostPlayedOpening =
      Object.keys(openingCount).length > 0
        ? Object.entries(openingCount).sort((a, b) => b[1] - a[1])[0]
        : null;

    return {
      username,
      gamesPlayed: totalGames,
      wins,
      losses,
      draws,
      whiteWinPercent: whiteGames ? Math.round((whiteWins / whiteGames) * 100) : 0,
      blackWinPercent: blackGames ? Math.round((blackWins / blackGames) * 100) : 0,
      mostPlayedOpening: mostPlayedOpening
        ? { name: mostPlayedOpening[0], eco: "" }
        : null,
    };
  };

  // --- Search handler ---
  const handleSearch = async (username) => {
    setLoading(true);
    setStats(null);
    setGames([]);

    try {
      // Fetch Recent Games
      const gamesRes = await fetch(
        `https://lichess.org/api/games/user/${username}?max=200&opening=true`,
        { headers: { Accept: "application/x-ndjson" } }
      );
      const textStream = await gamesRes.text();
      const parsedGames = textStream
        .trim()
        .split("\n")
        .map((line) => JSON.parse(line));

      // Compute player stats
      const summary = computeSummary(username, parsedGames);

      setStats(summary);
      setGames(parsedGames);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1 className="text-2xl font-bold mb-6">Chess Dashboard</h1>

      <PlayerSearch onSearch={handleSearch} />
      <PlayerSummary stats={stats} loading={loading} />

      {stats && (
        <>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setFilter("last_week")}>Last Week</button>
            <button onClick={() => setFilter("last_month")}>Last Month</button>
            <button onClick={() => setFilter("last_6_months")}>Last 6 Months</button>
            <button onClick={() => setFilter("all_time")}>All Time</button>
          </div>
          <RatingGraph data={getFilteredData()} />
        </>
      )}

      <GamesTable games={games} loading={loading} />
    </div>
  );
}
