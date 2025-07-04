'use client';

import { useState, useEffect } from 'react';
import { RefreshCwIcon, TrendingUpIcon, MessageCircleIcon, HeartIcon, RepeatIcon } from 'lucide-react';

interface Tweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  public_metrics: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
    quote_count: number;
  };
}

interface SocialFeedProps {
  warId: string;
  className?: string;
}

export default function SocialFeed({ warId, className = '' }: SocialFeedProps) {
  const [feedData, setFeedData] = useState<Record<string, Tweet[]>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSocialFeed();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchSocialFeed, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [warId]);

  const fetchSocialFeed = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const response = await fetch(`/api/social/feed/war/${warId}`);
      if (!response.ok) throw new Error('Failed to fetch social feed');
      const data = await response.json();
      setFeedData(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching social feed:', error);
      setError('Failed to load social feed');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getEngagementScore = (tweet: Tweet): number => {
    const { like_count, retweet_count, reply_count, quote_count } = tweet.public_metrics;
    return like_count + retweet_count * 2 + reply_count + quote_count;
  };

  const handleRefresh = () => {
    fetchSocialFeed(true);
  };

  // Combine and sort all tweets by engagement
  const allTweets = Object.entries(feedData)
    .flatMap(([token, tweets]) => 
      tweets.map(tweet => ({ ...tweet, token }))
    )
    .sort((a, b) => getEngagementScore(b) - getEngagementScore(a))
    .slice(0, 10);

  if (loading) {
    return (
      <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-48"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageCircleIcon className="w-6 h-6 text-blue-400" />
          Social Buzz
        </h3>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors disabled:opacity-50"
        >
          <RefreshCwIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Feed */}
      {allTweets.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircleIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No social activity found</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {allTweets.map((tweet) => (
            <div key={tweet.id} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30 hover:border-gray-600/50 transition-colors">
              {/* Token Badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center px-2 py-1 bg-blue-600/20 text-blue-400 text-xs font-medium rounded-full">
                  ${(tweet as any).token}
                </span>
                <span className="text-xs text-gray-500">{formatTimeAgo(tweet.created_at)}</span>
              </div>

              {/* Tweet Content */}
              <p className="text-gray-200 mb-3 leading-relaxed">
                {tweet.text.length > 150 ? `${tweet.text.substring(0, 150)}...` : tweet.text}
              </p>

              {/* Engagement Metrics */}
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <HeartIcon className="w-3 h-3" />
                  <span>{formatNumber(tweet.public_metrics.like_count)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <RepeatIcon className="w-3 h-3" />
                  <span>{formatNumber(tweet.public_metrics.retweet_count)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircleIcon className="w-3 h-3" />
                  <span>{formatNumber(tweet.public_metrics.reply_count)}</span>
                </div>
                <div className="flex items-center gap-1 ml-auto">
                  <TrendingUpIcon className="w-3 h-3 text-green-400" />
                  <span className="text-green-400">{formatNumber(getEngagementScore(tweet))}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <p className="text-xs text-gray-500 text-center">
          Live social data from Twitter • Updates every 5 minutes
        </p>
      </div>
    </div>
  );
}