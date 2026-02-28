import React from 'react';

interface ProgressBarProps {
  current: number;
  max: number;
  color?: string;
  label?: string;
  showText?: boolean;
  height?: string;
}

export default function ProgressBar({
  current,
  max,
  color = 'bg-indigo-500',
  label,
  showText = true,
  height = 'h-4',
}: ProgressBarProps) {
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-300">{label}</span>
          {showText && (
            <span className="text-xs text-gray-400">
              {current}/{max}
            </span>
          )}
        </div>
      )}
      <div className={`w-full ${height} bg-gray-700/50 rounded-full overflow-hidden`}>
        <div
          className={`${height} ${color} rounded-full transition-all duration-500 ease-out relative`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 progress-shimmer" />
        </div>
      </div>
    </div>
  );
}
