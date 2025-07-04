'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { HistoryIcon, FilterIcon, TrendingUpIcon, TrendingDownIcon, CalendarIcon, DollarSignIcon } from 'lucide-react';

interface Bet {
  id: number;
  war_id: number;
  user_wallet: string;
  amount: number;
  token_choice: 0 | 1;
  transaction_signature: string;
  created_at: string;
  war: {
    id: number;
    token_a: { symbol: string; name: string };
    token_b: { symbol: string; name: string };
    is_settled: boolean;
    winner: 0 | 1 | null;
    end_time: string;
  };
  payout?: number;
  profit?: number;
}

interface BetHistoryProps {
  className?: string;
}

export default function BetHistory({ className = '' }: BetHistoryProps) {
  const { publicKey } = useWallet();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'won' | 'lost' | 'pending' | 'cancelled'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'profit'>('date');
  const [dateRange, setDateRange] = useState<'all' | '7d' | '30d' | '90d'>('all');

  useEffect(() => {
    if (publicKey) {
      fetchBetHistory();
    }
  }, [publicKey]);

  const fetchBetHistory = async () => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      const response = await fetch(`https://api.trenchwars.wtf/api/bets/user/${publicKey?.toBase58()}`);
      if (!response.ok) throw new Error('Failed to fetch bet history');
      const data = await response.json();
      setBets(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching bet history:', error);
      setError('Failed to load bet history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return `${(amount / 1e9).toFixed(3)} SOL`;
  };

  const getBetStatus = (bet: Bet) => {
    if (!bet.war.is_settled) return 'pending';
    if (bet.war.winner === null) return 'cancelled';
    return bet.war.winner === bet.token_choice ? 'won' : 'lost';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won': return 'text-green-400';
      case 'lost': return 'text-red-400';
      case 'pending': return 'text-yellow-400';
      case 'cancelled': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'won': return <TrendingUpIcon className="w-4 h-4" />;
      case 'lost': return <TrendingDownIcon className="w-4 h-4" />;
      case 'pending': return <CalendarIcon className="w-4 h-4" />;
      default: return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const filteredAndSortedBets = bets
    .filter(bet => {
      // Filter by status
      if (filter !== 'all' && getBetStatus(bet) !== filter) {
        return false;
      }
      
      // Filter by date range
      if (dateRange !== 'all') {
        const betDate = new Date(bet.created_at);
        const now = new Date();
        const daysAgo = {
          '7d': 7,
          '30d': 30,
          '90d': 90
        }[dateRange];
        
        if (daysAgo) {
          const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
          if (betDate < cutoffDate) return false;
        }
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'amount':
          return b.amount - a.amount;
        case 'profit':
          return (b.profit || 0) - (a.profit || 0);
        default:
          return 0;
      }
    });

  const stats = {
    total: bets.length,
    won: bets.filter(bet => getBetStatus(bet) === 'won').length,
    lost: bets.filter(bet => getBetStatus(bet) === 'lost').length,
    pending: bets.filter(bet => getBetStatus(bet) === 'pending').length,
    totalWagered: bets.reduce((sum, bet) => sum + bet.amount, 0),
    totalProfit: bets.reduce((sum, bet) => sum + (bet.profit || 0), 0)
  };

  if (!publicKey) {
    return (
      <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 ${className}`}>
        <div className="text-center py-8">
          <HistoryIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">Connect Wallet</h3>
          <p className="text-gray-500">Connect your wallet to view bet history</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-32 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <HistoryIcon className="w-6 h-6 text-purple-400" />
          Bet History
        </h3>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide">Total Bets</div>
          <div className="text-lg font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide">Win Rate</div>
          <div className="text-lg font-bold text-green-400">
            {stats.total > 0 ? ((stats.won / stats.total) * 100).toFixed(1) : 0}%
          </div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide">Total Wagered</div>
          <div className="text-lg font-bold text-blue-400">
            {formatAmount(stats.totalWagered)}
          </div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide">Net Profit</div>
          <div className={`text-lg font-bold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stats.totalProfit >= 0 ? '+' : ''}{formatAmount(stats.totalProfit)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <FilterIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Status:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-gray-700 text-white rounded px-2 py-1 text-sm"
          >
            <option value="all">All Bets</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Period:</span>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="bg-gray-700 text-white rounded px-2 py-1 text-sm"
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-gray-700 text-white rounded px-2 py-1 text-sm"
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
            <option value="profit">Profit</option>
          </select>
        </div>
      </div>

      {/* Bet List */}
      {filteredAndSortedBets.length === 0 ? (
        <div className="text-center py-8">
          <HistoryIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No Bets Found</h3>
          <p className="text-gray-500">
            {filter === 'all' ? 'Place your first bet to see it here!' : `No ${filter} bets found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredAndSortedBets.map((bet) => {
            const status = getBetStatus(bet);
            const chosenToken = bet.token_choice === 0 ? bet.war.token_a : bet.war.token_b;
            
            return (
              <div key={bet.id} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30 hover:bg-gray-900/70 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1 ${getStatusColor(status)}`}>
                      {getStatusIcon(status)}
                      <span className="text-sm font-medium capitalize">{status}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      War #{bet.war_id}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatDate(bet.created_at)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-white font-medium">
                      {bet.war.token_a.symbol} vs {bet.war.token_b.symbol}
                    </div>
                    <div className="text-sm text-blue-400">
                      Bet on {chosenToken.symbol} • {formatAmount(bet.amount)}
                    </div>
                  </div>
                  
                  {bet.profit !== undefined && (
                    <div className={`text-right ${bet.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      <div className="font-medium">
                        {bet.profit >= 0 ? '+' : ''}{formatAmount(bet.profit)}
                      </div>
                      <div className="text-xs">
                        {bet.profit >= 0 ? 'Profit' : 'Loss'}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Transaction details */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-700/50">
                  <div>
                    TX: {bet.transaction_signature.slice(0, 8)}...{bet.transaction_signature.slice(-8)}
                  </div>
                  <a
                    href={`https://explorer.solana.com/tx/${bet.transaction_signature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    View on Solana Explorer
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}