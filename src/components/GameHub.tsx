import React from 'react';
import { playClickSound } from '../utils/sound';
import { useGame } from '../contexts/GameContext';

export type MiniGame = 'snake' | 'game24' | 'puzzle' | 'tictactoe';

interface GameInfo {
  id: MiniGame;
  name: string;
  icon: string;
  description: string;
  color: string;
  glowClass: string;
}

const GAMES: GameInfo[] = [
  {
    id: 'snake',
    name: '贪吃蛇',
    icon: '🐍',
    description: '控制蛇吃食物，越吃越长！',
    color: 'from-green-600 to-emerald-700',
    glowClass: 'glow-green',
  },
  {
    id: 'game24',
    name: '24点',
    icon: '🃏',
    description: '用4个数字凑出24，考验你的计算力！',
    color: 'from-yellow-600 to-orange-700',
    glowClass: 'glow-yellow',
  },
  {
    id: 'puzzle',
    name: '数字华容道',
    icon: '🧩',
    description: '滑动数字方块，排列成正确顺序！',
    color: 'from-blue-600 to-cyan-700',
    glowClass: 'glow-indigo',
  },
  {
    id: 'tictactoe',
    name: '井字棋',
    icon: '⭕',
    description: '挑战AI，三子连线获胜！',
    color: 'from-purple-600 to-pink-700',
    glowClass: 'glow-red',
  },
];

interface GameHubProps {
  onSelectGame: (game: MiniGame) => void;
  onBack: () => void;
}

export default function GameHub({ onSelectGame, onBack }: GameHubProps) {
  const { soundEnabled } = useGame();

  return (
    <div className="page-enter min-h-screen relative">
      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => {
              if (soundEnabled) playClickSound();
              onBack();
            }}
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
          >
            ← 返回
          </button>
          <h1 className="text-xl font-bold">🎮 游戏乐园</h1>
          <div className="w-16" />
        </div>

        {/* Banner */}
        <div className="glass rounded-2xl p-6 mb-8 text-center bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
          <div className="text-4xl mb-2 animate-float">🎮</div>
          <h2 className="text-lg font-bold mb-1">欢迎来到游戏乐园!</h2>
          <p className="text-sm text-gray-400">休息一下，玩个小游戏吧</p>
        </div>

        {/* Game cards */}
        <div className="grid grid-cols-2 gap-4">
          {GAMES.map((game, index) => (
            <button
              key={game.id}
              onClick={() => {
                if (soundEnabled) playClickSound();
                onSelectGame(game.id);
              }}
              className={`
                glass rounded-2xl p-5 text-center transition-all duration-300
                hover:scale-105 active:scale-95 animate-slide-up
                hover:${game.glowClass}
              `}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`
                w-16 h-16 mx-auto rounded-xl bg-gradient-to-br ${game.color}
                flex items-center justify-center text-3xl mb-3
                shadow-lg
              `}>
                {game.icon}
              </div>
              <h3 className="font-bold text-sm mb-1">{game.name}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{game.description}</p>
            </button>
          ))}
        </div>

        {/* Tip */}
        <p className="mt-8 text-center text-xs text-gray-500">
          更多游戏即将上线，敬请期待!
        </p>
      </div>
    </div>
  );
}
