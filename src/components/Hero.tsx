'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useEffect } from 'react';

export default function Hero() {
  const { connected } = useWallet();
  const [terminalText, setTerminalText] = useState('');
  const [breakingNews, setBreakingNews] = useState('MAXIMUM SCHIZO MODE ACTIVATED');
  const [battleStats, setBattleStats] = useState({
    chaosLevel: 'CRITICAL',
    degenCount: '1337',
    rektCount: '420',
    moonMissions: '69'
  });

  // Terminal typing effect
  useEffect(() => {
    const text = 'INITIALIZING TRENCHWARS.WTF... LOADING MAXIMUM DEGENERACY PROTOCOLS...';
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < text.length) {
        setTerminalText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typeInterval);
      }
    }, 50);
    return () => clearInterval(typeInterval);
  }, []);

  // Breaking news rotation
  useEffect(() => {
    const newsItems = [
      'WOJAKS CRYING GLOBALLY AS SHITCOINS PUMP TO INFINITY',
      'ANON DISCOVERS ULTIMATE ALPHA - LOSES EVERYTHING IMMEDIATELY',
      'PUMP AND DUMP SCHEMES REACH UNPRECEDENTED LEVELS OF BASED',
      'LOCAL DEGEN ACHIEVES FINANCIAL INDEPENDENCE THROUGH PURE LUCK',
      'BREAKING: SOMEONE ACTUALLY MADE MONEY IN CRYPTO TODAY',
      'ALERT: MASSIVE HOPIUM OVERDOSE DETECTED IN SECTOR 7',
      'EMERGENCY: COPIUM RESERVES DEPLETED ACROSS ALL EXCHANGES'
    ];
    
    let index = 0;
    const newsInterval = setInterval(() => {
      setBreakingNews(newsItems[index % newsItems.length]);
      index++;
    }, 4000);
    
    return () => clearInterval(newsInterval);
  }, []);

  // Live battle stats updates
  useEffect(() => {
    const statsInterval = setInterval(() => {
      setBattleStats({
        chaosLevel: Math.random() > 0.5 ? 'CRITICAL' : 'MAXIMUM',
        degenCount: (1337 + Math.floor(Math.random() * 100)).toString(),
        rektCount: (420 + Math.floor(Math.random() * 50)).toString(),
        moonMissions: (69 + Math.floor(Math.random() * 10)).toString()
      });
    }, 2000);
    
    return () => clearInterval(statsInterval);
  }, []);

  return (
    <section className="relative py-8 px-4 overflow-hidden">
      {/* Matrix Background Effects */}
      <div className="matrix-bg">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="matrix-rain"
            style={{
              '--col': i,
              '--delay': Math.random() * 5,
              left: `${i * 5}%`
            } as any}
          >
            {Array.from({ length: 50 }, () => Math.random() > 0.5 ? '1' : '0').join('')}
          </div>
        ))}
      </div>

      {/* Breaking News Ticker - CNN Hack Style */}
      <div className="breaking-news mb-6">
        <div className="breaking-news-ticker">
          {breakingNews} • TRENCHWARS.WTF IS NOT RESPONSIBLE FOR YOUR FINANCIAL RUIN • 
          DYOR OR GET REKT • {breakingNews}
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Terminal Header */}
        <div className="terminal-window mb-8">
          <div className="terminal-header">
            TRENCHWARS.WTF - MAXIMUM_SCHIZO_MODE.EXE
          </div>
          <div className="terminal-content">
            <div className="terminal-flicker">
              {terminalText}<span className="terminal-pulse">█</span>
            </div>
            <div className="mt-4 text-sm">
              <div className="greentext-item">be anon</div>
              <div className="greentext-item">discover ultimate crypto battle arena</div>
              <div className="greentext-item">time to absolutely send it</div>
              <div className="greentext-item">moon mission or rope</div>
            </div>
          </div>
        </div>

        {/* Main Title - Explosive Typography */}
        <div className="text-center mb-12">
          <h1 className="text-6xl sm:text-7xl lg:text-9xl font-black mb-6">
            <span className="chaos-shift terminal-glow font-mono">
              TRENCH
            </span>
            <br />
            <span className="text-[var(--explosive-red)] glitch-corruption font-mono">
              WARS
            </span>
          </h1>
          
          <div className="terminal-window max-w-3xl mx-auto mb-8">
            <div className="terminal-content text-lg">
              <div className="data-point">MAXIMUM DEGENERACY PREDICTION MARKET</div>
              <div className="mt-2 text-[var(--pump-green)]">
                [PROTOCOL] BET_ON_CRYPTO_WARS.EXE
              </div>
              <div className="text-[var(--shockwave-blue)]">
                [STATUS] MOON_OR_REKT_MODE_ACTIVE
              </div>
              <div className="text-[var(--explosive-red)]">
                [WARNING] MAXIMUM_RISK_TOLERANCE_REQUIRED
              </div>
            </div>
          </div>
        </div>

        {/* Connection Status - Doom HUD Style */}
        {!connected ? (
          <div className="doom-hud mb-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-[var(--explosive-red)] font-black text-xl mb-4 terminal-flicker">
                ⚠️ WALLET_NOT_CONNECTED.ERR ⚠️
              </div>
              <div className="health-bar mb-4">
                <div className="health-fill" style={{ width: '0%' }}></div>
              </div>
              <div className="ammo-counter mb-4">READY: 0/1</div>
              <WalletMultiButton className="btn-send-it !text-black !font-black !text-xl !px-12 !py-6 !rounded-xl" />
              <div className="terminal-content mt-4">
                <div className="greentext-item">connect wallet to enter battle</div>
                <div className="greentext-item">ngmi without connection, anon</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="doom-hud mb-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-[var(--pump-green)] font-black text-xl mb-4 terminal-pulse">
                ✅ CONNECTION_ESTABLISHED.OK ✅
              </div>
              <div className="health-bar mb-4">
                <div className="health-fill" style={{ width: '100%' }}></div>
              </div>
              <div className="ammo-counter mb-4">READY: 1/1</div>
              <button 
                onClick={() => document.getElementById('wars')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-send-it text-black px-12 py-6 rounded-xl text-xl font-black uppercase tracking-wider"
              >
                ENTER_BATTLE.EXE
              </button>
              <div className="terminal-content mt-4">
                <div className="greentext-item">wallet locked and loaded</div>
                <div className="greentext-item">choose your weapons below</div>
                <div className="greentext-item">may the strongest token win</div>
              </div>
            </div>
          </div>
        )}

        {/* Live Battle Statistics - Data Visualization Chaos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="data-viz p-6 text-center">
            <div className="terminal-window">
              <div className="terminal-content">
                <div className="data-point text-2xl font-black terminal-pulse">
                  24/7
                </div>
                <div className="text-sm mt-2 text-[var(--corruption-yellow)]">
                  CHAOS_MODE.SYS
                </div>
              </div>
            </div>
          </div>

          <div className="data-viz p-6 text-center">
            <div className="terminal-window">
              <div className="terminal-content">
                <div className="data-point text-2xl font-black explosion-pulse">
                  $500K+
                </div>
                <div className="text-sm mt-2 text-[var(--pump-green)]">
                  VOLUME_PUMPED.DAT
                </div>
              </div>
            </div>
          </div>

          <div className="data-viz p-6 text-center">
            <div className="terminal-window">
              <div className="terminal-content">
                <div className="data-point text-2xl font-black system-crash">
                  {battleStats.rektCount}
                </div>
                <div className="text-sm mt-2 text-[var(--explosive-red)]">
                  DEGENS_REKT.LOG
                </div>
              </div>
            </div>
          </div>

          <div className="data-viz p-6 text-center">
            <div className="terminal-window">
              <div className="terminal-content">
                <div className="data-point text-2xl font-black terminal-glow">
                  AUDITED
                </div>
                <div className="text-sm mt-2 text-[var(--shockwave-blue)]">
                  BATTLE_TESTED.OK
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Doomscroll Feed */}
        <div className="mt-12">
          <div className="terminal-window max-w-4xl mx-auto">
            <div className="terminal-header">
              LIVE_CHAOS_FEED.EXE - REFRESHING EVERY 2.3 SECONDS
            </div>
            <div className="doomscroll-feed">
              <div className="feed-item">
                <span className="text-[var(--pump-green)]">[{new Date().toLocaleTimeString()}]</span> 
                &gt; WOJAK.SYS: Calculating devastation levels...
              </div>
              <div className="feed-item">
                <span className="text-[var(--shockwave-blue)]">[{new Date().toLocaleTimeString()}]</span> 
                &gt; PEPE_PRICE.DLL: Status ABSOLUTELY_BASED
              </div>
              <div className="feed-item">
                <span className="text-[var(--explosive-red)]">[{new Date().toLocaleTimeString()}]</span> 
                &gt; REKT_DETECTOR.EXE: {battleStats.rektCount} anons liquidated
              </div>
              <div className="feed-item">
                <span className="text-[var(--corruption-yellow)]">[{new Date().toLocaleTimeString()}]</span> 
                &gt; HOPIUM_LEVELS: {battleStats.chaosLevel} | COPIUM: DEPLETED
              </div>
              <div className="feed-item">
                <span className="text-[var(--schizo-purple)]">[{new Date().toLocaleTimeString()}]</span> 
                &gt; URGENT: Massive schizo energy detected in Sector 7
              </div>
              <div className="feed-item">
                <span className="text-[var(--pump-green)]">[{new Date().toLocaleTimeString()}]</span> 
                &gt; DIAMOND_HANDS.DLL: {battleStats.degenCount} active hodlers
              </div>
            </div>
          </div>
        </div>

        {/* ASCII Art Wojak Terminal Display */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="wojak-terminal wojak-gains">
            {`
   ⠀⠀⠀⠀⠀⠀⠀⣠⣤⣤⣤⣤⣤⣶⣦⣤⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀
   ⠀⠀⠀⠀⠀⠀⢀⣴⣿⡿⠛⠉⠙⠛⠛⠛⠛⠻⢿⣿⣷⣤⡀⠀⠀⠀⠀⠀
   ⠀⠀⠀⠀⠀⣼⣿⠋⠀⠀⠀⠀⠀⠀⠀⢀⣀⣀⠈⢻⣿⣿⡄⠀⠀⠀⠀
   ⠀⠀⠀⠀⣸⣿⡏⠀⠀⠀⣠⣶⣾⣿⣿⣿⠿⠿⠿⢿⣿⣿⣿⣄⠀⠀⠀
   ⠀⠀⠀⠀⣿⣿⠁⠀⠀⢰⣿⣿⣯⠁⠀⠀⠀⠀⠀⠀⠀⠈⠙⢿⣷⡄⠀
   ⠀⠀⣀⣶⣿⣿⣿⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⣿⣦⣀
            `}
            <div className="mt-4 terminal-pulse">
              &gt; COMFY_WOJAK.EXE loaded successfully
              <br />
              &gt; Ready to witness maximum chaos
              <br />
              &gt; Status: ABSOLUTELY_BASED.WAV
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}