import axios from 'axios';

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
  context_annotations?: Array<{
    domain: {
      id: string;
      name: string;
    };
    entity: {
      id: string;
      name: string;
    };
  }>;
}

interface TwitterSearchResponse {
  data: Tweet[];
  meta: {
    result_count: number;
    next_token?: string;
  };
  includes?: {
    users: Array<{
      id: string;
      username: string;
      name: string;
      verified: boolean;
      public_metrics: {
        followers_count: number;
        following_count: number;
        tweet_count: number;
      };
    }>;
  };
}

interface SocialMetrics {
  token_symbol: string;
  total_mentions: number;
  sentiment_score: number;
  engagement_score: number;
  trending_score: number;
  last_updated: Date;
}

class TwitterService {
  private bearerToken: string;
  private baseURL = 'https://api.twitter.com/2';

  constructor() {
    this.bearerToken = process.env.TWITTER_BEARER_TOKEN || '';
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.bearerToken}`,
      'Content-Type': 'application/json',
    };
  }

  // Search for tweets mentioning specific crypto tokens
  async searchTweets(query: string, maxResults = 100): Promise<TwitterSearchResponse | null> {
    if (!this.bearerToken) {
      console.warn('Twitter Bearer Token not configured - using mock data');
      return this.getMockTwitterData(query);
    }

    try {
      const params = new URLSearchParams({
        query: query,
        'max_results': maxResults.toString(),
        'tweet.fields': 'created_at,author_id,public_metrics,context_annotations',
        'user.fields': 'username,name,verified,public_metrics',
        'expansions': 'author_id'
      });

      const response = await axios.get(`${this.baseURL}/tweets/search/recent?${params}`, {
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error: any) {
      console.error('Error searching tweets:', error.response?.data || error.message);
      return this.getMockTwitterData(query);
    }
  }

  // Monitor specific hashtags for crypto projects
  async monitorHashtags(hashtags: string[]): Promise<Map<string, Tweet[]>> {
    const results = new Map<string, Tweet[]>();

    for (const hashtag of hashtags) {
      const query = `#${hashtag} -is:retweet lang:en`;
      const response = await this.searchTweets(query, 50);
      
      if (response?.data) {
        results.set(hashtag, response.data);
      }
    }

    return results;
  }

  // Get engagement metrics for a specific token
  async getTokenSocialMetrics(tokenSymbol: string): Promise<SocialMetrics> {
    const queries = [
      `$${tokenSymbol}`,
      `#${tokenSymbol}`,
      `${tokenSymbol} crypto`,
      `${tokenSymbol} token`
    ];

    let totalMentions = 0;
    let totalEngagement = 0;
    let sentimentSum = 0;
    let tweetCount = 0;

    for (const query of queries) {
      const response = await this.searchTweets(query, 100);
      
      if (response?.data) {
        totalMentions += response.data.length;
        
        for (const tweet of response.data) {
          const engagement = 
            tweet.public_metrics.like_count +
            tweet.public_metrics.retweet_count +
            tweet.public_metrics.reply_count +
            tweet.public_metrics.quote_count;
          
          totalEngagement += engagement;
          sentimentSum += this.analyzeSentiment(tweet.text);
          tweetCount++;
        }
      }
    }

    const avgSentiment = tweetCount > 0 ? sentimentSum / tweetCount : 0;
    const avgEngagement = tweetCount > 0 ? totalEngagement / tweetCount : 0;
    const trendingScore = this.calculateTrendingScore(totalMentions, avgEngagement, avgSentiment);

    return {
      token_symbol: tokenSymbol,
      total_mentions: totalMentions,
      sentiment_score: avgSentiment,
      engagement_score: avgEngagement,
      trending_score: trendingScore,
      last_updated: new Date()
    };
  }

  // Simple sentiment analysis (can be enhanced with ML services)
  private analyzeSentiment(text: string): number {
    const positiveWords = ['moon', 'bullish', 'pump', 'up', 'rise', 'buy', 'hodl', 'diamond', 'rocket', 'gains', 'profit'];
    const negativeWords = ['dump', 'crash', 'down', 'sell', 'bearish', 'drop', 'fall', 'rekt', 'loss', 'dead'];
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    for (const word of words) {
      if (positiveWords.some(pos => word.includes(pos))) score += 1;
      if (negativeWords.some(neg => word.includes(neg))) score -= 1;
    }
    
    // Normalize to -1 to 1 range
    return Math.max(-1, Math.min(1, score / words.length * 10));
  }

  // Calculate trending score based on various factors
  private calculateTrendingScore(mentions: number, engagement: number, sentiment: number): number {
    const mentionsScore = Math.min(mentions / 100, 1); // Cap at 100 mentions
    const engagementScore = Math.min(engagement / 1000, 1); // Cap at 1000 avg engagement
    const sentimentScore = (sentiment + 1) / 2; // Convert from -1,1 to 0,1
    
    return (mentionsScore * 0.4 + engagementScore * 0.4 + sentimentScore * 0.2) * 100;
  }

  // Mock data for development/demo purposes
  private getMockTwitterData(query: string): TwitterSearchResponse {
    const mockTweets: Tweet[] = [
      {
        id: '1',
        text: `${query} is going to the moon! 🚀 #crypto #bullish`,
        created_at: new Date().toISOString(),
        author_id: '123',
        public_metrics: {
          retweet_count: Math.floor(Math.random() * 100),
          like_count: Math.floor(Math.random() * 500),
          reply_count: Math.floor(Math.random() * 50),
          quote_count: Math.floor(Math.random() * 25)
        }
      },
      {
        id: '2',
        text: `Just bought more ${query}! Diamond hands 💎🙌`,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        author_id: '456',
        public_metrics: {
          retweet_count: Math.floor(Math.random() * 80),
          like_count: Math.floor(Math.random() * 300),
          reply_count: Math.floor(Math.random() * 30),
          quote_count: Math.floor(Math.random() * 15)
        }
      },
      {
        id: '3',
        text: `${query} technical analysis shows strong support levels`,
        created_at: new Date(Date.now() - 7200000).toISOString(),
        author_id: '789',
        public_metrics: {
          retweet_count: Math.floor(Math.random() * 60),
          like_count: Math.floor(Math.random() * 200),
          reply_count: Math.floor(Math.random() * 40),
          quote_count: Math.floor(Math.random() * 10)
        }
      }
    ];

    return {
      data: mockTweets,
      meta: {
        result_count: mockTweets.length
      }
    };
  }

  // Get trending hashtags for crypto space
  async getTrendingCryptoHashtags(): Promise<string[]> {
    // This would use Twitter's trending topics API in production
    // For now, return common crypto hashtags
    return [
      'Bitcoin', 'BTC', 'Ethereum', 'ETH', 'Dogecoin', 'DOGE', 
      'ShibaInu', 'SHIB', 'Pepe', 'PEPE', 'Solana', 'SOL',
      'crypto', 'cryptocurrency', 'altcoin', 'memecoin', 'DeFi'
    ];
  }
}

export default new TwitterService();
export { TwitterService, SocialMetrics, Tweet };