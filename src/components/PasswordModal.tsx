import React, { useState, useRef, useEffect } from 'react';
import { playClickSound, playWrongSound, playCorrectSound } from '../utils/sound';
import { useGame } from '../contexts/GameContext';

const STORAGE_KEY = 'math_game_password';
const DEFAULT_PASSWORD = '1101';

function getPassword(): string {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_PASSWORD;
}

interface PasswordModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export default function PasswordModal({ onSuccess, onClose }: PasswordModalProps) {
  const { soundEnabled } = useGame();
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    setError(false);

    // Auto-advance to next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 4 digits entered
    if (value && index === 3) {
      const code = newDigits.join('');
      if (code.length === 4) {
        setTimeout(() => checkPassword(code), 100);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      const code = digits.join('');
      if (code.length === 4) {
        checkPassword(code);
      }
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const checkPassword = (code: string) => {
    const correctPassword = getPassword();
    if (code === correctPassword) {
      if (soundEnabled) playCorrectSound();
      onSuccess();
    } else {
      if (soundEnabled) playWrongSound();
      setError(true);
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setDigits(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }, 600);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`glass rounded-2xl p-8 max-w-sm w-full mx-4 text-center animate-bounce-in ${shake ? 'animate-shake' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-xl font-bold mb-2">输入通关密码</h2>
        <p className="text-sm text-gray-400 mb-6">请输入4位密码进入游戏乐园</p>

        <div className="flex justify-center gap-3 mb-6">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`
                w-14 h-14 text-center text-2xl font-bold rounded-xl
                bg-gray-800/60 border-2 outline-none transition-all duration-200
                ${error
                  ? 'border-red-500 text-red-400'
                  : digit
                    ? 'border-indigo-500 text-white'
                    : 'border-gray-600 text-white focus:border-indigo-500'
                }
              `}
            />
          ))}
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-4 animate-slide-up">
            密码错误，请重新输入
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl glass text-gray-400 hover:text-white transition-all"
          >
            取消
          </button>
          <button
            onClick={() => {
              if (soundEnabled) playClickSound();
              const code = digits.join('');
              if (code.length === 4) checkPassword(code);
            }}
            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold transition-all"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
}
