import React from 'react';

interface CoinDisplayProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export default function CoinDisplay({ amount, size = 'md', animate = false }: CoinDisplayProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const iconSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-1 ${sizeClasses[size]} font-bold`}>
      <span className={`${iconSizes[size]} ${animate ? 'animate-coin-flip' : ''}`}>
        🪙
      </span>
      <span className="text-yellow-400">{amount.toLocaleString()}</span>
    </div>
  );
}
