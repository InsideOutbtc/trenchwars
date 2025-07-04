import express from 'express';
import { pool } from '../config/database';

const router = express.Router();

// Get user profile
router.get('/:wallet', async (req, res) => {
  try {
    const { wallet } = req.params;
    
    const userQuery = `
      SELECT 
        u.*,
        COUNT(b.id) as total_bets,
        COALESCE(SUM(b.amount), 0) as total_wagered,
        COUNT(CASE WHEN w.winner = b.token_choice THEN 1 END) as wins,
        COUNT(CASE WHEN w.is_settled = true AND w.winner IS NOT NULL AND w.winner != b.token_choice THEN 1 END) as losses
      FROM users u
      LEFT JOIN bets b ON u.id = b.user_id
      LEFT JOIN wars w ON b.war_id = w.id
      WHERE u.wallet_address = $1
      GROUP BY u.id
    `;
    
    const result = await pool.query(userQuery, [wallet]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    const winRate = user.total_bets > 0 ? (user.wins / user.total_bets * 100).toFixed(2) : '0';
    
    res.json({
      ...user,
      win_rate: parseFloat(winRate),
      total_wagered: parseInt(user.total_wagered),
      total_bets: parseInt(user.total_bets),
      wins: parseInt(user.wins),
      losses: parseInt(user.losses)
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/:wallet', async (req, res) => {
  try {
    const { wallet } = req.params;
    const { username } = req.body;
    
    if (!username || username.length > 50) {
      return res.status(400).json({ error: 'Invalid username' });
    }
    
    // Check if username is already taken
    const usernameCheck = await pool.query(
      'SELECT id FROM users WHERE username = $1 AND wallet_address != $2',
      [username, wallet]
    );
    
    if (usernameCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    
    const query = `
      UPDATE users 
      SET username = $1, updated_at = NOW()
      WHERE wallet_address = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [username, wallet]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Get leaderboard
router.get('/leaderboard/top', async (req, res) => {
  try {
    const { limit = 50, period = 'all' } = req.query;
    
    let dateFilter = '';
    if (period === '7d') dateFilter = "AND b.created_at >= NOW() - INTERVAL '7 days'";
    else if (period === '30d') dateFilter = "AND b.created_at >= NOW() - INTERVAL '30 days'";
    
    const query = `
      SELECT 
        u.wallet_address,
        u.username,
        COUNT(b.id) as total_bets,
        COALESCE(SUM(b.amount), 0) as total_wagered,
        COUNT(CASE WHEN w.winner = b.token_choice THEN 1 END) as wins,
        COUNT(CASE WHEN w.is_settled = true AND w.winner IS NOT NULL THEN 1 END) as settled_bets,
        CASE 
          WHEN COUNT(CASE WHEN w.is_settled = true AND w.winner IS NOT NULL THEN 1 END) > 0 
          THEN (COUNT(CASE WHEN w.winner = b.token_choice THEN 1 END)::float / COUNT(CASE WHEN w.is_settled = true AND w.winner IS NOT NULL THEN 1 END) * 100)
          ELSE 0 
        END as win_rate
      FROM users u
      LEFT JOIN bets b ON u.id = b.user_id ${dateFilter}
      LEFT JOIN wars w ON b.war_id = w.id
      GROUP BY u.id, u.wallet_address, u.username
      HAVING COUNT(b.id) > 0
      ORDER BY win_rate DESC, total_wagered DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    
    const leaderboard = result.rows.map((row, index) => ({
      rank: index + 1,
      wallet_address: row.wallet_address,
      username: row.username || 'Anonymous',
      total_bets: parseInt(row.total_bets),
      total_wagered: parseInt(row.total_wagered),
      wins: parseInt(row.wins),
      settled_bets: parseInt(row.settled_bets),
      win_rate: parseFloat(row.win_rate).toFixed(2)
    }));
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get detailed user profile with achievements
router.get('/:wallet/profile', async (req, res) => {
  try {
    const { wallet } = req.params;
    
    // Get user basic info and bet statistics
    const userQuery = `
      SELECT 
        u.*,
        COUNT(b.id) as total_bets,
        COALESCE(SUM(b.amount), 0) as total_wagered,
        COUNT(CASE WHEN w.winner = b.token_choice THEN 1 END) as wins,
        COUNT(CASE WHEN w.is_settled = true AND w.winner IS NOT NULL AND w.winner != b.token_choice THEN 1 END) as losses,
        COALESCE(SUM(CASE WHEN w.winner = b.token_choice THEN b.amount * 1.8 ELSE 0 END), 0) as total_winnings
      FROM users u
      LEFT JOIN bets b ON u.id = b.user_id
      LEFT JOIN wars w ON b.war_id = w.id
      WHERE u.wallet_address = $1
      GROUP BY u.id
    `;
    
    const userResult = await pool.query(userQuery, [wallet]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    const totalBets = parseInt(user.total_bets);
    const wins = parseInt(user.wins);
    const totalWagered = parseInt(user.total_wagered);
    const totalWinnings = parseInt(user.total_winnings);
    const winRate = totalBets > 0 ? (wins / totalBets * 100) : 0;
    
    // Get current streak
    const streakQuery = `
      SELECT 
        CASE WHEN w.winner = b.token_choice THEN 1 ELSE 0 END as won
      FROM bets b
      JOIN wars w ON b.war_id = w.id
      WHERE b.user_id = $1 AND w.is_settled = true
      ORDER BY b.created_at DESC
      LIMIT 20
    `;
    
    const streakResult = await pool.query(streakQuery, [user.id]);
    let currentStreak = 0;
    let longestStreak = 0;
    let currentWinStreak = 0;
    
    for (const bet of streakResult.rows) {
      if (bet.won === 1) {
        currentWinStreak++;
        if (currentStreak === 0) currentStreak = currentWinStreak;
      } else {
        if (currentStreak === 0) break;
        currentWinStreak = 0;
      }
      longestStreak = Math.max(longestStreak, currentWinStreak);
    }
    
    // Get favorite token
    const favoriteTokenQuery = `
      SELECT 
        CASE 
          WHEN b.token_choice = 0 THEN ta.symbol 
          ELSE tb.symbol 
        END as token_symbol,
        COUNT(*) as bet_count
      FROM bets b
      JOIN wars w ON b.war_id = w.id
      JOIN tokens ta ON w.token_a_id = ta.id
      JOIN tokens tb ON w.token_b_id = tb.id
      WHERE b.user_id = $1
      GROUP BY token_symbol
      ORDER BY bet_count DESC
      LIMIT 1
    `;
    
    const favoriteResult = await pool.query(favoriteTokenQuery, [user.id]);
    const favoriteToken = favoriteResult.rows.length > 0 ? favoriteResult.rows[0].token_symbol : 'None';
    
    // Get user rank
    const rankQuery = `
      SELECT COUNT(*) + 1 as rank
      FROM (
        SELECT 
          u2.id,
          COUNT(CASE WHEN w2.winner = b2.token_choice THEN 1 END)::float / NULLIF(COUNT(CASE WHEN w2.is_settled = true AND w2.winner IS NOT NULL THEN 1 END), 0) as win_rate
        FROM users u2
        LEFT JOIN bets b2 ON u2.id = b2.user_id
        LEFT JOIN wars w2 ON b2.war_id = w2.id
        GROUP BY u2.id
        HAVING COUNT(b2.id) > 0 AND 
               COUNT(CASE WHEN w2.winner = b2.token_choice THEN 1 END)::float / NULLIF(COUNT(CASE WHEN w2.is_settled = true AND w2.winner IS NOT NULL THEN 1 END), 0) > $1
      ) ranked_users
    `;
    
    const rankResult = await pool.query(rankQuery, [winRate / 100]);
    const rank = parseInt(rankResult.rows[0]?.rank || 999999);
    
    // Generate achievements based on user stats
    const achievements = [];
    
    if (totalBets >= 1) {
      achievements.push({
        id: 'first_bet',
        name: 'First Blood',
        description: 'Placed your first bet',
        icon: '🎯',
        unlockedAt: user.created_at,
        rarity: 'common'
      });
    }
    
    if (totalBets >= 10) {
      achievements.push({
        id: 'veteran',
        name: 'Veteran Bettor',
        description: 'Placed 10 or more bets',
        icon: '🏆',
        unlockedAt: user.created_at,
        rarity: 'rare'
      });
    }
    
    if (winRate >= 70 && totalBets >= 5) {
      achievements.push({
        id: 'high_roller',
        name: 'High Roller',
        description: '70%+ win rate with 5+ bets',
        icon: '💎',
        unlockedAt: user.created_at,
        rarity: 'epic'
      });
    }
    
    if (totalWinnings > totalWagered * 2) {
      achievements.push({
        id: 'profit_master',
        name: 'Profit Master',
        description: 'Doubled your total investment',
        icon: '💰',
        unlockedAt: user.created_at,
        rarity: 'legendary'
      });
    }
    
    if (currentStreak >= 5) {
      achievements.push({
        id: 'hot_streak',
        name: 'Hot Streak',
        description: '5 wins in a row',
        icon: '🔥',
        unlockedAt: user.created_at,
        rarity: 'epic'
      });
    }
    
    const profile = {
      totalBets,
      totalWagered,
      totalWinnings,
      winRate,
      currentStreak,
      longestStreak,
      favoriteToken,
      memberSince: user.created_at,
      rank,
      achievements
    };
    
    res.json(profile);
  } catch (error) {
    console.error('Error fetching detailed user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

export default router;