-- Social Media Metrics Database Schema

-- Social metrics tracking table
CREATE TABLE IF NOT EXISTS social_metrics (
    id SERIAL PRIMARY KEY,
    token_address VARCHAR(44) NOT NULL,
    twitter_mentions INTEGER DEFAULT 0,
    twitter_sentiment DECIMAL(4, 3) DEFAULT 0, -- -1.000 to 1.000
    trending_hashtags JSONB DEFAULT '[]',
    influencer_mentions INTEGER DEFAULT 0,
    social_score INTEGER DEFAULT 0, -- 0-100
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_social_metrics_token (token_address),
    INDEX idx_social_metrics_score (social_score DESC),
    INDEX idx_social_metrics_timestamp (timestamp)
);

-- Social trends tracking
CREATE TABLE IF NOT EXISTS social_trends (
    id SERIAL PRIMARY KEY,
    hashtag VARCHAR(100) NOT NULL,
    mention_count INTEGER DEFAULT 0,
    trend_score DECIMAL(8, 4) DEFAULT 0,
    related_tokens JSONB DEFAULT '[]',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_social_trends_hashtag (hashtag),
    INDEX idx_social_trends_score (trend_score DESC)
);

-- Influencer tracking
CREATE TABLE IF NOT EXISTS influencer_mentions (
    id SERIAL PRIMARY KEY,
    influencer_handle VARCHAR(100) NOT NULL,
    follower_count INTEGER DEFAULT 0,
    verification_status BOOLEAN DEFAULT FALSE,
    token_address VARCHAR(44) NOT NULL,
    mention_type VARCHAR(20) DEFAULT 'neutral', -- 'positive', 'negative', 'neutral'
    tweet_id VARCHAR(50),
    tweet_text TEXT,
    retweet_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_influencer_mentions_token (token_address),
    INDEX idx_influencer_mentions_handle (influencer_handle),
    INDEX idx_influencer_mentions_timestamp (timestamp)
);

-- Social sentiment analysis
CREATE TABLE IF NOT EXISTS sentiment_analysis (
    id SERIAL PRIMARY KEY,
    token_address VARCHAR(44) NOT NULL,
    period_hours INTEGER NOT NULL, -- 1, 6, 24 hour periods
    total_mentions INTEGER DEFAULT 0,
    positive_mentions INTEGER DEFAULT 0,
    negative_mentions INTEGER DEFAULT 0,
    neutral_mentions INTEGER DEFAULT 0,
    average_sentiment DECIMAL(4, 3) DEFAULT 0,
    sentiment_trend VARCHAR(20) DEFAULT 'stable', -- 'rising', 'falling', 'stable'
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(token_address, period_hours, DATE_TRUNC('hour', timestamp)),
    INDEX idx_sentiment_token_period (token_address, period_hours),
    INDEX idx_sentiment_timestamp (timestamp)
);

-- Social signals for trading
CREATE TABLE IF NOT EXISTS social_signals (
    id SERIAL PRIMARY KEY,
    token_address VARCHAR(44) NOT NULL,
    signal_type VARCHAR(50) NOT NULL, -- 'viral_hashtag', 'influencer_pump', 'sentiment_shift'
    signal_strength INTEGER DEFAULT 0, -- 1-10
    description TEXT,
    confidence DECIMAL(4, 3) DEFAULT 0, -- 0-1
    related_data JSONB DEFAULT '{}',
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_social_signals_token (token_address),
    INDEX idx_social_signals_type (signal_type),
    INDEX idx_social_signals_strength (signal_strength DESC)
);

-- Views for social analytics

-- Top trending tokens by social score
CREATE OR REPLACE VIEW trending_tokens_social AS
SELECT 
    sm.token_address,
    CASE 
        WHEN w.token_a_address = sm.token_address THEN w.token_a_symbol
        ELSE w.token_b_symbol
    END as token_symbol,
    sm.social_score,
    sm.twitter_mentions,
    sm.twitter_sentiment,
    sm.influencer_mentions,
    sm.trending_hashtags,
    sm.timestamp,
    ROW_NUMBER() OVER (PARTITION BY sm.token_address ORDER BY sm.timestamp DESC) as rn
FROM social_metrics sm
JOIN wars w ON (sm.token_address = w.token_a_address OR sm.token_address = w.token_b_address)
WHERE sm.timestamp > NOW() - INTERVAL '24 hours';

-- Social vs price correlation
CREATE OR REPLACE VIEW social_price_correlation AS
SELECT 
    sm.token_address,
    sm.social_score,
    sm.twitter_sentiment,
    ph.price_usd,
    ph.price_change_24h,
    sm.timestamp,
    CORR(sm.social_score, ph.price_change_24h) OVER (
        PARTITION BY sm.token_address 
        ORDER BY sm.timestamp 
        ROWS BETWEEN 23 PRECEDING AND CURRENT ROW
    ) as correlation_24h
FROM social_metrics sm
JOIN token_price_history ph ON sm.token_address = ph.token_address 
    AND ABS(EXTRACT(EPOCH FROM (sm.timestamp - ph.timestamp))) < 1800 -- 30 min window
WHERE sm.timestamp > NOW() - INTERVAL '7 days';

-- Influencer impact analysis
CREATE OR REPLACE VIEW influencer_impact AS
SELECT 
    im.influencer_handle,
    im.follower_count,
    COUNT(*) as total_mentions,
    AVG(CASE WHEN im.mention_type = 'positive' THEN 1 
             WHEN im.mention_type = 'negative' THEN -1 
             ELSE 0 END) as avg_sentiment,
    AVG(im.retweet_count + im.like_count) as avg_engagement,
    COUNT(DISTINCT im.token_address) as tokens_mentioned,
    MAX(im.timestamp) as last_mention
FROM influencer_mentions im
WHERE im.timestamp > NOW() - INTERVAL '30 days'
GROUP BY im.influencer_handle, im.follower_count
ORDER BY total_mentions DESC, avg_engagement DESC;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_metrics_token_time ON social_metrics(token_address, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_social_trends_time ON social_trends(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_influencer_mentions_token_time ON influencer_mentions(token_address, timestamp DESC);

-- Function to calculate social momentum
CREATE OR REPLACE FUNCTION calculate_social_momentum(token_addr VARCHAR(44), hours INTEGER DEFAULT 24)
RETURNS DECIMAL(8, 4) AS $$
DECLARE
    current_score DECIMAL(8, 4);
    previous_score DECIMAL(8, 4);
    momentum DECIMAL(8, 4);
BEGIN
    -- Get current social score
    SELECT social_score INTO current_score
    FROM social_metrics 
    WHERE token_address = token_addr 
    ORDER BY timestamp DESC 
    LIMIT 1;
    
    -- Get previous social score
    SELECT social_score INTO previous_score
    FROM social_metrics 
    WHERE token_address = token_addr 
    AND timestamp < NOW() - INTERVAL concat(hours, ' hours')
    ORDER BY timestamp DESC 
    LIMIT 1;
    
    -- Calculate momentum
    IF previous_score IS NULL OR previous_score = 0 THEN
        momentum := 0;
    ELSE
        momentum := ((current_score - previous_score) / previous_score) * 100;
    END IF;
    
    RETURN momentum;
END;
$$ LANGUAGE plpgsql;