import React, { useState, useEffect, useCallback } from 'react';
import { playClickSound, playCorrectSound, playPerfectSound } from '../../utils/sound';
import { useGame } from '../../contexts/GameContext';
import confetti from 'canvas-confetti';

interface NumberPuzzleProps {
  onBack: () => void;
}

type GridSize = 3 | 4;

function createSolvedBoard(size: GridSize): number[] {
  const board: number[] = [];
  for (let i = 1; i < size * size; i++) {
    board.push(i);
  }
  board.push(0); // 0 represents the empty space
  return board;
}

function isSolvable(board: number[], size: GridSize): boolean {
  let inversions = 0;
  const flat = board.filter(n => n !== 0);
  for (let i = 0; i < flat.length; i++) {
    for (let j = i + 1; j < flat.length; j++) {
      if (flat[i] > flat[j]) inversions++;
    }
  }

  if (size % 2 === 1) {
    // Odd grid: solvable if inversions is even
    return inversions % 2 === 0;
  } else {
    // Even grid: solvable based on empty row from bottom + inversions
    const emptyRow = Math.floor(board.indexOf(0) / size);
    const emptyRowFromBottom = size - emptyRow;
    return (emptyRowFromBottom % 2 === 0) === (inversions % 2 === 1);
  }
}

function shuffleBoard(size: GridSize): number[] {
  let board: number[];
  do {
    board = createSolvedBoard(size);
    // Fisher-Yates shuffle
    for (let i = board.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [board[i], board[j]] = [board[j], board[i]];
    }
  } while (!isSolvable(board, size) || isSolved(board, size));

  return board;
}

function isSolved(board: number[], size: GridSize): boolean {
  for (let i = 0; i < size * size - 1; i++) {
    if (board[i] !== i + 1) return false;
  }
  return board[size * size - 1] === 0;
}

function getMovableIndices(board: number[], size: GridSize): number[] {
  const emptyIndex = board.indexOf(0);
  const row = Math.floor(emptyIndex / size);
  const col = emptyIndex % size;
  const movable: number[] = [];

  if (row > 0) movable.push(emptyIndex - size); // above
  if (row < size - 1) movable.push(emptyIndex + size); // below
  if (col > 0) movable.push(emptyIndex - 1); // left
  if (col < size - 1) movable.push(emptyIndex + 1); // right

  return movable;
}

export default function NumberPuzzle({ onBack }: NumberPuzzleProps) {
  const { soundEnabled } = useGame();
  const [gridSize, setGridSize] = useState<GridSize>(3);
  const [board, setBoard] = useState<number[]>(() => shuffleBoard(3));
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [solved, setSolved] = useState(false);
  const [bestRecord, setBestRecord] = useState<Record<GridSize, { moves: number; time: number }>>(() => {
    try {
      const data = localStorage.getItem('puzzle_records');
      return data ? JSON.parse(data) : { 3: { moves: 0, time: 0 }, 4: { moves: 0, time: 0 } };
    } catch { return { 3: { moves: 0, time: 0 }, 4: { moves: 0, time: 0 } }; }
  });

  // Timer
  useEffect(() => {
    if (!startTime || solved) return;
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, solved]);

  const handleTileClick = useCallback((index: number) => {
    if (solved) return;

    const movable = getMovableIndices(board, gridSize);
    if (!movable.includes(index)) return;

    if (soundEnabled) playClickSound();

    // Start timer on first move
    if (!startTime) setStartTime(Date.now());

    const newBoard = [...board];
    const emptyIndex = newBoard.indexOf(0);
    [newBoard[index], newBoard[emptyIndex]] = [newBoard[emptyIndex], newBoard[index]];

    setBoard(newBoard);
    setMoves(m => m + 1);

    // Check solved
    if (isSolved(newBoard, gridSize)) {
      setSolved(true);
      if (soundEnabled) playPerfectSound();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });

      // Save record
      const finalMoves = moves + 1;
      const finalTime = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
      const current = bestRecord[gridSize];
      if (!current.moves || finalMoves < current.moves) {
        const newRecords = { ...bestRecord, [gridSize]: { moves: finalMoves, time: finalTime } };
        setBestRecord(newRecords);
        localStorage.setItem('puzzle_records', JSON.stringify(newRecords));
      }
    }
  }, [board, gridSize, solved, startTime, moves, bestRecord, soundEnabled]);

  const handleNewGame = useCallback((size?: GridSize) => {
    const s = size || gridSize;
    if (size) setGridSize(size);
    setBoard(shuffleBoard(s));
    setMoves(0);
    setStartTime(null);
    setElapsed(0);
    setSolved(false);
    if (soundEnabled) playClickSound();
  }, [gridSize, soundEnabled]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const movable = getMovableIndices(board, gridSize);
  const tileSize = gridSize === 3 ? 'w-24 h-24 text-2xl' : 'w-[4.5rem] h-[4.5rem] text-xl';

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
          <h1 className="text-lg font-bold">🧩 数字华容道</h1>
          <div className="w-12" />
        </div>

        {/* Grid size selector */}
        <div className="flex justify-center gap-3 mb-4">
          <button
            onClick={() => handleNewGame(3)}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              gridSize === 3 ? 'bg-indigo-600' : 'glass hover:bg-white/10'
            }`}
          >
            3 × 3
          </button>
          <button
            onClick={() => handleNewGame(4)}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              gridSize === 4 ? 'bg-indigo-600' : 'glass hover:bg-white/10'
            }`}
          >
            4 × 4
          </button>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6 mb-6">
          <div className="text-center">
            <div className="text-xs text-gray-400">步数</div>
            <div className="text-xl font-bold text-indigo-400">{moves}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">用时</div>
            <div className="text-xl font-bold text-green-400">{formatTime(elapsed)}</div>
          </div>
          {bestRecord[gridSize].moves > 0 && (
            <div className="text-center">
              <div className="text-xs text-gray-400">最佳</div>
              <div className="text-xl font-bold text-yellow-400">{bestRecord[gridSize].moves}步</div>
            </div>
          )}
        </div>

        {/* Puzzle board */}
        <div className="flex justify-center mb-6">
          <div
            className="glass rounded-xl p-3 inline-grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            }}
          >
            {board.map((num, index) => (
              <button
                key={index}
                onClick={() => handleTileClick(index)}
                disabled={num === 0 || !movable.includes(index)}
                className={`
                  ${tileSize} rounded-xl font-bold transition-all duration-200
                  ${num === 0
                    ? 'bg-transparent'
                    : movable.includes(index)
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:scale-105 active:scale-95 cursor-pointer shadow-lg'
                      : 'bg-gradient-to-br from-indigo-500/60 to-purple-600/60'
                  }
                  ${solved && num !== 0 ? 'from-green-500 to-emerald-600' : ''}
                `}
              >
                {num !== 0 ? num : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Solved message */}
        {solved && (
          <div className="text-center mb-6 animate-bounce-in">
            <div className="text-4xl mb-2">🎉</div>
            <h2 className="text-xl font-bold text-green-400 mb-1">恭喜通关!</h2>
            <p className="text-sm text-gray-400">
              用了 {moves} 步，耗时 {formatTime(elapsed)}
            </p>
          </div>
        )}

        {/* New game button */}
        <div className="flex justify-center">
          <button
            onClick={() => handleNewGame()}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all btn-game"
          >
            {solved ? '🎲 再来一局' : '🔄 重新开始'}
          </button>
        </div>
      </div>
    </div>
  );
}
