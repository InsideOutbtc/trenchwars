import axios from 'axios';
import { pool } from '../config/database';

export interface SocialMetrics {
  tokenAddress: string;
  twitterMentions: number;
  twitterSentiment: number; // -1 to 1
  trendingHashtags: string[];
  influencerMentions: number;
  socialScore: number; // 0-100
  timestamp: Date;
}

export class SocialMediaService {
  private twitterBearer: string;

  constructor() {
    this.twitterBearer = process.env.TWITTER_BEARER_TOKEN || '';
    this.scheduleSocialTracking();
  }

  /**
   * Get social metrics for a token
   */
  async getTokenSocialMetrics(tokenSymbol: string, tokenAddress: string): Promise<SocialMetrics> {
    try {
      // Get Twitter mentions and sentiment
      const twitterData = await this.getTwitterMetrics(tokenSymbol);
      
      // Calculate social score
      const socialScore = this.calculateSocialScore(twitterData);

      const metrics: SocialMetrics = {
        tokenAddress,
        twitterMentions: twitterData.mentions,
        twitterSentiment: twitterData.sentiment,
        trendingHashtags: twitterData.hashtags,
        influencerMentions: twitterData.influencerMentions,
        socialScore,
        timestamp: new Date()
      };

      // Store metrics in database
      await this.storeSocialMetrics(metrics);

      return metrics;

    } catch (error) {
      console.error(`Error getting social metrics for ${tokenSymbol}:`, error);
      throw error;
    }
  }

  /**
   * Get Twitter metrics using Twitter API v2
   */
  private async getTwitterMetrics(tokenSymbol: string) {
    try {
      const searchQuery = `${tokenSymbol} OR $${tokenSymbol} -is:retweet lang:en`;
      const url = `https://api.twitter.com/2/tweets/search/recent`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.twitterBearer}`
        },
        params: {
          query: searchQuery,
          max_results: 100,
          'tweet.fields': 'author_id,created_at,public_metrics,context_annotations',
          'user.fields': 'verified,public_metrics'
        }
      });

      const tweets = response.data.data || [];
      
      // Analyze sentiment and extract hashtags
      let totalSentiment = 0;
      let mentions = tweets.length;
      let hashtags: string[] = [];
      let influencerMentions = 0;

      tweets.forEach((tweet: any) => {
        // Simple sentiment analysis based on keywords
        const sentiment = this.analyzeSentiment(tweet.text);
        totalSentiment += sentiment;

        // Extract hashtags
        const tweetHashtags = tweet.text.match(/#\w+/g) || [];
        hashtags = [...hashtags, ...tweetHashtags];

        // Count influencer mentions (verified users with 10k+ followers)
        const author = response.data.includes?.users?.find((u: any) => u.id === tweet.author_id);
        if (author?.verified || author?.public_metrics?.followers_count > 10000) {
          influencerMentions++;
        }
      });

      const avgSentiment = mentions > 0 ? totalSentiment / mentions : 0;
      const uniqueHashtags = [...new Set(hashtags)].slice(0, 10);

      return {
        mentions,
        sentiment: avgSentiment,
        hashtags: uniqueHashtags,
        influencerMentions
      };

    } catch (error) {
      console.error('Error fetching Twitter metrics:', error);
      return {
        mentions: 0,
        sentiment: 0,
        hashtags: [],
        influencerMentions: 0
      };
    }
  }

  /**
   * Simple sentiment analysis
   */
  private analyzeSentiment(text: string): number {
    const positiveWords = ['good', 'great', 'amazing', 'bullish', 'moon', 'pump', 'buy', 'hold', 'diamond', 'hands'];
    const negativeWords = ['bad', 'terrible', 'crash', 'dump', 'bearish', 'sell', 'rug', 'scam', 'dead'];

    const lowerText = text.toLowerCase();
    let score = 0;

    positiveWords.forEach(word => {
      if (lowerText.includes(word)) score += 1;
    });

    negativeWords.forEach(word => {
      if (lowerText.includes(word)) score -= 1;
    });

    // Normalize to -1 to 1 range
    return Math.max(-1, Math.min(1, score / 5));
  }

  /**
   * Calculate overall social score (0-100)
   */
  private calculateSocialScore(twitterData: any): number {
    let score = 0;

    // Mentions weight (0-40 points)
    score += Math.min(40, twitterData.mentions * 0.4);

    // Sentiment weight (0-30 points)
    score += (twitterData.sentiment + 1) * 15; // Convert -1,1 to 0,30

    // Influencer mentions weight (0-20 points)
    score += Math.min(20, twitterData.influencerMentions * 2);

    // Hashtag diversity weight (0-10 points)
    score += Math.min(10, twitterData.hashtags.length);

    return Math.round(Math.min(100, score));
  }

  /**
   * Store social metrics in database
   */
  private async storeSocialMetrics(metrics: SocialMetrics) {
    try {
      const query = `
        INSERT INTO social_metrics 
        (token_address, twitter_mentions, twitter_sentiment, trending_hashtags, 
         influencer_mentions, social_score, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;

      await pool.query(query, [
        metrics.tokenAddress,
        metrics.twitterMentions,
        metrics.twitterSentiment,
        JSON.stringify(metrics.trendingHashtags),
        metrics.influencerMentions,
        metrics.socialScore,
        metrics.timestamp
      ]);

    } catch (error) {
      console.error('Error storing social metrics:', error);
    }
  }

  /**
   * Get trending tokens based on social activity
   */
  async getTrendingTokens(limit: number = 10): Promise<any[]> {
    try {
      const query = `
        SELECT 
          sm.token_address,
          w.token_a_symbol,
          w.token_b_symbol,
          sm.social_score,
          sm.twitter_mentions,
          sm.twitter_sentiment,
          sm.trending_hashtags,
          sm.timestamp
        FROM social_metrics sm
        JOIN wars w ON (sm.token_address = w.token_a_address OR sm.token_address = w.token_b_address)
        WHERE sm.timestamp > NOW() - INTERVAL '24 hours'
        ORDER BY sm.social_score DESC, sm.twitter_mentions DESC
        LIMIT $1
      `;

      const result = await pool.query(query, [limit]);
      return result.rows;

    } catch (error) {
      console.error('Error getting trending tokens:', error);
      return [];
    }
  }

  /**
   * Schedule social media tracking
   */
  private scheduleSocialTracking() {
    const cron = require('node-cron');
    
    // Track social metrics every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
      console.log('📱 Updating social metrics...');
      await this.trackActiveTokens();
    });

    console.log('✅ Social media tracking scheduled');
  }

  /**
   * Track social metrics for all active war tokens
   */
  private async trackActiveTokens() {
    try {
      const query = `
        SELECT DISTINCT 
          token_a_address, token_a_symbol,
          token_b_address, token_b_symbol
        FROM wars 
        WHERE status = 'active'
      `;

      const result = await pool.query(query);
      
      for (const war of result.rows) {
        // Track token A
        if (war.token_a_symbol) {
          await this.getTokenSocialMetrics(war.token_a_symbol, war.token_a_address);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limit
        }

        // Track token B
        if (war.token_b_symbol) {
          await this.getTokenSocialMetrics(war.token_b_symbol, war.token_b_address);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limit
        }
      }

      console.log(`✅ Updated social metrics for ${result.rows.length * 2} tokens`);

    } catch (error) {
      console.error('Error tracking active tokens:', error);
    }
  }

  /**
   * Get social metrics history for a token
   */
  async getSocialHistory(tokenAddress: string, hours: number = 24): Promise<SocialMetrics[]> {
    try {
      const query = `
        SELECT * FROM social_metrics 
        WHERE token_address = $1 
        AND timestamp > NOW() - INTERVAL '${hours} hours'
        ORDER BY timestamp ASC
      `;

      const result = await pool.query(query, [tokenAddress]);
      
      return result.rows.map(row => ({
        tokenAddress: row.token_address,
        twitterMentions: row.twitter_mentions,
        twitterSentiment: parseFloat(row.twitter_sentiment),
        trendingHashtags: JSON.parse(row.trending_hashtags || '[]'),
        influencerMentions: row.influencer_mentions,
        socialScore: row.social_score,
        timestamp: row.timestamp
      }));

    } catch (error) {
      console.error('Error getting social history:', error);
      return [];
    }
  }
}

export const socialService = new SocialMediaService();