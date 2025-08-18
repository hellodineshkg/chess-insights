import Skeleton from './Skeleton';

export default function GamesTable({ games, loading }) {
  if (loading) {
    return (
      <section style={{ marginTop: '2rem' }}>
        <h2>Recent Games</h2>
        <Skeleton count={6} height="1.2rem" />
      </section>
    );
  }

  if (!games || games.length === 0) {
    return (
      <section style={{ marginTop: '2rem' }}>
        <h2>Recent Games</h2>
        <p>No recent games available.</p>
      </section>
    );
  }

  return (
    <section style={{ marginTop: '2rem' }}>
      <h2>Recent Games</h2>
      <table className="min-w-full border border-gray-300 mt-2">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">White</th>
            <th className="p-2 border">Black</th>
            <th className="p-2 border">Result</th>
            <th className="p-2 border">Opening</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game, idx) => (
            <tr key={idx} className="text-center">
              <td className="p-2 border">{game.players.white.user?.name || 'Anon'}</td>
              <td className="p-2 border">{game.players.black.user?.name || 'Anon'}</td>
              <td className="p-2 border">{game.winner || 'Draw'}</td>
              <td className="p-2 border">{game.opening?.name || 'Unknown'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
