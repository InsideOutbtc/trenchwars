import axios from 'axios';

interface DexScreenerToken {
  address: string;
  name: string;
  symbol: string;
}

interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: DexScreenerToken;
  quoteToken: DexScreenerToken;
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity?: {
    usd?: number;
    base: number;
    quote: number;
  };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
}

interface DexScreenerResponse {
  schemaVersion: string;
  pairs: DexScreenerPair[];
}

interface TokenMetrics {
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  liquidity: number;
  fdv: number;
  lastUpdated: Date;
}

class DexScreenerService {
  private baseURL = 'https://api.dexscreener.com/latest/dex';

  // Get token data by contract address
  async getTokenByAddress(address: string): Promise<TokenMetrics | null> {
    try {
      const response = await axios.get<DexScreenerResponse>(`${this.baseURL}/tokens/${address}`);
      
      if (!response.data.pairs || response.data.pairs.length === 0) {
        return null;
      }

      // Get the pair with highest liquidity
      const bestPair = response.data.pairs
        .filter(pair => pair.liquidity?.usd && pair.liquidity.usd > 1000)
        .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];

      if (!bestPair) return null;

      return this.formatTokenMetrics(bestPair);
    } catch (error) {
      console.error(`Error fetching token data for ${address}:`, error);
      return null;
    }
  }

  // Search for tokens by symbol
  async searchTokens(query: string): Promise<TokenMetrics[]> {
    try {
      const response = await axios.get<DexScreenerResponse>(`${this.baseURL}/search/?q=${encodeURIComponent(query)}`);
      
      if (!response.data.pairs) return [];

      // Filter and sort by relevance (liquidity and volume)
      const relevantPairs = response.data.pairs
        .filter(pair => 
          pair.baseToken.symbol.toLowerCase().includes(query.toLowerCase()) &&
          pair.liquidity?.usd && pair.liquidity.usd > 1000 &&
          pair.volume.h24 > 1000
        )
        .sort((a, b) => {
          const scoreA = (a.liquidity?.usd || 0) + a.volume.h24;
          const scoreB = (b.liquidity?.usd || 0) + b.volume.h24;
          return scoreB - scoreA;
        })
        .slice(0, 10);

      return relevantPairs.map(pair => this.formatTokenMetrics(pair));
    } catch (error) {
      console.error(`Error searching tokens for ${query}:`, error);
      return [];
    }
  }

  // Get trending tokens from Solana
  async getTrendingTokens(limit = 20): Promise<TokenMetrics[]> {
    try {
      const response = await axios.get<DexScreenerResponse>(`${this.baseURL}/pairs/solana`);
      
      if (!response.data.pairs) return [];

      // Filter and sort by trading activity and price change
      const trendingPairs = response.data.pairs
        .filter(pair => 
          pair.liquidity?.usd && pair.liquidity.usd > 10000 &&
          pair.volume.h24 > 5000 &&
          pair.txns.h24.buys + pair.txns.h24.sells > 50
        )
        .sort((a, b) => {
          // Score based on volume, price change, and transaction count
          const scoreA = a.volume.h24 * (1 + Math.abs(a.priceChange.h24) / 100) * (a.txns.h24.buys + a.txns.h24.sells);
          const scoreB = b.volume.h24 * (1 + Math.abs(b.priceChange.h24) / 100) * (b.txns.h24.buys + b.txns.h24.sells);
          return scoreB - scoreA;
        })
        .slice(0, limit);

      return trendingPairs.map(pair => this.formatTokenMetrics(pair));
    } catch (error) {
      console.error('Error fetching trending tokens:', error);
      return [];
    }
  }

  // Get price history for a token (DexScreener doesn't provide history, so we'll simulate)
  async getTokenPriceHistory(address: string, timeframe: '1h' | '24h' | '7d' = '24h'): Promise<Array<{ price: number; timestamp: number }>> {
    try {
      const currentData = await this.getTokenByAddress(address);
      if (!currentData) return [];

      // Since DexScreener doesn't provide historical data, we'll generate realistic price movements
      // In production, you'd want to use a different API or store historical data
      const currentPrice = currentData.price;
      const priceChange24h = currentData.priceChange24h;
      
      const points = timeframe === '1h' ? 60 : timeframe === '24h' ? 24 : 7 * 24;
      const interval = timeframe === '1h' ? 60 * 1000 : timeframe === '24h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
      
      const history = [];
      const now = Date.now();
      
      for (let i = points; i >= 0; i--) {
        const timestamp = now - (i * interval);
        
        // Simulate price movement based on 24h change
        const progress = (points - i) / points;
        const randomVariation = (Math.random() - 0.5) * 0.1; // ±5% random variation
        const trendComponent = (priceChange24h / 100) * progress;
        const priceMultiplier = 1 + trendComponent + randomVariation;
        
        const price = currentPrice * priceMultiplier;
        
        history.push({
          price: Math.max(price, 0), // Ensure price is never negative
          timestamp
        });
      }
      
      return history;
    } catch (error) {
      console.error(`Error generating price history for ${address}:`, error);
      return [];
    }
  }

  // Format pair data to our token metrics format
  private formatTokenMetrics(pair: DexScreenerPair): TokenMetrics {
    return {
      symbol: pair.baseToken.symbol,
      name: pair.baseToken.name,
      price: parseFloat(pair.priceUsd) || 0,
      priceChange24h: pair.priceChange.h24 || 0,
      volume24h: pair.volume.h24 || 0,
      marketCap: pair.marketCap || 0,
      liquidity: pair.liquidity?.usd || 0,
      fdv: pair.fdv || 0,
      lastUpdated: new Date()
    };
  }

  // Get real-time data for specific meme coins
  async getMemeCoinsData(): Promise<Record<string, TokenMetrics>> {
    const memeCoinAddresses = {
      // Solana meme coins - these are example addresses, replace with real ones
      'DOGE': 'So11111111111111111111111111111111111111112', // Placeholder
      'SHIB': 'So11111111111111111111111111111111111111112', // Placeholder  
      'PEPE': 'So11111111111111111111111111111111111111112', // Placeholder
      'WIF': 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', // dogwifhat
      'BONK': 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // Bonk
      'POPCAT': 'So11111111111111111111111111111111111111112', // Placeholder
    };

    const results: Record<string, TokenMetrics> = {};

    for (const [symbol, address] of Object.entries(memeCoinAddresses)) {
      try {
        const data = await this.getTokenByAddress(address);
        if (data) {
          results[symbol] = { ...data, symbol }; // Ensure symbol matches our key
        }
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
      }
    }

    return results;
  }
}

export default new DexScreenerService();
export { DexScreenerService, TokenMetrics };