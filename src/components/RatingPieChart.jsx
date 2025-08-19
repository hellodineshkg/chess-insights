import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function RatingPieChart({ games, username }) {
  if (!games || games.length === 0) return <div>No games data available.</div>;

  const playerName = username?.toLowerCase();

  // Count wins, losses, draws
  let wins = 0, losses = 0, draws = 0;
  games.forEach(game => {
    const userColor = game.players.white.user?.name?.toLowerCase() === playerName
      ? "white"
      : game.players.black.user?.name?.toLowerCase() === playerName
        ? "black"
        : null;

    if (!userColor) return;

    if (!game.winner) draws++;
    else if (game.winner === userColor) wins++;
    else losses++;
  });

  const data = {
    labels: ["Wins", "Losses", "Draws"],
    datasets: [
      {
        data: [wins, losses, draws],
        backgroundColor: ["#59D8A1", "#FF7C66", "#FFE352"], // green, red, yellow
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      tooltip: { enabled: true },
    },
  };

  return (
    <div style={{ width: "100%", maxWidth: 400, margin: "2rem auto" }}>
      <h3>Win/Loss/Draw Distribution</h3>
      <Pie data={data} options={options} />
    </div>
  );
}
