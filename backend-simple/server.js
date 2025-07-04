const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

const wars = [
  {
    id: 1,
    token_a_id: 1,
    token_b_id: 2,
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    total_bets_a: 500,
    total_bets_b: 500,
    is_settled: false,
    token_a: {
      id: 1,
      symbol: "PEPE",
      name: "Pepe the Frog",
      price: 0.000001,
      market_cap: 420000000,
      price_change_24h: 15.2
    },
    token_b: {
      id: 2,
      symbol: "SHIB", 
      name: "Shiba Inu",
      price: 0.000008,
      market_cap: 4600000000,
      price_change_24h: -3.7
    }
  },
  {
    id: 2,
    token_a_id: 3,
    token_b_id: 4,
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    total_bets_a: 300,
    total_bets_b: 450,
    is_settled: false,
    token_a: {
      id: 3,
      symbol: "DOGE",
      name: "Dogecoin", 
      price: 0.08,
      market_cap: 11500000000,
      price_change_24h: 8.9
    },
    token_b: {
      id: 4,
      symbol: "WIF",
      name: "dogwifhat",
      price: 2.50,
      market_cap: 2500000000,
      price_change_24h: 22.1
    }
  }
];

app.get('/', (req, res) => {
  res.json({ message: 'CryptoColosseum API is running! 🏆', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/wars', (req, res) => {
  res.json(wars);
});

app.get('/api/wars/active', (req, res) => {
  res.json(wars);
});

app.get('/api/wars/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const war = wars.find(w => w.id === id);
  if (!war) return res.status(404).json({ error: 'War not found' });
  res.json(war);
});

app.get('/api/wars/:id/stats', (req, res) => {
  const id = parseInt(req.params.id);
  const war = wars.find(w => w.id === id);
  if (!war) return res.status(404).json({ error: 'War not found' });
  
  res.json({
    total_bets_a: war.total_bets_a,
    total_bets_b: war.total_bets_b,
    total_pool: war.total_bets_a + war.total_bets_b,
    total_bets: 45,
    unique_bettors: 23,
    odds_a: 2.0,
    odds_b: 2.0
  });
});

app.listen(PORT, () => {
  console.log(`🚀 CryptoColosseum Backend running on port ${PORT}`);
  console.log(`🏆 PEPE vs SHIB and DOGE vs WIF battles are LIVE!`);
});

module.exports = app;