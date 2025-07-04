import express from 'express';
import { WarModel } from '../models/War';
import { pool } from '../config/database';
import { mockWars } from './mockData';

const router = express.Router();

// Get all wars
router.get('/', async (req, res) => {
  try {
    const wars = await WarModel.getAll();
    res.json(wars);
  } catch (error) {
    console.error('Error fetching wars:', error);
    res.status(500).json({ error: 'Failed to fetch wars' });
  }
});

// Get active wars
router.get('/active', async (req, res) => {
  try {
    // For initial launch, return mock data if database is empty
    try {
      const wars = await WarModel.getActive();
      if (wars.length === 0) {
        console.log('No wars in database, returning mock data for demo');
        return res.json(mockWars);
      }
      res.json(wars);
    } catch (dbError) {
      console.log('Database not ready, returning mock data:', dbError);
      res.json(mockWars);
    }
  } catch (error) {
    console.error('Error fetching active wars:', error);
    res.status(500).json({ error: 'Failed to fetch active wars' });
  }
});

// Get war by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const war = await WarModel.getById(id);
    
    if (!war) {
      return res.status(404).json({ error: 'War not found' });
    }
    
    res.json(war);
  } catch (error) {
    console.error('Error fetching war:', error);
    res.status(500).json({ error: 'Failed to fetch war' });
  }
});

// Create new war
router.post('/', async (req, res) => {
  try {
    const { token_a_id, token_b_id, duration_hours = 168 } = req.body; // Default 1 week
    
    // Validate tokens exist
    const tokenCheckQuery = 'SELECT id, price FROM tokens WHERE id IN ($1, $2)';
    const tokenResult = await pool.query(tokenCheckQuery, [token_a_id, token_b_id]);
    
    if (tokenResult.rows.length !== 2) {
      return res.status(400).json({ error: 'Invalid token IDs' });
    }
    
    const token_a = tokenResult.rows.find(t => t.id === token_a_id);
    const token_b = tokenResult.rows.find(t => t.id === token_b_id);
    
    const start_time = new Date();
    const end_time = new Date(start_time.getTime() + duration_hours * 60 * 60 * 1000);
    
    const war = await WarModel.create({
      token_a_id,
      token_b_id,
      start_time,
      end_time,
      token_a_start_price: parseFloat(token_a.price),
      token_b_start_price: parseFloat(token_b.price),
      solana_program_id: 'BET1234567890abcdefghijklmnopqrstuvwxyz1234567' // This would be dynamic in production
    });
    
    res.status(201).json(war);
  } catch (error) {
    console.error('Error creating war:', error);
    res.status(500).json({ error: 'Failed to create war' });
  }
});

// Get war betting statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const statsQuery = `
      SELECT 
        w.total_bets_a,
        w.total_bets_b,
        COUNT(b.id) as total_bets,
        COUNT(DISTINCT b.user_id) as unique_bettors
      FROM wars w
      LEFT JOIN bets b ON w.id = b.war_id
      WHERE w.id = $1
      GROUP BY w.id, w.total_bets_a, w.total_bets_b
    `;
    
    const result = await pool.query(statsQuery, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'War not found' });
    }
    
    const stats = result.rows[0];
    const total_pool = parseInt(stats.total_bets_a) + parseInt(stats.total_bets_b);
    
    res.json({
      total_bets_a: parseInt(stats.total_bets_a),
      total_bets_b: parseInt(stats.total_bets_b),
      total_pool,
      total_bets: parseInt(stats.total_bets),
      unique_bettors: parseInt(stats.unique_bettors),
      odds_a: total_pool > 0 ? total_pool / parseInt(stats.total_bets_a) : 1,
      odds_b: total_pool > 0 ? total_pool / parseInt(stats.total_bets_b) : 1
    });
  } catch (error) {
    console.error('Error fetching war stats:', error);
    res.status(500).json({ error: 'Failed to fetch war statistics' });
  }
});

// Settle war (admin only - would need authentication in production)
router.post('/:id/settle', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const war = await WarModel.getById(id);
    
    if (!war) {
      return res.status(404).json({ error: 'War not found' });
    }
    
    if (war.is_settled) {
      return res.status(400).json({ error: 'War already settled' });
    }
    
    if (new Date() < war.end_time) {
      return res.status(400).json({ error: 'War has not ended yet' });
    }
    
    // Get current prices
    const pricesQuery = `
      SELECT 
        ta.price as token_a_price,
        tb.price as token_b_price
      FROM wars w
      JOIN tokens ta ON w.token_a_id = ta.id
      JOIN tokens tb ON w.token_b_id = tb.id
      WHERE w.id = $1
    `;
    
    const pricesResult = await pool.query(pricesQuery, [id]);
    const prices = pricesResult.rows[0];
    
    // Calculate price changes
    const token_a_change = war.token_a_start_price ? 
      ((prices.token_a_price - war.token_a_start_price) / war.token_a_start_price) * 100 : 0;
    const token_b_change = war.token_b_start_price ? 
      ((prices.token_b_price - war.token_b_start_price) / war.token_b_start_price) * 100 : 0;
    
    // Determine winner
    let winner: number | null = null;
    if (token_a_change > token_b_change) {
      winner = 0;
    } else if (token_b_change > token_a_change) {
      winner = 1;
    }
    // null = tie
    
    const settledWar = await WarModel.settle(id, winner, prices.token_a_price, prices.token_b_price);
    
    res.json({
      war: settledWar,
      token_a_change,
      token_b_change,
      winner
    });
  } catch (error) {
    console.error('Error settling war:', error);
    res.status(500).json({ error: 'Failed to settle war' });
  }
});

// Create a new war (user-submitted)
router.post('/create', async (req, res) => {
  try {
    const {
      token_a,
      token_b,
      duration_hours,
      min_bet_amount,
      description,
      creator_wallet,
      start_time,
      end_time
    } = req.body;

    // Validate required fields
    if (!token_a || !token_b || !duration_hours || !creator_wallet) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate duration
    if (duration_hours < 1 || duration_hours > 168) {
      return res.status(400).json({ error: 'Duration must be between 1 and 168 hours' });
    }

    // Validate minimum bet
    if (min_bet_amount < 1000000) { // 0.001 SOL in lamports
      return res.status(400).json({ error: 'Minimum bet must be at least 0.001 SOL' });
    }

    // Check if tokens already exist, if not create them
    let tokenAId, tokenBId;

    // Handle Token A
    const tokenAQuery = 'SELECT id FROM tokens WHERE symbol = $1';
    const tokenAResult = await pool.query(tokenAQuery, [token_a.symbol]);
    
    if (tokenAResult.rows.length === 0) {
      const insertTokenA = `
        INSERT INTO tokens (symbol, name, coingecko_id, price, price_change_24h, market_cap)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;
      const newTokenA = await pool.query(insertTokenA, [
        token_a.symbol,
        token_a.name,
        token_a.id,
        token_a.price || 0,
        token_a.price_change_24h || 0,
        token_a.market_cap || 0
      ]);
      tokenAId = newTokenA.rows[0].id;
    } else {
      tokenAId = tokenAResult.rows[0].id;
    }

    // Handle Token B
    const tokenBQuery = 'SELECT id FROM tokens WHERE symbol = $1';
    const tokenBResult = await pool.query(tokenBQuery, [token_b.symbol]);
    
    if (tokenBResult.rows.length === 0) {
      const insertTokenB = `
        INSERT INTO tokens (symbol, name, coingecko_id, price, price_change_24h, market_cap)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;
      const newTokenB = await pool.query(insertTokenB, [
        token_b.symbol,
        token_b.name,
        token_b.id,
        token_b.price || 0,
        token_b.price_change_24h || 0,
        token_b.market_cap || 0
      ]);
      tokenBId = newTokenB.rows[0].id;
    } else {
      tokenBId = tokenBResult.rows[0].id;
    }

    // Create the war with pending status
    const createWarQuery = `
      INSERT INTO wars (
        token_a_id, token_b_id, start_time, end_time, 
        min_bet_amount, description, creator_wallet,
        is_active, is_settled, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, false, false, 'pending')
      RETURNING *
    `;

    const warResult = await pool.query(createWarQuery, [
      tokenAId,
      tokenBId,
      start_time,
      end_time,
      min_bet_amount,
      description || `${token_a.symbol} vs ${token_b.symbol} - TrenchWars Battle`,
      creator_wallet
    ]);

    const war = warResult.rows[0];

    // Return war with token details
    const warWithTokens = {
      ...war,
      token_a: {
        id: tokenAId,
        symbol: token_a.symbol,
        name: token_a.name
      },
      token_b: {
        id: tokenBId,
        symbol: token_b.symbol,
        name: token_b.name
      }
    };

    res.status(201).json(warWithTokens);
  } catch (error) {
    console.error('Error creating war:', error);
    res.status(500).json({ error: 'Failed to create war' });
  }
});

// Get user-created wars
router.get('/user/:wallet', async (req, res) => {
  try {
    const { wallet } = req.params;
    const { status = 'all' } = req.query;

    let statusFilter = '';
    if (status !== 'all') {
      statusFilter = 'AND w.status = $2';
    }

    const query = `
      SELECT 
        w.*,
        ta.symbol as token_a_symbol,
        ta.name as token_a_name,
        tb.symbol as token_b_symbol,
        tb.name as token_b_name
      FROM wars w
      JOIN tokens ta ON w.token_a_id = ta.id
      JOIN tokens tb ON w.token_b_id = tb.id
      WHERE w.creator_wallet = $1 ${statusFilter}
      ORDER BY w.created_at DESC
    `;

    const params = status === 'all' ? [wallet] : [wallet, status];
    const result = await pool.query(query, params);

    const wars = result.rows.map(war => ({
      ...war,
      token_a: {
        id: war.token_a_id,
        symbol: war.token_a_symbol,
        name: war.token_a_name
      },
      token_b: {
        id: war.token_b_id,
        symbol: war.token_b_symbol,
        name: war.token_b_name
      }
    }));

    res.json(wars);
  } catch (error) {
    console.error('Error fetching user wars:', error);
    res.status(500).json({ error: 'Failed to fetch user wars' });
  }
});

// Admin: Approve/reject user-created wars
router.put('/:id/moderate', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, admin_wallet } = req.body; // action: 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const updateQuery = `
      UPDATE wars 
      SET 
        status = $2,
        is_active = $3,
        moderated_by = $4,
        moderated_at = NOW()
      WHERE id = $1 AND status = 'pending'
      RETURNING *
    `;

    const isActive = action === 'approve';
    const status = action === 'approve' ? 'active' : 'rejected';

    const result = await pool.query(updateQuery, [id, status, isActive, admin_wallet]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'War not found or already moderated' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error moderating war:', error);
    res.status(500).json({ error: 'Failed to moderate war' });
  }
});

export default router;