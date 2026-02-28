import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playClickSound, playCorrectSound, playWrongSound } from '../../utils/sound';
import { useGame } from '../../contexts/GameContext';

interface Point {
  x: number;
  y: number;
}

interface Food {
  pos: Point;
  value: number;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 20;
const CELL_SIZE = 16;
const INITIAL_SPEED = 260;
const SPEED_INCREMENT = 3;
const MIN_SPEED = 100;

interface SnakeGameProps {
  onBack: () => void;
}

export default function SnakeGame({ onBack }: SnakeGameProps) {
  const { soundEnabled } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'over'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('snake_high_score') || '0', 10);
  });

  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const directionRef = useRef<Direction>('RIGHT');
  const nextDirectionRef = useRef<Direction>('RIGHT');
  const foodRef = useRef<Food>({ pos: { x: 15, y: 10 }, value: 1 });
  const speedRef = useRef(INITIAL_SPEED);
  const gameLoopRef = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const touchStartRef = useRef<Point | null>(null);

  const spawnFood = useCallback(() => {
    const snake = snakeRef.current;
    let pos: Point;
    do {
      pos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snake.some(s => s.x === pos.x && s.y === pos.y));

    foodRef.current = { pos, value: Math.floor(Math.random() * 9) + 1 };
  }, []);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cellW = w / GRID_SIZE;
    const cellH = h / GRID_SIZE;

    // Clear
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellW, 0);
      ctx.lineTo(i * cellW, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellH);
      ctx.lineTo(w, i * cellH);
      ctx.stroke();
    }

    // Snake
    const snake = snakeRef.current;
    snake.forEach((seg, i) => {
      const isHead = i === 0;
      const gradient = ctx.createLinearGradient(
        seg.x * cellW, seg.y * cellH,
        (seg.x + 1) * cellW, (seg.y + 1) * cellH
      );

      if (isHead) {
        gradient.addColorStop(0, '#22c55e');
        gradient.addColorStop(1, '#16a34a');
      } else {
        const alpha = 1 - (i / snake.length) * 0.5;
        gradient.addColorStop(0, `rgba(34, 197, 94, ${alpha})`);
        gradient.addColorStop(1, `rgba(22, 163, 74, ${alpha})`);
      }

      ctx.fillStyle = gradient;
      const padding = isHead ? 0.5 : 1;
      ctx.beginPath();
      ctx.roundRect(
        seg.x * cellW + padding,
        seg.y * cellH + padding,
        cellW - padding * 2,
        cellH - padding * 2,
        isHead ? 4 : 2
      );
      ctx.fill();

      // Head eyes
      if (isHead) {
        ctx.fillStyle = 'white';
        const dir = directionRef.current;
        const eyeSize = cellW * 0.15;
        const cx = seg.x * cellW + cellW / 2;
        const cy = seg.y * cellH + cellH / 2;

        let e1x = cx - cellW * 0.15, e1y = cy - cellH * 0.15;
        let e2x = cx + cellW * 0.15, e2y = cy - cellH * 0.15;

        if (dir === 'UP') { e1x = cx - cellW * 0.15; e1y = cy - cellH * 0.2; e2x = cx + cellW * 0.15; e2y = cy - cellH * 0.2; }
        if (dir === 'DOWN') { e1x = cx - cellW * 0.15; e1y = cy + cellH * 0.2; e2x = cx + cellW * 0.15; e2y = cy + cellH * 0.2; }
        if (dir === 'LEFT') { e1x = cx - cellW * 0.2; e1y = cy - cellH * 0.15; e2x = cx - cellW * 0.2; e2y = cy + cellH * 0.15; }
        if (dir === 'RIGHT') { e1x = cx + cellW * 0.2; e1y = cy - cellH * 0.15; e2x = cx + cellW * 0.2; e2y = cy + cellH * 0.15; }

        ctx.beginPath();
        ctx.arc(e1x, e1y, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(e2x, e2y, eyeSize, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Food
    const food = foodRef.current;
    // Glow
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(
      food.pos.x * cellW + cellW / 2,
      food.pos.y * cellH + cellH / 2,
      cellW * 0.4, 0, Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Food number
    ctx.fillStyle = '#0f172a';
    ctx.font = `bold ${cellW * 0.5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      food.value.toString(),
      food.pos.x * cellW + cellW / 2,
      food.pos.y * cellH + cellH / 2 + 1
    );
  }, []);

  const gameOver = useCallback(() => {
    setGameState('over');
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    if (soundEnabled) playWrongSound();

    const finalScore = scoreRef.current;
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('snake_high_score', finalScore.toString());
    }
  }, [highScore, soundEnabled]);

  const tick = useCallback(() => {
    const snake = [...snakeRef.current];
    const head = { ...snake[0] };

    // Apply next direction
    directionRef.current = nextDirectionRef.current;
    const dir = directionRef.current;

    switch (dir) {
      case 'UP': head.y--; break;
      case 'DOWN': head.y++; break;
      case 'LEFT': head.x--; break;
      case 'RIGHT': head.x++; break;
    }

    // Wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      gameOver();
      return;
    }

    // Self collision
    if (snake.some(s => s.x === head.x && s.y === head.y)) {
      gameOver();
      return;
    }

    snake.unshift(head);

    // Eat food
    const food = foodRef.current;
    if (head.x === food.pos.x && head.y === food.pos.y) {
      const points = food.value;
      scoreRef.current += points;
      setScore(scoreRef.current);
      if (soundEnabled) playCorrectSound();
      spawnFood();

      // Speed up
      speedRef.current = Math.max(MIN_SPEED, speedRef.current - SPEED_INCREMENT);
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = window.setInterval(tick, speedRef.current);
      }
    } else {
      snake.pop();
    }

    snakeRef.current = snake;
    drawGame();
  }, [drawGame, gameOver, soundEnabled, spawnFood]);

  const startGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = 'RIGHT';
    nextDirectionRef.current = 'RIGHT';
    speedRef.current = INITIAL_SPEED;
    scoreRef.current = 0;
    setScore(0);
    spawnFood();
    setGameState('playing');

    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    gameLoopRef.current = window.setInterval(tick, speedRef.current);

    drawGame();
  }, [spawnFood, tick, drawGame]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;

      const dir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (dir !== 'DOWN') nextDirectionRef.current = 'UP';
          e.preventDefault();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (dir !== 'UP') nextDirectionRef.current = 'DOWN';
          e.preventDefault();
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (dir !== 'RIGHT') nextDirectionRef.current = 'LEFT';
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (dir !== 'LEFT') nextDirectionRef.current = 'RIGHT';
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState]);

  // Touch controls
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || gameState !== 'playing') return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return; // too small

    const dir = directionRef.current;
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swipe
      if (dx > 0 && dir !== 'LEFT') nextDirectionRef.current = 'RIGHT';
      else if (dx < 0 && dir !== 'RIGHT') nextDirectionRef.current = 'LEFT';
    } else {
      // Vertical swipe
      if (dy > 0 && dir !== 'UP') nextDirectionRef.current = 'DOWN';
      else if (dy < 0 && dir !== 'DOWN') nextDirectionRef.current = 'UP';
    }

    touchStartRef.current = null;
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, []);

  // Initial draw
  useEffect(() => {
    drawGame();
  }, [drawGame]);

  const canvasSize = Math.min(GRID_SIZE * CELL_SIZE, 340);

  return (
    <div className="page-enter min-h-screen relative">
      <div className="relative z-10 max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              if (gameLoopRef.current) clearInterval(gameLoopRef.current);
              if (soundEnabled) playClickSound();
              onBack();
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← 返回
          </button>
          <h1 className="text-lg font-bold">🐍 贪吃蛇</h1>
          <div className="w-12" />
        </div>

        {/* Score */}
        <div className="flex justify-between items-center mb-4">
          <div className="glass rounded-lg px-4 py-2">
            <span className="text-xs text-gray-400">得分</span>
            <div className="text-xl font-bold text-green-400">{score}</div>
          </div>
          <div className="glass rounded-lg px-4 py-2">
            <span className="text-xs text-gray-400">最高分</span>
            <div className="text-xl font-bold text-yellow-400">{highScore}</div>
          </div>
        </div>

        {/* Game canvas */}
        <div className="flex justify-center mb-6">
          <div
            className="relative glass rounded-xl p-2"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <canvas
              ref={canvasRef}
              width={canvasSize}
              height={canvasSize}
              className="rounded-lg"
              style={{ touchAction: 'none' }}
            />

            {/* Overlay states */}
            {gameState === 'idle' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-xl">
                <div className="text-5xl mb-4">🐍</div>
                <button
                  onClick={() => {
                    if (soundEnabled) playClickSound();
                    startGame();
                  }}
                  className="px-8 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-lg btn-game"
                >
                  开始游戏
                </button>
                <p className="text-xs text-gray-400 mt-3">滑动或方向键控制</p>
              </div>
            )}

            {gameState === 'over' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-xl">
                <div className="text-4xl mb-2">💀</div>
                <h2 className="text-xl font-bold text-red-400 mb-1">游戏结束</h2>
                <p className="text-2xl font-bold text-white mb-1">{score} 分</p>
                {score >= highScore && score > 0 && (
                  <p className="text-sm text-yellow-400 mb-3 animate-pulse">🎉 新纪录!</p>
                )}
                <button
                  onClick={() => {
                    if (soundEnabled) playClickSound();
                    startGame();
                  }}
                  className="px-8 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold btn-game"
                >
                  再来一局
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile direction buttons */}
        {gameState === 'playing' && (
          <div className="flex flex-col items-center gap-2">
            <button
              onTouchStart={(e) => { e.preventDefault(); if (directionRef.current !== 'DOWN') nextDirectionRef.current = 'UP'; }}
              onClick={() => { if (directionRef.current !== 'DOWN') nextDirectionRef.current = 'UP'; }}
              className="w-14 h-14 glass rounded-xl flex items-center justify-center text-2xl active:bg-white/20"
            >
              ⬆️
            </button>
            <div className="flex gap-2">
              <button
                onTouchStart={(e) => { e.preventDefault(); if (directionRef.current !== 'RIGHT') nextDirectionRef.current = 'LEFT'; }}
                onClick={() => { if (directionRef.current !== 'RIGHT') nextDirectionRef.current = 'LEFT'; }}
                className="w-14 h-14 glass rounded-xl flex items-center justify-center text-2xl active:bg-white/20"
              >
                ⬅️
              </button>
              <button
                onTouchStart={(e) => { e.preventDefault(); if (directionRef.current !== 'UP') nextDirectionRef.current = 'DOWN'; }}
                onClick={() => { if (directionRef.current !== 'UP') nextDirectionRef.current = 'DOWN'; }}
                className="w-14 h-14 glass rounded-xl flex items-center justify-center text-2xl active:bg-white/20"
              >
                ⬇️
              </button>
              <button
                onTouchStart={(e) => { e.preventDefault(); if (directionRef.current !== 'LEFT') nextDirectionRef.current = 'RIGHT'; }}
                onClick={() => { if (directionRef.current !== 'LEFT') nextDirectionRef.current = 'RIGHT'; }}
                className="w-14 h-14 glass rounded-xl flex items-center justify-center text-2xl active:bg-white/20"
              >
                ➡️
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
