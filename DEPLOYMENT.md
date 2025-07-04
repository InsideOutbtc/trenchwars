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

## Backend (Railway/Custom Server)

1. **Connect Repository**
   - Connect GitHub repo to Railway/hosting provider
   - Deploy from `/backend` directory

2. **Configure Environment Variables**
   ```
   PORT=3001
   NODE_ENV=production
   FRONTEND_URL=https://trenchwars.wtf
   
   # Database (Railway PostgreSQL)
   DATABASE_URL=postgresql://user:password@host:port/dbname
   
   # Optional API Keys
   COINGECKO_API_KEY=your_key_here
   TWITTER_BEARER_TOKEN=your_token_here
   ```

3. **Database Setup**
   - Add Railway PostgreSQL service
   - Run database migrations
   - Seed with initial data

## Ready URLs
- Frontend: `https://trenchwars.wtf`
- Backend API: `https://api.trenchwars.wtf`

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