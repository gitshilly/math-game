// localStorage wrapper for game data persistence

import { GameStats, Achievement, getDefaultAchievements, ShopItem, getShopItems } from './rewards';

const STORAGE_KEYS = {
  STATS: 'math_game_stats',
  ACHIEVEMENTS: 'math_game_achievements',
  SHOP: 'math_game_shop',
  GRADE: 'math_game_grade',
  EQUIPPED_TITLE: 'math_game_equipped_title',
  EQUIPPED_FRAME: 'math_game_equipped_frame',
  SOUND_ENABLED: 'math_game_sound',
};

export function getDefaultStats(): GameStats {
  return {
    totalQuestions: 0,
    totalCorrect: 0,
    totalRounds: 0,
    perfectRounds: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalCoins: 0,
    level: 1,
    xp: 0,
    daysPlayed: 0,
    lastPlayDate: '',
    consecutiveDays: 0,
  };
}

export function loadStats(): GameStats {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STATS);
    if (data) {
      return { ...getDefaultStats(), ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('Failed to load stats:', e);
  }
  return getDefaultStats();
}

export function saveStats(stats: GameStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats:', e);
  }
}

export function loadAchievements(): Achievement[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (data) {
      const saved = JSON.parse(data) as { id: string; unlocked: boolean }[];
      const defaults = getDefaultAchievements();
      return defaults.map(a => {
        const savedA = saved.find(s => s.id === a.id);
        return { ...a, unlocked: savedA?.unlocked || false };
      });
    }
  } catch (e) {
    console.error('Failed to load achievements:', e);
  }
  return getDefaultAchievements();
}

export function saveAchievements(achievements: Achievement[]): void {
  try {
    const data = achievements.map(a => ({ id: a.id, unlocked: a.unlocked }));
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save achievements:', e);
  }
}

export function loadShopItems(): ShopItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SHOP);
    if (data) {
      const saved = JSON.parse(data) as { id: string; owned: boolean }[];
      const defaults = getShopItems();
      return defaults.map(item => {
        const savedItem = saved.find(s => s.id === item.id);
        return { ...item, owned: savedItem?.owned || false };
      });
    }
  } catch (e) {
    console.error('Failed to load shop items:', e);
  }
  return getShopItems();
}

export function saveShopItems(items: ShopItem[]): void {
  try {
    const data = items.map(i => ({ id: i.id, owned: i.owned }));
    localStorage.setItem(STORAGE_KEYS.SHOP, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save shop items:', e);
  }
}

export function loadGrade(): number {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GRADE);
    if (data) return parseInt(data, 10);
  } catch (e) {
    console.error('Failed to load grade:', e);
  }
  return 4; // Default grade 4
}

export function saveGrade(grade: number): void {
  localStorage.setItem(STORAGE_KEYS.GRADE, grade.toString());
}

export function loadEquippedTitle(): string {
  return localStorage.getItem(STORAGE_KEYS.EQUIPPED_TITLE) || '';
}

export function saveEquippedTitle(title: string): void {
  localStorage.setItem(STORAGE_KEYS.EQUIPPED_TITLE, title);
}

export function loadEquippedFrame(): string {
  return localStorage.getItem(STORAGE_KEYS.EQUIPPED_FRAME) || '';
}

export function saveEquippedFrame(frame: string): void {
  localStorage.setItem(STORAGE_KEYS.EQUIPPED_FRAME, frame);
}

export function loadSoundEnabled(): boolean {
  const data = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
  return data !== 'false'; // default true
}

export function saveSoundEnabled(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, enabled.toString());
}

export function updateDailyLogin(stats: GameStats): GameStats {
  const today = new Date().toISOString().split('T')[0];
  if (stats.lastPlayDate === today) return stats;

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const isConsecutive = stats.lastPlayDate === yesterday;

  return {
    ...stats,
    lastPlayDate: today,
    daysPlayed: stats.daysPlayed + 1,
    consecutiveDays: isConsecutive ? stats.consecutiveDays + 1 : 1,
  };
}
