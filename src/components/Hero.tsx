'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Hero() {
  const { connected } = useWallet();

  return (
    <section className="relative py-8 px-4 overflow-hidden">
      {/* 🚨 TESTING DEPLOYMENT - TERMINAL CYBERPUNK MODE 🚨 */}
      <div className="breaking-news mb-6">
        <div className="breaking-news-ticker">
          🚨 TERMINAL CYBERPUNK DEPLOYMENT TEST - IF YOU SEE THIS THE NEW CODE IS WORKING 🚨
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Terminal Header */}
        <div className="terminal-window mb-8">
          <div className="terminal-header">
            TRENCHWARS.WTF - DEPLOYMENT_TEST.EXE
          </div>
          <div className="terminal-content">
            <div className="terminal-flicker">
              TESTING TERMINAL CYBERPUNK DEPLOYMENT...
            </div>
            <div className="mt-4 text-sm">
              <div className="greentext-item">be anon</div>
              <div className="greentext-item">deploy terminal cyberpunk UI</div>
              <div className="greentext-item">check if vercel picks up changes</div>
              <div className="greentext-item">profit or get rekt</div>
            </div>
          </div>
        </div>

        {/* Main Title - Terminal Style */}
        <div className="text-center mb-12">
          <h1 className="text-6xl sm:text-7xl lg:text-9xl font-black mb-6">
            <span className="chaos-shift terminal-glow font-mono">
              TERMINAL
            </span>
            <br />
            <span className="text-[var(--explosive-red)] glitch-corruption font-mono">
              TEST
            </span>
          </h1>
          
          <div className="terminal-window max-w-3xl mx-auto mb-8">
            <div className="terminal-content text-lg">
              <div className="data-point">DEPLOYMENT STATUS: TESTING</div>
              <div className="mt-2 text-[var(--pump-green)]">
                [PROTOCOL] CYBERPUNK_THEME_TEST.EXE
              </div>
              <div className="text-[var(--shockwave-blue)]">
                [STATUS] VERCEL_CACHE_BYPASS_ACTIVE
              </div>
              <div className="text-[var(--explosive-red)]">
                [WARNING] MAXIMUM_TERMINAL_MODE
              </div>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        {!connected ? (
          <div className="doom-hud mb-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-[var(--explosive-red)] font-black text-xl mb-4 terminal-flicker">
                ⚠️ WALLET_NOT_CONNECTED.ERR ⚠️
              </div>
              <WalletMultiButton className="btn-send-it !text-black !font-black !text-xl !px-12 !py-6 !rounded-xl" />
              <div className="terminal-content mt-4">
                <div className="greentext-item">connect wallet to test deployment</div>
                <div className="greentext-item">terminal cyberpunk mode active</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="doom-hud mb-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-[var(--pump-green)] font-black text-xl mb-4 terminal-pulse">
                ✅ CONNECTION_ESTABLISHED.OK ✅
              </div>
              <div className="terminal-content mt-4">
                <div className="greentext-item">wallet connected successfully</div>
                <div className="greentext-item">terminal test mode active</div>
                <div className="greentext-item">deployment verification complete</div>
              </div>
            </div>
          </div>
        )}

        {/* Test Status Display */}
        <div className="mt-12">
          <div className="terminal-window max-w-4xl mx-auto">
            <div className="terminal-header">
              DEPLOYMENT_TEST_LOG.EXE
            </div>
            <div className="doomscroll-feed">
              <div className="feed-item">
                <span className="text-[var(--pump-green)]">[SYSTEM]</span> 
                Terminal cyberpunk theme loaded
              </div>
              <div className="feed-item">
                <span className="text-[var(--shockwave-blue)]">[CSS]</span> 
                New terminal variables active
              </div>
              <div className="feed-item">
                <span className="text-[var(--explosive-red)]">[DEPLOYMENT]</span> 
                Vercel cache bypass successful
              </div>
              <div className="feed-item">
                <span className="text-[var(--corruption-yellow)]">[STATUS]</span> 
                Ready for full terminal implementation
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}