export default function Skeleton({ width = '100%', height = '1rem', style = {} }) {
  const baseStyle = {
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    width,
    height,
    marginBottom: '0.5rem',
    position: 'relative',
    overflow: 'hidden',
  };

  const shimmerStyle = {
    position: 'absolute',
    top: 0,
    left: '-150%',
    height: '100%',
    width: '50%',
    background:
      'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
    animation: 'shimmer 1.5s infinite',
  };

  return (
    <div style={{ ...baseStyle, ...style }}>
      <div style={shimmerStyle} />
      <style>{`
        @keyframes shimmer {
          0% {
            left: -150%;
          }
          100% {
            left: 150%;
          }
        }
      `}</style>
    </div>
  );
}
