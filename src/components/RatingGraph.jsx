import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function RatingGraph({ data }) {
  if (!data || data.length === 0) {
    return <div>No rating data available.</div>;
  }

  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: "Rating",
        data: data.map((d) => d.rating),
        borderColor: "#3366ff",
        backgroundColor: "rgba(51, 102, 255, 0.3)",
        tension: 0.2,
        pointRadius: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    scales: {
      x: { ticks: { autoSkip: true, maxTicksLimit: 12 } },
      y: { beginAtZero: false },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
  };

  return (
    <div style={{ width: "100%", height: 350, marginBottom: "2rem" }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
