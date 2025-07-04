# ⚔️ TrenchWars - Token Battle Arena

**🔗 Live at: [trenchwars.wtf](https://trenchwars.wtf)**

A revolutionary Polymarket-style prediction market on Solana where crypto communities battle it out in epic token wars. Users bet on which cryptocurrency will perform better over specified time periods, creating an engaging and competitive trading experience.

## 🎮 **Live Platform Features**

- **⚔️ Epic Token Battles**: Community-created wars between competing cryptocurrencies
- **💰 Solana Integration**: Real SOL betting with instant payouts via smart contracts
- **📊 Live Market Data**: Real-time price feeds and comprehensive market analytics
- **👤 User Profiles**: Wallet-based profiles with achievements and statistics
- **🏆 Global Leaderboards**: Track top performers and betting champions
- **🔗 Multi-Wallet Support**: Phantom, Solflare, and other Solana wallets
- **📱 Mobile-First Design**: Optimized for all devices and screen sizes
- **🌐 Social Integration**: Twitter sentiment analysis and trending data
- **🎯 Market Creation**: Users can propose and create new token battles

## 🚀 **Platform Status: LIVE & PRODUCTION-READY** ✅

**🌐 Live URLs:**
- **Frontend**: [https://trenchwars.wtf](https://trenchwars.wtf)
- **API**: [https://api.trenchwars.wtf](https://api.trenchwars.wtf)
- **Smart Contract**: `7KK67M12SbodyTKSetMjMeCWBiDNvB817dkWWvueRbYG` (Solana Devnet)

## 🎯 **How to Play TrenchWars**

1. **Visit [trenchwars.wtf](https://trenchwars.wtf)**
2. **Connect your Solana wallet** (Phantom, Solflare, etc.)
3. **Browse active token battles** (PEPE vs SHIB, DOGE vs WIF, etc.)
4. **Place your bets** using SOL cryptocurrency
5. **Track your performance** in your user profile
6. **Create new wars** and challenge the community
7. **Climb the leaderboards** and earn achievements

## 🛠️ **Local Development Setup**

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Solana CLI (for smart contract development)

### Quick Setup
```bash
# Clone the repository
git clone https://github.com/insideoutbtc/trenchwars.git
cd trenchwars

# Install dependencies
npm install
cd backend && npm install && cd ..

# Set up environment
cp .env.example .env.local

# Start development servers
npm run dev              # Frontend (localhost:3000)
cd backend && npm run dev # Backend (localhost:3001)
```

### Environment Configuration
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Backend (.env)
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost/trenchwars_dev
TWITTER_BEARER_TOKEN=your_twitter_token
```

## 🏗️ **Production Architecture**

### **Frontend Stack**
- **Framework**: Next.js 15 with App Router & TypeScript
- **Styling**: Tailwind CSS with custom components
- **Blockchain**: Solana Web3.js + Wallet Adapter
- **State Management**: Custom React hooks + real-time updates
- **Deployment**: Vercel with custom domain
- **CDN**: Global edge network for optimal performance

### **Backend Stack** 
- **API**: Express.js with TypeScript + RESTful endpoints
- **Database**: PostgreSQL with optimized queries
- **External APIs**: DexScreener (prices) + Twitter API (social data)
- **Deployment**: Render with auto-scaling
- **Security**: Rate limiting, CORS, input validation

### **Blockchain Infrastructure**
- **Platform**: Solana (Devnet → Mainnet ready)
- **Framework**: Anchor for smart contract development
- **Contract Features**: 
  - Automated betting and payout logic
  - Escrow system for secure fund handling
  - 3% platform fee with buyback mechanism
  - Emergency pause functionality

### **Key Integrations**
- **Price Data**: DexScreener WebSocket for real-time prices
- **Social Metrics**: Twitter API v2 for sentiment analysis
- **Wallets**: Phantom, Solflare, Backpack, and more
- **Analytics**: Built-in user statistics and achievements