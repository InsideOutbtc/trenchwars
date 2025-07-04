import express from 'express';
import { pool } from '../config/database';

const router = express.Router();

// Place a bet
router.post('/', async (req, res) => {
  try {
    const { war_id, user_wallet, amount, token_choice, transaction_signature } = req.body;
    
    // Validate inputs
    if (!war_id || !user_wallet || !amount || token_choice === undefined || !transaction_signature) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (token_choice !== 0 && token_choice !== 1) {
      return res.status(400).json({ error: 'Invalid token choice' });
    }
    
    // Check if war exists and is active
    const warQuery = `
      SELECT * FROM wars 
      WHERE id = $1 AND start_time <= NOW() AND end_time > NOW() AND is_settled = FALSE
    `;
    const warResult = await pool.query(warQuery, [war_id]);
    
    if (warResult.rows.length === 0) {
      return res.status(400).json({ error: 'War not found or not active' });
    }
    
    // Check if transaction signature is unique
    const txCheckQuery = 'SELECT id FROM bets WHERE transaction_signature = $1';
    const txResult = await pool.query(txCheckQuery, [transaction_signature]);
    
    if (txResult.rows.length > 0) {
      return res.status(400).json({ error: 'Transaction already processed' });
    }
    
    // Get or create user
    let user_id;
    const userQuery = 'SELECT id FROM users WHERE wallet_address = $1';
    const userResult = await pool.query(userQuery, [user_wallet]);
    
    if (userResult.rows.length === 0) {
      const createUserQuery = 'INSERT INTO users (wallet_address) VALUES ($1) RETURNING id';
      const newUser = await pool.query(createUserQuery, [user_wallet]);
      user_id = newUser.rows[0].id;
    } else {
      user_id = userResult.rows[0].id;
    }
    
    // Create bet record
    const betQuery = `
      INSERT INTO bets (user_id, war_id, amount, token_choice, transaction_signature)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const bet = await pool.query(betQuery, [user_id, war_id, amount, token_choice, transaction_signature]);
    
    // Update war totals
    const updateColumn = token_choice === 0 ? 'total_bets_a' : 'total_bets_b';
    await pool.query(`UPDATE wars SET ${updateColumn} = ${updateColumn} + $1 WHERE id = $2`, [amount, war_id]);
    
    res.status(201).json(bet.rows[0]);
  } catch (error) {
    console.error('Error placing bet:', error);
    res.status(500).json({ error: 'Failed to place bet' });
  }
});

// Get user's bets
router.get('/user/:wallet', async (req, res) => {
  try {
    const { wallet } = req.params;
    
    const query = `
      SELECT 
        b.*,
        w.start_time,
        w.end_time,
        w.is_settled,
        w.winner,
        ta.symbol as token_a_symbol,
        tb.symbol as token_b_symbol
      FROM bets b
      JOIN users u ON b.user_id = u.id
      JOIN wars w ON b.war_id = w.id
      JOIN tokens ta ON w.token_a_id = ta.id
      JOIN tokens tb ON w.token_b_id = tb.id
      WHERE u.wallet_address = $1
      ORDER BY b.created_at DESC
    `;
    
    const result = await pool.query(query, [wallet]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user bets:', error);
    res.status(500).json({ error: 'Failed to fetch user bets' });
  }
});

// Get bets for a specific war
router.get('/war/:id', async (req, res) => {
  try {
    const war_id = parseInt(req.params.id);
    
    const query = `
      SELECT 
        b.amount,
        b.token_choice,
        b.created_at,
        u.wallet_address
      FROM bets b
      JOIN users u ON b.user_id = u.id
      WHERE b.war_id = $1
      ORDER BY b.created_at DESC
      LIMIT 100
    `;
    
    const result = await pool.query(query, [war_id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching war bets:', error);
    res.status(500).json({ error: 'Failed to fetch war bets' });
  }
});

// Calculate potential winnings
router.get('/winnings/:war_id/:wallet/:token_choice/:amount', async (req, res) => {
  try {
    const { war_id, wallet, token_choice, amount } = req.params;
    
    // Get current war stats
    const warQuery = `
      SELECT total_bets_a, total_bets_b, is_settled
      FROM wars
      WHERE id = $1
    `;
    
    const warResult = await pool.query(warQuery, [war_id]);
    
    if (warResult.rows.length === 0) {
      return res.status(404).json({ error: 'War not found' });
    }
    
    const war = warResult.rows[0];
    const betAmount = parseInt(amount);
    const choice = parseInt(token_choice);
    
    if (war.is_settled) {
      return res.status(400).json({ error: 'War already settled' });
    }
    
    // Calculate potential winnings
    const totalA = parseInt(war.total_bets_a);
    const totalB = parseInt(war.total_bets_b);
    const totalPool = totalA + totalB + betAmount;
    const platformFee = Math.floor(totalPool * 0.03); // 3% fee
    const prizePool = totalPool - platformFee;
    
    const currentWinningPool = choice === 0 ? totalA + betAmount : totalB + betAmount;
    const potentialWinnings = Math.floor((betAmount * prizePool) / currentWinningPool);
    
    res.json({
      potential_winnings: potentialWinnings,
      potential_profit: potentialWinnings - betAmount,
      current_odds: prizePool / currentWinningPool,
      total_pool: totalPool,
      platform_fee: platformFee
    });
  } catch (error) {
    console.error('Error calculating winnings:', error);
    res.status(500).json({ error: 'Failed to calculate potential winnings' });
  }
});

export default router;