# ⚔️ TrenchWars - Token Battle Arena

A Polymarket-style prediction market on Solana where users bet on which crypto project will perform better over specified time periods. Built with Next.js, Express.js, and Solana smart contracts.

## ✨ Features

- **⚔️ Token Battles**: Community-created wars between competing cryptocurrencies
- **💰 SOL Betting**: Place bets using Solana (SOL) cryptocurrency  
- **📊 Real-time Data**: Live price feeds and market data from CoinGecko
- **🏆 Leaderboards**: Track top performers and betting statistics
- **🔗 Wallet Integration**: Connect with Phantom, Solflare, and other Solana wallets
- **📱 Responsive Design**: Works seamlessly on desktop and mobile

## 🎯 Current Status: MVP Complete ✅

The application is fully functional with all core features implemented. Ready for testing and deployment!

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+

### Local Development

1. **Install dependencies**
   ```bash
   # Frontend
   npm install
   
   # Backend  
   cd backend
   npm install
   cd ..
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start development servers**
   ```bash
   # Frontend (Terminal 1)
   npm run dev
   
   # Backend (Terminal 2)
   cd backend
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 🏗️ Architecture

### Frontend (Next.js 15)
- Next.js with App Router and TypeScript
- Tailwind CSS for styling
- Solana Web3.js and Wallet Adapter
- Real-time data with custom React hooks

### Backend (Express.js)
- RESTful API with Express.js
- PostgreSQL database
- CoinGecko API integration
- Automated price tracking

### Blockchain (Solana)
- Anchor framework smart contracts
- Automated betting and payout logic
- 3% platform fee structure