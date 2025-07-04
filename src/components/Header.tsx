'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Sword, Trophy, User, Zap } from 'lucide-react';
import { PepeEmoji } from './WojakReaction';
import { useState, useEffect } from 'react';

export default function Header() {
  const { connected, publicKey } = useWallet();
  const [isGlitching, setIsGlitching] = useState(false);
  const [currentPepe, setCurrentPepe] = useState<'happy' | 'smug' | 'confused'>('happy');

  // Random pepe rotation for chaos
  useEffect(() => {
    const interval = setInterval(() => {
      const pepes: ('happy' | 'smug' | 'confused')[] = ['happy', 'smug', 'confused'];
      setCurrentPepe(pepes[Math.floor(Math.random() * pepes.length)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Random glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 300);
    }, 10000 + Math.random() * 20000); // Random between 10-30 seconds

    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <header className="border-b-2 border-[var(--schizo-green)] bg-[var(--schizo-bg)]/98 backdrop-blur-sm sticky top-0 z-50 schizo-border-battle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 🔥 SCHIZO LOGO 🔥 */}
          <div className="flex items-center space-x-3">
            <div className={`flex items-center justify-center w-12 h-12 schizo-bg-chaos rounded-lg ${isGlitching ? 'schizo-glitch' : 'schizo-pulse'}`}>
              <Sword className="w-7 h-7 text-white drop-shadow-lg" />
            </div>
            <div>
              <h1 className={`text-2xl font-black text-white schizo-text-glow ${isGlitching ? 'schizo-glitch' : ''}`}>
                TRENCHWARS ⚔️
              </h1>
              <p className="text-xs text-[var(--schizo-green)] font-bold uppercase tracking-wider">
                DEGEN BATTLE ARENA 💀
              </p>
            </div>
            <PepeEmoji type={currentPepe} size="lg" animate={true} />
          </div>

          {/* 🎯 CHAOTIC NAVIGATION 🎯 */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#wars" className="group relative text-white hover:text-[var(--schizo-green)] transition-all duration-200 font-bold uppercase tracking-wide">
              <span className="group-hover:schizo-text-glow">🔥 ACTIVE WARS</span>
              <Zap className="w-4 h-4 inline ml-1 group-hover:schizo-pulse" />
            </a>
            <a href="#leaderboard" className="group text-white hover:text-[var(--schizo-yellow)] transition-all duration-200 font-bold uppercase tracking-wide flex items-center space-x-1">
              <Trophy className="w-5 h-5 group-hover:schizo-pulse" />
              <span className="group-hover:schizo-text-glow">🏆 CHAMPIONS</span>
            </a>
            {connected && (
              <a href="#profile" className="group text-white hover:text-[var(--schizo-blue)] transition-all duration-200 font-bold uppercase tracking-wide flex items-center space-x-1">
                <User className="w-5 h-5 group-hover:schizo-pulse" />
                <span className="group-hover:schizo-text-glow">💎 PROFILE</span>
              </a>
            )}
          </nav>

          {/* 💳 WALLET CHAOS 💳 */}
          <div className="flex items-center space-x-4">
            {connected && publicKey ? (
              <div className="hidden sm:flex items-center space-x-2">
                <div className="wojak-container wojak-gains">
                  <div className="text-sm font-mono bg-[var(--schizo-bg-secondary)] px-3 py-1 rounded-lg border border-[var(--schizo-green)]">
                    <span className="text-[var(--schizo-green)]">
                      {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-[var(--schizo-green)] font-bold">
                  CONNECTED 🚀
                </div>
              </div>
            ) : (
              <div className="text-xs text-[var(--schizo-red)] font-bold schizo-pulse">
                NOT CONNECTED ❌
              </div>
            )}
            <WalletMultiButton className="btn-send-it !text-black !font-black !text-sm !px-6 !py-3 hover:!scale-105 active:schizo-shake" />
          </div>
        </div>
      </div>
      
      {/* 💥 CHAOS INDICATOR BAR 💥 */}
      <div className="h-1 bg-gradient-to-r from-[var(--schizo-red)] via-[var(--schizo-green)] to-[var(--schizo-blue)] schizo-bg-chaos"></div>
    </header>
  );
}