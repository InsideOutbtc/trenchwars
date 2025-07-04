import { Router } from 'express';
import priceService from '../services/priceService';

const router = Router();

// Get current token prices from DexScreener
router.get('/tokens', async (req, res) => {
  try {
    // Try to get real data from DexScreener
    const dexData = await priceService.getCurrentPricesFromDex();
    
    if (Object.keys(dexData).length > 0) {
      // Convert DexScreener data to our format
      const tokens = Object.entries(dexData).map(([symbol, data], index) => 
        priceService.formatTokenForFrontend(data, index + 1)
      );
      return res.json(tokens);
    }

    // Fallback to mock data if DexScreener fails
    const tokens = [
      {
        id: 1,
        symbol: 'DOGE',
        name: 'Dogecoin',
        price: 0.07891,
        market_cap: 11500000000,
        price_change_24h: 2.45,
        volume_24h: 450000000
      },
      {
        id: 2,
        symbol: 'SHIB',
        name: 'Shiba Inu',
        price: 0.000008234,
        market_cap: 4850000000,
        price_change_24h: -1.23,
        volume_24h: 280000000
      },
      {
        id: 3,
        symbol: 'PEPE',
        name: 'Pepe',
        price: 0.00000089,
        market_cap: 380000000,
        price_change_24h: 8.91,
        volume_24h: 95000000
      },
      {
        id: 4,
        symbol: 'WIF',
        name: 'dogwifhat',
        price: 1.89,
        market_cap: 1890000000,
        price_change_24h: 15.67,
        volume_24h: 125000000
      },
      {
        id: 5,
        symbol: 'BONK',
        name: 'Bonk',
        price: 0.00000892,
        market_cap: 650000000,
        price_change_24h: -3.45,
        volume_24h: 75000000
      },
      {
        id: 6,
        symbol: 'POPCAT',
        name: 'Popcat',
        price: 0.456,
        market_cap: 456000000,
        price_change_24h: 12.34,
        volume_24h: 28000000
      }
    ];

    res.json(tokens);
  } catch (error) {
    console.error('Error fetching token prices:', error);
    res.status(500).json({ error: 'Failed to fetch token prices' });
  }
});

// Get price history for a specific token
router.get('/history/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { range = '24h' } = req.query;
    
    // Token address mapping (these would be real addresses in production)
    const tokenAddresses: Record<string, string> = {
      '1': 'So11111111111111111111111111111111111111112', // DOGE placeholder
      '2': 'So11111111111111111111111111111111111111112', // SHIB placeholder
      '3': 'So11111111111111111111111111111111111111112', // PEPE placeholder
      '4': 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', // WIF
      '5': 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // BONK
      '6': 'So11111111111111111111111111111111111111112', // POPCAT placeholder
    };

    const tokenAddress = tokenAddresses[tokenId];
    
    if (tokenAddress && tokenAddress !== 'So11111111111111111111111111111111111111112') {
      // Try to get real price history from DexScreener
      const history = await priceService.getTokenPriceHistory(
        tokenAddress, 
        range as '1h' | '24h' | '7d'
      );
      
      if (history.length > 0) {
        const formattedHistory = history.map(point => ({
          price: point.price,
          market_cap: point.price * 1000000000, // Estimate market cap
          volume_24h: Math.floor(Math.random() * 100000000),
          recorded_at: new Date(point.timestamp).toISOString()
        }));
        
        return res.json(formattedHistory);
      }
    }
    
    // Fallback to mock price history
    const history = [];
    const now = new Date();
    const basePrice = Math.random() * 0.1 + 0.01;
    const hours = range === '1h' ? 1 : range === '7d' ? 168 : 24;
    const interval = range === '1h' ? 60 * 1000 : 60 * 60 * 1000;
    
    for (let i = hours; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * interval);
      const variation = (Math.random() - 0.5) * 0.2;
      const price = basePrice * (1 + variation);
      
      history.push({
        price: Math.max(price, 0.001),
        market_cap: price * 1000000000,
        volume_24h: Math.floor(Math.random() * 100000000),
        recorded_at: timestamp.toISOString()
      });
    }

    res.json(history);
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({ error: 'Failed to fetch price history' });
  }
});

// Get trending tokens from DexScreener
router.get('/trending', async (req, res) => {
  try {
    // Try to get real trending data from DexScreener
    const trending = await priceService.getTrendingTokens();
    
    if (trending.length > 0) {
      const formattedTrending = trending.map((token, index) => 
        priceService.formatTokenForFrontend(token, index + 1)
      );
      return res.json(formattedTrending);
    }

    // Fallback to mock trending tokens
    const mockTrending = [
      { id: 4, symbol: 'WIF', name: 'dogwifhat', price_change_24h: 15.67 },
      { id: 6, symbol: 'POPCAT', name: 'Popcat', price_change_24h: 12.34 },
      { id: 3, symbol: 'PEPE', name: 'Pepe', price_change_24h: 8.91 },
      { id: 1, symbol: 'DOGE', name: 'Dogecoin', price_change_24h: 2.45 },
      { id: 2, symbol: 'SHIB', name: 'Shiba Inu', price_change_24h: -1.23 }
    ];

    res.json(mockTrending);
  } catch (error) {
    console.error('Error fetching trending tokens:', error);
    res.status(500).json({ error: 'Failed to fetch trending tokens' });
  }
});

// Search tokens using DexScreener
router.get('/search', async (req, res) => {
  try {
    const { q: query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const results = await priceService.searchTokens(query);
    const formattedResults = results.map((token, index) => 
      priceService.formatTokenForFrontend(token, index + 1)
    );

    res.json(formattedResults);
  } catch (error) {
    console.error('Error searching tokens:', error);
    res.status(500).json({ error: 'Failed to search tokens' });
  }
});

// Get token by address
router.get('/token/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const token = await priceService.getTokenByAddress(address);
    
    if (!token) {
      return res.status(404).json({ error: 'Token not found' });
    }

    res.json(priceService.formatTokenForFrontend(token, 1));
  } catch (error) {
    console.error('Error fetching token by address:', error);
    res.status(500).json({ error: 'Failed to fetch token data' });
  }
});

export default router;