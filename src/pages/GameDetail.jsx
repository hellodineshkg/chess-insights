import { useParams } from "react-router-dom";

export default function GameDetail() {
  const { gameId } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Game Details</h1>
      <p>Showing details for game ID: {gameId}</p>
    </div>
  );
}
