'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { User, Trophy, TrendingUp, Activity, Calendar, DollarSign, Target } from 'lucide-react';

interface UserStats {
  totalBets: number;
  totalWagered: number;
  totalWinnings: number;
  winRate: number;
  currentStreak: number;
  longestStreak: number;
  favoriteToken: string;
  memberSince: string;
  rank: number;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface UserProfileProps {
  className?: string;
}

export default function UserProfile({ className = '' }: UserProfileProps) {
  const { publicKey } = useWallet();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (publicKey) {
      fetchUserProfile();
    }
  }, [publicKey]);

  const fetchUserProfile = async () => {
    if (!publicKey) return;

    setLoading(true);
    try {
      const response = await fetch(`https://api.trenchwars.wtf/api/users/${publicKey.toBase58()}/profile`);
      if (!response.ok) {
        // If user doesn't exist, create with default stats
        if (response.status === 404) {
          setUserStats(getDefaultUserStats());
        } else {
          throw new Error('Failed to fetch user profile');
        }
      } else {
        const data = await response.json();
        setUserStats(data);
      }
      setError(null);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load profile');
      // Fallback to default stats
      setUserStats(getDefaultUserStats());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultUserStats = (): UserStats => ({
    totalBets: 0,
    totalWagered: 0,
    totalWinnings: 0,
    winRate: 0,
    currentStreak: 0,
    longestStreak: 0,
    favoriteToken: 'None',
    memberSince: new Date().toISOString(),
    rank: 999999,
    achievements: []
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatSOL = (amount: number) => {
    return `${(amount / 1e9).toFixed(3)} SOL`;
  };

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-400 border-yellow-400';
      case 'epic': return 'text-purple-400 border-purple-400';
      case 'rare': return 'text-blue-400 border-blue-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  if (!publicKey) {
    return (
      <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 ${className}`}>
        <div className="text-center py-8">
          <User className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">Connect Wallet</h3>
          <p className="text-gray-500">Connect your wallet to view your profile</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-32 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !userStats) {
    return (
      <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 ${className}`}>
        <div className="text-center py-8">
          <User className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-400 mb-2">Error Loading Profile</h3>
          <p className="text-gray-500">{error || 'Something went wrong'}</p>
          <button
            onClick={fetchUserProfile}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <User className="w-6 h-6 text-purple-400" />
          Profile
        </h3>
        <div className="text-sm text-gray-400">
          Rank #{userStats.rank.toLocaleString()}
        </div>
      </div>

      {/* Wallet Info */}
      <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400">Wallet Address</div>
            <div className="text-white font-mono text-sm">
              {publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-8)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Member Since</div>
            <div className="text-white">{formatDate(userStats.memberSince)}</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400 uppercase tracking-wide">Total Bets</span>
          </div>
          <div className="text-lg font-bold text-white">{userStats.totalBets}</div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400 uppercase tracking-wide">Total Wagered</span>
          </div>
          <div className="text-lg font-bold text-white">{formatSOL(userStats.totalWagered)}</div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400 uppercase tracking-wide">Total Winnings</span>
          </div>
          <div className="text-lg font-bold text-green-400">{formatSOL(userStats.totalWinnings)}</div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400 uppercase tracking-wide">Win Rate</span>
          </div>
          <div className="text-lg font-bold text-white">{userStats.winRate.toFixed(1)}%</div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-gray-400 uppercase tracking-wide">Current Streak</span>
          </div>
          <div className="text-lg font-bold text-white">{userStats.currentStreak}</div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-pink-400" />
            <span className="text-xs text-gray-400 uppercase tracking-wide">Favorite Token</span>
          </div>
          <div className="text-lg font-bold text-white">{userStats.favoriteToken}</div>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Achievements ({userStats.achievements.length})
        </h4>
        
        {userStats.achievements.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Trophy className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p>No achievements yet. Start betting to unlock achievements!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {userStats.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`bg-gray-900/50 rounded-lg p-3 border ${getRarityColor(achievement.rarity)}`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-white">{achievement.name}</div>
                    <div className="text-xs text-gray-400">{achievement.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Unlocked: {formatDate(achievement.unlockedAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Net Profit */}
      <div className="mt-6 bg-gray-900/50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Net Profit/Loss</span>
          <span className={`text-lg font-bold ${
            userStats.totalWinnings - userStats.totalWagered >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {userStats.totalWinnings - userStats.totalWagered >= 0 ? '+' : ''}
            {formatSOL(userStats.totalWinnings - userStats.totalWagered)}
          </span>
        </div>
      </div>
    </div>
  );
}