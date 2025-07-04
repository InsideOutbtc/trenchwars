'use client';

import { useState, useEffect } from 'react';

export default function BottomHUD() {
  const [chaosMessages, setChaosMessages] = useState<string[]>([
    'WOJAK.SYS: Calculating devastation...',
    'PEPE_ARMY.EXE: Mobilizing for battle',
    'REKT_DETECTOR: 420 anons liquidated',
    'COPIUM_LEVELS: CRITICALLY_LOW',
    'HOPIUM_INJECTION: REQUIRED'
  ]);

  const [memeStats] = useState([
    { icon: '🚀', text: 'TO_THE_MOON', count: '+1337' },
    { icon: '💎', text: 'DIAMOND_HANDS', count: '+420' },
    { icon: '🔥', text: 'ABSOLUTELY_BASED', count: '+69' },
    { icon: '💀', text: 'GET_REKT', count: '+666' },
    { icon: '🐸', text: 'PEPE_POWER', count: '+1488' }
  ]);

  const [leaderboard] = useState([
    { rank: '#1', wojak: '😎', name: 'ANON_CHAD', gains: '+$6969', negative: false },
    { rank: '#2', wojak: '🤑', name: 'PUMP_LORD', gains: '+$4200', negative: false },
    { rank: '#3', wojak: '😭', name: 'REKT_ANON', gains: '-$1337', negative: true },
    { rank: '#4', wojak: '😰', name: 'PAPER_HANDS', gains: '-$420', negative: true },
    { rank: '#5', wojak: '🤡', name: 'NGMI_FREN', gains: '-$69', negative: true }
  ]);

  useEffect(() => {
    const newMessages = [
      'DIAMOND_HANDS.DLL: Loading...',
      'MOON_MISSION: Preparing launch sequence',
      'CHAOS_ENGINE: Maximum overdrive',
      'BASED_DETECTOR: Signal detected',
      'COPIUM_RESERVES: Status DEPLETED',
      'WOJAK_EMOTIONS: Extreme volatility',
      'PEPE_PROTOCOL: Activating green candles'
    ];

    const messageInterval = setInterval(() => {
      setChaosMessages(prev => {
        const randomMessage = newMessages[Math.floor(Math.random() * newMessages.length)];
        return [randomMessage, ...prev.slice(0, 9)];
      });
    }, 3000);

    return () => clearInterval(messageInterval);
  }, []);

  return (
    <div className="bottom-hud">
      {/* Left Panel: Live Chaos Feed */}
      <div className="chaos-feed">
        <div className="panel-header">
          <span className="panel-title">💀 LIVE CHAOS FEED 💀</span>
          <span className="panel-status">MAXIMUM_OVERDRIVE</span>
        </div>
        <div className="feed-content">
          {chaosMessages.map((message, index) => (
            <div key={index} className="feed-line">
              {message}
            </div>
          ))}
        </div>
      </div>

      {/* Center Panel: Trending Memes */}
      <div className="meme-tracker">
        <div className="panel-header">
          <span className="panel-title">🐸 MEME TRACKER 🐸</span>
          <span className="panel-status">SCHIZO_MODE</span>
        </div>
        <div className="meme-list">
          {memeStats.map((meme, index) => (
            <div key={index} className="meme-item">
              <span className="meme-icon">{meme.icon}</span>
              <span className="meme-text">{meme.text}</span>
              <span className="meme-count">{meme.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel: Anon Leaderboard */}
      <div className="anon-leaderboard">
        <div className="panel-header">
          <span className="panel-title">👑 CHAD LEADERBOARD 👑</span>
          <span className="panel-status">BASED_RANKING</span>
        </div>
        <div className="leaderboard-list">
          {leaderboard.map((leader, index) => (
            <div key={index} className="leader-item">
              <span className="leader-rank">{leader.rank}</span>
              <span className="leader-wojak">{leader.wojak}</span>
              <span className="leader-name">{leader.name}</span>
              <span className={`leader-gains ${leader.negative ? 'negative' : ''}`}>
                {leader.gains}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}