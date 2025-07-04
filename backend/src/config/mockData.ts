// Mock data for demonstration purposes
export const mockTokens = [
  {
    id: 1,
    symbol: 'DOGE',
    name: 'Dogecoin',
    price: 0.08234,
    market_cap: 12000000000,
    price_change_24h: 5.23
  },
  {
    id: 2,
    symbol: 'SHIB',
    name: 'Shiba Inu',
    price: 0.000009876,
    market_cap: 5800000000,
    price_change_24h: -2.45
  },
  {
    id: 3,
    symbol: 'PEPE',
    name: 'Pepe',
    price: 0.00000123,
    market_cap: 520000000,
    price_change_24h: 12.67
  },
  {
    id: 4,
    symbol: 'WIF',
    name: 'dogwifhat',
    price: 2.34,
    market_cap: 2340000000,
    price_change_24h: 8.91
  },
  {
    id: 5,
    symbol: 'BONK',
    name: 'Bonk',
    price: 0.00001234,
    market_cap: 890000000,
    price_change_24h: -1.23
  },
  {
    id: 6,
    symbol: 'POPCAT',
    name: 'Popcat',
    price: 0.567,
    market_cap: 567000000,
    price_change_24h: 15.45
  }
];

export const mockWars = [
  {
    id: 1,
    token_a_id: 1,
    token_b_id: 2,
    start_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    end_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    total_bets_a: 15000000000, // 15 SOL in lamports
    total_bets_b: 8500000000,  // 8.5 SOL in lamports
    is_settled: false,
    winner: null,
    token_a_start_price: 0.07891,
    token_b_start_price: 0.000010234,
    token_a: mockTokens[0],
    token_b: mockTokens[1]
  },
  {
    id: 2,
    token_a_id: 3,
    token_b_id: 4,
    start_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    end_time: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days from now
    total_bets_a: 12000000000, // 12 SOL in lamports
    total_bets_b: 18000000000, // 18 SOL in lamports
    is_settled: false,
    winner: null,
    token_a_start_price: 0.00000098,
    token_b_start_price: 2.12,
    token_a: mockTokens[2],
    token_b: mockTokens[3]
  },
  {
    id: 3,
    token_a_id: 5,
    token_b_id: 6,
    start_time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    end_time: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days from now
    total_bets_a: 6000000000,  // 6 SOL in lamports
    total_bets_b: 9000000000,  // 9 SOL in lamports
    is_settled: false,
    winner: null,
    token_a_start_price: 0.00001456,
    token_b_start_price: 0.512,
    token_a: mockTokens[4],
    token_b: mockTokens[5]
  }
];

export const calculateWarStats = (war: any) => {
  const total_bets_a = war.total_bets_a || 0;
  const total_bets_b = war.total_bets_b || 0;
  const total_pool = total_bets_a + total_bets_b;
  const total_bets = Math.floor(total_pool / 100000000); // Approximate number of bets
  const unique_bettors = Math.floor(total_bets * 0.7); // Estimate unique bettors
  
  return {
    total_bets_a,
    total_bets_b,
    total_pool,
    total_bets,
    unique_bettors,
    odds_a: total_pool > 0 ? total_pool / total_bets_a : 1,
    odds_b: total_pool > 0 ? total_pool / total_bets_b : 1
  };
};