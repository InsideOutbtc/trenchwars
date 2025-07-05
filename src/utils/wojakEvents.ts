// Event system for Wojak bubble auto-opening and notifications

export enum WojakEvents {
  BIG_WIN = 'big_win',           // P&L > +$50
  BIG_LOSS = 'big_loss',         // P&L < -$50
  BATTLE_WON = 'battle_won',     // User's bet won
  BATTLE_LOST = 'battle_lost',   // User's bet lost
  NEW_BATTLE = 'new_battle',     // New battle started
  ACHIEVEMENT = 'achievement',   // Streak, milestone, etc.
  MOOD_CHANGE = 'mood_change',   // Significant mood change
  PORTFOLIO_UPDATE = 'portfolio_update' // Regular P&L update
}

export interface WojakEventData {
  type: WojakEvents;
  amount?: number;
  token?: string;
  battle?: string;
  achievement?: string;
  oldMood?: string;
  newMood?: string;
  message?: string;
  timestamp?: number;
}

export class WojakEventSystem {
  private static instance: WojakEventSystem;
  private listeners: Map<WojakEvents, ((data: WojakEventData) => void)[]> = new Map();
  private eventHistory: WojakEventData[] = [];

  static getInstance(): WojakEventSystem {
    if (!WojakEventSystem.instance) {
      WojakEventSystem.instance = new WojakEventSystem();
    }
    return WojakEventSystem.instance;
  }

  // Subscribe to specific event types
  on(eventType: WojakEvents, callback: (data: WojakEventData) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
  }

  // Unsubscribe from events
  off(eventType: WojakEvents, callback: (data: WojakEventData) => void) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Emit an event to all listeners
  emit(eventData: WojakEventData) {
    eventData.timestamp = Date.now();
    this.eventHistory.push(eventData);
    
    // Keep only last 50 events
    if (this.eventHistory.length > 50) {
      this.eventHistory = this.eventHistory.slice(-50);
    }

    const callbacks = this.listeners.get(eventData.type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(eventData);
        } catch (error) {
          console.error('Wojak event callback error:', error);
        }
      });
    }
  }

  // Get recent event history
  getRecentEvents(limit: number = 10): WojakEventData[] {
    return this.eventHistory.slice(-limit).reverse();
  }

  // Clear event history
  clearHistory() {
    this.eventHistory = [];
  }
}

// Convenience functions for triggering specific events
export const triggerWojakEvent = {
  bigWin: (amount: number, token?: string) => {
    WojakEventSystem.getInstance().emit({
      type: WojakEvents.BIG_WIN,
      amount,
      token,
      message: `HOLY SHIT ANON! +$${amount.toFixed(2)}! 🚀`
    });
  },

  bigLoss: (amount: number, token?: string) => {
    WojakEventSystem.getInstance().emit({
      type: WojakEvents.BIG_LOSS,
      amount: Math.abs(amount),
      token,
      message: `REKT FOR $${Math.abs(amount).toFixed(2)}... F 💀`
    });
  },

  battleWon: (amount: number, token: string) => {
    WojakEventSystem.getInstance().emit({
      type: WojakEvents.BATTLE_WON,
      amount,
      token,
      message: `${token} WINS! You're based anon! 🏆`
    });
  },

  battleLost: (amount: number, token: string) => {
    WojakEventSystem.getInstance().emit({
      type: WojakEvents.BATTLE_LOST,
      amount,
      token,
      message: `${token} lost... better luck next time 💀`
    });
  },

  newBattle: (battleName: string) => {
    WojakEventSystem.getInstance().emit({
      type: WojakEvents.NEW_BATTLE,
      battle: battleName,
      message: `New battle: ${battleName} - Place your bets!`
    });
  },

  achievement: (achievement: string) => {
    WojakEventSystem.getInstance().emit({
      type: WojakEvents.ACHIEVEMENT,
      achievement,
      message: `${achievement} unlocked! 🎯`
    });
  },

  moodChange: (oldMood: string, newMood: string) => {
    WojakEventSystem.getInstance().emit({
      type: WojakEvents.MOOD_CHANGE,
      oldMood,
      newMood,
      message: `Mood changed from ${oldMood} to ${newMood}`
    });
  },

  portfolioUpdate: (pnl: number, percentage: number) => {
    WojakEventSystem.getInstance().emit({
      type: WojakEvents.PORTFOLIO_UPDATE,
      amount: pnl,
      message: `Portfolio update: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%)`
    });
  }
};

// Hook for React components
export const useWojakEvents = () => {
  const eventSystem = WojakEventSystem.getInstance();
  
  return {
    on: eventSystem.on.bind(eventSystem),
    off: eventSystem.off.bind(eventSystem),
    emit: eventSystem.emit.bind(eventSystem),
    getRecentEvents: eventSystem.getRecentEvents.bind(eventSystem),
    trigger: triggerWojakEvent
  };
};