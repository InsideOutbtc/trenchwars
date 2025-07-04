import { Pool } from 'pg';

export const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'crypto_meme_wars',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        wallet_address VARCHAR(44) UNIQUE NOT NULL,
        username VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS tokens (
        id SERIAL PRIMARY KEY,
        symbol VARCHAR(20) NOT NULL,
        name VARCHAR(100) NOT NULL,
        contract_address VARCHAR(44),
        market_cap BIGINT,
        price DECIMAL(20, 8),
        price_change_24h DECIMAL(10, 4),
        volume_24h BIGINT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(symbol)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS wars (
        id SERIAL PRIMARY KEY,
        token_a_id INTEGER REFERENCES tokens(id),
        token_b_id INTEGER REFERENCES tokens(id),
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        total_bets_a BIGINT DEFAULT 0,
        total_bets_b BIGINT DEFAULT 0,
        is_settled BOOLEAN DEFAULT FALSE,
        winner INTEGER, -- 0 = token_a, 1 = token_b, NULL = tie
        token_a_start_price DECIMAL(20, 8),
        token_b_start_price DECIMAL(20, 8),
        token_a_end_price DECIMAL(20, 8),
        token_b_end_price DECIMAL(20, 8),
        solana_program_id VARCHAR(44),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS bets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        war_id INTEGER REFERENCES wars(id),
        amount BIGINT NOT NULL,
        token_choice INTEGER NOT NULL, -- 0 = token_a, 1 = token_b
        transaction_signature VARCHAR(88),
        is_claimed BOOLEAN DEFAULT FALSE,
        payout_amount BIGINT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS social_metrics (
        id SERIAL PRIMARY KEY,
        token_id INTEGER REFERENCES tokens(id),
        twitter_mentions INTEGER DEFAULT 0,
        twitter_engagement INTEGER DEFAULT 0,
        reddit_mentions INTEGER DEFAULT 0,
        discord_mentions INTEGER DEFAULT 0,
        sentiment_score DECIMAL(3, 2), -- -1 to 1
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS price_history (
        id SERIAL PRIMARY KEY,
        token_id INTEGER REFERENCES tokens(id),
        price DECIMAL(20, 8) NOT NULL,
        market_cap BIGINT,
        volume_24h BIGINT,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_wars_active ON wars (start_time, end_time, is_settled);
      CREATE INDEX IF NOT EXISTS idx_bets_user_war ON bets (user_id, war_id);
      CREATE INDEX IF NOT EXISTS idx_price_history_token_time ON price_history (token_id, recorded_at);
      CREATE INDEX IF NOT EXISTS idx_social_metrics_token_time ON social_metrics (token_id, recorded_at);
    `);

    console.log('Database tables created successfully');
  } finally {
    client.release();
  }
}