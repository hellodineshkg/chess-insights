// src/pages/GameDetail.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Clock, User, Trophy, Book, Zap, AlertCircle, Loader2 } from 'lucide-react';

// Import the CSS file
import '../styles/GameDetail.css';

// Inline Skeleton component
const Skeleton = ({ className = "", width = "w-full", height = "h-4" }) => (
  <div className={`skeleton ${height} ${width} ${className}`}></div>
);

// Inline Error component
const ErrorState = ({ message, onRetry }) => (
  <div className="error-container">
    <AlertCircle className="error-icon" />
    <h3 className="error-title">Something went wrong</h3>
    <p className="error-message">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="retry-button">
        Try Again
      </button>
    )}
  </div>
);

// Sample games data (same as before)
const SAMPLE_GAMES = {
  "sample1": {
    id: "sample1",
    white: { name: "Magnus Carlsen", rating: 2830 },
    black: { name: "Fabiano Caruana", rating: 2810 },
    result: "1-0",
    timeControl: "180+2",
    date: "2024-02-15",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7", "Re1", "b5", "Bb3", "d6"],
    tactics: [
      {
        move: 5,
        type: "book",
        description: "Bb5 - The Spanish Opening, putting pressure on the knight",
        bestMove: "Bb5",
        evaluation: "+0.2"
      },
      {
        move: 9,
        type: "excellent",
        description: "Castling kingside maintains safety while developing the rook",
        bestMove: "O-O",
        evaluation: "+0.3"
      },
      {
        move: 14,
        type: "inaccuracy", 
        description: "d6 is slightly passive, Bc5 was more active",
        bestMove: "Bc5",
        evaluation: "+0.6"
      }
    ]
  },
  "sample2": {
    id: "sample2",
    white: { name: "Hikaru Nakamura", rating: 2780 },
    black: { name: "Anish Giri", rating: 2760 },
    result: "1/2-1/2",
    timeControl: "300+3",
    date: "2024-02-10",
    moves: ["d4", "d5", "c4", "e6", "Nc3", "Nf6", "cxd5", "exd5", "Bg5", "Be7", "e3", "O-O"],
    tactics: [
      {
        move: 3,
        type: "book",
        description: "c4 - The Queen's Gambit, offering a pawn for central control",
        bestMove: "c4",
        evaluation: "=0.0"
      },
      {
        move: 9,
        type: "excellent",
        description: "Bg5 puts pressure on Black's kingside development",
        bestMove: "Bg5",
        evaluation: "+0.2"
      }
    ]
  },
  "sample3": {
    id: "sample3",
    white: { name: "Ding Liren", rating: 2790 },
    black: { name: "Ian Nepomniachtchi", rating: 2770 },
    result: "0-1",
    timeControl: "90+30",
    date: "2024-02-08",
    moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Bg5", "e6"],
    tactics: [
      {
        move: 2,
        type: "book",
        description: "c5 - The Sicilian Defense, Black's most aggressive response",
        bestMove: "c5",
        evaluation: "=0.0"
      },
      {
        move: 11,
        type: "sharp",
        description: "Bg5 leads to sharp tactical complications",
        bestMove: "Bg5",
        evaluation: "+0.3"
      }
    ]
  }
};

// ECO Opening database (same as before)
const ECO_DATABASE = {
  "e4 e5 Nf3 Nc6 Bb5": { code: "C60", name: "Spanish Opening (Ruy Lopez)" },
  "d4 d5 c4": { code: "D06", name: "Queen's Gambit" },
  "e4 c5": { code: "B20", name: "Sicilian Defense" },
  "e4 e6": { code: "C00", name: "French Defense" },
  "d4 Nf6": { code: "A40", name: "Queen's Pawn Game" },
  "Nf3 d5": { code: "A04", name: "Réti Opening" },
  "e4 e5 Nf3 Nc6": { code: "C20", name: "King's Pawn Opening" }
};

// Helper functions (same as before)
const detectOpening = (moves) => {
  if (!moves || moves.length === 0) return { code: "A00", name: "Unknown Opening" };
  
  const moveString = moves.slice(0, 6).join(' ');
  for (const [key, value] of Object.entries(ECO_DATABASE)) {
    if (moveString.startsWith(key)) return value;
  }
  
  if (moves[0] === 'e4') return { code: "B00", name: "King's Pawn Opening" };
  if (moves[0] === 'd4') return { code: "A40", name: "Queen's Pawn Opening" };
  return { code: "A00", name: "Irregular Opening" };
};

const findOpeningDeviation = (moves) => {
  const opening = detectOpening(moves);
  if (!moves || moves.length < 3) {
    return {
      ...opening,
      deviationMove: null,
      bookMoves: moves ? moves.join(' ') : '',
      actualMoves: moves ? moves.join(' ') : '',
      deviationReason: "Game too short for analysis"
    };
  }

  const deviationMove = Math.min(6, moves.length - 1);
  return {
    ...opening,
    deviationMove,
    bookMoves: moves.slice(0, deviationMove).join(' '),
    actualMoves: moves.slice(0, deviationMove + 1).join(' '),
    deviationReason: "Beyond basic opening theory"
  };
};

// Chess board component
const ChessBoard = ({ lastMove }) => {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

  return (
    <div className="chess-board">
      {ranks.map(rank =>
        files.map(file => {
          const square = `${file}${rank}`;
          const isLight = (files.indexOf(file) + rank) % 2 === 1;
          const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
          
          return (
            <div
              key={square}
              className={`chess-square ${isLight ? 'light' : 'dark'} ${isLastMove ? 'last-move' : ''}`}
            >
              <span className="chess-piece">
                {square === 'e1' && '♔'}
                {square === 'e8' && '♚'}
                {square === 'a1' && '♖'}
                {square === 'h1' && '♖'}
                {square === 'a8' && '♜'}
                {square === 'h8' && '♜'}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
};

// Opening analysis component
const OpeningAnalysis = ({ moves, deviation }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!deviation) {
    return (
      <div className="card">
        <Skeleton className="h-6 mb-2" width="w-1-2" />
        <Skeleton className="h-4 mb-1" width="w-3-4" />
        <Skeleton className="h-4" width="w-1-2" />
      </div>
    );
  }

  return (
    <div className="card opening-analysis">
      <div className="analysis-header">
        <div className="analysis-title">
          <Book />
          <h3>Opening Analysis</h3>
        </div>
        <span className="eco-code">
          {deviation.code}
        </span>
      </div>
      
      <div>
        <h4 className="opening-name">{deviation.name}</h4>
        <p className="deviation-info">
          Theory followed until move {deviation.deviationMove || 'N/A'}
        </p>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="book-moves-toggle"
        >
          {isExpanded ? 'Hide' : 'Show'} book moves
        </button>
        
        {isExpanded && (
          <div className="book-moves-content">
            <p>Book: {deviation.bookMoves}</p>
            <p>Played: {deviation.actualMoves}</p>
            <p className="reason">{deviation.deviationReason}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Tactics component
const TacticsSection = ({ tactics }) => {
  if (!tactics) {
    return (
      <div className="card">
        <div className="tactics-title">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-20" />
      </div>
    );
  }

  return (
    <div className="card tactics-section">
      <div className="tactics-title">
        <Zap />
        <h3>Tactical Moments</h3>
      </div>
      
      <div className="tactics-list">
        {tactics.map((tactic, index) => (
          <div key={index} className="tactic-item">
            <div className="tactic-header">
              <span className="move-number">Move {tactic.move}</span>
              <span className={`tactic-badge tactic-${tactic.type}`}>
                {tactic.type}
              </span>
            </div>
            <p className="tactic-description">{tactic.description}</p>
            {tactic.bestMove && (
              <p className="tactic-best-move">
                Best: {tactic.bestMove} (eval: {tactic.evaluation})
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Main GameDetail component
const GameDetail = () => {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [currentGameId, setCurrentGameId] = useState('sample1');

  // Load game data
  useEffect(() => {
    const fetchGame = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (SAMPLE_GAMES[currentGameId]) {
          const mockGame = SAMPLE_GAMES[currentGameId];
          const deviation = findOpeningDeviation(mockGame.moves);
          setGame({ ...mockGame, opening: deviation });
        } else {
          throw new Error(`Game ${currentGameId} not found`);
        }
        
      } catch (err) {
        setError(err.message || "Failed to load game data");
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [currentGameId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!game) return;
      
      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentMoveIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentMoveIndex(prev => Math.min(game.moves.length - 1, prev + 1));
          break;
        case 'Home':
          e.preventDefault();
          setCurrentMoveIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setCurrentMoveIndex(game.moves.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [game]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setCurrentGameId('sample1');
    }, 100);
  };

  if (error) {
    return (
      <div className="game-detail">
        <ErrorState message={error} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="game-detail">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <button 
            onClick={() => window.history.back()}
            className="back-button"
            aria-label="Go back"
          >
            <ChevronLeft />
          </button>
          <div>
            {loading ? (
              <Skeleton className="h-7" width="w-48" />
            ) : game ? (
              <h1 className="header-title">
                {game.white.name} vs {game.black.name}
              </h1>
            ) : (
              <h1 className="header-title">Game Analysis</h1>
            )}
            {loading ? (
              <Skeleton className="h-5 mt-1" width="w-32" />
            ) : game ? (
              <p className="header-subtitle">{game.date} • {game.timeControl}</p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Sample Game Selector */}
        <div className="game-selector">
          <h3>Sample Games</h3>
          <div className="game-selector-buttons">
            {Object.entries(SAMPLE_GAMES).map(([id, gameData]) => (
              <button
                key={id}
                onClick={() => {
                  setCurrentGameId(id);
                  setCurrentMoveIndex(0);
                }}
                className={`game-selector-button ${
                  currentGameId === id ? 'active' : 'inactive'
                }`}
              >
                {gameData.white.name} vs {gameData.black.name}
              </button>
            ))}
          </div>
        </div>

        <div className="content-grid">
          {/* Left Column - Game Board and Controls */}
          <div className="left-column">
            {/* Players Info */}
            <div className="card">
              <div className="players-grid">
                <div className="player-info">
                  {loading ? (
                    <>
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-5 w-24 mb-1" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="player-avatar white">
                        <User />
                      </div>
                      <div className="player-details">
                        <h3>{game?.white.name}</h3>
                        <p>White • {game?.white.rating}</p>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="player-info">
                  {loading ? (
                    <>
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-5 w-24 mb-1" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="player-avatar black">
                        <User />
                      </div>
                      <div className="player-details">
                        <h3>{game?.black.name}</h3>
                        <p>Black • {game?.black.rating}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="game-info">
                <div className="time-control">
                  <Clock />
                  {loading ? <Skeleton className="h-4 w-16" /> : game?.timeControl}
                </div>
                <div className="result">
                  <Trophy />
                  {loading ? <Skeleton className="h-4 w-12" /> : (
                    <span>Result: {game?.result}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Chess Board */}
            <div className="card">
              {loading ? (
                <Skeleton className="aspect-square" />
              ) : (
                <ChessBoard lastMove={{ from: "e2", to: "e4" }} />
              )}
              
              {/* Move Navigation */}
              <div className="move-navigation">
                <button 
                  onClick={() => setCurrentMoveIndex(0)}
                  disabled={loading || currentMoveIndex === 0}
                  className="nav-button"
                >
                  ⏮
                </button>
                <button 
                  onClick={() => setCurrentMoveIndex(prev => Math.max(0, prev - 1))}
                  disabled={loading || currentMoveIndex === 0}
                  className="nav-button"
                >
                  ⏪
                </button>
                <span className="move-counter">
                  {loading ? <Skeleton className="h-4 w-12" /> : `${currentMoveIndex + 1}/${game?.moves.length || 0}`}
                </span>
                <button 
                  onClick={() => setCurrentMoveIndex(prev => Math.min((game?.moves.length || 0) - 1, prev + 1))}
                  disabled={loading || currentMoveIndex >= (game?.moves.length || 0) - 1}
                  className="nav-button"
                >
                  ⏩
                </button>
                <button 
                  onClick={() => setCurrentMoveIndex((game?.moves.length || 0) - 1)}
                  disabled={loading || currentMoveIndex >= (game?.moves.length || 0) - 1}
                  className="nav-button"
                >
                  ⏭
                </button>
              </div>
              
              <p className="navigation-help">
                Use arrow keys or buttons to navigate moves
              </p>
            </div>
          </div>

          {/* Right Column - Analysis */}
          <div className="right-column">
            {/* Opening Analysis */}
            <OpeningAnalysis 
              moves={game?.moves} 
              deviation={loading ? null : game?.opening}
            />

            {/* Tactics */}
            <TacticsSection tactics={loading ? null : game?.tactics} />

            {/* Move List */}
            <div className="card">
              <h3>Moves</h3>
              {loading ? (
                <div>
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-6 mb-2" width={i % 2 === 0 ? "w-full" : "w-3-4"} />
                  ))}
                </div>
              ) : (
                <div className="move-list-container">
                  <div className="move-list">
                    {game?.moves.map((move, index) => (
                      <div 
                        key={index}
                        className={`move-item ${index === currentMoveIndex ? 'active' : ''}`}
                        onClick={() => setCurrentMoveIndex(index)}
                      >
                        <span className="move-number-display">
                          {Math.floor(index / 2) + 1}{index % 2 === 0 ? '.' : '...'}
                        </span>
                        <span className="move-notation">{move}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-card">
            <div className="loading-content">
              <Loader2 className="loading-spinner" />
              <span className="loading-text">Loading game analysis...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameDetail;