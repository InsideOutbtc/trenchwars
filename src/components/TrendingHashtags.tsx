'use client';

import { useState, useEffect } from 'react';
import { TrendingUpIcon, HashtagIcon, RefreshCwIcon } from 'lucide-react';

interface TrendingHashtagsProps {
  className?: string;
}

export default function TrendingHashtags({ className = '' }: TrendingHashtagsProps) {
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrendingHashtags();
    
    // Auto-refresh every 10 minutes
    const interval = setInterval(fetchTrendingHashtags, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrendingHashtags = async () => {
    try {
      const response = await fetch('/api/social/trending/hashtags');
      if (!response.ok) throw new Error('Failed to fetch trending hashtags');
      const data = await response.json();
      setHashtags(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching trending hashtags:', error);
      setError('Failed to load trending hashtags');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <TrendingUpIcon className="w-5 h-5 text-orange-400" />
          Trending
        </h3>
        <button
          onClick={fetchTrendingHashtags}
          className="p-1.5 bg-orange-600/20 text-orange-400 rounded-lg hover:bg-orange-600/30 transition-colors"
          title="Refresh trending hashtags"
        >
          <RefreshCwIcon className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Hashtags Grid */}
      <div className="grid grid-cols-2 gap-2">
        {hashtags.slice(0, 12).map((hashtag, index) => (
          <div
            key={hashtag}
            className="bg-gray-900/50 rounded-lg p-2 border border-gray-700/30 hover:border-orange-500/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <HashtagIcon className="w-3 h-3 text-orange-400 group-hover:text-orange-300" />
              <span className="text-sm text-gray-200 group-hover:text-white truncate">
                {hashtag}
              </span>
              {index < 3 && (
                <div className="ml-auto">
                  <span className="inline-flex items-center px-1.5 py-0.5 bg-orange-600/20 text-orange-400 text-xs rounded-full">
                    {index + 1}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-700/50">
        <p className="text-xs text-gray-500 text-center">
          Popular crypto hashtags • Updated every 10 minutes
        </p>
      </div>
    </div>
  );
}