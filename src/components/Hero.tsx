'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Zap, TrendingUp, Users, Shield, Target, Skull } from 'lucide-react';
import { PepeEmoji } from './WojakReaction';
import { useState, useEffect } from 'react';

export default function Hero() {
  const { connected } = useWallet();
  const [isGlitching, setIsGlitching] = useState(false);
  const [explosionCount, setExplosionCount] = useState(0);

  // Random explosion counter for chaos
  useEffect(() => {
    const interval = setInterval(() => {
      setExplosionCount(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Random glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 400);
    }, 8000 + Math.random() * 12000);
    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <section className="relative py-20 px-4 text-center overflow-hidden">
      {/* 💥 SCHIZO BACKGROUND CHAOS 💥 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--schizo-green)]/10 rounded-full blur-3xl schizo-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--schizo-red)]/10 rounded-full blur-3xl schizo-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--schizo-blue)]/5 rounded-full blur-3xl"></div>
        
        {/* Floating chaos elements */}
        <div className="absolute top-20 right-20 text-4xl schizo-pulse">💀</div>
        <div className="absolute bottom-32 left-16 text-3xl schizo-pulse">⚔️</div>
        <div className="absolute top-40 left-1/3 text-2xl schizo-pulse">🚀</div>
      </div>
      
      <div className="relative max-w-6xl mx-auto">
        <div className="space-y-8">
          {/* 🔥 SCHIZO MAIN HEADING 🔥 */}
          <div className="space-y-6">
            <div className="flex justify-center items-center space-x-4 mb-4">
              <PepeEmoji type="smug" size="lg" animate={true} />
              <Target className="w-12 h-12 text-[var(--schizo-green)] schizo-pulse" />
              <PepeEmoji type="happy" size="lg" animate={true} />
            </div>
            
            <h1 className={`text-6xl sm:text-7xl lg:text-8xl font-black ${isGlitching ? 'schizo-glitch' : 'schizo-pulse'}`}>
              <span className="text-[var(--schizo-green)] schizo-text-glow">
                TRENCH
              </span>
              <span className="text-[var(--schizo-red)]">
                WARS
              </span>
              <div className="text-2xl mt-2 text-[var(--schizo-yellow)] font-black tracking-widest">
                ⚔️ TOKEN BATTLE ARENA ⚔️
              </div>
            </h1>
            
            <p className="text-xl sm:text-2xl text-white max-w-4xl mx-auto leading-relaxed font-bold">
              🔥 MAXIMUM DEGENERACY PREDICTION MARKET 🔥<br/>
              <span className="text-[var(--schizo-green)]">💎 BET ON CRYPTO WARS</span> • 
              <span className="text-[var(--schizo-blue)]"> 🚀 MOON OR REKT</span> • 
              <span className="text-[var(--schizo-yellow)]"> ⚔️ BATTLE FOR SUPREMACY</span>
            </p>
            
            <div className="flex justify-center space-x-4 text-4xl">
              <span className="schizo-pulse">💀</span>
              <span className="schizo-pulse">🎯</span>
              <span className="schizo-pulse">💎</span>
              <span className="schizo-pulse">🚀</span>
              <span className="schizo-pulse">⚔️</span>
            </div>
          </div>

          {/* 🚀 SCHIZO CTA 🚀 */}
          {!connected ? (
            <div className="space-y-6">
              <div className="text-[var(--schizo-red)] font-black text-lg uppercase tracking-widest schizo-pulse">
                ⚠️ WALLET NOT CONNECTED - NGMI ANON! ⚠️
              </div>
              <WalletMultiButton className="btn-send-it !text-black !font-black !text-xl !px-12 !py-6 !rounded-xl hover:!scale-110 active:schizo-shake" />
              <p className="text-[var(--schizo-yellow)] font-bold uppercase tracking-wider">
                🎯 CONNECT TO ENTER THE BATTLEFIELD 🎯
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-[var(--schizo-green)] font-black text-lg uppercase tracking-widest schizo-text-glow">
                ✅ WALLET CONNECTED - READY FOR BATTLE! ✅
              </div>
              <button 
                onClick={() => document.getElementById('wars')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-send-it text-black px-12 py-6 rounded-xl text-xl font-black hover:scale-110 active:schizo-shake uppercase tracking-wider"
              >
                🔥 ENTER THE TRENCHES 🔥
              </button>
              <p className="text-[var(--schizo-blue)] font-bold uppercase tracking-wider">
                💎 CHOOSE YOUR WEAPONS BELOW 💎
              </p>
            </div>
          )}

          {/* 💀 BATTLE STATS 💀 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16">
            <div className="battle-card text-center p-6">
              <div className="flex justify-center mb-3">
                <Zap className="w-12 h-12 text-[var(--schizo-green)] schizo-pulse" />
              </div>
              <div className="text-3xl font-black text-[var(--schizo-green)] schizo-text-glow">24/7</div>
              <div className="text-sm text-[var(--schizo-yellow)] font-bold uppercase tracking-wider">⚡ CHAOS MODE ⚡</div>
            </div>
            <div className="battle-card text-center p-6">
              <div className="flex justify-center mb-3">
                <TrendingUp className="w-12 h-12 text-[var(--schizo-blue)] schizo-pulse" />
              </div>
              <div className="text-3xl font-black text-[var(--schizo-blue)] schizo-text-glow">$500K+</div>
              <div className="text-sm text-[var(--schizo-yellow)] font-bold uppercase tracking-wider">💰 VOLUME PUMPED 💰</div>
            </div>
            <div className="battle-card text-center p-6">
              <div className="flex justify-center mb-3">
                <Skull className="w-12 h-12 text-[var(--schizo-red)] schizo-pulse" />
              </div>
              <div className="text-3xl font-black text-[var(--schizo-red)] schizo-text-glow">10K+</div>
              <div className="text-sm text-[var(--schizo-yellow)] font-bold uppercase tracking-wider">💀 DEGENS REKT 💀</div>
            </div>
            <div className="battle-card text-center p-6">
              <div className="flex justify-center mb-3">
                <Shield className="w-12 h-12 text-[var(--schizo-yellow)] schizo-pulse" />
              </div>
              <div className="text-3xl font-black text-[var(--schizo-yellow)] schizo-text-glow">AUDITED</div>
              <div className="text-sm text-[var(--schizo-yellow)] font-bold uppercase tracking-wider">🛡️ BATTLE TESTED 🛡️</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}