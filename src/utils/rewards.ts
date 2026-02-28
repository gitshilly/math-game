// Reward calculation and achievement system

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: (stats: GameStats) => boolean;
  unlocked: boolean;
}

export interface GameStats {
  totalQuestions: number;
  totalCorrect: number;
  totalRounds: number;
  perfectRounds: number;
  currentStreak: number;
  bestStreak: number;
  totalCoins: number;
  level: number;
  xp: number;
  daysPlayed: number;
  lastPlayDate: string;
  consecutiveDays: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  type: 'title' | 'avatar_frame';
  owned: boolean;
}

export const TITLES: Record<number, string> = {
  1: '数学小白',
  2: '数学学徒',
  3: '数学新手',
  5: '计算能手',
  8: '数学达人',
  10: '算术高手',
  13: '数学精英',
  15: '计算大师',
  18: '数学王者',
  20: '数学传奇',
  25: '数学之神',
};

export function getTitleForLevel(level: number): string {
  let title = '数学小白';
  for (const [lvl, t] of Object.entries(TITLES)) {
    if (level >= parseInt(lvl)) {
      title = t;
    }
  }
  return title;
}

export const XP_PER_LEVEL = 100; // XP needed per level

export function calculateXpForLevel(level: number): number {
  return level * XP_PER_LEVEL;
}

export function calculateRewards(
  correctCount: number,
  totalCount: number,
  streak: number,
  isPerfect: boolean,
): { coins: number; xp: number; bonusMessage: string } {
  let coins = correctCount * 5; // 5 coins per correct answer
  let xp = correctCount * 10;   // 10 XP per correct answer
  let bonusMessage = '';

  // Perfect round bonus
  if (isPerfect) {
    coins += 30;
    xp += 50;
    bonusMessage = '全对奖励 +30金币 +50经验！';
  }

  // Streak bonus
  if (streak >= 3) {
    const streakMultiplier = Math.min(streak, 10) * 0.1 + 1; // max 2x
    coins = Math.floor(coins * streakMultiplier);
    xp = Math.floor(xp * streakMultiplier);
    bonusMessage += ` 连胜${streak}次 x${streakMultiplier.toFixed(1)}！`;
  }

  // Accuracy bonus
  const accuracy = correctCount / totalCount;
  if (accuracy >= 0.8 && !isPerfect) {
    coins += 10;
    xp += 20;
    bonusMessage += ' 高准确率奖励！';
  }

  return { coins, xp, bonusMessage: bonusMessage.trim() };
}

export function getDefaultAchievements(): Achievement[] {
  return [
    {
      id: 'first_round',
      name: '初出茅庐',
      description: '完成第一轮练习',
      icon: '🎯',
      requirement: (s) => s.totalRounds >= 1,
      unlocked: false,
    },
    {
      id: 'perfect_first',
      name: '一鸣惊人',
      description: '第一次全对',
      icon: '⭐',
      requirement: (s) => s.perfectRounds >= 1,
      unlocked: false,
    },
    {
      id: 'streak_3',
      name: '三连胜',
      description: '连续3轮全对',
      icon: '🔥',
      requirement: (s) => s.bestStreak >= 3,
      unlocked: false,
    },
    {
      id: 'streak_5',
      name: '五连胜',
      description: '连续5轮全对',
      icon: '💥',
      requirement: (s) => s.bestStreak >= 5,
      unlocked: false,
    },
    {
      id: 'streak_10',
      name: '十连胜',
      description: '连续10轮全对',
      icon: '👑',
      requirement: (s) => s.bestStreak >= 10,
      unlocked: false,
    },
    {
      id: 'questions_100',
      name: '百题勇士',
      description: '累计完成100道题目',
      icon: '💯',
      requirement: (s) => s.totalQuestions >= 100,
      unlocked: false,
    },
    {
      id: 'questions_500',
      name: '五百题达人',
      description: '累计完成500道题目',
      icon: '🏅',
      requirement: (s) => s.totalQuestions >= 500,
      unlocked: false,
    },
    {
      id: 'questions_1000',
      name: '千题大师',
      description: '累计完成1000道题目',
      icon: '🏆',
      requirement: (s) => s.totalQuestions >= 1000,
      unlocked: false,
    },
    {
      id: 'level_5',
      name: '初露锋芒',
      description: '达到5级',
      icon: '🌟',
      requirement: (s) => s.level >= 5,
      unlocked: false,
    },
    {
      id: 'level_10',
      name: '小有成就',
      description: '达到10级',
      icon: '✨',
      requirement: (s) => s.level >= 10,
      unlocked: false,
    },
    {
      id: 'level_20',
      name: '登峰造极',
      description: '达到20级',
      icon: '💎',
      requirement: (s) => s.level >= 20,
      unlocked: false,
    },
    {
      id: 'coins_500',
      name: '小富翁',
      description: '累计获得500金币',
      icon: '💰',
      requirement: (s) => s.totalCoins >= 500,
      unlocked: false,
    },
    {
      id: 'coins_2000',
      name: '大富翁',
      description: '累计获得2000金币',
      icon: '💎',
      requirement: (s) => s.totalCoins >= 2000,
      unlocked: false,
    },
    {
      id: 'days_3',
      name: '坚持不懈',
      description: '连续3天练习',
      icon: '📅',
      requirement: (s) => s.consecutiveDays >= 3,
      unlocked: false,
    },
    {
      id: 'days_7',
      name: '一周达人',
      description: '连续7天练习',
      icon: '🗓️',
      requirement: (s) => s.consecutiveDays >= 7,
      unlocked: false,
    },
    {
      id: 'accuracy_master',
      name: '精准计算',
      description: '总正确率达到95%以上（至少50题）',
      icon: '🎯',
      requirement: (s) => s.totalQuestions >= 50 && (s.totalCorrect / s.totalQuestions) >= 0.95,
      unlocked: false,
    },
  ];
}

export function getShopItems(): ShopItem[] {
  return [
    { id: 'title_speed', name: '速算之星', description: '闪亮的称号', icon: '⚡', price: 200, type: 'title', owned: false },
    { id: 'title_genius', name: '数学天才', description: '天才的象征', icon: '🧠', price: 500, type: 'title', owned: false },
    { id: 'title_hero', name: '计算英雄', description: '英雄的称号', icon: '🦸', price: 300, type: 'title', owned: false },
    { id: 'title_wizard', name: '数字魔法师', description: '神秘的力量', icon: '🧙', price: 800, type: 'title', owned: false },
    { id: 'title_dragon', name: '数学神龙', description: '最强称号', icon: '🐉', price: 1500, type: 'title', owned: false },
    { id: 'frame_star', name: '星光头像框', description: '闪闪发光', icon: '⭐', price: 150, type: 'avatar_frame', owned: false },
    { id: 'frame_fire', name: '烈焰头像框', description: '火焰环绕', icon: '🔥', price: 300, type: 'avatar_frame', owned: false },
    { id: 'frame_rainbow', name: '彩虹头像框', description: '七彩绚丽', icon: '🌈', price: 400, type: 'avatar_frame', owned: false },
    { id: 'frame_crown', name: '皇冠头像框', description: '王者风范', icon: '👑', price: 1000, type: 'avatar_frame', owned: false },
  ];
}
