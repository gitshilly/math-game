import React, { useEffect, useState } from 'react';
import { Question } from '../utils/questionGenerator';
import { useGame } from '../contexts/GameContext';
import { Achievement } from '../utils/rewards';
import { playPerfectSound } from '../utils/sound';
import confetti from 'canvas-confetti';
import RewardPopup from './RewardPopup';

interface QuizResult {
  question: Question;
  userAnswer: string;
  correct: boolean;
}

interface ResultPageProps {
  results: QuizResult[];
  onRetry: (wrongQuestions: Question[]) => void;
  onHome: () => void;
  isRetry?: boolean;
}

export default function ResultPage({ results, onRetry, onHome, isRetry = false }: ResultPageProps) {
  const { completeRound, breakStreak, soundEnabled, stats } = useGame();
  const [showReward, setShowReward] = useState(false);
  const [rewardData, setRewardData] = useState<{
    coins: number;
    xp: number;
    bonusMessage: string;
    newLevel: boolean;
    newAchievements: Achievement[];
  } | null>(null);

  const correctCount = results.filter(r => r.correct).length;
  const totalCount = results.length;
  const isPerfect = correctCount === totalCount;
  const accuracy = Math.round((correctCount / totalCount) * 100);
  const wrongQuestions = results.filter(r => !r.correct).map(r => r.question);

  // Stars based on accuracy
  const stars = accuracy === 100 ? 3 : accuracy >= 70 ? 2 : accuracy >= 40 ? 1 : 0;

  useEffect(() => {
    // Calculate and give rewards
    const reward = completeRound(correctCount, totalCount);
    setRewardData(reward);

    if (!isPerfect) {
      breakStreak();
    }

    if (isPerfect && soundEnabled) {
      playPerfectSound();
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.4 },
        colors: ['#fbbf24', '#22c55e', '#6366f1', '#ef4444', '#a855f7'],
      });
    }

    // Show reward popup after a delay
    setTimeout(() => setShowReward(true), 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page-enter max-w-lg mx-auto px-4 py-6">
      {/* Stars */}
      <div className="text-center mb-6">
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3].map(i => (
            <span
              key={i}
              className={`text-5xl transition-all duration-500 ${
                i <= stars ? 'star-filled animate-star-spin' : 'star-empty'
              }`}
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              ★
            </span>
          ))}
        </div>

        <h1 className="text-2xl font-bold mb-1">
          {isPerfect ? '太棒了! 全对!' : accuracy >= 70 ? '做得不错!' : '继续加油!'}
        </h1>
        <p className="text-gray-400">
          {isRetry ? '错题重练' : '练习'} 完成
        </p>
      </div>

      {/* Score card */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-green-400">{correctCount}</div>
            <div className="text-xs text-gray-400 mt-1">正确</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-red-400">{totalCount - correctCount}</div>
            <div className="text-xs text-gray-400 mt-1">错误</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-indigo-400">{accuracy}%</div>
            <div className="text-xs text-gray-400 mt-1">正确率</div>
          </div>
        </div>
      </div>

      {/* Wrong answers review */}
      {wrongQuestions.length > 0 && (
        <div className="glass rounded-2xl p-4 mb-6">
          <h3 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-1">
            <span>❌</span> 错题回顾
          </h3>
          <div className="space-y-2">
            {results.filter(r => !r.correct).map((r, i) => (
              <div key={i} className="bg-red-500/10 rounded-lg p-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-white">{r.question.expression} = ?</span>
                </div>
                <div className="flex justify-between mt-1 text-xs">
                  <span className="text-red-400">你的答案: {r.userAnswer}</span>
                  <span className="text-green-400">
                    正确答案: {r.question.isFraction ? r.question.fractionAnswer : r.question.answer}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-3">
        {wrongQuestions.length > 0 && (
          <button
            onClick={() => onRetry(wrongQuestions)}
            className="w-full py-4 bg-orange-600 hover:bg-orange-500 rounded-xl font-bold text-lg btn-game flex items-center justify-center gap-2"
          >
            <span>🔄</span>
            错题重练 ({wrongQuestions.length}道错题类型)
          </button>
        )}
        <button
          onClick={onHome}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-lg btn-game flex items-center justify-center gap-2"
        >
          {isPerfect ? (
            <>
              <span>🏠</span>
              返回首页
            </>
          ) : (
            <>
              <span>🏠</span>
              返回首页
            </>
          )}
        </button>
      </div>

      {/* Reward popup */}
      {rewardData && (
        <RewardPopup
          show={showReward}
          coins={rewardData.coins}
          xp={rewardData.xp}
          bonusMessage={rewardData.bonusMessage}
          newLevel={rewardData.newLevel}
          newLevel_number={stats.level}
          newAchievements={rewardData.newAchievements}
          onClose={() => setShowReward(false)}
        />
      )}
    </div>
  );
}
