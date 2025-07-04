'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useEffect } from 'react';

export default function Header() {
  const { connected, publicKey } = useWallet();
  const [terminalMode, setTerminalMode] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState('OPERATIONAL');
  const [chaosLevel, setChaosLevel] = useState('MAXIMUM');

  // System clock
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // System status rotation
  useEffect(() => {
    const statusItems = ['OPERATIONAL', 'DEGRADED', 'CRITICAL', 'CHAOS_MODE'];
    let index = 0;
    const statusInterval = setInterval(() => {
      setSystemStatus(statusItems[index % statusItems.length]);
      index++;
    }, 3000);
    return () => clearInterval(statusInterval);
  }, []);

  // Chaos level monitoring
  useEffect(() => {
    const chaosItems = ['MAXIMUM', 'CRITICAL', 'LEGENDARY', 'GODLIKE'];
    let index = 0;
    const chaosInterval = setInterval(() => {
      setChaosLevel(chaosItems[index % chaosItems.length]);
      index++;
    }, 2000);
    return () => clearInterval(chaosInterval);
  }, []);

  return (
    <header className="border-b-2 border-[var(--pump-green)] bg-[var(--midnight-black)]/98 backdrop-blur-sm sticky top-0 z-50">
      {/* Terminal Status Bar */}
      <div className="bg-[var(--trench-grey)] px-4 py-1 text-xs font-mono">
        <div className="flex justify-between items-center text-[var(--pump-green)]">
          <div className="flex space-x-6">
            <span className="terminal-flicker">
              [SYS] {currentTime.toLocaleTimeString()}
            </span>
            <span className={`${systemStatus === 'CRITICAL' ? 'text-[var(--explosive-red)] system-crash' : 'terminal-pulse'}`}>
              [STATUS] {systemStatus}
            </span>
            <span className="chaos-shift">
              [CHAOS] {chaosLevel}
            </span>
          </div>
          <div className="flex space-x-4">
            <span className="terminal-flicker">CPU: 69%</span>
            <span className="terminal-flicker">MEM: 420MB</span>
            <span className="terminal-flicker">NET: 1337KB/s</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Terminal Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="terminal-window w-12 h-12 flex items-center justify-center">
              <div className="terminal-content p-1">
                <span className="text-lg font-black text-[var(--pump-green)] terminal-glow">⚔</span>
              </div>
            </div>
            
            <div className="terminal-window">
              <div className="terminal-content py-2 px-4">
                <div className="flex items-center space-x-2">
                  <span className="text-[var(--pump-green)]">anon@trenchwars:~$</span>
                  <span className="text-[var(--pure-white)] font-black text-lg terminal-glow">
                    ./TRENCHWARS.EXE
                  </span>
                  <span className="terminal-pulse">█</span>
                </div>
              </div>
            </div>
          </div>

          {/* Terminal Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-1">
            <div className="terminal-window">
              <div className="terminal-content py-2 px-3">
                <a 
                  href="#wars" 
                  className="text-[var(--pump-green)] hover:text-[var(--pure-white)] font-mono text-sm terminal-flicker hover:chaos-shift transition-all duration-200"
                >
                  [ACTIVE_WARS.DAT]
                </a>
              </div>
            </div>
            
            <div className="terminal-window">
              <div className="terminal-content py-2 px-3">
                <a 
                  href="#leaderboard" 
                  className="text-[var(--corruption-yellow)] hover:text-[var(--pure-white)] font-mono text-sm terminal-flicker hover:chaos-shift transition-all duration-200"
                >
                  [CHAMPIONS.LOG]
                </a>
              </div>
            </div>
            
            {connected && (
              <div className="terminal-window">
                <div className="terminal-content py-2 px-3">
                  <a 
                    href="#profile" 
                    className="text-[var(--shockwave-blue)] hover:text-[var(--pure-white)] font-mono text-sm terminal-flicker hover:chaos-shift transition-all duration-200"
                  >
                    [PROFILE.SYS]
                  </a>
                </div>
              </div>
            )}
          </nav>

          {/* Terminal Connection Status and Wallet */}
          <div className="flex items-center space-x-4">
            {/* Connection Display */}
            <div className="terminal-window">
              <div className="terminal-content py-2 px-4">
                {connected && publicKey ? (
                  <div className="flex items-center space-x-2">
                    <div className="text-[var(--pump-green)] font-mono text-xs">
                      <div className="terminal-pulse">● CONNECTED</div>
                    </div>
                    <div className="text-[var(--pump-green)] font-mono text-xs border-l border-[var(--terminal-grey)] pl-2">
                      {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
                    </div>
                  </div>
                ) : (
                  <div className="text-[var(--explosive-red)] font-mono text-xs system-crash">
                    ● DISCONNECTED
                  </div>
                )}
              </div>
            </div>

            {/* Wallet Button in Terminal Style */}
            <div className="terminal-window">
              <div className="terminal-content p-1">
                <WalletMultiButton className="!bg-transparent !border-none !text-[var(--pump-green)] !font-mono !text-xs hover:!text-[var(--pure-white)] !p-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Terminal Command Bar */}
      <div className="bg-[var(--terminal-grey)] px-4 py-2 border-t border-[var(--pump-green)]/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 text-xs font-mono">
            <span className="text-[var(--pump-green)]">&gt;</span>
            <span className="text-[var(--pure-white)] terminal-flicker">
              System ready. Awaiting user input...
            </span>
            <div className="flex space-x-4 ml-auto">
              <span className="text-[var(--shockwave-blue)]">[F1] HELP</span>
              <span className="text-[var(--corruption-yellow)]">[F5] REFRESH</span>
              <span className="text-[var(--explosive-red)]">[F12] DEBUG</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chaos Indicator Bar - Data Stream */}
      <div className="h-1 bg-[var(--midnight-black)] relative overflow-hidden">
        <div className="absolute inset-0 chaos-shift opacity-60"></div>
        <div className="absolute inset-0 data-stream bg-[var(--pump-green)]/20"></div>
      </div>
    </header>
  );
}