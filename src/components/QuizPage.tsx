import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Question } from '../utils/questionGenerator';
import { useGame } from '../contexts/GameContext';
import { playCorrectSound, playWrongSound, playClickSound } from '../utils/sound';
import ProgressBar from './ProgressBar';

interface QuizPageProps {
  questions: Question[];
  onComplete: (results: { question: Question; userAnswer: string; correct: boolean }[]) => void;
  isRetry?: boolean;
}

export default function QuizPage({ questions, onComplete, isRetry = false }: QuizPageProps) {
  const { soundEnabled } = useGame();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [results, setResults] = useState<{ question: Question; userAnswer: string; correct: boolean }[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentQuestion = questions[currentIndex];

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  // Auto-focus input
  useEffect(() => {
    if (feedback === null) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentIndex, feedback]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const checkAnswer = useCallback(() => {
    if (!userAnswer.trim()) return;

    const question = currentQuestion;
    let isCorrect = false;

    if (question.isFraction && question.fractionAnswer) {
      // For fractions, check both the fraction string and decimal value
      const normalized = userAnswer.trim().replace(/\s/g, '');
      if (normalized === question.fractionAnswer) {
        isCorrect = true;
      } else {
        // Try evaluating as fraction
        const parts = normalized.split('/');
        if (parts.length === 2) {
          const num = parseFloat(parts[0]);
          const den = parseFloat(parts[1]);
          if (den !== 0) {
            isCorrect = Math.abs(num / den - question.answer) < 0.001;
          }
        } else {
          isCorrect = Math.abs(parseFloat(normalized) - question.answer) < 0.001;
        }
      }
    } else {
      const numAnswer = parseFloat(userAnswer.trim());
      isCorrect = Math.abs(numAnswer - question.answer) < 0.01;
    }

    setFeedback(isCorrect ? 'correct' : 'wrong');

    if (isCorrect && soundEnabled) playCorrectSound();
    if (!isCorrect && soundEnabled) playWrongSound();

    const newResults = [...results, { question, userAnswer: userAnswer.trim(), correct: isCorrect }];
    setResults(newResults);

    setTimeout(() => {
      setFeedback(null);
      setUserAnswer('');

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onComplete(newResults);
      }
    }, isCorrect ? 800 : 1500);
  }, [userAnswer, currentQuestion, results, currentIndex, questions.length, onComplete, soundEnabled]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  const handleSubmit = () => {
    if (soundEnabled) playClickSound();
    checkAnswer();
  };

  return (
    <div className="page-enter max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {isRetry ? '错题重练' : '练习中'}
          </span>
          {isRetry && <span className="text-orange-400 text-lg">🔄</span>}
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <span>⏱️</span>
          <span className="font-mono text-sm">{formatTime(elapsed)}</span>
        </div>
      </div>

      {/* Progress */}
      <ProgressBar
        current={currentIndex + 1}
        max={questions.length}
        color="bg-indigo-500"
        label={`第 ${currentIndex + 1} / ${questions.length} 题`}
      />

      {/* Question Card */}
      <div className={`
        mt-8 glass rounded-2xl p-8 text-center transition-all duration-300
        ${feedback === 'correct' ? 'glow-green' : ''}
        ${feedback === 'wrong' ? 'glow-red animate-shake' : ''}
      `}>
        {/* Question number badge */}
        <div className="inline-block bg-indigo-600/30 rounded-full px-3 py-1 text-xs text-indigo-300 mb-4">
          Q{currentIndex + 1}
        </div>

        {/* Expression */}
        <div className="text-3xl md:text-4xl font-bold mb-8 tracking-wider">
          {currentQuestion.expression} = <span className="text-indigo-400">?</span>
        </div>

        {/* Input */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={userAnswer}
            onChange={e => setUserAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentQuestion.isFraction ? "输入分数 如 3/4" : "输入答案"}
            disabled={feedback !== null}
            className={`
              w-full text-center text-2xl font-bold py-4 px-6 rounded-xl
              bg-gray-800/60 border-2 transition-all duration-300 outline-none
              ${feedback === 'correct'
                ? 'border-green-500 text-green-400'
                : feedback === 'wrong'
                  ? 'border-red-500 text-red-400'
                  : 'border-gray-600 focus:border-indigo-500 text-white'
              }
            `}
          />

          {/* Feedback overlay */}
          {feedback && (
            <div className={`
              absolute inset-0 flex items-center justify-center rounded-xl
              ${feedback === 'correct' ? 'bg-green-500/10' : 'bg-red-500/10'}
            `}>
              {feedback === 'correct' ? (
                <span className="text-4xl animate-star-spin">⭐</span>
              ) : (
                <div className="text-center">
                  <span className="text-3xl">❌</span>
                  <p className="text-red-400 text-sm mt-1">
                    正确答案: {currentQuestion.isFraction ? currentQuestion.fractionAnswer : currentQuestion.answer}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit button */}
        {feedback === null && (
          <button
            onClick={handleSubmit}
            disabled={!userAnswer.trim()}
            className={`
              mt-6 px-10 py-3 rounded-xl font-bold text-lg transition-all duration-200
              ${userAnswer.trim()
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white btn-game'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            确认
          </button>
        )}
      </div>

      {/* Bottom stats */}
      <div className="mt-6 flex justify-center gap-6 text-sm text-gray-400">
        <div className="flex items-center gap-1">
          <span className="text-green-400">✓</span>
          <span>{results.filter(r => r.correct).length} 对</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-red-400">✗</span>
          <span>{results.filter(r => !r.correct).length} 错</span>
        </div>
      </div>
    </div>
  );
}
