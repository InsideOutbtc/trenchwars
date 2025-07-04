import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database';
import warRoutes from './routes/wars';
import betRoutes from './routes/bets';
import priceRoutes from './routes/prices';
import userRoutes from './routes/users';
import { startPriceTracking } from './services/priceService';
import { rewardService } from './services/rewardService';
import { realTimePriceService } from './services/realTimePriceService';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://app.cryptocolosseum.app',
    'https://docs.cryptocolosseum.app'
  ],
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/wars', warRoutes);
app.use('/api/bets', betRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');
    
    // Start price tracking service
    startPriceTracking();
    console.log('Price tracking service started');
    
    // Start Winner's Reward System
    await rewardService.scheduleRewardDistributions();
    console.log('Winner\'s Reward System started');
    
    // Initialize real-time price service
    console.log('Real-time price service started');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();