'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { War, useWarStats } from '@/hooks/useWar';
import { Clock, TrendingUp, TrendingDown, Users, DollarSign, Zap, Hash } from 'lucide-react';
import BettingModal from './BettingModal';
import SocialMetrics from './SocialMetrics';

interface WarCardProps {
  war: War;
}

export default function WarCard({ war }: WarCardProps) {
  const { connected } = useWallet();
  const { stats, loading: statsLoading } = useWarStats(war.id);
  const [timeLeft, setTimeLeft] = useState('');
  const [showBettingModal, setShowBettingModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState<0 | 1 | null>(null);
  const [socialMultipliers, setSocialMultipliers] = useState<Record<string, number>>({});
  const [showSocialMetrics, setShowSocialMetrics] = useState(false);

  // Calculate time remaining
  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date().getTime();
      const endTime = new Date(war.end_time).getTime();
      const difference = endTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m`);
        } else {
          setTimeLeft(`${minutes}m`);
        }
      } else {
        setTimeLeft('Ended');
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, [war.end_time]);

  // Fetch social multipliers
  useEffect(() => {
    const fetchSocialMultipliers = async () => {
      try {
        const response = await fetch('/api/social/engagement/multipliers');
        if (response.ok) {
          const data = await response.json();
          setSocialMultipliers(data);
        }
      } catch (error) {
        console.error('Error fetching social multipliers:', error);
      }
    };

    fetchSocialMultipliers();
  }, []);

  const handleBet = (tokenChoice: 0 | 1) => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }
    setSelectedToken(tokenChoice);
    setShowBettingModal(true);
  };

  // Calculate percentages for visual representation
  const totalBets = (stats?.total_bets_a || 0) + (stats?.total_bets_b || 0);
  const percentageA = totalBets > 0 ? ((stats?.total_bets_a || 0) / totalBets) * 100 : 50;
  const percentageB = totalBets > 0 ? ((stats?.total_bets_b || 0) / totalBets) * 100 : 50;

  return (
    <>
      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-1">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <span className="text-purple-400 font-semibold">{timeLeft}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSocialMetrics(!showSocialMetrics)}
                className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                title="Toggle social metrics"
              >
                <Hash className="w-4 h-4" />
              </button>
              <div className="text-sm text-gray-400">
                War #{war.id}
              </div>
            </div>
          </div>
          
          {/* Battle Title */}
          <h3 className="text-xl font-bold text-white text-center">
            {war.token_a.symbol} vs {war.token_b.symbol}
          </h3>
        </div>

        {/* Fighters */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Token A */}
            <button
              onClick={() => handleBet(0)}
              className="bg-gray-700 rounded-lg p-4 hover:bg-purple-600/20 transition-colors border-2 border-transparent hover:border-purple-500"
              disabled={!connected || timeLeft === 'Ended'}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{war.token_a.symbol}</div>
                <div className="text-sm text-gray-400 mb-2">{war.token_a.name}</div>
                <div className="text-lg font-semibold text-green-400">
                  ${war.token_a.price?.toFixed(4) || '0.0000'}
                </div>
                {socialMultipliers[war.token_a.symbol] && (
                  <div className="flex items-center justify-center mt-1">
                    <Zap className="w-3 h-3 text-yellow-400 mr-1" />
                    <span className="text-xs text-yellow-400">
                      {socialMultipliers[war.token_a.symbol].toFixed(2)}x
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-center mt-2">
                  {war.token_a.price_change_24h >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                  )}
                  <span className={`text-sm ${war.token_a.price_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {war.token_a.price_change_24h?.toFixed(2) || '0.00'}%
                  </span>
                </div>
              </div>
            </button>

            {/* Token B */}
            <button
              onClick={() => handleBet(1)}
              className="bg-gray-700 rounded-lg p-4 hover:bg-purple-600/20 transition-colors border-2 border-transparent hover:border-purple-500"
              disabled={!connected || timeLeft === 'Ended'}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{war.token_b.symbol}</div>
                <div className="text-sm text-gray-400 mb-2">{war.token_b.name}</div>
                <div className="text-lg font-semibold text-green-400">
                  ${war.token_b.price?.toFixed(4) || '0.0000'}
                </div>
                {socialMultipliers[war.token_b.symbol] && (
                  <div className="flex items-center justify-center mt-1">
                    <Zap className="w-3 h-3 text-yellow-400 mr-1" />
                    <span className="text-xs text-yellow-400">
                      {socialMultipliers[war.token_b.symbol].toFixed(2)}x
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-center mt-2">
                  {war.token_b.price_change_24h >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                  )}
                  <span className={`text-sm ${war.token_b.price_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {war.token_b.price_change_24h?.toFixed(2) || '0.00'}%
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Betting Stats */}
          {stats && !statsLoading && (
            <>
              {/* Betting Distribution */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>{war.token_a.symbol}: {percentageA.toFixed(1)}%</span>
                  <span>{war.token_b.symbol}: {percentageB.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div className="h-full flex">
                    <div 
                      className="bg-purple-500" 
                      style={{ width: `${percentageA}%` }}
                    ></div>
                    <div 
                      className="bg-pink-500" 
                      style={{ width: `${percentageB}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center mb-1">
                    <DollarSign className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="text-lg font-semibold text-white">
                    {((stats.total_pool || 0) / 1e9).toFixed(2)} SOL
                  </div>
                  <div className="text-xs text-gray-400">Total Pool</div>
                </div>
                <div>
                  <div className="flex items-center justify-center mb-1">
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-lg font-semibold text-white">
                    {stats.unique_bettors || 0}
                  </div>
                  <div className="text-xs text-gray-400">Bettors</div>
                </div>
                <div>
                  <div className="flex items-center justify-center mb-1">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="text-lg font-semibold text-white">
                    {stats.total_bets || 0}
                  </div>
                  <div className="text-xs text-gray-400">Total Bets</div>
                </div>
              </div>
            </>
          )}

          {/* Social Metrics */}
          {showSocialMetrics && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SocialMetrics tokenSymbol={war.token_a.symbol} />
                <SocialMetrics tokenSymbol={war.token_b.symbol} />
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            {!connected ? (
              <p className="text-center text-gray-400 text-sm">
                Connect wallet to participate
              </p>
            ) : timeLeft === 'Ended' ? (
              <p className="text-center text-red-400 text-sm font-semibold">
                War Ended
              </p>
            ) : (
              <p className="text-center text-purple-400 text-sm font-semibold">
                Click a token to place your bet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Betting Modal */}
      {showBettingModal && selectedToken !== null && (
        <BettingModal
          war={war}
          tokenChoice={selectedToken}
          onClose={() => {
            setShowBettingModal(false);
            setSelectedToken(null);
          }}
        />
      )}
    </>
  );
}