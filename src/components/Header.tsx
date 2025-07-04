'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useEffect } from 'react';

export default function Header() {
  const { connected, publicKey } = useWallet();
  const [chaosLevel, setChaosLevel] = useState('MAX');
  const [rektCount, setRektCount] = useState(420);
  const [audioStatus, setAudioStatus] = useState('OFF');

  useEffect(() => {
    const chaosItems = ['MAX', 'ULTRA', 'LEGENDARY', 'GODLIKE'];
    let index = 0;
    const chaosInterval = setInterval(() => {
      setChaosLevel(chaosItems[index % chaosItems.length]);
      index++;
    }, 2000);
    return () => clearInterval(chaosInterval);
  }, []);

  useEffect(() => {
    const rektInterval = setInterval(() => {
      setRektCount(prev => prev + Math.floor(Math.random() * 5));
    }, 3000);
    return () => clearInterval(rektInterval);
  }, []);

  return (
    <>
      {/* Fixed Terminal Header */}
      <div className="schizo-header">
        <div className="header-status">
          <div className="status-item">
            <span>💀</span>
            <span className="chaos-level">CHAOS_LVL: {chaosLevel}</span>
          </div>
          <div className="status-item">
            <span className="rekt-count">REKT_COUNT: {rektCount}</span>
          </div>
          <div className="status-item">
            <span>🔊</span>
            <span className="wallet-status">{audioStatus}</span>
          </div>
          <div className="status-item">
            <span>[WALLET]</span>
            <span className="wallet-status">
              {connected && publicKey ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>
        </div>
      </div>

      {/* Breaking News Ticker */}
      <div className="breaking-ticker">
        <div className="ticker-content">
          🚨 BREAKING: PEPE ARMY MOBILIZES | WOJAKS CRYING GLOBALLY | NGMI DETECTED | DIAMOND HANDS PROTOCOL ACTIVATED | MOON MISSION LAUNCHING | MAXIMUM CHAOS ENGAGED
        </div>
      </div>

      {/* Navigation Bar */}
      <header className="bg-[var(--midnight-black)]/95 backdrop-blur-sm border-b-2 border-[var(--pump-green)] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-black text-[var(--pump-green)] terminal-flicker">
                ⚔️ TRENCHWARS
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#wars" className="text-[var(--pump-green)] hover:text-[var(--pure-white)] font-mono font-bold transition-colors">
                WARS
              </a>
              <a href="#leaderboard" className="text-[var(--corruption-yellow)] hover:text-[var(--pure-white)] font-mono font-bold transition-colors">
                LEADERBOARD
              </a>
              <a href="#stats" className="text-[var(--shockwave-blue)] hover:text-[var(--pure-white)] font-mono font-bold transition-colors">
                STATS
              </a>
            </nav>

            {/* Wallet Connection */}
            <div className="flex items-center space-x-4">
              {connected && publicKey && (
                <div className="text-[var(--pump-green)] font-mono text-sm">
                  {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
                </div>
              )}
              <WalletMultiButton className="!bg-[var(--chaos-gradient)] !border-2 !border-[var(--pump-green)] !text-[var(--midnight-black)] !font-mono !font-black !text-sm hover:!scale-105 transition-all" />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}