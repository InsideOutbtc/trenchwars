#!/bin/bash

echo "⚔️ Setting up TrenchWars Demo"
echo "=============================="

# Create demo environment file (for local development)
cat > .env.local << EOL
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# For production, use:
# NEXT_PUBLIC_API_URL=https://api.trenchwars.wtf/api
EOL

# Create backend environment file (for local development)
cat > backend/.env << EOL
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Demo Database (use SQLite for simplicity)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=trenchwars_demo
DB_USER=demo
DB_PASSWORD=demo123

# API Keys (optional for demo)
COINGECKO_API_KEY=
TWITTER_BEARER_TOKEN=

# Production backend is live at: https://api.trenchwars.wtf
EOL

echo "✅ Environment files created"
echo ""
echo "📋 Next Steps:"
echo "1. Install dependencies: npm install && cd backend && npm install"
echo "2. Start backend: cd backend && npm run dev"
echo "3. Start frontend: npm run dev"
echo "4. Open http://localhost:3000"
echo ""
echo "⚔️ Ready to test the TrenchWars platform!"