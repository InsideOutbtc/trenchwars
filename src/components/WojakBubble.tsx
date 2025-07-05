'use client';

import { useState, useEffect, useRef } from 'react';
import { WojakEvents, WojakEventData, useWojakEvents } from '@/utils/wojakEvents';

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

type WojakMood = 'chad' | 'comfy' | 'neutral' | 'coping' | 'crying';

export default function WojakBubble({ pnl, pnlPercentage, onQuickBet, onViewPortfolio }: WojakBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentMood, setCurrentMood] = useState<WojakMood>('neutral');
  const [showNotification, setShowNotification] = useState(false);
  const [showSpeech, setShowSpeech] = useState(false);
  const [speechMessage, setSpeechMessage] = useState('');
  const [showPulse, setShowPulse] = useState(false);
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

  // Determine wojak mood based on P&L
  const getWojakMood = (pnlValue: number): WojakMood => {
    if (pnlValue >= 100) return 'chad';
    if (pnlValue > 0) return 'comfy';
    if (pnlValue >= -1) return 'neutral';
    if (pnlValue >= -50) return 'coping';
    return 'crying';
  };

  // Get wojak image source with fallback
  const getWojakImage = (mood: WojakMood): string => {
    // Since we don't have actual wojak images, use data URIs for authentic wojak appearance
    const wojaks = {
      chad: getWojakDataURI('chad'),
      comfy: getWojakDataURI('comfy'),
      neutral: getWojakDataURI('neutral'),
      coping: getWojakDataURI('coping'),
      crying: getWojakDataURI('crying')
    };
    return wojaks[mood];
  };

  // Generate authentic wojak-style SVG as data URI
  const getWojakDataURI = (mood: WojakMood): string => {
    let eyeExpression = '';
    let mouthExpression = '';
    let extraElements = '';

    switch (mood) {
      case 'chad':
        eyeExpression = '<circle cx="22" cy="25" r="1.5" fill="#000"/><circle cx="38" cy="25" r="1.5" fill="#000"/>';
        mouthExpression = '<path d="M24 35 Q30 32 36 35" stroke="#000" stroke-width="1.5" fill="none"/>';
        extraElements = '<rect x="20" y="22" width="8" height="4" fill="#000" opacity="0.6" rx="2"/>'; // sunglasses
        break;
      case 'comfy':
        eyeExpression = '<circle cx="22" cy="25" r="2" fill="#000"/><circle cx="38" cy="25" r="2" fill="#000"/>';
        mouthExpression = '<path d="M24 35 Q30 32 36 35" stroke="#000" stroke-width="1.5" fill="none"/>';
        break;
      case 'neutral':
        eyeExpression = '<circle cx="22" cy="25" r="2" fill="#000"/><circle cx="38" cy="25" r="2" fill="#000"/>';
        mouthExpression = '<path d="M26 35 Q30 37 34 35" stroke="#000" stroke-width="1.5" fill="none"/>';
        break;
      case 'coping':
        eyeExpression = '<ellipse cx="22" cy="25" rx="3" ry="2" fill="#000"/><ellipse cx="38" cy="25" rx="3" ry="2" fill="#000"/>';
        mouthExpression = '<path d="M24 37 Q30 40 36 37" stroke="#000" stroke-width="1.5" fill="none"/>';
        extraElements = '<path d="M20 20 Q25 15 30 20" stroke="#87CEEB" stroke-width="0.5" opacity="0.7"/>'; // sweat
        break;
      case 'crying':
        eyeExpression = '<circle cx="22" cy="25" r="2" fill="#000"/><circle cx="38" cy="25" r="2" fill="#000"/>';
        mouthExpression = '<path d="M24 40 Q30 45 36 40" stroke="#000" stroke-width="1.5" fill="none"/>';
        extraElements = '<path d="M22 28 Q20 35 18 42" stroke="#87CEEB" stroke-width="1.5"/><path d="M38 28 Q40 35 42 42" stroke="#87CEEB" stroke-width="1.5"/>'; // tears
        break;
    }

    const svg = `<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <!-- Head shape (balding) -->
      <ellipse cx="30" cy="35" rx="18" ry="22" fill="#fdbcb4"/>
      
      <!-- Hair on sides/back -->
      <path d="M12 25 Q10 20 15 18 Q20 15 25 18" fill="#8B4513"/>
      <path d="M48 25 Q50 20 45 18 Q40 15 35 18" fill="#8B4513"/>
      <path d="M15 45 Q12 50 15 52 Q20 55 25 52" fill="#8B4513"/>
      <path d="M45 45 Q48 50 45 52 Q40 55 35 52" fill="#8B4513"/>
      
      <!-- Large nose -->
      <ellipse cx="30" cy="30" rx="3" ry="5" fill="#e6a89a"/>
      
      <!-- Eyes -->
      ${eyeExpression}
      
      <!-- Mouth -->
      ${mouthExpression}
      
      <!-- Additional mood elements -->
      ${extraElements}
      
      <!-- Face outline -->
      <ellipse cx="30" cy="35" rx="18" ry="22" fill="none" stroke="#d4a574" stroke-width="0.5"/>
    </svg>`;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  // Get mood text and messages
  const getMoodData = (mood: WojakMood) => {
    const moodData = {
      chad: {
        vibe: 'CHAD',
        cope: 5,
        message: 'ANON IS ABSOLUTELY BASED! 🚀',
        speech: 'HOLY SHIT ANON! ABSOLUTE CHAD!'
      },
      comfy: {
        vibe: 'COMFY',
        cope: 25,
        message: 'Feeling comfy anon 😊',
        speech: 'Comfy vibes, keep it up anon!'
      },
      neutral: {
        vibe: 'NEUTRAL',
        cope: 50,
        message: 'Staying neutral... for now',
        speech: 'Crabbing sideways... classic'
      },
      coping: {
        vibe: 'COPING',
        cope: 75,
        message: 'Diamond hands anon... diamond hands 💎',
        speech: 'This is fine... totally fine... 💎🙌'
      },
      crying: {
        vibe: 'REKT',
        cope: 95,
        message: 'NGMI... but maybe next time? 😭',
        speech: 'JUST... why anon... why... 😭'
      }
    };
    return moodData[mood];
  };

  // Handle mood changes and P&L tracking
  useEffect(() => {
    const newMood = getWojakMood(pnl);
    const oldMood = currentMood;
    const pnlDifference = pnl - lastPnl.current;

    // Update P&L tracking
    lastPnl.current = pnl;

    // Emit portfolio update event
    wojakEvents.trigger.portfolioUpdate(pnl, pnlPercentage);

    // Check for significant P&L changes
    if (Math.abs(pnlDifference) >= 50) {
      if (pnlDifference > 0) {
        wojakEvents.trigger.bigWin(pnlDifference);
      } else {
        wojakEvents.trigger.bigLoss(pnlDifference);
      }
    }

    if (newMood !== oldMood) {
      setCurrentMood(newMood);
      wojakEvents.trigger.moodChange(oldMood, newMood);

      // Trigger notifications for significant changes
      const significantChanges: WojakMood[] = ['chad', 'crying'];
      if (significantChanges.includes(newMood)) {
        triggerNotification();
        showSpeechBubble(getMoodData(newMood).speech);

        // Auto-open for dramatic changes
        if (!isExpanded) {
          setTimeout(() => setIsExpanded(true), 1000);
        }
      }
    }
  }, [pnl, pnlPercentage, currentMood, isExpanded, wojakEvents]);

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
  const wojakImage = getWojakImage(currentMood);
  const isPositive = pnl >= 0;

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
            <img src={wojakImage} className="bubble-wojak" alt="Wojak" />
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
          <img src={wojakImage} className="panel-wojak" alt="Wojak" />
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
          <span className="status-value">3W</span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <h4 className="section-title">Recent Activity</h4>
        <div className="activity-list">
          {activityItems.map((item, index) => (
            <div key={index} className={`activity-item ${item.type}`}>
              <span className="activity-icon">{item.icon}</span>
              <span className="activity-text">{item.text}</span>
              <span className={`activity-value ${item.type === 'win' ? 'positive' : 'negative'}`}>
                {item.value}
              </span>
            </div>
          ))}
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