import axios from 'axios';
import dexScreenerService, { TokenMetrics } from './dexScreenerService';

interface PriceData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  total_volume: number;
  last_updated: string;
}

class PriceService {
  private coingeckoBaseURL = 'https://api.coingecko.com/api/v3';
  private apiKey = process.env.COINGECKO_API_KEY;

  // Primary method: Use DexScreener for real-time Solana token data
  async getCurrentPricesFromDex(): Promise<Record<string, TokenMetrics>> {
    try {
      return await dexScreenerService.getMemeCoinsData();
    } catch (error) {
      console.error('Error fetching prices from DexScreener:', error);
      return {};
    }
  }

  // Fallback method: CoinGecko for established tokens
  async getCurrentPrices(coinIds: string[]): Promise<PriceData[]> {
    try {
      const ids = coinIds.join(',');
      const headers = this.apiKey ? { 'X-CG-Pro-API-Key': this.apiKey } : {};
      
      const response = await axios.get(`${this.coingeckoBaseURL}/coins/markets`, {
        headers,
        params: {
          vs_currency: 'usd',
          ids,
          order: 'market_cap_desc',
          per_page: 100,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching prices from CoinGecko:', error);
      return [];
    }
  }

  // Get token by address from DexScreener
  async getTokenByAddress(address: string): Promise<TokenMetrics | null> {
    try {
      return await dexScreenerService.getTokenByAddress(address);
    } catch (error) {
      console.error('Error fetching token by address:', error);
      return null;
    }
  }

  // Search tokens using DexScreener
  async searchTokens(query: string): Promise<TokenMetrics[]> {
    try {
      // Try DexScreener first for Solana tokens
      const dexResults = await dexScreenerService.searchTokens(query);
      if (dexResults.length > 0) {
        return dexResults;
      }

      // Fallback to CoinGecko for established tokens
      const headers = this.apiKey ? { 'X-CG-Pro-API-Key': this.apiKey } : {};
      const response = await axios.get(`${this.coingeckoBaseURL}/search`, {
        headers,
        params: { query }
      });

      return (response.data.coins || []).map((coin: any) => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: 0, // CoinGecko search doesn't include price
        priceChange24h: 0,
        volume24h: 0,
        marketCap: 0,
        liquidity: 0,
        fdv: 0,
        lastUpdated: new Date()
      }));
    } catch (error) {
      console.error('Error searching tokens:', error);
      return [];
    }
  }

  // Get trending tokens from DexScreener
  async getTrendingTokens(): Promise<TokenMetrics[]> {
    try {
      // Use DexScreener for real trending data
      const dexTrending = await dexScreenerService.getTrendingTokens(15);
      if (dexTrending.length > 0) {
        return dexTrending;
      }

      // Fallback to CoinGecko
      const headers = this.apiKey ? { 'X-CG-Pro-API-Key': this.apiKey } : {};
      const response = await axios.get(`${this.coingeckoBaseURL}/search/trending`, {
        headers
      });

      return (response.data.coins || []).map((item: any) => ({
        symbol: item.item.symbol.toUpperCase(),
        name: item.item.name,
        price: 0,
        priceChange24h: 0,
        volume24h: 0,
        marketCap: item.item.market_cap_rank || 0,
        liquidity: 0,
        fdv: 0,
        lastUpdated: new Date()
      }));
    } catch (error) {
      console.error('Error fetching trending tokens:', error);
      return [];
    }
  }

  // Get price history from DexScreener
  async getTokenPriceHistory(tokenAddress: string, timeframe: '1h' | '24h' | '7d' = '24h') {
    try {
      return await dexScreenerService.getTokenPriceHistory(tokenAddress, timeframe);
    } catch (error) {
      console.error('Error fetching price history:', error);
      return [];
    }
  }

  // Convert our token metrics to the format expected by the frontend
  formatTokenForFrontend(token: TokenMetrics, id: number) {
    return {
      id,
      symbol: token.symbol,
      name: token.name,
      price: token.price,
      market_cap: token.marketCap,
      price_change_24h: token.priceChange24h,
      volume_24h: token.volume24h,
      liquidity: token.liquidity,
      fdv: token.fdv,
      last_updated: token.lastUpdated.toISOString()
    };
  }
}

export default new PriceService();