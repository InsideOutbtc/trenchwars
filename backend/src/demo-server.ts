import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { mockTokens, mockWars, calculateWarStats } from './config/mockData';
import socialRoutes from './routes/social';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Social routes
app.use('/api/social', socialRoutes);

// Mock API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mode: 'DEMO'
  });
});

// Wars endpoints
app.get('/api/wars', (req, res) => {
  res.json(mockWars);
});

app.get('/api/wars/active', (req, res) => {
  const activeWars = mockWars.filter(war => !war.is_settled);
  res.json(activeWars);
});

app.get('/api/wars/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const war = mockWars.find(w => w.id === id);
  
  if (!war) {
    return res.status(404).json({ error: 'War not found' });
  }
  
  res.json(war);
});

app.get('/api/wars/:id/stats', (req, res) => {
  const id = parseInt(req.params.id);
  const war = mockWars.find(w => w.id === id);
  
  if (!war) {
    return res.status(404).json({ error: 'War not found' });
  }
  
  const stats = calculateWarStats(war);
  res.json(stats);
});

// Tokens/Prices endpoints
app.get('/api/prices/tokens', (req, res) => {
  res.json(mockTokens);
});

app.get('/api/prices/history/:tokenId', (req, res) => {
  const tokenId = parseInt(req.params.tokenId);
  const token = mockTokens.find(t => t.id === tokenId);
  
  if (!token) {
    return res.status(404).json({ error: 'Token not found' });
  }
  
  // Generate mock price history
  const history = [];
  const now = new Date();
  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const priceVariation = (Math.random() - 0.5) * 0.1; // ±5% variation
    const price = token.price * (1 + priceVariation);
    
    history.push({
      price: price,
      market_cap: token.market_cap * (price / token.price),
      volume_24h: Math.floor(Math.random() * 1000000000),
      recorded_at: timestamp.toISOString()
    });
  }
  
  res.json(history);
});

app.get('/api/prices/trending', (req, res) => {
  const trending = [...mockTokens]
    .sort((a, b) => b.price_change_24h - a.price_change_24h)
    .slice(0, 10);
  
  res.json(trending);
});

// Bets endpoints (mock)
app.post('/api/bets', (req, res) => {
  const { war_id, user_wallet, amount, token_choice, transaction_signature } = req.body;
  
  // Simulate bet creation
  const bet = {
    id: Math.floor(Math.random() * 10000),
    war_id,
    user_wallet,
    amount,
    token_choice,
    transaction_signature,
    created_at: new Date().toISOString()
  };
  
  // Update war totals
  const war = mockWars.find(w => w.id === war_id);
  if (war) {
    if (token_choice === 0) {
      war.total_bets_a += amount;
    } else {
      war.total_bets_b += amount;
    }
  }
  
  res.status(201).json(bet);
});

app.get('/api/bets/user/:wallet', (req, res) => {
  // Return empty array for demo
  res.json([]);
});

// Users endpoints (mock)
app.get('/api/users/:wallet', (req, res) => {
  res.json({
    wallet_address: req.params.wallet,
    username: null,
    total_bets: 0,
    total_wagered: 0,
    wins: 0,
    losses: 0,
    win_rate: 0,
    created_at: new Date().toISOString()
  });
});

app.get('/api/users/leaderboard/top', (req, res) => {
  res.json([]);
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  res.status(500).json({
    error: 'Internal server error',
    mode: 'DEMO'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Demo server running on port ${PORT}`);
  console.log(`📱 Frontend should connect to: http://localhost:${PORT}/api`);
  console.log(`🎮 Mode: DEMO (using mock data)`);
});

export default app;