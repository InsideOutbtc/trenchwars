'use client';

import { useEffect, useState } from 'react';

interface WojakReactionProps {
  pnl: number; // P&L in SOL
  className?: string;
}

export default function WojakReaction({ pnl, className = '' }: WojakReactionProps) {
  const [reaction, setReaction] = useState<string>('😐');
  const [wojakClass, setWojakClass] = useState<string>('wojak-neutral');
  const [message, setMessage] = useState<string>('Waiting for action...');

  useEffect(() => {
    if (pnl >= 10) {
      setReaction('😎');
      setWojakClass('wojak-massive-gains');
      setMessage('CHAD MODE ACTIVATED');
    } else if (pnl >= 1) {
      setReaction('😊');
      setWojakClass('wojak-gains');
      setMessage('Number go up! 📈');
    } else if (pnl >= -0.1 && pnl <= 0.1) {
      setReaction('😐');
      setWojakClass('wojak-neutral');
      setMessage('Crabbing...');
    } else if (pnl >= -1) {
      setReaction('😰');
      setWojakClass('wojak-losses');
      setMessage('This is fine... 🔥');
    } else if (pnl >= -5) {
      setReaction('😭');
      setWojakClass('wojak-rekt');
      setMessage('NGMI anon...');
    } else {
      setReaction('💀');
      setWojakClass('wojak-rekt schizo-shake');
      setMessage('ABSOLUTELY REKT');
    }
  }, [pnl]);

  const getTextColor = () => {
    if (pnl >= 1) return 'text-[var(--schizo-green)]';
    if (pnl <= -1) return 'text-[var(--schizo-red)]';
    return 'text-[var(--schizo-blue)]';
  };

  return (
    <div className={`wojak-container ${className}`}>
      <div className={`${wojakClass} flex items-center space-x-2 p-2 rounded-lg bg-gray-900/50 backdrop-blur`}>
        <div className="text-3xl">{reaction}</div>
        <div className="flex flex-col">
          <div className={`font-bold ${getTextColor()}`}>
            {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} SOL
          </div>
          <div className="text-xs text-gray-400">{message}</div>
        </div>
      </div>
    </div>
  );
}

// 🐸 Pepe Emoji Component System 🐸
interface PepeEmojiProps {
  type: 'happy' | 'sad' | 'smug' | 'confused' | 'angry';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export function PepeEmoji({ type, size = 'md', animate = false }: PepeEmojiProps) {
  const emojis = {
    happy: '🐸',
    sad: '😢',
    smug: '😏', 
    confused: '🤔',
    angry: '😠'
  };

  const sizes = {
    sm: 'text-sm',
    md: 'text-lg', 
    lg: 'text-2xl'
  };

  return (
    <span className={`${sizes[size]} ${animate ? 'schizo-pulse' : ''}`}>
      {emojis[type]}
    </span>
  );
}

// 💎 Diamond Hands Indicator 💎
interface DiamondHandsProps {
  holdTime: number; // in minutes
}

export function DiamondHands({ holdTime }: DiamondHandsProps) {
  const getDiamondLevel = () => {
    if (holdTime >= 1440) return { emoji: '💎💎💎', text: 'LEGENDARY DIAMOND HANDS', class: 'schizo-text-glow' };
    if (holdTime >= 720) return { emoji: '💎💎', text: 'Diamond Hands', class: 'schizo-pulse' };
    if (holdTime >= 60) return { emoji: '💎', text: 'Diamond Hands', class: '' };
    if (holdTime >= 10) return { emoji: '🙌', text: 'Holding Strong', class: '' };
    return { emoji: '📄', text: 'Paper Hands', class: 'schizo-shake' };
  };

  const diamond = getDiamondLevel();

  return (
    <div className={`flex items-center space-x-1 ${diamond.class}`}>
      <span>{diamond.emoji}</span>
      <span className="text-xs font-medium">{diamond.text}</span>
    </div>
  );
}