'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { War } from '@/hooks/useWar';
import { X, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
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

  const selectedToken = tokenChoice === 0 ? war.token_a : war.token_b;
  const betAmountLamports = parseFloat(betAmount) * LAMPORTS_PER_SOL;

  const handlePlaceBet = async () => {
    if (!publicKey) {
      setError('Wallet not connected');
      return;
    }

    if (parseFloat(betAmount) <= 0) {
      setError('Bet amount must be greater than 0');
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

      alert('Bet placed successfully!');
      onClose();
    } catch (err: unknown) {
      console.error('Error placing bet:', err);
      setError(err instanceof Error ? err.message : 'Failed to place bet');
    } finally {
      setIsPlacingBet(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Place Your Bet</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* War Info */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-white mb-2">
              {war.token_a.symbol} vs {war.token_b.symbol}
            </h4>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-gray-400">Betting on:</span>
              <span className="text-purple-400 font-semibold text-lg">{selectedToken.symbol}</span>
            </div>
          </div>
        </div>

        {/* Token Details */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <div className="text-center">
            <h5 className="text-lg font-semibold text-white mb-2">{selectedToken.name}</h5>
            <div className="text-2xl font-bold text-green-400 mb-2">
              ${selectedToken.price?.toFixed(4) || '0.0000'}
            </div>
            <div className="flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
              <span className={`text-sm ${selectedToken.price_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {selectedToken.price_change_24h?.toFixed(2) || '0.00'}% (24h)
              </span>
            </div>
          </div>
        </div>

        {/* Bet Amount */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bet Amount (SOL)
          </label>
          <div className="relative">
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              placeholder="0.1"
              min="0.001"
              step="0.001"
            />
            <div className="absolute right-3 top-3 text-gray-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-400">Min: 0.001 SOL</span>
            <span className="text-xs text-gray-400">≈ ${(parseFloat(betAmount) * 100).toFixed(2)} USD</span>
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {['0.1', '0.5', '1.0', '2.0'].map((amount) => (
            <button
              key={amount}
              onClick={() => setBetAmount(amount)}
              className="bg-gray-700 hover:bg-purple-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {amount}
            </button>
          ))}
        </div>

        {/* Potential Winnings */}
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Potential Winnings:</span>
            <span className="text-green-400 font-semibold">
              ~{(parseFloat(betAmount) * 1.8).toFixed(3)} SOL
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Estimated based on current odds. Actual winnings may vary.
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-6 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePlaceBet}
            disabled={isPlacingBet || parseFloat(betAmount) <= 0}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlacingBet ? 'Placing Bet...' : `Bet ${betAmount} SOL`}
          </button>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          By placing this bet, you acknowledge the risks involved in cryptocurrency betting.
        </div>
      </div>
    </div>
  );
}