export default function ErrorState({ message, onRetry }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        border: '1px solid #ff4d4f',
        backgroundColor: '#fff1f0',
        color: '#a8071a',
        padding: '1rem',
        borderRadius: '4px',
        margin: '1rem 0',
        textAlign: 'center',
      }}
    >
      <p style={{ margin: 0, fontWeight: 'bold' }}>Error: {message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop: '0.75rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#ff4d4f',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
          }}
          aria-label="Retry"
        >
          Retry
        </button>
      )}
    </div>
  );
}
