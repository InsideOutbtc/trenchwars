import { Router } from 'express';
import twitterService from '../services/twitterService';

const router = Router();

// Get social metrics for a specific token
router.get('/metrics/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const metrics = await twitterService.getTokenSocialMetrics(symbol.toUpperCase());
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching social metrics:', error);
    res.status(500).json({ error: 'Failed to fetch social metrics' });
  }
});

// Get trending hashtags
router.get('/trending/hashtags', async (req, res) => {
  try {
    const hashtags = await twitterService.getTrendingCryptoHashtags();
    res.json(hashtags);
  } catch (error) {
    console.error('Error fetching trending hashtags:', error);
    res.status(500).json({ error: 'Failed to fetch trending hashtags' });
  }
});

// Search tweets for a specific query
router.get('/tweets/search', async (req, res) => {
  try {
    const { q: query, limit = 50 } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const tweets = await twitterService.searchTweets(query, parseInt(limit.toString()));
    res.json(tweets);
  } catch (error) {
    console.error('Error searching tweets:', error);
    res.status(500).json({ error: 'Failed to search tweets' });
  }
});

// Monitor hashtags for multiple tokens
router.post('/monitor/hashtags', async (req, res) => {
  try {
    const { hashtags } = req.body;
    
    if (!hashtags || !Array.isArray(hashtags)) {
      return res.status(400).json({ error: 'Hashtags array is required' });
    }

    const results = await twitterService.monitorHashtags(hashtags);
    
    // Convert Map to object for JSON response
    const response = Object.fromEntries(results);
    res.json(response);
  } catch (error) {
    console.error('Error monitoring hashtags:', error);
    res.status(500).json({ error: 'Failed to monitor hashtags' });
  }
});

// Get social feed for war tokens
router.get('/feed/war/:warId', async (req, res) => {
  try {
    const { warId } = req.params;
    
    // This would typically fetch war details first, then get social data for both tokens
    // For now, we'll simulate with popular meme coins
    const mockTokens = ['DOGE', 'SHIB', 'PEPE', 'WIF'];
    const feeds = new Map();
    
    for (const token of mockTokens.slice(0, 2)) {
      const tweets = await twitterService.searchTweets(`$${token}`, 25);
      if (tweets?.data) {
        feeds.set(token, tweets.data);
      }
    }
    
    res.json(Object.fromEntries(feeds));
  } catch (error) {
    console.error('Error fetching social feed:', error);
    res.status(500).json({ error: 'Failed to fetch social feed' });
  }
});

// Get engagement multipliers for betting
router.get('/engagement/multipliers', async (req, res) => {
  try {
    const tokens = ['DOGE', 'SHIB', 'PEPE', 'WIF', 'BONK', 'POPCAT'];
    const multipliers: Record<string, number> = {};
    
    for (const token of tokens) {
      const metrics = await twitterService.getTokenSocialMetrics(token);
      // Calculate multiplier based on trending score (1.0 to 2.0x)
      const multiplier = 1 + (metrics.trending_score / 100);
      multipliers[token] = Math.round(multiplier * 100) / 100;
    }
    
    res.json(multipliers);
  } catch (error) {
    console.error('Error calculating engagement multipliers:', error);
    res.status(500).json({ error: 'Failed to calculate engagement multipliers' });
  }
});

export default router;