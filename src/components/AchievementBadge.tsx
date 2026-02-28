import React from 'react';
import { Achievement } from '../utils/rewards';

interface AchievementBadgeProps {
  achievement: Achievement;
  isNew?: boolean;
}

export default function AchievementBadge({ achievement, isNew = false }: AchievementBadgeProps) {
  return (
    <div
      className={`
        relative p-3 rounded-xl transition-all duration-300
        ${achievement.unlocked
          ? 'glass glow-yellow cursor-pointer hover:scale-105'
          : 'bg-gray-800/40 opacity-50'
        }
        ${isNew ? 'animate-bounce-in' : ''}
      `}
    >
      {isNew && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
          新!
        </div>
      )}
      <div className="text-center">
        <div className={`text-3xl mb-1 ${achievement.unlocked ? '' : 'grayscale'}`}>
          {achievement.unlocked ? achievement.icon : '🔒'}
        </div>
        <div className={`text-xs font-bold ${achievement.unlocked ? 'text-yellow-300' : 'text-gray-500'}`}>
          {achievement.name}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          {achievement.description}
        </div>
      </div>
    </div>
  );
}
