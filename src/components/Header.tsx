'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useEffect } from 'react';

export default function Header() {
  const { connected, publicKey } = useWallet();
  const [volume24h] = useState(420690);
  const [anonsRekt, setAnonsRekt] = useState(1337);
  const [activeWars] = useState(12);
  const [balance] = useState(69.420);

  useEffect(() => {
    const rektInterval = setInterval(() => {
      setAnonsRekt(prev => prev + Math.floor(Math.random() * 3 + 1));
    }, 5000);
    return () => clearInterval(rektInterval);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num}`;
  };

  return (
    <header className="trading-header">
      <div className="header-left">
        <div className="brand-section">
          <div className="logo">💀 TRENCHWARS</div>
          <div className="tagline">Degen Prediction Market</div>
        </div>
        
        <nav className="main-nav">
          <button className="nav-item active">
            <span className="nav-icon">⚔️</span>
            <span className="nav-label">Wars</span>
          </button>
          <button className="nav-item">
            <span className="nav-icon">👑</span>
            <span className="nav-label">Leaderboard</span>
          </button>
          <button className="nav-item">
            <span className="nav-icon">📊</span>
            <span className="nav-label">Stats</span>
          </button>
        </nav>
      </div>

      <div className="header-center">
        <div className="global-stats">
          <div className="stat-item">
            <div className="stat-value text-lg">{formatNumber(volume24h)}</div>
            <div className="stat-label text-xs">24h Volume</div>
          </div>
          <div className="stat-item">
            <div className="stat-value text-lg">{anonsRekt.toLocaleString()}</div>
            <div className="stat-label text-xs">Anons Rekt</div>
          </div>
          <div className="stat-item">
            <div className="stat-value text-lg">{activeWars}</div>
            <div className="stat-label text-xs">Active Wars</div>
          </div>
        </div>
      </div>

      <div className="header-right">
        <div className="user-section">
          {connected && (
            <div className="balance-display">
              <div className="balance-value text-lg">{balance.toFixed(3)} SOL</div>
              <div className="balance-label text-xs">Available</div>
            </div>
          )}
          
          {connected && publicKey ? (
            <button className="wallet-btn">
              <span className="wallet-status"></span>
              {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
            </button>
          ) : (
            <WalletMultiButton className="wallet-btn" />
          )}
        </div>
      </div>
    </header>
  );
}