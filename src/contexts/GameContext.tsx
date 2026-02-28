import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  GameStats,
  Achievement,
  ShopItem,
  calculateRewards,
  calculateXpForLevel,
  getTitleForLevel,
} from '../utils/rewards';
import {
  loadStats,
  saveStats,
  loadAchievements,
  saveAchievements,
  loadShopItems,
  saveShopItems,
  loadGrade,
  saveGrade,
  loadEquippedTitle,
  saveEquippedTitle,
  loadEquippedFrame,
  saveEquippedFrame,
  loadSoundEnabled,
  saveSoundEnabled,
  getDefaultStats,
  updateDailyLogin,
} from '../utils/storage';
import { playLevelUpSound, playAchievementSound, playCoinSound } from '../utils/sound';

interface GameContextType {
  stats: GameStats;
  achievements: Achievement[];
  shopItems: ShopItem[];
  grade: number;
  equippedTitle: string;
  equippedFrame: string;
  soundEnabled: boolean;
  currentTitle: string;
  setGrade: (grade: number) => void;
  completeRound: (correct: number, total: number) => {
    coins: number;
    xp: number;
    bonusMessage: string;
    newLevel: boolean;
    newAchievements: Achievement[];
  };
  breakStreak: () => void;
  purchaseItem: (itemId: string) => boolean;
  equipTitle: (title: string) => void;
  equipFrame: (frame: string) => void;
  toggleSound: () => void;
  resetProgress: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<GameStats>(loadStats);
  const [achievements, setAchievements] = useState<Achievement[]>(loadAchievements);
  const [shopItems, setShopItems] = useState<ShopItem[]>(loadShopItems);
  const [grade, setGradeState] = useState<number>(loadGrade);
  const [equippedTitle, setEquippedTitleState] = useState<string>(loadEquippedTitle);
  const [equippedFrame, setEquippedFrameState] = useState<string>(loadEquippedFrame);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(loadSoundEnabled);

  // Update daily login on mount
  useEffect(() => {
    const updated = updateDailyLogin(stats);
    if (updated !== stats) {
      setStats(updated);
      saveStats(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentTitle = equippedTitle || getTitleForLevel(stats.level);

  const setGrade = useCallback((g: number) => {
    setGradeState(g);
    saveGrade(g);
  }, []);

  const completeRound = useCallback((correct: number, total: number) => {
    const isPerfect = correct === total;
    const newStreak = isPerfect ? stats.currentStreak + 1 : 0;
    const { coins, xp, bonusMessage } = calculateRewards(correct, total, newStreak, isPerfect);

    let newXp = stats.xp + xp;
    let newLevel = stats.level;
    let didLevelUp = false;

    // Check level up
    while (newXp >= calculateXpForLevel(newLevel)) {
      newXp -= calculateXpForLevel(newLevel);
      newLevel++;
      didLevelUp = true;
    }

    if (didLevelUp && soundEnabled) {
      playLevelUpSound();
    }

    const newStats: GameStats = {
      ...stats,
      totalQuestions: stats.totalQuestions + total,
      totalCorrect: stats.totalCorrect + correct,
      totalRounds: stats.totalRounds + 1,
      perfectRounds: isPerfect ? stats.perfectRounds + 1 : stats.perfectRounds,
      currentStreak: newStreak,
      bestStreak: Math.max(stats.bestStreak, newStreak),
      totalCoins: stats.totalCoins + coins,
      level: newLevel,
      xp: newXp,
    };

    setStats(newStats);
    saveStats(newStats);

    // Check achievements
    const newAchievements: Achievement[] = [];
    const updatedAchievements = achievements.map(a => {
      if (!a.unlocked && a.requirement(newStats)) {
        newAchievements.push({ ...a, unlocked: true });
        if (soundEnabled) playAchievementSound();
        return { ...a, unlocked: true };
      }
      return a;
    });

    if (newAchievements.length > 0) {
      setAchievements(updatedAchievements);
      saveAchievements(updatedAchievements);
    }

    if (soundEnabled && coins > 0) {
      setTimeout(() => playCoinSound(), 500);
    }

    return { coins, xp, bonusMessage, newLevel: didLevelUp, newAchievements };
  }, [stats, achievements, soundEnabled]);

  const breakStreak = useCallback(() => {
    const newStats = { ...stats, currentStreak: 0 };
    setStats(newStats);
    saveStats(newStats);
  }, [stats]);

  const purchaseItem = useCallback((itemId: string) => {
    const item = shopItems.find(i => i.id === itemId);
    if (!item || item.owned || stats.totalCoins < item.price) return false;

    const newStats = { ...stats, totalCoins: stats.totalCoins - item.price };
    const newItems = shopItems.map(i =>
      i.id === itemId ? { ...i, owned: true } : i
    );

    setStats(newStats);
    saveStats(newStats);
    setShopItems(newItems);
    saveShopItems(newItems);

    if (soundEnabled) playCoinSound();
    return true;
  }, [stats, shopItems, soundEnabled]);

  const equipTitle = useCallback((title: string) => {
    setEquippedTitleState(title);
    saveEquippedTitle(title);
  }, []);

  const equipFrame = useCallback((frame: string) => {
    setEquippedFrameState(frame);
    saveEquippedFrame(frame);
  }, []);

  const toggleSound = useCallback(() => {
    const newVal = !soundEnabled;
    setSoundEnabledState(newVal);
    saveSoundEnabled(newVal);
  }, [soundEnabled]);

  const resetProgress = useCallback(() => {
    const defaultStats = getDefaultStats();
    setStats(defaultStats);
    saveStats(defaultStats);
    const defaultAchievements = loadAchievements().map(a => ({ ...a, unlocked: false }));
    setAchievements(defaultAchievements);
    saveAchievements(defaultAchievements);
    const defaultShop = loadShopItems().map(i => ({ ...i, owned: false }));
    setShopItems(defaultShop);
    saveShopItems(defaultShop);
    setEquippedTitleState('');
    saveEquippedTitle('');
    setEquippedFrameState('');
    saveEquippedFrame('');
  }, []);

  return (
    <GameContext.Provider
      value={{
        stats,
        achievements,
        shopItems,
        grade,
        equippedTitle,
        equippedFrame,
        soundEnabled,
        currentTitle,
        setGrade,
        completeRound,
        breakStreak,
        purchaseItem,
        equipTitle,
        equipFrame,
        toggleSound,
        resetProgress,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
