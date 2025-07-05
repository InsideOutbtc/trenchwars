'use client';

import { useState, useEffect } from 'react';
import { gameSystem, formatMultiplier, formatStreakDisplay, getStreakEmoji, type StreakLevel, type Achievement } from '@/utils/gameSystem';
import { celebrateCustom } from '@/utils/celebrationSystem';

interface StreakDisplayProps {
  compact?: boolean;
  showProgress?: boolean;
  showAchievements?: boolean;
}

export default function StreakDisplay({ 
  compact = false, 
  showProgress = true, 
  showAchievements = true 
}: StreakDisplayProps) {
  const [gameStats, setGameStats] = useState(gameSystem.getStats());
  const [rankInfo, setRankInfo] = useState(gameSystem.getRankInfo());
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [nextAchievement, setNextAchievement] = useState<{ achievement: Achievement; progress: number } | null>(null);

  useEffect(() => {
    const handleStatsUpdate = (stats: any) => {
      setGameStats(stats);
      setRankInfo(gameSystem.getRankInfo());
      setUnlockedAchievements(gameSystem.getUnlockedAchievements());
      setNextAchievement(gameSystem.getAchievementProgress());
    };

    gameSystem.on('stats_updated', handleStatsUpdate);

    // Initialize data
    setUnlockedAchievements(gameSystem.getUnlockedAchievements());
    setNextAchievement(gameSystem.getAchievementProgress());

    return () => {
      gameSystem.off('stats_updated', handleStatsUpdate);
    };
  }, []);

  const handleStreakClick = () => {
    if (gameStats.currentStreak >= 5) {
      celebrateCustom('fire');
    }
  };

  const calculateProgressToNext = (): number => {
    if (!rankInfo.next) return 1;
    const winsNeeded = rankInfo.next.minStreak - rankInfo.current.minStreak;
    const winsProgress = gameStats.currentStreak - rankInfo.current.minStreak;
    return Math.min(winsProgress / winsNeeded, 1);
  };

  const getWinsToNext = (): number => {
    if (!rankInfo.next) return 0;
    return Math.max(0, rankInfo.next.minStreak - gameStats.currentStreak);
  };

  if (compact) {
    return (
      <div className="streak-display-compact">
        <div className="streak-info" onClick={handleStreakClick}>
          <span className="streak-emoji">{getStreakEmoji(gameStats.currentStreak)}</span>
          <span className="streak-value">{formatStreakDisplay(gameStats.currentStreak)}</span>
          <span className="multiplier-badge">{formatMultiplier(gameStats.streakMultiplier)}</span>
        </div>
        
        <div className="rank-info">
          <span className="rank-icon" style={{ color: rankInfo.current.color }}>
            {rankInfo.current.icon}
          </span>
          <span className="rank-name">{rankInfo.current.name}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="streak-display">
      {/* Current Streak Section */}
      <div className="streak-section">
        <div className="section-header">
          <h3 className="section-title">Current Streak</h3>
          <div className="streak-multiplier">
            <span className="multiplier-label">Multiplier:</span>
            <span className="multiplier-value">{formatMultiplier(gameStats.streakMultiplier)}</span>
          </div>
        </div>

        <div className="streak-main" onClick={handleStreakClick}>
          <div className="streak-visual">
            <span className="streak-emoji-large">{getStreakEmoji(gameStats.currentStreak)}</span>
            <div className="streak-numbers">
              <span className="streak-current">{gameStats.currentStreak}</span>
              <span className="streak-label">Win Streak</span>
            </div>
          </div>
          
          <div className="streak-stats">
            <div className="stat-item">
              <span className="stat-value">{gameStats.bestStreak}</span>
              <span className="stat-label">Best Streak</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{gameStats.totalWins}</span>
              <span className="stat-label">Total Wins</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{Math.round((gameStats.totalWins / (gameStats.totalWins + gameStats.totalLosses)) * 100) || 0}%</span>
              <span className="stat-label">Win Rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rank Progress Section */}
      {showProgress && (
        <div className="rank-section">
          <div className="section-header">
            <h3 className="section-title">Rank Progress</h3>
            <div className="current-rank" style={{ color: rankInfo.current.color }}>
              {rankInfo.current.icon} {rankInfo.current.name}
            </div>
          </div>

          <div className="rank-levels">
            {gameSystem.getStreakLevels().map((level, index) => {
              const isActive = gameStats.currentStreak >= level.minStreak;
              const isCurrent = level.name === rankInfo.current.name;
              const isNext = level.name === rankInfo.next?.name;

              return (
                <div 
                  key={level.name} 
                  className={`rank-level ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''} ${isNext ? 'next' : ''}`}
                >
                  <div className="level-icon" style={{ color: isActive ? level.color : '#666' }}>
                    {level.icon}
                  </div>
                  <div className="level-info">
                    <span className="level-name">{level.name}</span>
                    <span className="level-requirement">{level.minStreak}+ wins</span>
                    <span className="level-multiplier">{formatMultiplier(level.multiplier)}</span>
                  </div>
                  {isCurrent && (
                    <div className="level-badge">Current</div>
                  )}
                  {isNext && (
                    <div className="level-badge next-badge">
                      {getWinsToNext()} more wins
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress Bar to Next Rank */}
          {rankInfo.next && (
            <div className="progress-container">
              <div className="progress-header">
                <span>Progress to {rankInfo.next.icon} {rankInfo.next.name}</span>
                <span>{getWinsToNext()} wins remaining</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${calculateProgressToNext() * 100}%`,
                    backgroundColor: rankInfo.next.color
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Achievement Progress Section */}
      {showAchievements && (
        <div className="achievement-section">
          <div className="section-header">
            <h3 className="section-title">Achievements</h3>
            <div className="achievement-count">
              {gameStats.achievementsUnlocked.length} / {gameSystem.getAchievements().length}
            </div>
          </div>

          {/* Next Achievement Progress */}
          {nextAchievement && (
            <div className="next-achievement">
              <div className="achievement-header">
                <span className="achievement-icon">{nextAchievement.achievement.icon}</span>
                <div className="achievement-info">
                  <span className="achievement-name">{nextAchievement.achievement.name}</span>
                  <span className="achievement-description">{nextAchievement.achievement.description}</span>
                </div>
                <span className="achievement-progress-text">
                  {Math.round(nextAchievement.progress * 100)}%
                </span>
              </div>
              <div className="achievement-progress-bar">
                <div 
                  className="achievement-progress-fill"
                  style={{ width: `${nextAchievement.progress * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Recently Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <div className="unlocked-achievements">
              <h4 className="subsection-title">Recently Unlocked</h4>
              <div className="achievement-grid">
                {unlockedAchievements
                  .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
                  .slice(0, 6)
                  .map((achievement) => (
                    <div key={achievement.id} className="achievement-item unlocked">
                      <span className="achievement-icon">{achievement.icon}</span>
                      <div className="achievement-details">
                        <span className="achievement-name">{achievement.name}</span>
                        <span className="achievement-reward">{achievement.reward}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="streak-actions">
        <button 
          className="action-button simulate"
          onClick={() => gameSystem.simulateRandomBet()}
        >
          <span className="button-icon">🎲</span>
          <span className="button-text">Simulate Bet</span>
        </button>
        
        <button 
          className="action-button reset"
          onClick={() => {
            if (confirm('Reset all streak data? This cannot be undone.')) {
              gameSystem.resetStats();
            }
          }}
        >
          <span className="button-icon">🔄</span>
          <span className="button-text">Reset Stats</span>
        </button>
      </div>
    </div>
  );
}