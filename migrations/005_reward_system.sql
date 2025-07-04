-- Winner's Reward System Database Schema

-- Reward distributions table
CREATE TABLE IF NOT EXISTS reward_distributions (
    id SERIAL PRIMARY KEY,
    war_id INTEGER REFERENCES wars(id) NOT NULL,
    winning_token VARCHAR(44) NOT NULL,
    total_fees DECIMAL(18, 9) NOT NULL,
    buyback_amount DECIMAL(18, 9) NOT NULL,
    participants INTEGER NOT NULL,
    transaction_id VARCHAR(88) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(war_id)
);

-- Token price history for tracking buyback impact
CREATE TABLE IF NOT EXISTS token_price_history (
    id SERIAL PRIMARY KEY,
    token_address VARCHAR(44) NOT NULL,
    price_usd DECIMAL(18, 9) NOT NULL,
    market_cap DECIMAL(18, 2),
    volume_24h DECIMAL(18, 2),
    price_change_24h DECIMAL(8, 4),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_token_timestamp (token_address, timestamp)
);

-- Buyback impact tracking
CREATE TABLE IF NOT EXISTS buyback_impact (
    id SERIAL PRIMARY KEY,
    reward_distribution_id INTEGER REFERENCES reward_distributions(id),
    token_address VARCHAR(44) NOT NULL,
    price_before DECIMAL(18, 9) NOT NULL,
    price_after DECIMAL(18, 9) NOT NULL,
    price_impact_percent DECIMAL(8, 4) NOT NULL,
    tokens_purchased DECIMAL(18, 9) NOT NULL,
    sol_spent DECIMAL(18, 9) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- War statistics including fees
ALTER TABLE wars ADD COLUMN IF NOT EXISTS total_fees_collected DECIMAL(18, 9) DEFAULT 0;
ALTER TABLE wars ADD COLUMN IF NOT EXISTS reward_distributed BOOLEAN DEFAULT FALSE;

-- Betting fees tracking
ALTER TABLE bets ADD COLUMN IF NOT EXISTS fee_amount DECIMAL(18, 9) DEFAULT 0;

-- Update existing bets to calculate fees (2% of bet amount)
UPDATE bets SET fee_amount = amount * 0.02 WHERE fee_amount = 0;

-- Treasury wallet tracking
CREATE TABLE IF NOT EXISTS treasury_transactions (
    id SERIAL PRIMARY KEY,
    transaction_type VARCHAR(20) NOT NULL, -- 'fee_collection', 'buyback', 'distribution'
    amount DECIMAL(18, 9) NOT NULL,
    token_address VARCHAR(44),
    transaction_id VARCHAR(88) NOT NULL,
    war_id INTEGER REFERENCES wars(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reward_distributions_war_id ON reward_distributions(war_id);
CREATE INDEX IF NOT EXISTS idx_token_price_history_token ON token_price_history(token_address);
CREATE INDEX IF NOT EXISTS idx_treasury_transactions_type ON treasury_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_wars_reward_status ON wars(reward_distributed, status);

-- View for reward system analytics
CREATE OR REPLACE VIEW reward_system_stats AS
SELECT 
    COUNT(*) as total_distributions,
    SUM(total_fees) as total_fees_collected,
    SUM(buyback_amount) as total_buybacks,
    AVG(buyback_amount) as avg_buyback,
    SUM(participants) as total_participants,
    COUNT(DISTINCT winning_token) as unique_winning_tokens,
    MIN(created_at) as first_distribution,
    MAX(created_at) as latest_distribution
FROM reward_distributions;

-- View for war profitability
CREATE OR REPLACE VIEW war_profitability AS
SELECT 
    w.id,
    w.title,
    w.total_fees_collected,
    rd.buyback_amount,
    (w.total_fees_collected - rd.buyback_amount) as platform_revenue,
    rd.participants,
    rd.winning_token,
    bi.price_impact_percent,
    rd.created_at as reward_date
FROM wars w
LEFT JOIN reward_distributions rd ON w.id = rd.war_id
LEFT JOIN buyback_impact bi ON rd.id = bi.reward_distribution_id
WHERE w.status = 'completed'
ORDER BY w.end_time DESC;