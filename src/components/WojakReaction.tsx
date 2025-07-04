'use client';

import { useEffect, useState } from 'react';

interface WojakReactionProps {
  pnl: number; // P&L in SOL
  className?: string;
}

export default function WojakReaction({ pnl, className = '' }: WojakReactionProps) {
  const [reaction, setReaction] = useState<string>('neutral');
  const [wojakClass, setWojakClass] = useState<string>('wojak-terminal');
  const [message, setMessage] = useState<string>('Calculating devastation...');
  const [terminalStatus, setTerminalStatus] = useState<string>('STANDBY');

  useEffect(() => {
    if (pnl >= 10) {
      setReaction('moon');
      setWojakClass('wojak-terminal wojak-moon');
      setMessage('CHAD_MODE_ACTIVATED.EXE');
      setTerminalStatus('ABSOLUTELY_BASED');
    } else if (pnl >= 1) {
      setReaction('gains');
      setWojakClass('wojak-terminal wojak-gains');
      setMessage('GAINS_DETECTED.DLL');
      setTerminalStatus('COMFY');
    } else if (pnl >= -0.1 && pnl <= 0.1) {
      setReaction('neutral');
      setWojakClass('wojak-terminal');
      setMessage('CRABBING_PROTOCOL.SYS');
      setTerminalStatus('NGMI_BUT_NOT_REKT');
    } else if (pnl >= -1) {
      setReaction('losses');
      setWojakClass('wojak-terminal wojak-rekt');
      setMessage('LOSSES_DETECTED.WAR');
      setTerminalStatus('COPE_MODE_ACTIVE');
    } else if (pnl >= -5) {
      setReaction('rekt');
      setWojakClass('wojak-terminal wojak-rekt');
      setMessage('REKT_PROTOCOL_ACTIVATED.DLL');
      setTerminalStatus('MAJOR_LOSSES');
    } else {
      setReaction('rekt');
      setWojakClass('wojak-terminal wojak-rekt');
      setMessage('ABSOLUTELY_REKT.EXE');
      setTerminalStatus('FINANCIAL_SUICIDE');
    }
  }, [pnl]);

  const getTextColor = () => {
    if (pnl >= 1) return 'text-[var(--pump-green)]';
    if (pnl <= -1) return 'text-[var(--explosive-red)]';
    return 'text-[var(--shockwave-blue)]';
  };

  const getASCIIArt = () => {
    switch (reaction) {
      case 'moon':
        return `
    ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣤⣶⣶⣦⣄⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⢀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣦⠀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⡿⠋⠉⠙⢿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠸⣿⣿⣿⣿⣿⠃⠀⣠⣤⡈⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⢿⣿⣿⣿⣿⠀⠸⣿⣿⣷⠘⣿⣿⣿⣿⠀⠀⠀⠀⠀
        `;
      case 'gains':
        return `
    ⠀⠀⠀⠀⠀⠀⠀⣠⣤⣤⣤⣤⣤⣶⣦⣤⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⢀⣴⣿⡿⠛⠉⠙⠛⠛⠛⠛⠻⢿⣿⣷⣤⡀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⣼⣿⠋⠀⠀⠀⠀⠀⠀⠀⢀⣀⣀⠈⢻⣿⣿⡄⠀⠀⠀⠀
    ⠀⠀⠀⠀⣸⣿⡏⠀⠀⠀⣠⣶⣾⣿⣿⣿⠿⠿⠿⢿⣿⣿⣿⣄⠀⠀⠀
    ⠀⠀⠀⠀⣿⣿⠁⠀⠀⢰⣿⣿⣯⠁⠀⠀⠀⠀⠀⠀⠀⠈⠙⢿⣷⡄⠀
    ⠀⠀⣀⣶⣿⣿⣿⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⣿⣦⣀
        `;
      case 'rekt':
        return `
    ⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣴⣶⣿⣿⣷⣶⣄⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⠀⢰⣿⣿⣿⣿⣿⣩⣽⣿⡿⠿⣿⣿⣷⣄⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⢀⣾⣿⣿⡿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣸⣷⡀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⣼⣿⣿⣿⣿⣶⣌⡛⢿⣽⢘⣿⣷⣿⡻⠏⣛⣀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⢤⣄
    ⠀⠀⠀⠀⠀⠀⢿⣿⠄⣿⣿⣿⣿⡟⠁⣀⣤⣤⣭⣥⣤⣤⢹⡟⠉⠀⠀
        `;
      default:
        return `
    ⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣴⣶⣶⣦⣄⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⢀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣦⠀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠀⠀⠀⠀⠀
        `;
    }
  };

  return (
    <div className={`terminal-window ${className}`}>
      <div className="terminal-header">
        ANON_STATUS_MONITOR.EXE
      </div>
      <div className={wojakClass}>
        <pre className="text-[10px] leading-none mb-4 text-center whitespace-pre-wrap">
          {getASCIIArt()}
        </pre>
        
        <div className="terminal-content text-center">
          <div className="data-point mb-2">
            STATUS: {terminalStatus}
          </div>
          <div className={`data-point text-xl font-black mb-2 ${getTextColor()}`}>
            P&L: {pnl >= 0 ? '+' : ''}{pnl.toFixed(3)} SOL
          </div>
          <div className="data-point text-xs">
            {message}
          </div>
          
          {/* Status indicators */}
          <div className="mt-4 flex justify-center space-x-4 text-xs font-mono">
            <div className={`${pnl >= 0 ? 'text-[var(--pump-green)]' : 'text-[var(--explosive-red)]'}`}>
              [{pnl >= 0 ? 'GAINS' : 'LOSSES'}]
            </div>
            <div className="text-[var(--shockwave-blue)]">
              [HODL: {Math.abs(pnl) > 5 ? 'DIAMOND' : 'PAPER'}]
            </div>
            <div className="text-[var(--corruption-yellow)]">
              [RISK: {Math.abs(pnl) > 10 ? 'DEGEN' : 'NORMIE'}]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Terminal ASCII Symbols Component System
interface TerminalSymbolProps {
  type: 'arrow_up' | 'arrow_down' | 'diamond' | 'fire' | 'skull' | 'rocket' | 'chart';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export function TerminalSymbol({ type, size = 'md', animate = false }: TerminalSymbolProps) {
  const symbols = {
    arrow_up: '▲',
    arrow_down: '▼',
    diamond: '◆',
    fire: '▣',
    skull: '☠',
    rocket: '▶',
    chart: '▬'
  };

  const sizes = {
    sm: 'text-sm',
    md: 'text-lg', 
    lg: 'text-2xl'
  };

  const colors = {
    arrow_up: 'text-[var(--pump-green)]',
    arrow_down: 'text-[var(--explosive-red)]',
    diamond: 'text-[var(--shockwave-blue)]',
    fire: 'text-[var(--corruption-yellow)]',
    skull: 'text-[var(--explosive-red)]',
    rocket: 'text-[var(--pump-green)]',
    chart: 'text-[var(--pure-white)]'
  };

  return (
    <span className={`${sizes[size]} ${colors[type]} font-mono ${animate ? 'terminal-pulse' : ''}`}>
      {symbols[type]}
    </span>
  );
}

// ASCII Art Status Display
interface ASCIIStatusProps {
  level: 'gains' | 'losses' | 'neutral' | 'moon' | 'rekt';
  value: number;
}

export function ASCIIStatus({ level, value }: ASCIIStatusProps) {
  const getBarGraph = () => {
    const barLength = Math.min(Math.abs(value) * 10, 20);
    const bar = '█'.repeat(Math.floor(barLength)) + '░'.repeat(20 - Math.floor(barLength));
    return bar;
  };

  const getColorClass = () => {
    switch (level) {
      case 'gains':
      case 'moon':
        return 'text-[var(--pump-green)]';
      case 'losses':
      case 'rekt':
        return 'text-[var(--explosive-red)]';
      default:
        return 'text-[var(--shockwave-blue)]';
    }
  };

  return (
    <div className="terminal-window">
      <div className="terminal-header">
        ASCII_STATUS_DISPLAY.SYS
      </div>
      <div className="terminal-content">
        <div className="font-mono text-xs space-y-1">
          <div className="flex justify-between">
            <span>VALUE:</span>
            <span className={getColorClass()}>{value.toFixed(3)}</span>
          </div>
          <div className="flex justify-between">
            <span>STATUS:</span>
            <span className={getColorClass()}>{level.toUpperCase()}</span>
          </div>
          <div className="mt-2">
            <div className="text-[var(--terminal-grey)] text-xs mb-1">CHART:</div>
            <div className={`font-mono text-xs ${getColorClass()}`}>
              [{getBarGraph()}]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Terminal Progress Bar
interface TerminalProgressProps {
  progress: number; // 0-100
  label: string;
  color?: 'green' | 'red' | 'blue' | 'yellow';
}

export function TerminalProgress({ progress, label, color = 'green' }: TerminalProgressProps) {
  const colorClasses = {
    green: 'text-[var(--pump-green)]',
    red: 'text-[var(--explosive-red)]',
    blue: 'text-[var(--shockwave-blue)]',
    yellow: 'text-[var(--corruption-yellow)]'
  };

  const progressBar = '█'.repeat(Math.floor(progress / 5)) + '░'.repeat(20 - Math.floor(progress / 5));

  return (
    <div className="terminal-content">
      <div className="flex justify-between text-xs font-mono mb-1">
        <span>{label}</span>
        <span className={colorClasses[color]}>{progress.toFixed(1)}%</span>
      </div>
      <div className={`font-mono text-xs ${colorClasses[color]}`}>
        [{progressBar}]
      </div>
    </div>
  );
}

// Diamond Hands ASCII Indicator
interface DiamondHandsProps {
  holdTime: number; // in minutes
}

export function DiamondHands({ holdTime }: DiamondHandsProps) {
  const getDiamondLevel = () => {
    if (holdTime >= 1440) return { 
      ascii: '◆◆◆', 
      text: 'LEGENDARY_DIAMOND_HANDS.EXE', 
      class: 'wojak-moon' 
    };
    if (holdTime >= 720) return { 
      ascii: '◆◆', 
      text: 'DIAMOND_HANDS.DLL', 
      class: 'wojak-gains' 
    };
    if (holdTime >= 60) return { 
      ascii: '◆', 
      text: 'DIAMOND_HANDS_DETECTED.SYS', 
      class: '' 
    };
    if (holdTime >= 10) return { 
      ascii: '▣', 
      text: 'HOLDING_STRONG.DAT', 
      class: '' 
    };
    return { 
      ascii: '░', 
      text: 'PAPER_HANDS_DETECTED.ERR', 
      class: 'wojak-rekt' 
    };
  };

  const diamond = getDiamondLevel();

  return (
    <div className={`terminal-window ${diamond.class}`}>
      <div className="terminal-header">
        DIAMOND_HANDS_DETECTOR.EXE
      </div>
      <div className="terminal-content text-center">
        <div className="text-2xl font-mono mb-2 terminal-glow">
          {diamond.ascii}
        </div>
        <div className="data-point text-xs">
          {diamond.text}
        </div>
        <div className="data-point text-xs mt-2">
          HOLD_TIME: {holdTime}m
        </div>
      </div>
    </div>
  );
}