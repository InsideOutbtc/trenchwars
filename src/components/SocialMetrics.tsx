'use client';

import { useState, useEffect } from 'react';
import { TrendingUpIcon, TrendingDownIcon, HashtagIcon, HeartIcon, MessageCircleIcon } from 'lucide-react';

interface SocialMetrics {
  token_symbol: string;
  total_mentions: number;
  sentiment_score: number;
  engagement_score: number;
  trending_score: number;
  last_updated: string;
}

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

interface SocialMetricsProps {
  tokenSymbol: string;
  showTweets?: boolean;
}

export default function SocialMetrics({ tokenSymbol, showTweets = false }: SocialMetricsProps) {
  const [metrics, setMetrics] = useState<SocialMetrics | null>(null);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSocialMetrics();
    if (showTweets) {
      fetchTweets();
    }
  }, [tokenSymbol, showTweets]);

  const fetchSocialMetrics = async () => {
    try {
      const response = await fetch(`/api/social/metrics/${tokenSymbol}`);
      if (!response.ok) throw new Error('Failed to fetch social metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching social metrics:', error);
      setError('Failed to load social metrics');
    } finally {
      setLoading(false);
    }
  };

  const fetchTweets = async () => {
    try {
      const response = await fetch(`/api/social/tweets/search?q=$${tokenSymbol}&limit=10`);
      if (!response.ok) throw new Error('Failed to fetch tweets');
      const data = await response.json();
      setTweets(data.data || []);
    } catch (error) {
      console.error('Error fetching tweets:', error);
    }
  };

  const getSentimentColor = (score: number): string => {
    if (score > 0.2) return 'text-green-500';
    if (score < -0.2) return 'text-red-500';
    return 'text-yellow-500';
  };

  const getSentimentIcon = (score: number) => {
    if (score > 0.2) return <TrendingUpIcon className="w-4 h-4" />;
    if (score < -0.2) return <TrendingDownIcon className="w-4 h-4" />;
    return <span className="w-4 h-4 text-center">~</span>;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-24 mb-3"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-700 rounded"></div>
          <div className="h-3 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="bg-red-900/20 backdrop-blur-sm rounded-xl p-4 border border-red-500/20">
        <p className="text-red-400 text-sm">{error || 'No social data available'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Social Metrics Overview */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <HashtagIcon className="w-5 h-5 text-blue-400" />
            ${tokenSymbol} Social Pulse
          </h3>
          <div className="text-xs text-gray-400">
            Updated {formatTimeAgo(metrics.last_updated)}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Mentions */}
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Mentions</div>
            <div className="text-lg font-bold text-white">{formatNumber(metrics.total_mentions)}</div>
          </div>

          {/* Sentiment */}
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Sentiment</div>
            <div className={`text-lg font-bold flex items-center gap-1 ${getSentimentColor(metrics.sentiment_score)}`}>
              {getSentimentIcon(metrics.sentiment_score)}
              {(metrics.sentiment_score * 100).toFixed(0)}%
            </div>
          </div>

          {/* Engagement */}
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Engagement</div>
            <div className="text-lg font-bold text-blue-400">{formatNumber(metrics.engagement_score)}</div>
          </div>

          {/* Trending Score */}
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Trending</div>
            <div className="text-lg font-bold text-purple-400">{metrics.trending_score.toFixed(1)}</div>
          </div>
        </div>

        {/* Trending Score Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Trending Score</span>
            <span>{metrics.trending_score.toFixed(1)}/100</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(metrics.trending_score, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Recent Tweets */}
      {showTweets && tweets.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
          <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
            <MessageCircleIcon className="w-4 h-4 text-blue-400" />
            Recent Buzz
          </h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {tweets.slice(0, 5).map((tweet) => (
              <div key={tweet.id} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30">
                <p className="text-sm text-gray-200 mb-2 line-clamp-2">{tweet.text}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{formatTimeAgo(tweet.created_at)}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <HeartIcon className="w-3 h-3" />
                      {formatNumber(tweet.public_metrics.like_count)}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUpIcon className="w-3 h-3" />
                      {formatNumber(tweet.public_metrics.retweet_count)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}