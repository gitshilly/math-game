import React from 'react';

interface StreakFireProps {
  streak: number;
}

export default function StreakFire({ streak }: StreakFireProps) {
  if (streak < 2) return null;

  const fireSize = Math.min(streak, 10);
  const flames = Array.from({ length: Math.min(fireSize, 5) }, (_, i) => i);

  return (
    <div className="flex items-center gap-1">
      <div className="relative flex items-center">
        {flames.map((_, i) => (
          <span
            key={i}
            className="animate-fire"
            style={{
              fontSize: `${1.2 + i * 0.2}rem`,
              animationDelay: `${i * 0.1}s`,
              marginLeft: i > 0 ? '-4px' : '0',
            }}
          >
            🔥
          </span>
        ))}
      </div>
      <span className="text-orange-400 font-bold text-lg">
        x{streak}
      </span>
    </div>
  );
}
