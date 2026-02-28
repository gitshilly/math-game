import React, { useState, useCallback, useEffect } from 'react';
import { playClickSound, playCorrectSound, playWrongSound, playPerfectSound } from '../../utils/sound';
import { useGame } from '../../contexts/GameContext';
import confetti from 'canvas-confetti';

interface Card {
  id: number;
  value: number;
  display: string;
}

const OPERATORS = ['+', '-', '×', '÷'] as const;
type Operator = typeof OPERATORS[number];

function canMake24(numbers: number[]): boolean {
  if (numbers.length === 1) {
    return Math.abs(numbers[0] - 24) < 0.001;
  }

  for (let i = 0; i < numbers.length; i++) {
    for (let j = 0; j < numbers.length; j++) {
      if (i === j) continue;
      const remaining = numbers.filter((_, k) => k !== i && k !== j);
      const a = numbers[i];
      const b = numbers[j];

      const results = [a + b, a - b, a * b];
      if (b !== 0) results.push(a / b);

      for (const result of results) {
        if (canMake24([...remaining, result])) return true;
      }
    }
  }
  return false;
}

function generateCards(): Card[] {
  let cards: Card[];
  let attempts = 0;

  do {
    cards = Array.from({ length: 4 }, (_, i) => {
      const value = Math.floor(Math.random() * 13) + 1;
      const displayMap: Record<number, string> = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
      return {
        id: i,
        value,
        display: displayMap[value] || value.toString(),
      };
    });
    attempts++;
  } while (!canMake24(cards.map(c => c.value)) && attempts < 100);

  return cards;
}

function evaluate(a: number, op: Operator, b: number): number | null {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '×': return a * b;
    case '÷': return b !== 0 ? a / b : null;
  }
}

interface Game24Props {
  onBack: () => void;
}

export default function Game24({ onBack }: Game24Props) {
  const { soundEnabled } = useGame();
  const [cards, setCards] = useState<Card[]>(() => generateCards());
  const [numbers, setNumbers] = useState<{ id: number; value: number; display: string }[]>([]);
  const [selectedFirst, setSelectedFirst] = useState<number | null>(null);
  const [selectedOp, setSelectedOp] = useState<Operator | null>(null);
  const [message, setMessage] = useState('');
  const [wins, setWins] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [history, setHistory] = useState<string[]>([]);

  // Initialize numbers from cards
  useEffect(() => {
    setNumbers(cards.map(c => ({ id: c.id, value: c.value, display: c.display })));
    setSelectedFirst(null);
    setSelectedOp(null);
    setHistory([]);
    setMessage('');
  }, [cards]);

  const handleNumberClick = (index: number) => {
    if (soundEnabled) playClickSound();

    if (selectedFirst === null) {
      // Select first number
      setSelectedFirst(index);
    } else if (selectedOp === null) {
      // Clicked another number without selecting an operator - change selection
      if (index === selectedFirst) {
        setSelectedFirst(null);
      } else {
        setSelectedFirst(index);
      }
    } else {
      // Have first number and operator, now compute
      if (index === selectedFirst) return;

      const a = numbers[selectedFirst];
      const b = numbers[index];
      const result = evaluate(a.value, selectedOp, b.value);

      if (result === null) {
        setMessage('不能除以零!');
        if (soundEnabled) playWrongSound();
        setSelectedFirst(null);
        setSelectedOp(null);
        setTimeout(() => setMessage(''), 1500);
        return;
      }

      // Record the step
      const step = `${a.display} ${selectedOp} ${b.display} = ${Number.isInteger(result) ? result : result.toFixed(2)}`;
      setHistory([...history, step]);

      // Replace the two numbers with the result
      const newNumbers = numbers.filter((_, i) => i !== selectedFirst && i !== index);
      const resultDisplay = Number.isInteger(result) ? result.toString() : result.toFixed(2);
      newNumbers.push({ id: Date.now(), value: result, display: resultDisplay });

      setNumbers(newNumbers);
      setSelectedFirst(null);
      setSelectedOp(null);

      // Check if done
      if (newNumbers.length === 1) {
        if (Math.abs(newNumbers[0].value - 24) < 0.001) {
          // Win!
          setMessage('太棒了! 凑出24了!');
          setWins(w => w + 1);
          setRounds(r => r + 1);
          if (soundEnabled) playPerfectSound();
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } else {
          setMessage(`结果是 ${resultDisplay}，不是24，再试试!`);
          setRounds(r => r + 1);
          if (soundEnabled) playWrongSound();
        }
      }
    }
  };

  const handleOpClick = (op: Operator) => {
    if (selectedFirst === null) {
      setMessage('请先选择一个数字');
      setTimeout(() => setMessage(''), 1500);
      return;
    }
    if (soundEnabled) playClickSound();
    setSelectedOp(op);
  };

  const handleNewRound = useCallback(() => {
    if (soundEnabled) playClickSound();
    setCards(generateCards());
  }, [soundEnabled]);

  const handleUndo = () => {
    if (soundEnabled) playClickSound();
    // Reset to original cards
    setNumbers(cards.map(c => ({ id: c.id, value: c.value, display: c.display })));
    setSelectedFirst(null);
    setSelectedOp(null);
    setHistory([]);
    setMessage('');
  };

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
          <h1 className="text-lg font-bold">🃏 24点</h1>
          <div className="text-sm text-gray-400">
            {wins}/{rounds} 胜
          </div>
        </div>

        {/* Instructions */}
        <div className="glass rounded-xl p-3 mb-6 text-center text-sm text-gray-400">
          选择两个数字和一个运算符，凑出 <span className="text-yellow-400 font-bold">24</span>
        </div>

        {/* Message */}
        {message && (
          <div className={`text-center mb-4 font-bold animate-bounce-in ${
            message.includes('太棒了') ? 'text-green-400' : message.includes('不是') ? 'text-red-400' : 'text-yellow-400'
          }`}>
            {message}
          </div>
        )}

        {/* Number cards */}
        <div className="flex justify-center gap-3 mb-8">
          {numbers.map((num, i) => (
            <button
              key={num.id}
              onClick={() => handleNumberClick(i)}
              className={`
                w-20 h-28 rounded-xl text-2xl font-bold transition-all duration-200
                flex items-center justify-center
                ${selectedFirst === i
                  ? 'bg-indigo-600 scale-110 glow-indigo'
                  : 'glass hover:bg-white/10 hover:scale-105'
                }
                ${numbers.length === 1 && Math.abs(num.value - 24) < 0.001
                  ? 'bg-green-600 glow-green'
                  : ''
                }
              `}
            >
              {num.display}
            </button>
          ))}
        </div>

        {/* Operator buttons */}
        <div className="flex justify-center gap-4 mb-8">
          {OPERATORS.map(op => (
            <button
              key={op}
              onClick={() => handleOpClick(op)}
              className={`
                w-14 h-14 rounded-xl text-xl font-bold transition-all duration-200
                ${selectedOp === op
                  ? 'bg-yellow-600 scale-110 glow-yellow'
                  : 'glass hover:bg-white/10 hover:scale-105'
                }
              `}
            >
              {op}
            </button>
          ))}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="glass rounded-xl p-4 mb-6">
            <h3 className="text-xs text-gray-400 mb-2">计算步骤:</h3>
            {history.map((step, i) => (
              <div key={i} className="text-sm text-gray-300">
                {i + 1}. {step}
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleUndo}
            className="flex-1 py-3 glass rounded-xl font-bold text-gray-300 hover:bg-white/10 transition-all"
          >
            🔄 重置
          </button>
          <button
            onClick={handleNewRound}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all"
          >
            🎲 换一题
          </button>
        </div>
      </div>
    </div>
  );
}
