import React, { useState, useCallback } from 'react';
import { useGame } from './contexts/GameContext';
import { generateQuestions, generateSimilarQuestions, Question } from './utils/questionGenerator';
import HomePage from './components/HomePage';
import QuizPage from './components/QuizPage';
import ResultPage from './components/ResultPage';
import ShopPage from './components/ShopPage';

type Page = 'home' | 'quiz' | 'result' | 'shop';

interface QuizResult {
  question: Question;
  userAnswer: string;
  correct: boolean;
}

function App() {
  const { grade, soundEnabled, toggleSound } = useGame();
  const [page, setPage] = useState<Page>('home');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isRetry, setIsRetry] = useState(false);

  const handleStartQuiz = useCallback(() => {
    const newQuestions = generateQuestions(grade, 10);
    setQuestions(newQuestions);
    setIsRetry(false);
    setPage('quiz');
  }, [grade]);

  const handleQuizComplete = useCallback((quizResults: QuizResult[]) => {
    setResults(quizResults);
    setPage('result');
  }, []);

  const handleRetry = useCallback((wrongQuestions: Question[]) => {
    const retryQuestions = generateSimilarQuestions(wrongQuestions, grade, 10);
    setQuestions(retryQuestions);
    setIsRetry(true);
    setPage('quiz');
  }, [grade]);

  const handleGoHome = useCallback(() => {
    setPage('home');
  }, []);

  const handleOpenShop = useCallback(() => {
    setPage('shop');
  }, []);

  return (
    <div className="min-h-screen relative">
      {/* Sound toggle - floating button */}
      <button
        onClick={toggleSound}
        className="fixed top-4 right-4 z-40 w-10 h-10 rounded-full glass flex items-center justify-center text-lg hover:bg-white/10 transition-all"
        title={soundEnabled ? '关闭音效' : '开启音效'}
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>

      {/* Page router */}
      {page === 'home' && (
        <HomePage onStartQuiz={handleStartQuiz} onOpenShop={handleOpenShop} />
      )}
      {page === 'quiz' && (
        <QuizPage
          questions={questions}
          onComplete={handleQuizComplete}
          isRetry={isRetry}
        />
      )}
      {page === 'result' && (
        <ResultPage
          results={results}
          onRetry={handleRetry}
          onHome={handleGoHome}
          isRetry={isRetry}
        />
      )}
      {page === 'shop' && (
        <ShopPage onClose={handleGoHome} />
      )}
    </div>
  );
}

export default App;
