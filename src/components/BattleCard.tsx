'use client';

import { useState, useEffect } from 'react';

interface Token {
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  icon: string;
}

interface BattleCardProps {
  warId: string;
  category: string;
  status: 'LIVE' | 'UPCOMING' | 'ENDED';
  timeRemaining: string;
  tokenA: Token;
  tokenB: Token;
  totalVolume: number;
  participantCount: number;
  onBetClick: (tokenSymbol: string) => void;
}

export default function BattleCard({
  warId,
  category,
  status,
  timeRemaining,
  tokenA,
  tokenB,
  totalVolume,
  participantCount,
  onBetClick
}: BattleCardProps) {
  const [distribution, setDistribution] = useState({ a: 67.3, b: 32.7 });
  const [volumeA, setVolumeA] = useState(0);
  const [volumeB, setVolumeB] = useState(0);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 2;
      setDistribution(prev => {
        const newA = Math.max(5, Math.min(95, prev.a + change));
        return { a: newA, b: 100 - newA };
      });
    }, 3000);

    // Calculate volumes
    setVolumeA(totalVolume * (distribution.a / 100));
    setVolumeB(totalVolume * (distribution.b / 100));

    return () => clearInterval(interval);
  }, [totalVolume, distribution]);

  const winner = tokenA.priceChange24h > tokenB.priceChange24h ? tokenA : tokenB;
  const loser = tokenA.priceChange24h > tokenB.priceChange24h ? tokenB : tokenA;

  const formatPrice = (price: number) => {
    if (price < 0.001) return `$${price.toFixed(8)}`;
    if (price < 1) return `$${price.toFixed(6)}`;
    return `$${price.toFixed(4)}`;
  };

  const formatMarketCap = (mc: number) => {
    if (mc >= 1000000000) return `$${(mc / 1000000000).toFixed(1)}B`;
    if (mc >= 1000000) return `$${(mc / 1000000).toFixed(1)}M`;
    if (mc >= 1000) return `$${(mc / 1000).toFixed(0)}K`;
    return `$${mc}`;
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `$${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `$${(vol / 1000).toFixed(0)}K`;
    return `${vol.toFixed(1)} SOL`;
  };

  const getPayoutRatio = (isWinning: boolean) => {
    const dist = isWinning ? distribution.a : distribution.b;
    return (100 / dist).toFixed(2);
  };

  return (
    <div className="battle-card slide-in">
      {/* Card Header */}
      <div className="card-header">
        <div className="war-meta">
          <span className="war-id text-xs">#{warId}</span>
          <span className={`badge ${status === 'LIVE' ? 'badge-success' : 'badge'}`}>
            {category}
          </span>
          <span className={`badge ${status === 'LIVE' ? 'badge-success' : 'badge'}`}>
            {status}
          </span>
        </div>
        <div className="time-remaining">
          <div className="timer-value text-lg mono">{timeRemaining}</div>
          <div className="timer-label text-xs">Remaining</div>
        </div>
      </div>

      {/* Battle Overview */}
      <div className="battle-overview">
        <h3 className="battle-title text-xl">{tokenA.symbol} vs {tokenB.symbol}</h3>
        <div className="battle-stats">
          <div className="total-volume">
            <span className="volume-value text-lg mono">{formatVolume(totalVolume)}</span>
            <span className="volume-label text-xs">Total Volume</span>
          </div>
          <div className="participant-count">
            <span className="count-value text-lg">{participantCount.toLocaleString()}</span>
            <span className="count-label text-xs">Participants</span>
          </div>
        </div>
      </div>

      {/* Fighters Grid */}
      <div className="fighters-grid">
        {/* Fighter A */}
        <div className={`fighter-card ${winner.symbol === tokenA.symbol ? 'winner' : ''}`}>
          <div className="fighter-header">
            <div className="token-info">
              <img src={tokenA.icon} className="token-icon" alt={tokenA.symbol} />
              <div className="token-details">
                <div className="token-symbol text-lg">{tokenA.symbol}</div>
                <div className="token-name text-sm">{tokenA.name}</div>
              </div>
            </div>
            {winner.symbol === tokenA.symbol && (
              <div className="position-indicator">
                <div className="position-icon">🏆</div>
                <div className="position-label text-xs">Leading</div>
              </div>
            )}
          </div>

          {/* Price Data */}
          <div className="price-section">
            <div className="current-price">
              <span className="price-value text-xl mono">{formatPrice(tokenA.price)}</span>
              <span className={`price-change text-sm ${tokenA.priceChange24h >= 0 ? 'positive' : 'negative'}`}>
                <span className="change-icon">{tokenA.priceChange24h >= 0 ? '↗' : '↘'}</span>
                <span className="change-value">{tokenA.priceChange24h >= 0 ? '+' : ''}{tokenA.priceChange24h.toFixed(2)}%</span>
              </span>
            </div>
            <div className="price-meta">
              <span className="market-cap text-sm">MC: {formatMarketCap(tokenA.marketCap)}</span>
              <span className="volume-24h text-sm">Vol: {formatMarketCap(tokenA.volume24h)}</span>
            </div>
          </div>

          {/* Betting Data */}
          <div className="betting-section">
            <div className="bet-distribution">
              <div className="distribution-value text-lg">{distribution.a.toFixed(1)}%</div>
              <div className="distribution-amount text-sm mono">{formatVolume(volumeA)}</div>
            </div>
            <div className="potential-payout">
              <div className="payout-ratio text-sm">{getPayoutRatio(true)}x</div>
              <div className="payout-label text-xs">Payout</div>
            </div>
          </div>

          {/* Quick Bet */}
          <button 
            className="quick-bet-btn primary"
            onClick={() => onBetClick(tokenA.symbol)}
          >
            <span className="bet-icon">{tokenA.symbol === 'PEPE' ? '🐸' : '🚀'}</span>
            <span className="bet-label">Bet {tokenA.symbol}</span>
          </button>
        </div>

        {/* VS Divider */}
        <div className="vs-divider">
          <div className="vs-text text-sm">VS</div>
        </div>

        {/* Fighter B */}
        <div className={`fighter-card ${winner.symbol === tokenB.symbol ? 'winner' : ''}`}>
          <div className="fighter-header">
            <div className="token-info">
              <img src={tokenB.icon} className="token-icon" alt={tokenB.symbol} />
              <div className="token-details">
                <div className="token-symbol text-lg">{tokenB.symbol}</div>
                <div className="token-name text-sm">{tokenB.name}</div>
              </div>
            </div>
            {winner.symbol === tokenB.symbol && (
              <div className="position-indicator">
                <div className="position-icon">🏆</div>
                <div className="position-label text-xs">Leading</div>
              </div>
            )}
          </div>

          {/* Price Data */}
          <div className="price-section">
            <div className="current-price">
              <span className="price-value text-xl mono">{formatPrice(tokenB.price)}</span>
              <span className={`price-change text-sm ${tokenB.priceChange24h >= 0 ? 'positive' : 'negative'}`}>
                <span className="change-icon">{tokenB.priceChange24h >= 0 ? '↗' : '↘'}</span>
                <span className="change-value">{tokenB.priceChange24h >= 0 ? '+' : ''}{tokenB.priceChange24h.toFixed(2)}%</span>
              </span>
            </div>
            <div className="price-meta">
              <span className="market-cap text-sm">MC: {formatMarketCap(tokenB.marketCap)}</span>
              <span className="volume-24h text-sm">Vol: {formatMarketCap(tokenB.volume24h)}</span>
            </div>
          </div>

          {/* Betting Data */}
          <div className="betting-section">
            <div className="bet-distribution">
              <div className="distribution-value text-lg">{distribution.b.toFixed(1)}%</div>
              <div className="distribution-amount text-sm mono">{formatVolume(volumeB)}</div>
            </div>
            <div className="potential-payout">
              <div className="payout-ratio text-sm">{getPayoutRatio(false)}x</div>
              <div className="payout-label text-xs">Payout</div>
            </div>
          </div>

          {/* Quick Bet */}
          <button 
            className="quick-bet-btn"
            onClick={() => onBetClick(tokenB.symbol)}
          >
            <span className="bet-icon">{tokenB.symbol === 'SHIB' ? '🐕' : '🔥'}</span>
            <span className="bet-label">Bet {tokenB.symbol}</span>
          </button>
        </div>
      </div>

      {/* Betting Progress */}
      <div className="betting-progress">
        <div className="progress-header">
          <span className="progress-label text-xs">Pool Distribution</span>
          <span className="progress-total text-xs mono">{formatVolume(totalVolume)} Total</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${distribution.a}%`,
              background: winner.symbol === tokenA.symbol ? 'var(--green-positive)' : 'var(--blue-neutral)'
            }}
          />
        </div>
        <div className="progress-labels">
          <span className="label-left text-xs">{tokenA.symbol}: {distribution.a.toFixed(1)}%</span>
          <span className="label-right text-xs">{tokenB.symbol}: {distribution.b.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}