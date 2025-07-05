'use client';

import { useState, useEffect } from 'react';
import { gameSystem, type Achievement, type StreakLevel } from '@/utils/gameSystem';
import { celebrationSystem } from '@/utils/celebrationSystem';
import StreakDisplay from './StreakDisplay';

interface GameificationOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function GameificationOverlay({ isVisible, onClose }: GameificationOverlayProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'leaderboard'>('overview');
  const [gameStats, setGameStats] = useState(gameSystem.getStats());
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);

  useEffect(() => {
    const handleStatsUpdate = (stats: any) => {
      setGameStats(stats);
    };

    const handleAchievementUnlock = (achievement: Achievement) => {
      setRecentActivity(prev => [`🎯 Unlocked: ${achievement.name}`, ...prev.slice(0, 9)]);
    };

    const handleWin = (data: any) => {
      setRecentActivity(prev => [`🏆 Won ${data.amount.toFixed(2)} SOL (${data.streak}W streak)`, ...prev.slice(0, 9)]);
    };

    const handleLoss = (data: any) => {
      setRecentActivity(prev => [`💀 Lost ${data.amount.toFixed(2)} SOL (streak broken)`, ...prev.slice(0, 9)]);
    };

    const handleRankChange = (data: any) => {
      setRecentActivity(prev => [`👑 Rank up: ${data.newRank}!`, ...prev.slice(0, 9)]);
    };

    gameSystem.on('stats_updated', handleStatsUpdate);
    gameSystem.on('achievement_unlocked', handleAchievementUnlock);
    gameSystem.on('win', handleWin);
    gameSystem.on('loss', handleLoss);
    gameSystem.on('rank_changed', handleRankChange);

    // Initialize data
    setAchievements(gameSystem.getAchievements());

    return () => {
      gameSystem.off('stats_updated', handleStatsUpdate);
      gameSystem.off('achievement_unlocked', handleAchievementUnlock);
      gameSystem.off('win', handleWin);
      gameSystem.off('loss', handleLoss);
      gameSystem.off('rank_changed', handleRankChange);
    };
  }, []);

  const handleTestCelebration = () => {
    celebrationSystem.triggerCelebration('explosion');
  };

  const handleUnlockAchievement = (achievementId: string) => {
    gameSystem.unlockAchievementById(achievementId);
  };

  if (!isVisible) return null;

  return (
    <div className="gamification-overlay">
      <div className="overlay-backdrop" onClick={onClose} />
      
      <div className="overlay-content">
        <div className="overlay-header">
          <h2 className="overlay-title">🎮 TrenchWars Gamification</h2>
          <button className="overlay-close" onClick={onClose}>×</button>
        </div>

        <div className="overlay-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            🏆 Achievements
          </button>
          <button 
            className={`tab-button ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            👑 Hall of Fame
          </button>
        </div>

        <div className="overlay-body">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="overview-grid">
                <div className="overview-section">
                  <StreakDisplay compact={false} showProgress={true} showAchievements={true} />
                </div>

                <div className="overview-section">
                  <h3 className="section-title">Performance Metrics</h3>
                  <div className="metrics-grid">
                    <div className="metric-card">
                      <span className="metric-value">${gameStats.lifetimePnL.toFixed(2)}</span>
                      <span className="metric-label">Lifetime P&L</span>
                      <span className="metric-icon">💰</span>
                    </div>
                    <div className="metric-card">
                      <span className="metric-value">${gameStats.totalVolume.toFixed(0)}</span>
                      <span className="metric-label">Total Volume</span>
                      <span className="metric-icon">📈</span>
                    </div>
                    <div className="metric-card">
                      <span className="metric-value">${gameStats.biggestWin.toFixed(2)}</span>
                      <span className="metric-label">Biggest Win</span>
                      <span className="metric-icon">🚀</span>
                    </div>
                    <div className="metric-card">
                      <span className="metric-value">${gameStats.biggestLoss.toFixed(2)}</span>
                      <span className="metric-label">Biggest Loss</span>
                      <span className="metric-icon">💀</span>
                    </div>
                  </div>
                </div>

                <div className="overview-section">
                  <h3 className="section-title">Recent Activity</h3>
                  <div className="activity-feed">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity, index) => (
                        <div key={index} className="activity-item">
                          <span className="activity-text">{activity}</span>
                          <span className="activity-time">
                            {new Date(Date.now() - index * 60000).toLocaleTimeString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <span className="empty-icon">📝</span>
                        <span className="empty-text">No recent activity</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="achievements-tab">
              <div className="achievements-header">
                <h3 className="section-title">Achievement Collection</h3>
                <div className="achievement-stats">
                  <span className="unlocked-count">
                    {achievements.filter(a => a.isUnlocked).length} / {achievements.length} Unlocked
                  </span>
                  <div className="progress-bar-small">
                    <div 
                      className="progress-fill-small"
                      style={{ 
                        width: `${(achievements.filter(a => a.isUnlocked).length / achievements.length) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="achievements-grid">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`achievement-card ${achievement.isUnlocked ? 'unlocked' : 'locked'}`}
                  >
                    <div className="achievement-icon-large">
                      {achievement.isUnlocked ? achievement.icon : '🔒'}
                    </div>
                    <div className="achievement-content">
                      <h4 className="achievement-name">
                        {achievement.isUnlocked ? achievement.name : '???'}
                      </h4>
                      <p className="achievement-description">
                        {achievement.isUnlocked ? achievement.description : 'Complete more battles to unlock'}
                      </p>
                      <div className="achievement-reward">
                        <span className="reward-label">Reward:</span>
                        <span className="reward-text">
                          {achievement.isUnlocked ? achievement.reward : 'Hidden'}
                        </span>
                      </div>
                      {achievement.isUnlocked && achievement.unlockedAt && (
                        <div className="achievement-unlocked-date">
                          Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    {!achievement.isUnlocked && (
                      <button 
                        className="debug-unlock-btn"
                        onClick={() => handleUnlockAchievement(achievement.id)}
                        title="Debug: Force unlock"
                      >
                        🔓
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="leaderboard-tab">
              <div className="hall-of-fame">
                <h3 className="section-title">🏛️ Hall of Fame</h3>
                
                <div className="leaderboard-categories">
                  <div className="category-card">
                    <h4 className="category-title">👑 Longest Streak</h4>
                    <div className="leaderboard-entry champion">
                      <span className="position">🥇</span>
                      <span className="player-name">You</span>
                      <span className="score">{gameStats.bestStreak}W</span>
                    </div>
                  </div>

                  <div className="category-card">
                    <h4 className="category-title">💰 Biggest Win</h4>
                    <div className="leaderboard-entry champion">
                      <span className="position">🥇</span>
                      <span className="player-name">You</span>
                      <span className="score">${gameStats.biggestWin.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="category-card">
                    <h4 className="category-title">🎯 Achievement Hunter</h4>
                    <div className="leaderboard-entry champion">
                      <span className="position">🥇</span>
                      <span className="player-name">You</span>
                      <span className="score">{gameStats.achievementsUnlocked.length} badges</span>
                    </div>
                  </div>

                  <div className="category-card">
                    <h4 className="category-title">📈 Volume King</h4>
                    <div className="leaderboard-entry champion">
                      <span className="position">🥇</span>
                      <span className="player-name">You</span>
                      <span className="score">${gameStats.totalVolume.toFixed(0)}</span>
                    </div>
                  </div>
                </div>

                <div className="coming-soon">
                  <h4>🚀 Coming Soon</h4>
                  <p>Global leaderboards with real player rankings, seasonal competitions, and exclusive rewards for top performers!</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="overlay-footer">
          <button className="test-button" onClick={handleTestCelebration}>
            🎆 Test Celebration
          </button>
          <button className="demo-button" onClick={() => gameSystem.simulateRandomBet()}>
            🎲 Simulate Bet
          </button>
          <div className="footer-info">
            <span>Last updated: {new Date(gameStats.lastUpdated).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}