import React from 'react';
import { GRADE_CONFIGS } from '../utils/gradeConfig';
import { useGame } from '../contexts/GameContext';
import { playClickSound } from '../utils/sound';

interface GradeSelectorProps {
  onClose: () => void;
}

export default function GradeSelector({ onClose }: GradeSelectorProps) {
  const { grade, setGrade, soundEnabled } = useGame();

  const handleSelect = (g: number) => {
    if (soundEnabled) playClickSound();
    setGrade(g);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass rounded-2xl p-6 max-w-md w-full mx-4 animate-bounce-in" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-center mb-4">选择年级</h2>
        <p className="text-sm text-gray-400 text-center mb-6">基于沪教版数学课程</p>

        <div className="grid grid-cols-2 gap-3">
          {GRADE_CONFIGS.map(config => (
            <button
              key={config.grade}
              onClick={() => handleSelect(config.grade)}
              className={`
                p-4 rounded-xl transition-all duration-200 text-left
                ${grade === config.grade
                  ? 'bg-indigo-600 glow-indigo scale-105'
                  : 'glass hover:bg-white/10 hover:scale-102'
                }
              `}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{config.icon}</span>
                <span className="font-bold">{config.label}</span>
              </div>
              <p className="text-xs text-gray-300 mt-1">{config.description}</p>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 text-gray-400 hover:text-white transition-colors"
        >
          关闭
        </button>
      </div>
    </div>
  );
}
