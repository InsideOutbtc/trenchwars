'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface BettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: {
    symbol: string;
    name: string;
    icon: string;
    odds: number;
  };
  balance: number;
}

export default function BettingModal({ isOpen, onClose, token, balance }: BettingModalProps) {
  const { connected, publicKey } = useWallet();
  const [betAmount, setBetAmount] = useState('');
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<string | null>(null);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickAmounts = [
    { label: '0.1', value: '0.1' },
    { label: '1', value: '1' },
    { label: '10', value: '10' },
    { label: 'MAX', value: balance.toString() }
  ];

  const platformFeeRate = 0.025; // 2.5%
  const solPrice = 100; // Mock SOL price in USD

  useEffect(() => {
    if (isOpen) {
      setBetAmount('');
      setSelectedQuickAmount(null);
      setError(null);
    }
  }, [isOpen]);

  const parsedAmount = parseFloat(betAmount) || 0;
  const platformFee = parsedAmount * platformFeeRate;
  const potentialWin = parsedAmount * token.odds;
  const amountUSD = parsedAmount * solPrice;

  const handleQuickAmount = (amount: string, value: string) => {
    setBetAmount(value);
    setSelectedQuickAmount(amount);
    setError(null);
  };

  const handleAmountChange = (value: string) => {
    setBetAmount(value);
    setSelectedQuickAmount(null);
    setError(null);
  };

  const validateBet = () => {
    if (!connected) {
      setError('Please connect your wallet first');
      return false;
    }

    if (parsedAmount <= 0) {
      setError('Bet amount must be greater than 0');
      return false;
    }

    if (parsedAmount < 0.01) {
      setError('Minimum bet is 0.01 SOL');
      return false;
    }

    if (parsedAmount > balance) {
      setError('Insufficient balance');
      return false;
    }

    if (parsedAmount + platformFee > balance) {
      setError('Insufficient balance for bet + fees');
      return false;
    }

    return true;
  };

  const handlePlaceBet = async () => {
    if (!validateBet()) return;

    setIsPlacingBet(true);
    setError(null);

    try {
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success - in real implementation, this would interact with Solana
      console.log('Bet placed:', {
        token: token.symbol,
        amount: parsedAmount,
        fee: platformFee,
        potentialWin,
        wallet: publicKey?.toString()
      });

      // Show success and close modal
      alert(`Successfully bet ${parsedAmount} SOL on ${token.symbol}!`);
      onClose();
    } catch (err) {
      setError('Transaction failed. Please try again.');
    } finally {
      setIsPlacingBet(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="betting-modal fade-in">
      <div className="modal-content slide-in">
        <div className="modal-header">
          <h2 className="modal-title text-xl">Place Bet</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="bet-setup">
          {/* Selected Fighter */}
          <div className="selected-fighter">
            <img src={token.icon} className="fighter-icon" alt={token.symbol} />
            <div className="fighter-info">
              <div className="fighter-name text-lg">{token.symbol}</div>
              <div className="fighter-odds text-sm">{token.odds.toFixed(2)}x payout</div>
            </div>
          </div>

          {/* Bet Amount Section */}
          <div className="bet-amount-section">
            <label className="input-label text-sm">Bet Amount (SOL)</label>
            <div className="amount-input-group">
              <input
                type="number"
                className="amount-input text-xl mono"
                placeholder="0.0"
                value={betAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                min="0.01"
                max={balance}
                step="0.01"
              />
              <div className="quick-amounts">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount.label}
                    className={`quick-amount text-xs ${selectedQuickAmount === amount.label ? 'active' : ''}`}
                    onClick={() => handleQuickAmount(amount.label, amount.value)}
                  >
                    {amount.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="amount-usd text-sm">≈ ${amountUSD.toFixed(2)} USD</div>
          </div>

          {/* Bet Summary */}
          <div className="bet-summary">
            <div className="summary-row">
              <span className="summary-label text-sm">Bet Amount:</span>
              <span className="summary-value text-sm mono">{parsedAmount.toFixed(3)} SOL</span>
            </div>
            <div className="summary-row">
              <span className="summary-label text-sm">Potential Win:</span>
              <span className="summary-value text-sm mono positive">{potentialWin.toFixed(3)} SOL</span>
            </div>
            <div className="summary-row">
              <span className="summary-label text-sm">Platform Fee (2.5%):</span>
              <span className="summary-value text-sm mono">{platformFee.toFixed(3)} SOL</span>
            </div>
            <div className="summary-row" style={{ borderTop: '1px solid var(--border-default)', paddingTop: '8px', marginTop: '8px' }}>
              <span className="summary-label text-sm font-semibold">Total Cost:</span>
              <span className="summary-value text-sm mono font-semibold">{(parsedAmount + platformFee).toFixed(3)} SOL</span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div style={{ 
              padding: '12px', 
              background: 'rgba(255, 107, 107, 0.1)', 
              border: '1px solid var(--red-negative)', 
              borderRadius: '8px',
              color: 'var(--red-negative)',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="quick-bet-btn"
              onClick={onClose}
              style={{ flex: 1, background: 'var(--bg-elevated)' }}
            >
              Cancel
            </button>
            <button
              className="confirm-bet-btn"
              onClick={handlePlaceBet}
              disabled={isPlacingBet || !parsedAmount || !!error}
              style={{ flex: 2 }}
            >
              <span className="btn-icon">{token.symbol === 'PEPE' ? '🐸' : token.symbol === 'SHIB' ? '🐕' : '🚀'}</span>
              <span className="btn-text">
                {isPlacingBet ? 'Placing Bet...' : 'Send It'}
              </span>
            </button>
          </div>
        </div>

        {/* Balance Display */}
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'var(--bg-elevated)',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--text-secondary)'
        }}>
          Available Balance: <span className="mono" style={{ color: 'var(--text-primary)' }}>{balance.toFixed(3)} SOL</span>
        </div>
      </div>
    </div>
  );
}