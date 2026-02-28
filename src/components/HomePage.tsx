import React, { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { getGradeConfig } from '../utils/gradeConfig';
import { calculateXpForLevel, getTitleForLevel } from '../utils/rewards';
import ProgressBar from './ProgressBar';
import CoinDisplay from './CoinDisplay';
import StreakFire from './StreakFire';
import GradeSelector from './GradeSelector';
import { playClickSound } from '../utils/sound';

interface HomePageProps {
  onStartQuiz: () => void;
  onOpenShop: () => void;
}

export default function HomePage({ onStartQuiz, onOpenShop }: HomePageProps) {
  const { stats, grade, currentTitle, soundEnabled, equippedFrame } = useGame();
  const [showGradeSelector, setShowGradeSelector] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; size: number; delay: number; duration: number }[]>([]);
  const gradeConfig = getGradeConfig(grade);

  // Generate background particles
  useEffect(() => {
    const p = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 10,
      duration: Math.random() * 15 + 10,
    }));
    setParticles(p);
  }, []);

  const xpNeeded = calculateXpForLevel(stats.level);
  const defaultTitle = getTitleForLevel(stats.level);

  // Daily login streak bonus display
  const today = new Date().toISOString().split('T')[0];
  const isLoginToday = stats.lastPlayDate === today;

  return (
    <div className="page-enter min-h-screen relative">
      {/* Background particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="particle rounded-full bg-indigo-400/20"
          style={{
            left: `${p.x}%`,
            bottom: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <CoinDisplay amount={stats.totalCoins} />
          <div className="flex items-center gap-3">
            {stats.consecutiveDays > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <span>📅</span>
                <span className="text-orange-400 font-bold">{stats.consecutiveDays}天</span>
              </div>
            )}
            <button
              onClick={() => {
                if (soundEnabled) playClickSound();
                onOpenShop();
              }}
              className="glass rounded-lg px-3 py-1.5 text-sm hover:bg-white/10 transition-all"
            >
              🛒 商店
            </button>
          </div>
        </div>

        {/* Avatar & Level */}
        <div className="text-center mb-8">
          <div className={`
            inline-block relative mb-4
            ${equippedFrame ? 'p-1 rounded-full' : ''}
            ${equippedFrame === 'frame_fire' ? 'ring-4 ring-orange-500/50 animate-pulse-glow' : ''}
            ${equippedFrame === 'frame_star' ? 'ring-4 ring-yellow-400/50' : ''}
            ${equippedFrame === 'frame_rainbow' ? 'ring-4 ring-purple-500/50' : ''}
            ${equippedFrame === 'frame_crown' ? 'ring-4 ring-yellow-600/50' : ''}
          `}>
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl animate-float glow-indigo">
              {gradeConfig.icon}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="bg-indigo-600/30 text-indigo-300 px-3 py-0.5 rounded-full text-sm font-bold">
              Lv.{stats.level}
            </span>
            {stats.currentStreak >= 2 && <StreakFire streak={stats.currentStreak} />}
          </div>

          <h1 className="text-xl font-bold text-white mb-1">{currentTitle || defaultTitle}</h1>

          {/* XP bar */}
          <div className="max-w-xs mx-auto mt-3">
            <ProgressBar
              current={stats.xp}
              max={xpNeeded}
              color="bg-purple-500"
              label="经验值"
            />
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="glass rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.totalCorrect}</div>
            <div className="text-xs text-gray-400 mt-1">答对总数</div>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.perfectRounds}</div>
            <div className="text-xs text-gray-400 mt-1">满分次数</div>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-orange-400">{stats.bestStreak}</div>
            <div className="text-xs text-gray-400 mt-1">最佳连胜</div>
          </div>
        </div>

        {/* Grade selector */}
        <button
          onClick={() => {
            if (soundEnabled) playClickSound();
            setShowGradeSelector(true);
          }}
          className="w-full glass rounded-xl p-4 mb-4 flex items-center justify-between hover:bg-white/10 transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{gradeConfig.icon}</span>
            <div className="text-left">
              <div className="font-bold">{gradeConfig.label}</div>
              <div className="text-xs text-gray-400">{gradeConfig.description}</div>
            </div>
          </div>
          <span className="text-gray-400">切换 →</span>
        </button>

        {/* Daily login reminder */}
        {!isLoginToday && (
          <div className="glass rounded-xl p-3 mb-4 text-center bg-yellow-500/10 border-yellow-500/20">
            <span className="text-sm text-yellow-400">
              🎁 今日首次练习有额外奖励!
            </span>
          </div>
        )}

        {/* Start button */}
        <button
          onClick={() => {
            if (soundEnabled) playClickSound();
            onStartQuiz();
          }}
          className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-2xl font-bold text-xl text-white btn-game glow-indigo flex items-center justify-center gap-3"
        >
          <span className="text-2xl">🚀</span>
          开始练习
        </button>

        {/* Quick stats */}
        <div className="mt-6 text-center text-xs text-gray-500">
          累计做了 {stats.totalQuestions} 道题 · 正确率{' '}
          {stats.totalQuestions > 0
            ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
            : 0}
          %
        </div>
      </div>

      {/* Grade selector modal */}
      {showGradeSelector && (
        <GradeSelector onClose={() => setShowGradeSelector(false)} />
      )}
    </div>
  );
}
