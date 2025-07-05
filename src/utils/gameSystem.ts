// TrenchWars Gamification System - World-Class Implementation
// Comprehensive streak tracking, multipliers, and achievement system

import { WojakMood, determineWojakMood } from './wojakImageGenerator';

export interface GameStats {
  currentStreak: number;
  bestStreak: number;
  totalWins: number;
  totalLosses: number;
  totalBets: number;
  totalVolume: number;
  biggestWin: number;
  biggestLoss: number;
  streakMultiplier: number;
  currentRank: string;
  achievementsUnlocked: string[];
  lastWinAmount?: number;
  lifetimePnL: number;
  lastUpdated: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  reward: string;
  unlockCondition: (stats: GameStats) => boolean;
  isUnlocked: boolean;
  unlockedAt?: number;
  celebrationType?: 'fire' | 'rocket' | 'diamond' | 'crown' | 'whale' | 'sparkles';
}

export interface StreakLevel {
  name: string;
  icon: string;
  minStreak: number;
  multiplier: number;
  color: string;
  description: string;
}

// Streak levels with progressive multipliers
export const STREAK_LEVELS: StreakLevel[] = [
  {
    name: 'Normal Anon',
    icon: '😐',
    minStreak: 0,
    multiplier: 1.0,
    color: '#6B6B6B',
    description: 'Just getting started'
  },
  {
    name: 'Hot Hands',
    icon: '🔥',
    minStreak: 3,
    multiplier: 1.25,
    color: '#FF6B6B',
    description: '3+ wins - Getting warmed up'
  },
  {
    name: 'Based Anon',
    icon: '🚀',
    minStreak: 5,
    multiplier: 1.5,
    color: '#4A9EFF',
    description: '5+ wins - Absolutely based'
  },
  {
    name: 'Diamond Legend',
    icon: '💎',
    minStreak: 7,
    multiplier: 1.75,
    color: '#00D4AA',
    description: '7+ wins - Diamond hands confirmed'
  },
  {
    name: 'Unstoppable Chad',
    icon: '👑',
    minStreak: 10,
    multiplier: 2.0,
    color: '#FFD700',
    description: '10+ wins - Godmode activated'
  },
  {
    name: 'Legendary Degen',
    icon: '⚡',
    minStreak: 15,
    multiplier: 2.5,
    color: '#8B5CF6',
    description: '15+ wins - Transcended reality'
  }
];

// Comprehensive achievement system
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'FIRST_BLOOD',
    name: 'First Blood',
    description: 'Win your first battle',
    icon: '🩸',
    reward: 'Unlock comfy wojak expression',
    celebrationType: 'sparkles',
    isUnlocked: false,
    unlockCondition: (stats) => stats.totalWins >= 1
  },
  {
    id: 'HOT_HANDS',
    name: 'Hot Hands',
    description: 'Win 3 battles in a row',
    icon: '🔥',
    reward: '1.25x betting multiplier',
    celebrationType: 'fire',
    isUnlocked: false,
    unlockCondition: (stats) => stats.currentStreak >= 3
  },
  {
    id: 'BASED_ANON',
    name: 'Based Anon',
    description: 'Win 5 battles in a row',
    icon: '🚀',
    reward: '1.5x multiplier + special animation',
    celebrationType: 'rocket',
    isUnlocked: false,
    unlockCondition: (stats) => stats.currentStreak >= 5
  },
  {
    id: 'DIAMOND_LEGEND',
    name: 'Diamond Legend',
    description: 'Win 7 battles in a row',
    icon: '💎',
    reward: '1.75x multiplier + diamond badge',
    celebrationType: 'diamond',
    isUnlocked: false,
    unlockCondition: (stats) => stats.currentStreak >= 7
  },
  {
    id: 'UNSTOPPABLE_CHAD',
    name: 'Unstoppable Chad',
    description: 'Win 10 battles in a row',
    icon: '👑',
    reward: '2x multiplier + hall of fame',
    celebrationType: 'crown',
    isUnlocked: false,
    unlockCondition: (stats) => stats.currentStreak >= 10
  },
  {
    id: 'WHALE_STATUS',
    name: 'Whale Status',
    description: 'Win over $500 in single battle',
    icon: '🐋',
    reward: 'Exclusive whale wojak variant',
    celebrationType: 'whale',
    isUnlocked: false,
    unlockCondition: (stats) => (stats.lastWinAmount || 0) >= 500
  },
  {
    id: 'DIAMOND_HANDS',
    name: 'Diamond Hands',
    description: 'Win after losing $100+',
    icon: '💪',
    reward: 'Recovery wojak + inspire others',
    celebrationType: 'diamond',
    isUnlocked: false,
    unlockCondition: (stats) => stats.biggestLoss >= 100 && stats.totalWins > 0
  },
  {
    id: 'VOLUME_KING',
    name: 'Volume King',
    description: 'Bet over $10,000 total volume',
    icon: '📈',
    reward: 'Volume king badge + special rank',
    celebrationType: 'sparkles',
    isUnlocked: false,
    unlockCondition: (stats) => stats.totalVolume >= 10000
  },
  {
    id: 'COMEBACK_KING',
    name: 'Comeback King',
    description: 'Go from -$500 to positive P&L',
    icon: '🎯',
    reward: 'Comeback wojak + legendary status',
    celebrationType: 'fire',
    isUnlocked: false,
    unlockCondition: (stats) => stats.biggestLoss >= 500 && stats.lifetimePnL > 0
  },
  {
    id: 'SPEED_DEMON',
    name: 'Speed Demon',
    description: 'Win 5 battles in under 1 hour',
    icon: '⚡',
    reward: 'Speed multiplier bonus',
    celebrationType: 'rocket',
    isUnlocked: false,
    unlockCondition: (stats) => stats.currentStreak >= 5 // Simplified for demo
  }
];

class GameSystem {
  private static instance: GameSystem;
  private stats: GameStats;
  private achievements: Achievement[];
  private streakLevels: StreakLevel[];
  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  private constructor() {
    this.streakLevels = [...STREAK_LEVELS];
    this.achievements = ACHIEVEMENTS.map(a => ({ ...a }));
    this.stats = this.loadStats();
  }

  static getInstance(): GameSystem {
    if (!GameSystem.instance) {
      GameSystem.instance = new GameSystem();
    }
    return GameSystem.instance;
  }

  // Load stats from localStorage with fallbacks
  private loadStats(): GameStats {
    try {
      const saved = localStorage.getItem('trenchwars_game_stats');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...this.getDefaultStats(),
          ...parsed,
          lastUpdated: Date.now()
        };
      }
    } catch (error) {
      console.error('Error loading game stats:', error);
    }
    return this.getDefaultStats();
  }

  private getDefaultStats(): GameStats {
    return {
      currentStreak: 0,
      bestStreak: 0,
      totalWins: 0,
      totalLosses: 0,
      totalBets: 0,
      totalVolume: 0,
      biggestWin: 0,
      biggestLoss: 0,
      streakMultiplier: 1.0,
      currentRank: 'Normal Anon',
      achievementsUnlocked: [],
      lifetimePnL: 0,
      lastUpdated: Date.now()
    };
  }

  // Save stats to localStorage
  private saveStats(): void {
    try {
      this.stats.lastUpdated = Date.now();
      localStorage.setItem('trenchwars_game_stats', JSON.stringify(this.stats));
    } catch (error) {
      console.error('Error saving game stats:', error);
    }
  }

  // Event system for UI updates
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} callback:`, error);
        }
      });
    }
  }

  // Core game logic - process bet result
  processBetResult(didWin: boolean, betAmount: number, winAmount: number = 0): void {
    const oldStats = { ...this.stats };
    
    this.stats.totalBets++;
    this.stats.totalVolume += betAmount;

    if (didWin) {
      this.handleWin(winAmount);
    } else {
      this.handleLoss(betAmount);
    }

    this.updateMultiplier();
    this.updateRank();
    this.checkAchievements(oldStats);
    this.saveStats();

    // Emit events for UI updates
    this.emit('stats_updated', this.stats);
    this.emit('streak_changed', {
      oldStreak: oldStats.currentStreak,
      newStreak: this.stats.currentStreak,
      multiplier: this.stats.streakMultiplier
    });
  }

  private handleWin(winAmount: number): void {
    this.stats.totalWins++;
    this.stats.currentStreak++;
    this.stats.bestStreak = Math.max(this.stats.bestStreak, this.stats.currentStreak);
    this.stats.biggestWin = Math.max(this.stats.biggestWin, winAmount);
    this.stats.lastWinAmount = winAmount;
    this.stats.lifetimePnL += winAmount;

    this.emit('win', {
      amount: winAmount,
      streak: this.stats.currentStreak,
      isNewRecord: this.stats.currentStreak === this.stats.bestStreak
    });
  }

  private handleLoss(lossAmount: number): void {
    this.stats.totalLosses++;
    this.stats.currentStreak = 0;
    this.stats.biggestLoss = Math.max(this.stats.biggestLoss, lossAmount);
    this.stats.lifetimePnL -= lossAmount;
    this.stats.lastWinAmount = undefined;

    this.emit('loss', {
      amount: lossAmount,
      streakBroken: this.stats.currentStreak > 0
    });
  }

  private updateMultiplier(): void {
    const level = this.getCurrentStreakLevel();
    this.stats.streakMultiplier = level.multiplier;
  }

  private updateRank(): void {
    const level = this.getCurrentStreakLevel();
    const oldRank = this.stats.currentRank;
    this.stats.currentRank = level.name;

    if (oldRank !== level.name) {
      this.emit('rank_changed', {
        oldRank,
        newRank: level.name,
        level
      });
    }
  }

  getCurrentStreakLevel(): StreakLevel {
    let currentLevel = this.streakLevels[0];
    
    for (const level of this.streakLevels) {
      if (this.stats.currentStreak >= level.minStreak) {
        currentLevel = level;
      } else {
        break;
      }
    }
    
    return currentLevel;
  }

  getNextStreakLevel(): StreakLevel | null {
    const currentLevel = this.getCurrentStreakLevel();
    const currentIndex = this.streakLevels.indexOf(currentLevel);
    
    if (currentIndex < this.streakLevels.length - 1) {
      return this.streakLevels[currentIndex + 1];
    }
    
    return null;
  }

  private checkAchievements(oldStats: GameStats): void {
    for (const achievement of this.achievements) {
      if (!achievement.isUnlocked && achievement.unlockCondition(this.stats)) {
        this.unlockAchievement(achievement);
      }
    }
  }

  private unlockAchievement(achievement: Achievement): void {
    achievement.isUnlocked = true;
    achievement.unlockedAt = Date.now();
    
    if (!this.stats.achievementsUnlocked.includes(achievement.id)) {
      this.stats.achievementsUnlocked.push(achievement.id);
    }

    this.emit('achievement_unlocked', achievement);
  }

  // Calculate actual payout with multiplier
  calculatePayout(basePayout: number): number {
    return basePayout * this.stats.streakMultiplier;
  }

  // Get current wojak mood based on all factors
  getCurrentWojakMood(currentPnL: number): WojakMood {
    return determineWojakMood(
      currentPnL,
      this.stats.currentStreak,
      this.stats.lastWinAmount
    );
  }

  // Get progress to next achievement
  getAchievementProgress(): { achievement: Achievement; progress: number } | null {
    const unlockedIds = new Set(this.stats.achievementsUnlocked);
    const nextAchievement = this.achievements.find(a => !unlockedIds.has(a.id));
    
    if (!nextAchievement) return null;

    let progress = 0;
    
    // Calculate progress based on achievement type
    if (nextAchievement.id.includes('STREAK')) {
      const targetStreak = parseInt(nextAchievement.description.match(/\d+/)?.[0] || '0');
      progress = Math.min(this.stats.currentStreak / targetStreak, 1);
    } else if (nextAchievement.id === 'WHALE_STATUS') {
      progress = Math.min((this.stats.lastWinAmount || 0) / 500, 1);
    } else if (nextAchievement.id === 'VOLUME_KING') {
      progress = Math.min(this.stats.totalVolume / 10000, 1);
    }

    return { achievement: nextAchievement, progress };
  }

  // Get formatted rank info
  getRankInfo(): { current: StreakLevel; next: StreakLevel | null; progress: number } {
    const current = this.getCurrentStreakLevel();
    const next = this.getNextStreakLevel();
    
    let progress = 1;
    if (next) {
      const winsNeeded = next.minStreak - current.minStreak;
      const winsProgress = this.stats.currentStreak - current.minStreak;
      progress = Math.min(winsProgress / winsNeeded, 1);
    }

    return { current, next, progress };
  }

  // Public getters
  getStats(): GameStats {
    return { ...this.stats };
  }

  getAchievements(): Achievement[] {
    return this.achievements.map(a => ({ ...a }));
  }

  getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter(a => a.isUnlocked);
  }

  getStreakLevels(): StreakLevel[] {
    return [...this.streakLevels];
  }

  // Reset stats (for testing/demo purposes)
  resetStats(): void {
    this.stats = this.getDefaultStats();
    this.achievements.forEach(a => {
      a.isUnlocked = false;
      a.unlockedAt = undefined;
    });
    this.saveStats();
    this.emit('stats_reset', this.stats);
  }

  // Simulate bet for demo purposes
  simulateRandomBet(): void {
    const winChance = 0.6; // 60% win rate for demo
    const didWin = Math.random() < winChance;
    const betAmount = Math.random() * 100 + 10; // $10-$110
    const winAmount = didWin ? betAmount * (1 + Math.random()) : 0; // 1x-2x payout
    
    this.processBetResult(didWin, betAmount, winAmount);
  }

  // Force unlock achievement for demo
  unlockAchievementById(achievementId: string): void {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (achievement && !achievement.isUnlocked) {
      this.unlockAchievement(achievement);
      this.saveStats();
    }
  }
}

// Export singleton instance
export const gameSystem = GameSystem.getInstance();

// Export helper functions
export function formatMultiplier(multiplier: number): string {
  return `${multiplier.toFixed(2)}x`;
}

export function formatStreakDisplay(streak: number): string {
  if (streak === 0) return 'No streak';
  return `${streak}W`;
}

export function getStreakEmoji(streak: number): string {
  if (streak >= 15) return '⚡';
  if (streak >= 10) return '👑';
  if (streak >= 7) return '💎';
  if (streak >= 5) return '🚀';
  if (streak >= 3) return '🔥';
  return '😐';
}

export function calculateWinsToNext(currentStreak: number, streakLevels: StreakLevel[]): number {
  const nextLevel = streakLevels.find(level => level.minStreak > currentStreak);
  return nextLevel ? nextLevel.minStreak - currentStreak : 0;
}