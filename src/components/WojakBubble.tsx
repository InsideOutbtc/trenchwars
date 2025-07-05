'use client';

import { useState, useEffect, useRef } from 'react';
import { WojakEvents, WojakEventData, useWojakEvents } from '@/utils/wojakEvents';
import { gameSystem, formatMultiplier, formatStreakDisplay, getStreakEmoji } from '@/utils/gameSystem';
import { getWojakConfiguration, determineWojakMood, type WojakMood } from '@/utils/wojakImageGenerator';
import { celebrationSystem, celebrateWin, celebrateAchievement } from '@/utils/celebrationSystem';

interface WojakBubbleProps {
  pnl: number;
  pnlPercentage: number;
  onQuickBet?: () => void;
  onViewPortfolio?: () => void;
}

interface ActivityItem {
  type: 'win' | 'loss' | 'bet';
  icon: string;
  text: string;
  value: string;
}


export default function WojakBubble({ pnl, pnlPercentage, onQuickBet, onViewPortfolio }: WojakBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentMood, setCurrentMood] = useState<WojakMood>('neutral');
  const [showNotification, setShowNotification] = useState(false);
  const [showSpeech, setShowSpeech] = useState(false);
  const [speechMessage, setSpeechMessage] = useState('');
  const [showPulse, setShowPulse] = useState(false);
  const [gameStats, setGameStats] = useState(gameSystem.getStats());
  const [recentAchievements, setRecentAchievements] = useState<string[]>([]);
  const [rankInfo, setRankInfo] = useState(gameSystem.getRankInfo());
  const autoCloseTimer = useRef<NodeJS.Timeout | null>(null);
  const speechTimer = useRef<NodeJS.Timeout | null>(null);
  const lastPnl = useRef<number>(pnl);
  
  // Wojak event system
  const wojakEvents = useWojakEvents();

  // Mock activity data
  const [activityItems] = useState<ActivityItem[]>([
    { type: 'win', icon: '🏆', text: 'Won PEPE bet', value: '+$15.20' },
    { type: 'loss', icon: '💀', text: 'SHIB got rekt', value: '-$8.50' },
    { type: 'win', icon: '🚀', text: 'DOGE pump', value: '+$23.80' },
  ]);

  // Game system integration
  useEffect(() => {
    const handleStatsUpdate = (stats: any) => {
      setGameStats(stats);
      setRankInfo(gameSystem.getRankInfo());
    };

    const handleAchievementUnlock = (achievement: any) => {
      setRecentAchievements(prev => [achievement.id, ...prev.slice(0, 2)]);
      celebrateAchievement(achievement.id);
      showSpeechBubble(`Achievement: ${achievement.name}! 🎯`);
      triggerNotification();
    };

    const handleWin = (data: any) => {
      celebrateWin(data.amount, data.streak);
      if (data.isNewRecord) {
        showSpeechBubble(`NEW RECORD STREAK! ${data.streak}W! 🏆`);
      }
    };

    const handleRankChange = (data: any) => {
      showSpeechBubble(`RANK UP! ${data.newRank}! ${data.level.icon}`);
      triggerNotification();
    };

    gameSystem.on('stats_updated', handleStatsUpdate);
    gameSystem.on('achievement_unlocked', handleAchievementUnlock);
    gameSystem.on('win', handleWin);
    gameSystem.on('rank_changed', handleRankChange);

    return () => {
      gameSystem.off('stats_updated', handleStatsUpdate);
      gameSystem.off('achievement_unlocked', handleAchievementUnlock);
      gameSystem.off('win', handleWin);
      gameSystem.off('rank_changed', handleRankChange);
    };
  }, []);

  // Get comprehensive mood data including streak and multiplier info
  const getMoodData = (mood: WojakMood) => {
    const wojakConfig = getWojakConfiguration(mood);
    const currentLevel = rankInfo.current;
    
    return {
      vibe: currentLevel.name.toUpperCase(),
      cope: Math.max(0, Math.min(100, 100 - (gameStats.currentStreak * 10))),
      message: wojakConfig.message,
      speech: wojakConfig.message,
      multiplier: gameStats.streakMultiplier,
      streak: gameStats.currentStreak,
      rank: currentLevel,
      image: wojakConfig.imageSrc
    };
  };

  // Handle mood changes and P&L tracking with game system integration
  useEffect(() => {
    const newMood = gameSystem.getCurrentWojakMood(pnl);
    const oldMood = currentMood;
    const pnlDifference = pnl - lastPnl.current;

    // Update P&L tracking
    lastPnl.current = pnl;

    // Emit portfolio update event
    wojakEvents.trigger.portfolioUpdate(pnl, pnlPercentage);

    // Check for significant P&L changes and process as game results
    if (Math.abs(pnlDifference) >= 50) {
      if (pnlDifference > 0) {
        gameSystem.processBetResult(true, Math.abs(pnlDifference), pnlDifference);
        wojakEvents.trigger.bigWin(pnlDifference);
      } else {
        gameSystem.processBetResult(false, Math.abs(pnlDifference), 0);
        wojakEvents.trigger.bigLoss(pnlDifference);
      }
    }

    if (newMood !== oldMood) {
      setCurrentMood(newMood);
      wojakEvents.trigger.moodChange(oldMood, newMood);

      // Trigger notifications for significant changes
      const significantChanges: WojakMood[] = ['chad', 'crying', 'god', 'diamond', 'whale'];
      if (significantChanges.includes(newMood)) {
        triggerNotification();
        showSpeechBubble(getMoodData(newMood).speech);

        // Auto-open for dramatic changes
        if (!isExpanded) {
          setTimeout(() => setIsExpanded(true), 1000);
        }
      }
    }
  }, [pnl, pnlPercentage, currentMood, isExpanded, wojakEvents, gameStats]);

  // Event system integration
  useEffect(() => {
    const handleWojakEvent = (eventData: WojakEventData) => {
      switch (eventData.type) {
        case WojakEvents.BIG_WIN:
          triggerNotification();
          showSpeechBubble(eventData.message || 'HUGE WIN ANON! 🚀');
          if (!isExpanded) {
            setTimeout(() => setIsExpanded(true), 1500);
          }
          break;
          
        case WojakEvents.BIG_LOSS:
          triggerNotification();
          showSpeechBubble(eventData.message || 'REKT... F 💀');
          if (!isExpanded) {
            setTimeout(() => setIsExpanded(true), 1500);
          }
          break;
          
        case WojakEvents.BATTLE_WON:
          triggerNotification();
          showSpeechBubble(eventData.message || `${eventData.token} WINS! 🏆`);
          break;
          
        case WojakEvents.BATTLE_LOST:
          showSpeechBubble(eventData.message || `${eventData.token} lost... 💀`);
          break;
          
        case WojakEvents.NEW_BATTLE:
          showSpeechBubble(eventData.message || 'New battle started!');
          break;
          
        case WojakEvents.ACHIEVEMENT:
          triggerNotification();
          showSpeechBubble(eventData.message || `Achievement unlocked! 🎯`);
          break;
      }
    };

    // Subscribe to all events
    Object.values(WojakEvents).forEach(eventType => {
      wojakEvents.on(eventType, handleWojakEvent);
    });

    // Cleanup
    return () => {
      Object.values(WojakEvents).forEach(eventType => {
        wojakEvents.off(eventType, handleWojakEvent);
      });
    };
  }, [isExpanded, wojakEvents]);

  const triggerNotification = () => {
    setShowNotification(true);
    setShowPulse(true);

    // Auto-clear after 10 seconds
    setTimeout(() => {
      setShowNotification(false);
      setShowPulse(false);
    }, 10000);
  };

  const showSpeechBubble = (message: string) => {
    setSpeechMessage(message);
    setShowSpeech(true);

    // Clear existing timer
    if (speechTimer.current) {
      clearTimeout(speechTimer.current);
    }

    // Auto-hide after 5 seconds
    speechTimer.current = setTimeout(() => {
      setShowSpeech(false);
    }, 5000);
  };

  const togglePanel = () => {
    if (isExpanded) {
      closePanel();
    } else {
      openPanel();
    }
  };

  const openPanel = () => {
    setIsExpanded(true);
    clearNotifications();
    resetAutoClose();
  };

  const closePanel = () => {
    setIsExpanded(false);
    if (autoCloseTimer.current) {
      clearTimeout(autoCloseTimer.current);
    }
  };

  const clearNotifications = () => {
    setShowNotification(false);
    setShowPulse(false);
  };

  const resetAutoClose = () => {
    if (autoCloseTimer.current) {
      clearTimeout(autoCloseTimer.current);
    }
    autoCloseTimer.current = setTimeout(() => {
      if (isExpanded) {
        closePanel();
      }
    }, 15000);
  };

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.wojak-bubble') && !target.closest('.wojak-panel')) {
        closePanel();
      }
    };

    if (isExpanded) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isExpanded]);

  // Format P&L values
  const formatPnL = (value: number): string => {
    return value >= 0 ? `+$${value.toFixed(2)}` : `-$${Math.abs(value).toFixed(2)}`;
  };

  const formatPercentage = (value: number): string => {
    return value >= 0 ? `+${value.toFixed(1)}%` : `${value.toFixed(1)}%`;
  };

  const moodData = getMoodData(currentMood);
  const isPositive = pnl >= 0;
  const nextLevel = rankInfo.next;
  const progressToNext = nextLevel ? rankInfo.progress : 1;
  const winsToNext = nextLevel ? nextLevel.minStreak - gameStats.currentStreak : 0;

  if (!isExpanded) {
    // Collapsed bubble state
    return (
      <div className="wojak-bubble-container">
        <div className="wojak-bubble" onClick={togglePanel}>
          {/* Pulse ring for alerts */}
          {showPulse && <div className="pulse-ring" />}
          
          {/* Notification dot */}
          {showNotification && <div className="notification-dot" />}
          
          <div className="bubble-content">
            <img src={moodData.image} className="bubble-wojak" alt="Wojak" />
            <div className="bubble-info">
              <span className={`bubble-pnl ${isPositive ? 'positive' : 'negative'}`}>
                {formatPnL(pnl)}
              </span>
              <span className={`bubble-change ${isPositive ? 'positive' : 'negative'}`}>
                {formatPercentage(pnlPercentage)}
              </span>
            </div>
          </div>
        </div>

        {/* Speech bubble */}
        {showSpeech && (
          <div className="wojak-speech">
            <div className="speech-text">{speechMessage}</div>
            <div className="speech-tail" />
          </div>
        )}
      </div>
    );
  }

  // Expanded panel state
  return (
    <div className="wojak-panel">
      <div className="panel-header">
        <div className="header-left">
          <img src={moodData.image} className="panel-wojak" alt="Wojak" />
          <div className="header-info">
            <span className="panel-title">Portfolio Status</span>
            <span className="panel-subtitle">{moodData.message}</span>
          </div>
        </div>
        <button className="panel-close" onClick={closePanel}>×</button>
      </div>

      {/* P&L Section */}
      <div className="pnl-section">
        <div className="pnl-main">
          <div className={`pnl-value ${isPositive ? 'positive' : 'negative'}`}>
            {formatPnL(pnl)}
          </div>
          <div className={`pnl-percentage ${isPositive ? 'positive' : 'negative'}`}>
            {formatPercentage(pnlPercentage)}
          </div>
          <div className="pnl-period">24h P&L</div>
        </div>
        
        <div className="pnl-chart">
          <canvas width="120" height="40" style={{ background: 'var(--bg-elevated)', borderRadius: '4px' }} />
        </div>
      </div>

      {/* Status Indicators */}
      <div className="status-section">
        <div className="status-row">
          <span className="status-label">Vibe:</span>
          <span className={`status-value ${isPositive ? 'positive' : 'negative'}`}>
            {moodData.vibe}
          </span>
        </div>
        <div className="status-row">
          <span className="status-label">Cope:</span>
          <div className="cope-meter">
            <div className="cope-bar">
              <div 
                className="cope-fill" 
                style={{ width: `${moodData.cope}%` }}
              />
            </div>
            <span className="cope-percentage">{moodData.cope}%</span>
          </div>
        </div>
        <div className="status-row">
          <span className="status-label">Streak:</span>
          <span className="status-value streak-display">
            {getStreakEmoji(gameStats.currentStreak)} {formatStreakDisplay(gameStats.currentStreak)}
          </span>
        </div>
        <div className="status-row">
          <span className="status-label">Multiplier:</span>
          <span className="status-value multiplier-display">
            {formatMultiplier(gameStats.streakMultiplier)}
          </span>
        </div>
        <div className="status-row">
          <span className="status-label">Rank:</span>
          <span className="status-value rank-display" style={{ color: rankInfo.current.color }}>
            {rankInfo.current.icon} {rankInfo.current.name}
          </span>
        </div>
      </div>

      {/* Streak Progress */}
      {nextLevel && (
        <div className="progress-section">
          <h4 className="section-title">Progress to {nextLevel.name}</h4>
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${progressToNext * 100}%`,
                  backgroundColor: nextLevel.color
                }}
              />
            </div>
            <div className="progress-text">
              {winsToNext} wins to {nextLevel.icon} {nextLevel.name}
            </div>
          </div>
        </div>
      )}

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <div className="achievement-section">
          <h4 className="section-title">Recent Achievements</h4>
          <div className="achievement-list">
            {recentAchievements.map((achievementId, index) => {
              const achievement = gameSystem.getAchievements().find(a => a.id === achievementId);
              if (!achievement) return null;
              return (
                <div key={index} className="achievement-item">
                  <span className="achievement-icon">{achievement.icon}</span>
                  <div className="achievement-info">
                    <span className="achievement-name">{achievement.name}</span>
                    <span className="achievement-reward">{achievement.reward}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="activity-section">
        <h4 className="section-title">Game Stats</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{gameStats.totalWins}</span>
            <span className="stat-label">Wins</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{gameStats.totalLosses}</span>
            <span className="stat-label">Losses</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{gameStats.bestStreak}</span>
            <span className="stat-label">Best Streak</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{gameStats.achievementsUnlocked.length}</span>
            <span className="stat-label">Achievements</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="actions-section">
        <button className="action-btn primary" onClick={onQuickBet}>
          <span className="btn-icon">⚡</span>
          <span className="btn-text">Quick Bet</span>
        </button>
        <button className="action-btn secondary" onClick={onViewPortfolio}>
          <span className="btn-icon">📊</span>
          <span className="btn-text">Full Stats</span>
        </button>
      </div>

      {/* Wojak Messages */}
      <div className="message-section">
        <div className="wojak-message">
          "{moodData.message}"
        </div>
      </div>
    </div>
  );
}