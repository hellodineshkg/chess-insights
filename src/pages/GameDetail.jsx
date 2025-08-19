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

// Sample games data with proper move notation
const SAMPLE_GAMES = {
  "sample1": {
    id: "sample1",
    white: { name: "Magnus Carlsen", rating: 2830 },
    black: { name: "Fabiano Caruana", rating: 2810 },
    result: "1-0",
    timeControl: "180+2",
    date: "2024-02-15",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7", "Re1", "b5", "Bb3", "d6", "c3", "O-O", "h3", "Nb8", "d4", "Nbd7", "Nbd2", "Bb7", "Bc2", "Re8", "Nf1", "Bf8", "Ng3", "g6", "a4", "c5"],
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
    moves: ["d4", "d5", "c4", "e6", "Nc3", "Nf6", "cxd5", "exd5", "Bg5", "Be7", "e3", "O-O", "Bd3", "c6", "Qc2", "Re8", "Nge2", "Nbd7", "O-O", "Nf8", "Rae1", "Ng6", "Bxf6", "Bxf6", "f4", "Be7"],
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
    moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Bg5", "e6", "f4", "Be7", "Qf3", "Qc7", "O-O-O", "Nbd7", "g4", "b5", "Bxf6", "Nxf6", "g5", "Nd7", "f5", "Nc5"],
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

// ECO Opening database
const ECO_DATABASE = {
  "e4 e5 Nf3 Nc6 Bb5": { code: "C60", name: "Spanish Opening (Ruy Lopez)" },
  "d4 d5 c4": { code: "D06", name: "Queen's Gambit" },
  "e4 c5": { code: "B20", name: "Sicilian Defense" },
  "e4 e6": { code: "C00", name: "French Defense" },
  "d4 Nf6": { code: "A40", name: "Queen's Pawn Game" },
  "Nf3 d5": { code: "A04", name: "Réti Opening" },
  "e4 e5 Nf3 Nc6": { code: "C20", name: "King's Pawn Opening" }
};

// Chess piece position tracker and move parser
class ChessGame {
  constructor() {
    this.reset();
  }

  reset() {
    this.board = this.getInitialPosition();
    this.isWhiteToMove = true;
    this.lastMove = null;
    this.moveHistory = [];
    this.castlingRights = {
      whiteKingside: true,
      whiteQueenside: true,
      blackKingside: true,
      blackQueenside: true
    };
  }

  getInitialPosition() {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // White pieces
    board[7] = ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'];
    board[6] = ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'];
    
    // Black pieces  
    board[0] = ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'];
    board[1] = ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'];

    return board;
  }

  fileToIndex(file) {
    return file.charCodeAt(0) - 'a'.charCodeAt(0);
  }

  rankToIndex(rank) {
    return 8 - parseInt(rank);
  }

  indexToSquare(file, rank) {
    return String.fromCharCode('a'.charCodeAt(0) + file) + (8 - rank);
  }

  getPieceAt(square) {
    const file = this.fileToIndex(square[0]);
    const rank = this.rankToIndex(square[1]);
    return this.board[rank][file];
  }

  setPieceAt(square, piece) {
    const file = this.fileToIndex(square[0]);
    const rank = this.rankToIndex(square[1]);
    this.board[rank][file] = piece;
  }

  parseMove(moveStr) {
    // Remove check/checkmate indicators and annotations
    const cleanMove = moveStr.replace(/[+#!?]+$/, '').trim();
    
    // Handle castling
    if (cleanMove === 'O-O' || cleanMove === '0-0') {
      return {
        type: 'castle',
        isKingside: true,
        from: this.isWhiteToMove ? 'e1' : 'e8',
        to: this.isWhiteToMove ? 'g1' : 'g8'
      };
    }
    if (cleanMove === 'O-O-O' || cleanMove === '0-0-0') {
      return {
        type: 'castle',
        isQueenside: true,
        from: this.isWhiteToMove ? 'e1' : 'e8',
        to: this.isWhiteToMove ? 'c1' : 'c8'
      };
    }

    // Parse regular moves
    const isCapture = cleanMove.includes('x');
    let remaining = cleanMove;
    
    // Extract promotion if present
    let promotion = null;
    const promotionMatch = remaining.match(/=([QRBN])$/);
    if (promotionMatch) {
      promotion = promotionMatch[1];
      remaining = remaining.replace(/=[QRBN]$/, '');
    }

    // Extract destination square (always last 2 characters)
    const to = remaining.slice(-2);
    remaining = remaining.slice(0, -2);

    // Remove 'x' if present
    if (remaining.endsWith('x')) {
      remaining = remaining.slice(0, -1);
    }

    // Determine piece type and disambiguators
    let pieceType = 'P'; // Default to pawn
    let fromFile = null;
    let fromRank = null;

    if (remaining.match(/^[KQRBN]/)) {
      // Piece move
      pieceType = remaining[0];
      const disambiguator = remaining.slice(1);
      
      if (disambiguator.length === 1) {
        if (disambiguator >= 'a' && disambiguator <= 'h') {
          fromFile = disambiguator;
        } else if (disambiguator >= '1' && disambiguator <= '8') {
          fromRank = disambiguator;
        }
      } else if (disambiguator.length === 2) {
        fromFile = disambiguator[0];
        fromRank = disambiguator[1];
      }
    } else if (remaining.length > 0) {
      // Pawn move with file specified (for captures)
      if (remaining >= 'a' && remaining <= 'h') {
        fromFile = remaining;
      }
    }

    return {
      type: 'normal',
      pieceType,
      to,
      fromFile,
      fromRank,
      isCapture,
      promotion
    };
  }

  isValidMove(from, to, pieceType) {
    const fromFile = this.fileToIndex(from[0]);
    const fromRank = this.rankToIndex(from[1]);
    const toFile = this.fileToIndex(to[0]);
    const toRank = this.rankToIndex(to[1]);
    
    const piece = this.board[fromRank][fromFile];
    if (!piece) return false;

    // Basic piece type validation
    const whitePieces = { 'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔' };
    const blackPieces = { 'P': '♟', 'R': '♜', 'N': '♞', 'B': '♝', 'Q': '♛', 'K': '♚' };
    
    const expectedPiece = this.isWhiteToMove ? whitePieces[pieceType] : blackPieces[pieceType];
    if (piece !== expectedPiece) return false;

    // For simplicity, we'll accept the move if the piece type matches
    // A full chess engine would validate legal moves here
    return true;
  }

  findPieceForMove(pieceType, to, fromFile = null, fromRank = null) {
    const candidates = [];
    
    const whitePieces = { 'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔' };
    const blackPieces = { 'P': '♟', 'R': '♜', 'N': '♞', 'B': '♝', 'Q': '♛', 'K': '♚' };
    
    const targetPiece = this.isWhiteToMove ? whitePieces[pieceType] : blackPieces[pieceType];

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        if (this.board[rank][file] === targetPiece) {
          const square = this.indexToSquare(file, rank);
          
          // Check file constraint
          if (fromFile && square[0] !== fromFile) continue;
          // Check rank constraint
          if (fromRank && square[1] !== fromRank) continue;
          
          // Check if this piece can legally move to the destination
          if (this.isValidMove(square, to, pieceType)) {
            candidates.push(square);
          }
        }
      }
    }

    // Return the first valid candidate (in a real chess engine, we'd resolve ambiguities)
    return candidates.length > 0 ? candidates[0] : null;
  }

  makeMove(moveStr) {
    const move = this.parseMove(moveStr);
    
    if (move.type === 'castle') {
      // Handle castling
      const rank = this.isWhiteToMove ? 7 : 0;
      const kingFrom = 4;
      const kingTo = move.isKingside ? 6 : 2;
      const rookFrom = move.isKingside ? 7 : 0;
      const rookTo = move.isKingside ? 5 : 3;
      
      // Move king
      const king = this.board[rank][kingFrom];
      this.board[rank][kingFrom] = null;
      this.board[rank][kingTo] = king;
      
      // Move rook
      const rook = this.board[rank][rookFrom];
      this.board[rank][rookFrom] = null;
      this.board[rank][rookTo] = rook;
      
      this.lastMove = { from: move.from, to: move.to };
      
    } else {
      // Handle normal moves
      const from = this.findPieceForMove(move.pieceType, move.to, move.fromFile, move.fromRank);
      
      if (!from) {
        console.warn(`Could not find piece for move: ${moveStr}`);
        return;
      }

      // Get the piece and move it
      const piece = this.getPieceAt(from);
      this.setPieceAt(from, null);
      
      // Handle promotion
      if (move.promotion) {
        const whitePieces = { 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘' };
        const blackPieces = { 'Q': '♛', 'R': '♜', 'B': '♝', 'N': '♞' };
        const promotedPiece = this.isWhiteToMove ? whitePieces[move.promotion] : blackPieces[move.promotion];
        this.setPieceAt(move.to, promotedPiece);
      } else {
        this.setPieceAt(move.to, piece);
      }
      
      this.lastMove = { from, to: move.to };
    }
    
    this.isWhiteToMove = !this.isWhiteToMove;
    this.moveHistory.push(moveStr);
  }

  playMovesToPosition(moves, moveIndex) {
    this.reset();
    
    if (!moves || moveIndex < 0) {
      return; // Show starting position
    }
    
    for (let i = 0; i <= moveIndex && i < moves.length; i++) {
      this.makeMove(moves[i]);
    }
  }

  getBoardState() {
    return {
      board: this.board.map(row => [...row]),
      lastMove: this.lastMove,
      isWhiteToMove: this.isWhiteToMove
    };
  }
}

// Helper functions
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

// Chess board component with moving pieces
const ChessBoard = ({ moves, currentMoveIndex }) => {
  const [chessGame] = useState(() => new ChessGame());
  const [boardState, setBoardState] = useState(() => chessGame.getBoardState());
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

  // Update board position based on current move
  useEffect(() => {
    if (moves && moves.length > 0) {
      chessGame.playMovesToPosition(moves, currentMoveIndex);
      setBoardState(chessGame.getBoardState());
    } else {
      // Reset to starting position
      chessGame.reset();
      setBoardState(chessGame.getBoardState());
    }
  }, [moves, currentMoveIndex, chessGame]);

  // Debug info (remove in production)
  useEffect(() => {
    if (currentMoveIndex >= 0 && moves && moves[currentMoveIndex]) {
      console.log(`Move ${currentMoveIndex + 1}: ${moves[currentMoveIndex]}`, boardState.lastMove);
    }
  }, [currentMoveIndex, moves, boardState.lastMove]);

  return (
    <div className="chess-board">
      {ranks.map((rank, rankIndex) =>
        files.map((file, fileIndex) => {
          const square = `${file}${rank}`;
          const isLight = (fileIndex + rank) % 2 === 1;
          const isLastMove = boardState.lastMove && 
            (boardState.lastMove.from === square || boardState.lastMove.to === square);
          
          const piece = boardState.board[rankIndex][fileIndex];
          
          return (
            <div
              key={square}
              className={`chess-square ${isLight ? 'light' : 'dark'} ${isLastMove ? 'last-move' : ''}`}
            >
              {piece && (
                <span className="chess-piece">
                  {piece}
                </span>
              )}
              <div className="square-label">
                {square}
              </div>
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
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1); // Start at -1 to show initial position
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
          setCurrentMoveIndex(prev => Math.max(-1, prev - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentMoveIndex(prev => Math.min(game.moves.length - 1, prev + 1));
          break;
        case 'Home':
          e.preventDefault();
          setCurrentMoveIndex(-1);
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
                  setCurrentMoveIndex(-1);
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
                <ChessBoard 
                  moves={game?.moves} 
                  currentMoveIndex={currentMoveIndex}
                />
              )}
              
              {/* Move Navigation */}
              <div className="move-navigation">
                <button 
                  onClick={() => setCurrentMoveIndex(-1)}
                  disabled={loading || currentMoveIndex === -1}
                  className="nav-button"
                >
                  ⏮
                </button>
                <button 
                  onClick={() => setCurrentMoveIndex(prev => Math.max(-1, prev - 1))}
                  disabled={loading || currentMoveIndex === -1}
                  className="nav-button"
                >
                  ⏪
                </button>
                <span className="move-counter">
                  {loading ? <Skeleton className="h-4 w-12" /> : 
                    currentMoveIndex === -1 ? 'Start' : `${currentMoveIndex + 1}/${game?.moves.length || 0}`
                  }
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