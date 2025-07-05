'use client';

import { useState, useEffect } from 'react';

interface FeedItem {
  id: string;
  type: 'bet' | 'win' | 'loss' | 'system';
  timestamp: number;
  user?: string;
  action: string;
  amount?: number;
  token?: string;
  value?: number;
}

export default function LiveFeed() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'bets' | 'wins'>('all');

  const generateRandomFeedItem = (): FeedItem => {
    const types: FeedItem['type'][] = ['bet', 'win', 'loss', 'system'];
    const type = types[Math.floor(Math.random() * types.length)];
    const users = ['ANON_CHAD', 'DIAMOND_HANDS', 'PAPER_HANDS', 'MOON_BOY', 'BEAR_SLAYER', 'DEGEN_LORD', 'WOJAK_FAN', 'PEPE_LOVER'];
    const tokens = ['PEPE', 'SHIB', 'DOGE', 'WIF', 'BONK', 'FLOKI'];
    const systemMessages = [
      'New war started: DOGE vs WIF',
      'War #042 ended - PEPE wins!',
      'System maintenance in 5 minutes',
      'New token listed: WOJAK',
      'Total volume surpassed $1M',
      'Lucky anon won 100 SOL jackpot'
    ];

    const baseItem: FeedItem = {
      id: Date.now().toString() + Math.random(),
      type,
      timestamp: Date.now()
    };

    switch (type) {
      case 'bet':
        return {
          ...baseItem,
          user: users[Math.floor(Math.random() * users.length)],
          action: 'bet',
          amount: parseFloat((Math.random() * 50 + 0.1).toFixed(3)),
          token: tokens[Math.floor(Math.random() * tokens.length)],
          value: parseFloat((Math.random() * 5000 + 100).toFixed(0))
        };
      
      case 'win':
        return {
          ...baseItem,
          user: users[Math.floor(Math.random() * users.length)],
          action: 'won',
          amount: parseFloat((Math.random() * 100 + 10).toFixed(3)),
          value: parseFloat((Math.random() * 10000 + 500).toFixed(0))
        };
      
      case 'loss':
        return {
          ...baseItem,
          user: users[Math.floor(Math.random() * users.length)],
          action: 'got rekt for',
          amount: parseFloat((Math.random() * 25 + 5).toFixed(3)),
          value: parseFloat((Math.random() * 3000 + 200).toFixed(0))
        };
      
      case 'system':
        return {
          ...baseItem,
          action: systemMessages[Math.floor(Math.random() * systemMessages.length)]
        };
      
      default:
        return baseItem;
    }
  };

  useEffect(() => {
    // Initialize with some items
    const initialItems = Array.from({ length: 8 }, generateRandomFeedItem);
    setFeedItems(initialItems);

    // Add new items periodically
    const interval = setInterval(() => {
      const newItem = generateRandomFeedItem();
      setFeedItems(prev => [newItem, ...prev.slice(0, 49)]); // Keep last 50 items
    }, Math.random() * 3000 + 2000); // 2-5 seconds

    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    return `${Math.floor(diff / 3600)}h`;
  };

  const formatAmount = (amount: number) => {
    return `${amount.toFixed(3)} SOL`;
  };

  const formatValue = (value: number) => {
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value}`;
  };

  const filteredItems = feedItems.filter(item => {
    switch (activeFilter) {
      case 'bets': return item.type === 'bet';
      case 'wins': return item.type === 'win';
      default: return true;
    }
  });

  const renderFeedItem = (item: FeedItem) => {
    const timeAgo = formatTime(item.timestamp);
    
    switch (item.type) {
      case 'bet':
        return (
          <div key={item.id} className="feed-item fade-in">
            <div className="item-time text-xs">{timeAgo}</div>
            <div className="item-content">
              <span className="user-tag">{item.user}</span>
              <span className="action-text">bet</span>
              <span className="amount-value mono">{formatAmount(item.amount!)}</span>
              <span className="action-text">on</span>
              <span className="token-tag">{item.token}</span>
            </div>
            <div className="item-value neutral text-sm mono">{formatValue(item.value!)}</div>
          </div>
        );
      
      case 'win':
        return (
          <div key={item.id} className="feed-item fade-in">
            <div className="item-time text-xs">{timeAgo}</div>
            <div className="item-content">
              <span className="user-tag">{item.user}</span>
              <span className="action-text">won</span>
              <span className="amount-value mono">{formatAmount(item.amount!)}</span>
            </div>
            <div className="item-value positive text-sm mono">+{formatValue(item.value!)}</div>
          </div>
        );
      
      case 'loss':
        return (
          <div key={item.id} className="feed-item fade-in">
            <div className="item-time text-xs">{timeAgo}</div>
            <div className="item-content">
              <span className="user-tag">{item.user}</span>
              <span className="action-text">{item.action}</span>
              <span className="amount-value mono">{formatAmount(item.amount!)}</span>
            </div>
            <div className="item-value negative text-sm mono">-{formatValue(item.value!)}</div>
          </div>
        );
      
      case 'system':
        return (
          <div key={item.id} className="feed-item fade-in">
            <div className="item-time text-xs">{timeAgo}</div>
            <div className="item-content">
              <span className="system-tag">SYSTEM</span>
              <span className="action-text">{item.action}</span>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="activity-feed">
      <div className="feed-header">
        <h3 className="feed-title text-lg">Live Activity</h3>
        <div className="feed-controls">
          <button 
            className={`feed-filter text-xs ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button 
            className={`feed-filter text-xs ${activeFilter === 'bets' ? 'active' : ''}`}
            onClick={() => setActiveFilter('bets')}
          >
            Bets
          </button>
          <button 
            className={`feed-filter text-xs ${activeFilter === 'wins' ? 'active' : ''}`}
            onClick={() => setActiveFilter('wins')}
          >
            Wins
          </button>
        </div>
      </div>

      <div className="feed-content">
        {filteredItems.length === 0 ? (
          <div className="feed-item">
            <div className="item-content">
              <span className="action-text">No activity to show</span>
            </div>
          </div>
        ) : (
          filteredItems.map(renderFeedItem)
        )}
      </div>

      {/* Live indicator */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '120px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '10px',
        color: 'var(--green-positive)',
        fontWeight: '500'
      }}>
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: 'var(--green-positive)',
          animation: 'pulse 1s infinite'
        }} />
        LIVE
      </div>
    </div>
  );
}