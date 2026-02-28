import React, { useEffect } from 'react';
import { Achievement } from '../utils/rewards';
import confetti from 'canvas-confetti';

interface RewardPopupProps {
  show: boolean;
  coins: number;
  xp: number;
  bonusMessage: string;
  newLevel: boolean;
  newLevel_number?: number;
  newAchievements: Achievement[];
  onClose: () => void;
}

export default function RewardPopup({
  show,
  coins,
  xp,
  bonusMessage,
  newLevel,
  newLevel_number,
  newAchievements,
  onClose,
}: RewardPopupProps) {
  useEffect(() => {
    if (show && newLevel) {
      // Big confetti for level up
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#6366f1', '#a855f7', '#fbbf24', '#22c55e'],
      });
    } else if (show && coins > 0) {
      // Small confetti for rewards
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#fbbf24', '#f59e0b'],
      });
    }
  }, [show, newLevel, coins]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass rounded-2xl p-8 max-w-sm w-full mx-4 text-center animate-bounce-in"
        onClick={e => e.stopPropagation()}
      >
        {newLevel && (
          <div className="mb-4 animate-level-up">
            <div className="text-6xl mb-2">🎉</div>
            <h2 className="text-2xl font-bold text-yellow-400">升级啦!</h2>
            <p className="text-3xl font-bold text-white mt-1">Lv.{newLevel_number}</p>
          </div>
        )}

        <div className="space-y-4">
          {coins > 0 && (
            <div className="flex items-center justify-center gap-2 text-xl animate-slide-up">
              <span className="text-2xl animate-coin-flip">🪙</span>
              <span className="text-yellow-400 font-bold">+{coins}</span>
            </div>
          )}

          {xp > 0 && (
            <div className="flex items-center justify-center gap-2 text-xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <span className="text-2xl">⭐</span>
              <span className="text-purple-400 font-bold">+{xp} XP</span>
            </div>
          )}

          {bonusMessage && (
            <p className="text-sm text-green-400 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {bonusMessage}
            </p>
          )}

          {newAchievements.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm text-gray-300 font-bold">新成就解锁!</h3>
              {newAchievements.map(a => (
                <div key={a.id} className="flex items-center gap-2 bg-yellow-500/10 rounded-lg p-2 animate-slide-up">
                  <span className="text-2xl">{a.icon}</span>
                  <div className="text-left">
                    <div className="text-sm font-bold text-yellow-300">{a.name}</div>
                    <div className="text-xs text-gray-400">{a.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-6 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-white transition-all transform hover:scale-105 active:scale-95"
        >
          太棒了!
        </button>
      </div>
    </div>
  );
}
