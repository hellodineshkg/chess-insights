import { useState } from 'react';
export default function PlayerSearch({ onSearch }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setError('Username cannot be empty');
      return;
    }
    setError('');
    onSearch(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Player search form" style={{ marginBottom: '1.5rem' }}>
      <input
        type="text"
        value={username}
        placeholder="Enter Lichess username"
        onChange={(e) => setUsername(e.target.value)}
        aria-label="Lichess username"
        aria-describedby="username-error"
        autoComplete="off"
        style={{ padding: '0.5rem', fontSize: '1rem', width: '280px' }}
      />
      <button
        type="submit"
        style={{ marginLeft: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
      >
        Search
      </button>
      {error && (
        <div id="username-error" style={{ color: 'red', marginTop: '0.5rem' }}>
          {error}
        </div>
      )}
    </form>
  );
}
