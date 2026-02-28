import React, { useState, useCallback, useEffect } from 'react';
import { playClickSound, playCorrectSound, playWrongSound, playPerfectSound } from '../../utils/sound';
import { useGame } from '../../contexts/GameContext';
import confetti from 'canvas-confetti';

type CellValue = 'X' | 'O' | null;
type Difficulty = 'easy' | 'medium' | 'hard';

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],             // diags
];

function checkWinner(board: CellValue[]): { winner: CellValue; line: number[] | null } {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  return { winner: null, line: null };
}

function isDraw(board: CellValue[]): boolean {
  return board.every(cell => cell !== null) && !checkWinner(board).winner;
}

function getEmptyCells(board: CellValue[]): number[] {
  return board.map((cell, i) => cell === null ? i : -1).filter(i => i !== -1);
}

// Minimax AI
function minimax(board: CellValue[], isMaximizing: boolean, depth: number): number {
  const { winner } = checkWinner(board);
  if (winner === 'O') return 10 - depth;
  if (winner === 'X') return depth - 10;
  if (isDraw(board)) return 0;

  const empty = getEmptyCells(board);

  if (isMaximizing) {
    let best = -Infinity;
    for (const i of empty) {
      board[i] = 'O';
      best = Math.max(best, minimax(board, false, depth + 1));
      board[i] = null;
    }
    return best;
  } else {
    let best = Infinity;
    for (const i of empty) {
      board[i] = 'X';
      best = Math.min(best, minimax(board, true, depth + 1));
      board[i] = null;
    }
    return best;
  }
}

function getAIMove(board: CellValue[], difficulty: Difficulty): number {
  const empty = getEmptyCells(board);
  if (empty.length === 0) return -1;

  // Easy: random
  if (difficulty === 'easy') {
    return empty[Math.floor(Math.random() * empty.length)];
  }

  // Medium: 50% optimal, 50% random
  if (difficulty === 'medium' && Math.random() < 0.4) {
    return empty[Math.floor(Math.random() * empty.length)];
  }

  // Hard: minimax
  let bestScore = -Infinity;
  let bestMove = empty[0];

  for (const i of empty) {
    board[i] = 'O';
    const score = minimax(board, false, 0);
    board[i] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMove = i;
    }
  }

  return bestMove;
}

interface TicTacToeProps {
  onBack: () => void;
}

export default function TicTacToe({ onBack }: TicTacToeProps) {
  const { soundEnabled } = useGame();
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winLine, setWinLine] = useState<number[] | null>(null);
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [stats, setStats] = useState(() => {
    try {
      const data = localStorage.getItem('ttt_stats');
      return data ? JSON.parse(data) : { wins: 0, losses: 0, draws: 0 };
    } catch { return { wins: 0, losses: 0, draws: 0 }; }
  });

  // AI move
  useEffect(() => {
    if (isPlayerTurn || gameOver) return;

    const timer = setTimeout(() => {
      const boardCopy = [...board];
      const move = getAIMove(boardCopy, difficulty);
      if (move === -1) return;

      const newBoard = [...board];
      newBoard[move] = 'O';
      setBoard(newBoard);

      const { winner, line } = checkWinner(newBoard);
      if (winner) {
        setWinLine(line);
        setGameOver(true);
        setResult('lose');
        if (soundEnabled) playWrongSound();
        const newStats = { ...stats, losses: stats.losses + 1 };
        setStats(newStats);
        localStorage.setItem('ttt_stats', JSON.stringify(newStats));
      } else if (isDraw(newBoard)) {
        setGameOver(true);
        setResult('draw');
        const newStats = { ...stats, draws: stats.draws + 1 };
        setStats(newStats);
        localStorage.setItem('ttt_stats', JSON.stringify(newStats));
      } else {
        setIsPlayerTurn(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isPlayerTurn, gameOver, board, difficulty, stats, soundEnabled]);

  const handleCellClick = useCallback((index: number) => {
    if (!isPlayerTurn || gameOver || board[index]) return;
    if (soundEnabled) playClickSound();

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const { winner, line } = checkWinner(newBoard);
    if (winner) {
      setWinLine(line);
      setGameOver(true);
      setResult('win');
      if (soundEnabled) playPerfectSound();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      const newStats = { ...stats, wins: stats.wins + 1 };
      setStats(newStats);
      localStorage.setItem('ttt_stats', JSON.stringify(newStats));
    } else if (isDraw(newBoard)) {
      setGameOver(true);
      setResult('draw');
      const newStats = { ...stats, draws: stats.draws + 1 };
      setStats(newStats);
      localStorage.setItem('ttt_stats', JSON.stringify(newStats));
    } else {
      setIsPlayerTurn(false);
    }
  }, [isPlayerTurn, gameOver, board, stats, soundEnabled]);

  const handleNewGame = useCallback(() => {
    if (soundEnabled) playClickSound();
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setGameOver(false);
    setWinLine(null);
    setResult(null);
  }, [soundEnabled]);

  const handleChangeDifficulty = (d: Difficulty) => {
    if (soundEnabled) playClickSound();
    setDifficulty(d);
    handleNewGame();
  };

  return (
    <div className="page-enter min-h-screen relative">
      <div className="relative z-10 max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => { if (soundEnabled) playClickSound(); onBack(); }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← 返回
          </button>
          <h1 className="text-lg font-bold">⭕ 井字棋</h1>
          <div className="w-12" />
        </div>

        {/* Difficulty */}
        <div className="flex justify-center gap-2 mb-4">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
            <button
              key={d}
              onClick={() => handleChangeDifficulty(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                difficulty === d ? 'bg-indigo-600' : 'glass hover:bg-white/10'
              }`}
            >
              {d === 'easy' ? '简单' : d === 'medium' ? '中等' : '困难'}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6 mb-6">
          <div className="text-center">
            <div className="text-xs text-gray-400">胜</div>
            <div className="text-lg font-bold text-green-400">{stats.wins}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">负</div>
            <div className="text-lg font-bold text-red-400">{stats.losses}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">平</div>
            <div className="text-lg font-bold text-yellow-400">{stats.draws}</div>
          </div>
        </div>

        {/* Turn indicator */}
        {!gameOver && (
          <div className="text-center mb-4">
            <span className={`text-sm font-bold ${isPlayerTurn ? 'text-blue-400' : 'text-red-400'}`}>
              {isPlayerTurn ? '你的回合 (X)' : 'AI 思考中...'}
            </span>
          </div>
        )}

        {/* Board */}
        <div className="flex justify-center mb-6">
          <div className="glass rounded-xl p-4 inline-grid grid-cols-3 gap-2">
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={!!cell || gameOver || !isPlayerTurn}
                className={`
                  w-24 h-24 rounded-xl text-4xl font-bold
                  transition-all duration-200 flex items-center justify-center
                  ${!cell && !gameOver && isPlayerTurn
                    ? 'glass hover:bg-white/10 hover:scale-105 active:scale-95 cursor-pointer'
                    : 'glass'
                  }
                  ${winLine?.includes(index)
                    ? 'bg-green-600/30 glow-green scale-105'
                    : ''
                  }
                  ${cell === 'X' ? 'text-blue-400' : cell === 'O' ? 'text-red-400' : ''}
                `}
              >
                {cell && (
                  <span className="animate-bounce-in">
                    {cell}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        {gameOver && (
          <div className="text-center mb-6 animate-bounce-in">
            <div className="text-4xl mb-2">
              {result === 'win' ? '🎉' : result === 'lose' ? '😢' : '🤝'}
            </div>
            <h2 className={`text-xl font-bold mb-1 ${
              result === 'win' ? 'text-green-400' : result === 'lose' ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {result === 'win' ? '你赢了!' : result === 'lose' ? 'AI 赢了' : '平局!'}
            </h2>
          </div>
        )}

        {/* New game */}
        <div className="flex justify-center">
          <button
            onClick={handleNewGame}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all btn-game"
          >
            {gameOver ? '🎲 再来一局' : '🔄 重新开始'}
          </button>
        </div>
      </div>
    </div>
  );
}
