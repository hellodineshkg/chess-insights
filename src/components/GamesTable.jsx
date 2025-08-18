import { useState, useMemo } from 'react';

export default function GamesTable({ games }) {
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [resultFilter, setResultFilter] = useState('all');
  const [timeControlFilter, setTimeControlFilter] = useState('all');
  const [ecoSearch, setEcoSearch] = useState('');

  const sortedFilteredGames = useMemo(() => {
    let filtered = games;

    // Filter by result
    if (resultFilter !== 'all') {
      filtered = filtered.filter(g => g.result === resultFilter);
    }

    // Filter by time control
    if (timeControlFilter !== 'all') {
      filtered = filtered.filter(g => g.timeControl === timeControlFilter);
    }

    // Search by ECO or opening name (case insensitive)
    if (ecoSearch.trim()) {
      const searchTerm = ecoSearch.trim().toLowerCase();
      filtered = filtered.filter(g =>
        (g.opening?.name?.toLowerCase().includes(searchTerm)) ||
        (g.opening?.eco?.toLowerCase().includes(searchTerm))
      );
    }

    // Sort
    if (sortConfig.key) {
      filtered = filtered.slice().sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === 'date') {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
        } else if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [games, sortConfig, resultFilter, timeControlFilter, ecoSearch]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <section>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Result:
          <select value={resultFilter} onChange={e => setResultFilter(e.target.value)} style={{ marginLeft: '0.5rem' }}>
            <option value="all">All</option>
            <option value="win">Win</option>
            <option value="loss">Loss</option>
            <option value="draw">Draw</option>
          </select>
        </label>

        <label style={{ marginLeft: '1.5rem' }}>
          Time Control:
          <select value={timeControlFilter} onChange={e => setTimeControlFilter(e.target.value)} style={{ marginLeft: '0.5rem' }}>
            <option value="all">All</option>
            <option value="blitz">Blitz</option>
            <option value="rapid">Rapid</option>
            <option value="classical">Classical</option>
          </select>
        </label>

        <label style={{ marginLeft: '1.5rem' }}>
          Search Opening (Name/ECO):
          <input
            type="text"
            value={ecoSearch}
            onChange={e => setEcoSearch(e.target.value)}
            placeholder="e.g. Sicilian or B20"
            style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
          />
        </label>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['date', 'opponent', 'opponentRating', 'color', 'result', 'timeControl', 'opening'].map((key) => (
              <th
                key={key}
                onClick={() => requestSort(key === 'opponentRating' ? 'opponentRating' : key)}
                style={{
                  cursor: 'pointer',
                  borderBottom: '1px solid #ddd',
                  padding: '0.5rem',
                  textTransform: 'capitalize',
                  userSelect: 'none'
                }}
              >
                {key === 'opponentRating' ? 'Opp. Rating' : key.charAt(0).toUpperCase() + key.slice(1)}
                {sortConfig.key === key ? (sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽') : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedFilteredGames.map(game => (
            <tr key={game.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '0.5rem' }}>{new Date(game.date).toLocaleDateString()}</td>
              <td style={{ padding: '0.5rem' }}>{game.opponent}</td>
              <td style={{ padding: '0.5rem', textAlign: 'right' }}>{game.opponentRating}</td>
              <td style={{ padding: '0.5rem', textAlign: 'center' }}>{game.color}</td>
              <td style={{ padding: '0.5rem', textAlign: 'center' }}>{game.result}</td>
              <td style={{ padding: '0.5rem', textAlign: 'center' }}>{game.timeControl}</td>
              <td style={{ padding: '0.5rem' }}>{game.opening?.name} ({game.opening?.eco})</td>
            </tr>
          ))}
          {sortedFilteredGames.length === 0 && (
            <tr>
              <td colSpan="7" style={{ padding: '1rem', textAlign: 'center' }}>
                No games found matching filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
