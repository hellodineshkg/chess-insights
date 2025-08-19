export default function PlayerSummary({ stats, loading }) {
  if (loading) {
    return (
      <div>
        <h2>Player Summary</h2>
        <p>Loading player stats...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div>
        <h2>Player Summary</h2>
        <p>No player data available.</p>
      </div>
    );
  }

  const {
    username,
    gamesPlayed,
    wins,
    losses,
    draws,
    whiteWinPercent,
    blackWinPercent,
    mostPlayedOpening,
  } = stats;

  return (
    <section style={{ marginBottom: '2rem' }}>
      <h2>Player Summary for <span style={{ color: '#1976d2' }}>{username}</span></h2>
      <ul style={{ fontSize: '1.1rem' }}>
        <li>Total Games: <b>{gamesPlayed}</b></li>
        <li>Wins: <b>{wins}</b></li>
        <li>Losses: <b>{losses}</b></li>
        <li>Draws: <b>{draws}</b></li>
        <li>White Win %: <b>{whiteWinPercent}%</b></li>
        <li>Black Win %: <b>{blackWinPercent}%</b></li>
      </ul>
    </section>
  );
}
