'use client';

import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { War } from '@/hooks/useWar';
import { X, TrendingUp, DollarSign, AlertCircle, Zap, Target } from 'lucide-react';
import { PepeEmoji } from './WojakReaction';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

interface BettingModalProps {
  war: War;
  tokenChoice: 0 | 1;
  onClose: () => void;
}

export default function BettingModal({ war, tokenChoice, onClose }: BettingModalProps) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [betAmount, setBetAmount] = useState('0.1');
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 🔥 SCHIZO STATE MANAGEMENT 🔥
  const [isShaking, setIsShaking] = useState(false);
  const [battleMode, setBattleMode] = useState(false);
  const [currentPepe, setCurrentPepe] = useState<'happy' | 'smug' | 'confused' | 'angry'>('happy');
  const [sendItIntensity, setSendItIntensity] = useState(1);

  // 💥 CHAOS EFFECTS 💥
  useEffect(() => {
    const amount = parseFloat(betAmount);
    if (amount >= 5) {
      setBattleMode(true);
      setCurrentPepe('smug');
      setSendItIntensity(3);
    } else if (amount >= 1) {
      setBattleMode(true);
      setCurrentPepe('happy');
      setSendItIntensity(2);
    } else {
      setBattleMode(false);
      setCurrentPepe('confused');
      setSendItIntensity(1);
    }
  }, [betAmount]);

  // 🎯 SHAKE EFFECT FOR BIG BETS 🎯
  useEffect(() => {
    if (parseFloat(betAmount) >= 10) {
      const interval = setInterval(() => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 200);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [betAmount]);

  const selectedToken = tokenChoice === 0 ? war.token_a : war.token_b;
  const betAmountLamports = parseFloat(betAmount) * LAMPORTS_PER_SOL;

  const handlePlaceBet = async () => {
    if (!publicKey) {
      setError('💀 REKT - No wallet connected, anon!');
      setCurrentPepe('angry');
      return;
    }

    if (parseFloat(betAmount) <= 0) {
      setError('🤡 NGMI - You need to actually bet something, fren!');
      setCurrentPepe('confused');
      return;
    }

    if (parseFloat(betAmount) >= 100) {
      setError('🐋 WHALE ALERT - Are you absolutely sure about this degeneracy?');
      setCurrentPepe('smug');
      return;
    }

    setIsPlacingBet(true);
    setError(null);

    try {
      // Create transaction to send SOL to the deployed smart contract
      const programPublicKey = new PublicKey('7KK67M12SbodyTKSetMjMeCWBiDNvB817dkWWvueRbYG');
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: programPublicKey,
          lamports: betAmountLamports,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      // Record the bet in the backend
      const betData = {
        war_id: war.id,
        user_wallet: publicKey.toString(),
        amount: betAmountLamports,
        token_choice: tokenChoice,
        transaction_signature: signature
      };

      const response = await fetch('https://api.trenchwars.wtf/api/bets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(betData),
      });

      if (!response.ok) {
        throw new Error('Failed to record bet in backend');
      }

      const betResult = await response.json();
      console.log('Bet recorded successfully:', betResult);

      // 🚀 ABSOLUTE SEND SUCCESS 🚀
      const successMessages = [
        '🚀 ABSOLUTELY SENT! Your bet is live, anon!',
        '💎 DIAMOND HANDS ACTIVATED - Bet placed successfully!',
        '🔥 BASED! Your degeneracy has been recorded on-chain!',
        '⚔️ BATTLE STATIONS - You\'re now in the trenches!',
        '🎯 LOCKED AND LOADED - May the best token win!'
      ];
      const randomMessage = successMessages[Math.floor(Math.random() * successMessages.length)];
      alert(randomMessage);
      onClose();
    } catch (err: unknown) {
      console.error('Error placing bet:', err);
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      setError(`💀 REKT - ${errorMessage}. Try again, anon!`);
      setCurrentPepe('sad');
    } finally {
      setIsPlacingBet(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`battle-card max-w-md w-full ${isShaking ? 'schizo-shake' : ''} ${battleMode ? 'schizo-pulse' : ''}`}>
        {/* 🔥 SCHIZO HEADER 🔥 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <Target className={`w-6 h-6 text-[var(--schizo-green)] ${battleMode ? 'schizo-pulse' : ''}`} />
            <h3 className={`text-2xl font-black text-white schizo-text-glow ${battleMode ? 'schizo-glitch' : ''}`}>
              🎯 SEND IT! 🎯
            </h3>
            <PepeEmoji type={currentPepe} size="lg" animate={battleMode} />
          </div>
          <button
            onClick={onClose}
            className="text-[var(--schizo-red)] hover:text-white transition-colors hover:schizo-pulse"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* ⚔️ BATTLE INFO ⚔️ */}
        <div className="bg-[var(--schizo-bg-secondary)] border-2 border-[var(--schizo-green)] rounded-lg p-4 mb-6 schizo-bg-chaos">
          <div className="text-center">
            <h4 className={`text-xl font-black text-white mb-3 ${battleMode ? 'schizo-text-glow' : ''}`}>
              ⚔️ {war.token_a.symbol} VS {war.token_b.symbol} ⚔️
            </h4>
            <div className="flex items-center justify-center space-x-3">
              <span className="text-white font-bold">WEAPON OF CHOICE:</span>
              <span className={`text-[var(--schizo-green)] font-black text-xl ${battleMode ? 'schizo-pulse' : ''}`}>
                🚀 {selectedToken.symbol} 🚀
              </span>
            </div>
            <div className="mt-2 text-xs text-[var(--schizo-yellow)] font-bold uppercase tracking-wider">
              MAXIMUM DEGENERACY MODE
            </div>
          </div>
        </div>

        {/* 💎 TOKEN STATS 💎 */}
        <div className="bg-[var(--schizo-bg-secondary)] border border-[var(--schizo-blue)] rounded-lg p-4 mb-6">
          <div className="text-center">
            <h5 className="text-lg font-black text-white mb-2 uppercase tracking-wider">
              💎 {selectedToken.name} 💎
            </h5>
            <div className={`text-3xl font-black mb-2 ${selectedToken.price_change_24h >= 0 ? 'text-[var(--schizo-green)] schizo-pump' : 'text-[var(--schizo-red)] schizo-dump'}`}>
              ${selectedToken.price?.toFixed(4) || '0.0000'}
            </div>
            <div className="flex items-center justify-center space-x-2">
              {selectedToken.price_change_24h >= 0 ? (
                <div className="flex items-center text-[var(--schizo-green)]">
                  <TrendingUp className="w-5 h-5 mr-1 schizo-pulse" />
                  <span className="font-black text-lg">📈 +{selectedToken.price_change_24h?.toFixed(2) || '0.00'}% PUMP!</span>
                </div>
              ) : (
                <div className="flex items-center text-[var(--schizo-red)]">
                  <span className="font-black text-lg">📉 {selectedToken.price_change_24h?.toFixed(2) || '0.00'}% DUMP</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 💰 BET SIZE - HOW MUCH ARE YOU WILLING TO LOSE? 💰 */}
        <div className="mb-6">
          <label className="block text-lg font-black text-white mb-3 uppercase tracking-wider">
            💰 How much are you willing to lose, anon? 💰
          </label>
          <div className="relative">
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className={`w-full bg-[var(--schizo-bg-secondary)] border-2 ${battleMode ? 'border-[var(--schizo-green)]' : 'border-[var(--schizo-blue)]'} rounded-lg px-4 py-4 text-white text-xl font-black focus:border-[var(--schizo-green)] focus:outline-none ${parseFloat(betAmount) >= 5 ? 'schizo-text-glow' : ''}`}
              placeholder="0.1"
              min="0.001"
              step="0.001"
            />
            <div className={`absolute right-4 top-4 ${battleMode ? 'text-[var(--schizo-green)]' : 'text-[var(--schizo-blue)]'}`}>
              <Zap className={`w-6 h-6 ${battleMode ? 'schizo-pulse' : ''}`} />
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-[var(--schizo-yellow)] font-bold">MIN: 0.001 SOL (baby bet)</span>
            <span className="text-xs text-[var(--schizo-green)] font-bold">≈ ${(parseFloat(betAmount) * 100).toFixed(2)} USD</span>
          </div>
        </div>

        {/* 🎯 DEGEN QUICK BETS 🎯 */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { amount: '0.1', label: '🐱 SMOL' },
            { amount: '0.5', label: '🦆 SAFE' },
            { amount: '1.0', label: '🚀 SEND' },
            { amount: '5.0', label: '💎 YOLO' }
          ].map((bet) => (
            <button
              key={bet.amount}
              onClick={() => setBetAmount(bet.amount)}
              className={`${parseFloat(bet.amount) >= 1 ? 'btn-send-it' : 'bg-[var(--schizo-bg-secondary)]'} hover:schizo-pulse text-white py-3 rounded-lg text-xs font-black transition-all uppercase border-2 border-[var(--schizo-green)]`}
            >
              <div>{bet.label}</div>
              <div>{bet.amount}</div>
            </button>
          ))}
        </div>

        {/* 🚀 POTENTIAL MOON MISSION 🚀 */}
        <div className="bg-[var(--schizo-bg-secondary)] border-2 border-[var(--schizo-green)] rounded-lg p-4 mb-6 schizo-pulse">
          <div className="flex justify-between items-center">
            <span className="text-white font-black uppercase tracking-wider">🚀 MOON POTENTIAL:</span>
            <span className={`text-[var(--schizo-green)] font-black text-xl ${sendItIntensity >= 2 ? 'schizo-text-glow' : ''}`}>
              ~{(parseFloat(betAmount) * 1.8).toFixed(3)} SOL 💎
            </span>
          </div>
          <div className="text-xs text-[var(--schizo-yellow)] font-bold mt-2 uppercase tracking-wider">
            {sendItIntensity >= 3 ? '🐋 WHALE MODE - LAMBO OR CARDBOARD!' : 
             sendItIntensity >= 2 ? '💎 DIAMOND HANDS - TO THE MOON!' : 
             '🐱 SMOL BET - SAFE BUT BORING...'}
          </div>
        </div>

        {/* 💀 ERROR CHAOS 💀 */}
        {error && (
          <div className="bg-[var(--schizo-bg-secondary)] border-2 border-[var(--schizo-red)] rounded-lg p-4 mb-6 schizo-shake">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-[var(--schizo-red)] schizo-pulse" />
              <span className="text-[var(--schizo-red)] font-black text-sm uppercase tracking-wider">{error}</span>
            </div>
          </div>
        )}

        {/* 💥 ACTION CHAOS 💥 */}
        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 btn-rekt hover:schizo-shake text-white py-4 rounded-lg font-black uppercase tracking-wider transition-all"
          >
            📄 PAPER HANDS
          </button>
          <button
            onClick={handlePlaceBet}
            disabled={isPlacingBet || parseFloat(betAmount) <= 0}
            className={`flex-1 ${sendItIntensity >= 2 ? 'btn-send-it' : 'bg-[var(--schizo-bg-secondary)] border-2 border-[var(--schizo-green)]'} py-4 rounded-lg font-black uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed ${battleMode ? 'schizo-pulse' : ''}`}
          >
            {isPlacingBet ? (
              <div className="flex items-center justify-center space-x-2">
                <span className="schizo-pulse">⚡</span>
                <span>SENDING...</span>
                <span className="schizo-pulse">⚡</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span>🚀</span>
                <span>{sendItIntensity >= 3 ? 'ABSOLUTELY SEND IT!' : sendItIntensity >= 2 ? 'SEND IT!' : 'Send'}</span>
                <span>🚀</span>
              </div>
            )}
          </button>
        </div>

        {/* 💀 DEGEN DISCLAIMER 💀 */}
        <div className="mt-6 text-xs text-[var(--schizo-yellow)] text-center font-bold uppercase tracking-wider border-t border-[var(--schizo-green)] pt-4">
          ⚠️ YOU ARE ENTERING MAXIMUM DEGENERACY ZONE ⚠️<br/>
          ONLY BET WHAT YOU CAN AFFORD TO LOSE, ANON!<br/>
          🎯 TRENCHWARS = NOT FINANCIAL ADVICE 🎯
        </div>
      </div>
    </div>
  );
}