# 🚀 TrenchWars Deployment Guide

## Frontend (Vercel)

1. **Connect to GitHub**
   - Push code to GitHub repository
   - Connect repository to Vercel

2. **Configure Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://api.trenchwars.wtf/api
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
   ```

3. **Deploy**
   - Vercel will automatically build and deploy
   - Uses the vercel.json configuration

## Backend (Render - LIVE)

1. **✅ Connected Repository**
   - GitHub repo connected to Render
   - Deployed from `/backend` directory
   - Live at: `https://api.trenchwars.wtf`

2. **✅ Environment Variables Configured**
   ```
   PORT=3001
   NODE_ENV=production
   FRONTEND_URL=https://trenchwars.wtf
   
   # Database (Production PostgreSQL)
   DATABASE_URL=postgresql://user:password@host:port/dbname
   
   # API Keys (configured)
   COINGECKO_API_KEY=configured
   TWITTER_BEARER_TOKEN=configured
   ```

3. **✅ Database Setup Complete**
   - Production PostgreSQL service active
   - Database migrations completed
   - Initial data seeded

## 🌐 Live Production URLs
- **Frontend**: `https://trenchwars.wtf` ✅ LIVE
- **Backend API**: `https://api.trenchwars.wtf` ✅ LIVE
- **Smart Contract**: `7KK67M12SbodyTKSetMjMeCWBiDNvB817dkWWvueRbYG` (Solana Devnet)

## Manual Deployment Commands

### Vercel
```bash
npx vercel login
npx vercel --prod
```

### Railway
```bash
npm install -g @railway/cli
railway login
railway link
railway up
```