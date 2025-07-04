'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import WojakHUD from './WojakHUD';
import PepeCorner from './PepeCorner';
import BottomHUD from './BottomHUD';

export default function Hero() {
  const { connected } = useWallet();

  return (
    <>
      {/* Fixed Wojak HUD */}
      <WojakHUD />
      
      {/* Floating Pepe Corner */}
      <PepeCorner />

      <section className="relative py-12 px-4 overflow-hidden">
        <div className="relative max-w-6xl mx-auto">
          {/* Main Title - Schizo Style */}
          <div className="text-center mb-16">
            <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black mb-8">
              <span className="chaos-shift text-[var(--pump-green)] terminal-flicker font-mono">
                TRENCH
              </span>
              <br />
              <span className="text-[var(--explosive-red)] glitch-text font-mono">
                WARS
              </span>
            </h1>
            
            <div className="battle-card max-w-4xl mx-auto mb-12">
              <div className="card-header">
                <span className="war-number">MAXIMUM SCHIZO MODE</span>
                <span className="timer terminal-flicker">ACTIVE</span>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-black text-[var(--corruption-yellow)] mb-4 glitch-text">
                  💀 ENTER THE TRENCHES 💀
                </div>
                <div className="text-lg text-[var(--pure-white)] mb-6">
                  Where memes battle for supremacy and anons fight for financial freedom
                </div>
                
                {!connected ? (
                  <div className="space-y-6">
                    <div className="text-[var(--explosive-red)] font-black text-xl terminal-flicker">
                      ⚠️ WALLET_CONNECTION_REQUIRED.EXE ⚠️
                    </div>
                    <WalletMultiButton className="btn-send-it !text-xl !px-16 !py-6 !rounded-xl" />
                    <div className="text-sm text-[var(--pump-green)] font-mono">
                      Connect to join the chaos
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-[var(--pump-green)] font-black text-xl chaos-pulse">
                      ✅ ANON_AUTHENTICATED.OK ✅
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button className="pepe-bet">
                        🐸 ENTER BATTLE
                      </button>
                      <button className="btn-send-it">
                        💎 VIEW WARS
                      </button>
                      <button className="shib-bet">
                        📊 LEADERBOARD
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Battle Stats Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="battle-card">
              <div className="card-header">
                <span className="war-number">ACTIVE WARS</span>
                <span className="timer">🔥</span>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-[var(--pump-green)] mb-2 chaos-pulse">
                  12
                </div>
                <div className="text-sm text-[var(--pure-white)]">
                  Meme coins battling
                </div>
              </div>
            </div>

            <div className="battle-card">
              <div className="card-header">
                <span className="war-number">TOTAL VOLUME</span>
                <span className="timer">💰</span>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-[var(--corruption-yellow)] mb-2 terminal-flicker">
                  $420K
                </div>
                <div className="text-sm text-[var(--pure-white)]">
                  SOL wagered
                </div>
              </div>
            </div>

            <div className="battle-card">
              <div className="card-header">
                <span className="war-number">ANONS REKT</span>
                <span className="timer">💀</span>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-[var(--explosive-red)] mb-2 glitch-text">
                  1337
                </div>
                <div className="text-sm text-[var(--pure-white)]">
                  Dreams destroyed
                </div>
              </div>
            </div>
          </div>

          {/* How It Works - Greentext Style */}
          <div className="battle-card mb-16">
            <div className="card-header">
              <span className="war-number">HOW_TO_BATTLE.TXT</span>
              <span className="timer terminal-flicker">README</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="text-[var(--pump-green)] font-mono">
                  &gt; be anon<br/>
                  &gt; see epic meme battle<br/>
                  &gt; choose your fighter<br/>
                  &gt; place your bet in SOL<br/>
                  &gt; pray to based gods<br/>
                  &gt; either moon or get rekt<br/>
                  &gt; cope with results
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-[var(--explosive-red)] font-mono">
                  &gt; WARNING: not financial advice<br/>
                  &gt; WARNING: maximum degeneracy zone<br/>
                  &gt; WARNING: diamond hands required<br/>
                  &gt; WARNING: paper hands will be mocked<br/>
                  &gt; WARNING: NGMI detector active<br/>
                  &gt; WARNING: copium not included<br/>
                  &gt; CAUTION: may cause addiction to chaos
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom HUD Panels */}
      <BottomHUD />
    </>
  );
}