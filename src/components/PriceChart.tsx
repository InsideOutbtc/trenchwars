'use client';

import { useState, useEffect } from 'react';
import { TrendingUpIcon, TrendingDownIcon, BarChartIcon } from 'lucide-react';

interface PricePoint {
  price: number;
  market_cap: number;
  volume_24h: number;
  recorded_at: string;
}

interface PriceChartProps {
  tokenId: number;
  tokenSymbol: string;
  className?: string;
}

export default function PriceChart({ tokenId, tokenSymbol, className = '' }: PriceChartProps) {
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');

  useEffect(() => {
    fetchPriceHistory();
  }, [tokenId, timeRange]);

  const fetchPriceHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/prices/history/${tokenId}?range=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch price history');
      const data = await response.json();
      setPriceHistory(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching price history:', error);
      setError('Failed to load price data');
    } finally {
      setLoading(false);
    }
  };

  const calculatePriceChange = () => {
    if (priceHistory.length < 2) return { change: 0, percentage: 0 };
    
    const first = priceHistory[0].price;
    const last = priceHistory[priceHistory.length - 1].price;
    const change = last - first;
    const percentage = (change / first) * 100;
    
    return { change, percentage };
  };

  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toFixed(0)}`;
  };

  const getPathData = () => {
    if (priceHistory.length === 0) return '';
    
    const width = 300;
    const height = 120;
    const padding = 20;
    
    const prices = priceHistory.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    
    const points = priceHistory.map((point, index) => {
      const x = padding + (index / (priceHistory.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((point.price - minPrice) / priceRange) * (height - 2 * padding);
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  const getGradientId = () => `gradient-${tokenSymbol}-${tokenId}`;

  const { change, percentage } = calculatePriceChange();
  const isPositive = change >= 0;

  if (loading) {
    return (
      <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
          <div className="h-24 bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-20"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 ${className}`}>
        <div className="flex items-center gap-2 text-red-400">
          <BarChartIcon className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChartIcon className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">${tokenSymbol}</h3>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex bg-gray-700 rounded-lg p-1">
          {(['1h', '24h', '7d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Price Info */}
      <div className="mb-4">
        <div className="text-2xl font-bold text-white mb-1">
          ${formatPrice(priceHistory[priceHistory.length - 1]?.price || 0)}
        </div>
        <div className={`flex items-center gap-2 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? (
            <TrendingUpIcon className="w-4 h-4" />
          ) : (
            <TrendingDownIcon className="w-4 h-4" />
          )}
          <span>${Math.abs(change).toFixed(6)} ({percentage.toFixed(2)}%)</span>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-4">
        <svg viewBox="0 0 300 120" className="w-full h-24">
          <defs>
            <linearGradient id={getGradientId()} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity="0.3" />
              <stop offset="100%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {priceHistory.length > 1 && (
            <>
              {/* Area under curve */}
              <path
                d={`${getPathData()} L 280,100 L 20,100 Z`}
                fill={`url(#${getGradientId()})`}
              />
              {/* Price line */}
              <path
                d={getPathData()}
                stroke={isPositive ? '#10B981' : '#EF4444'}
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}
        </svg>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <div className="text-gray-400">Market Cap</div>
          <div className="text-white font-semibold">
            {formatNumber(priceHistory[priceHistory.length - 1]?.market_cap || 0)}
          </div>
        </div>
        <div>
          <div className="text-gray-400">24h Volume</div>
          <div className="text-white font-semibold">
            {formatNumber(priceHistory[priceHistory.length - 1]?.volume_24h || 0)}
          </div>
        </div>
      </div>
    </div>
  );
}