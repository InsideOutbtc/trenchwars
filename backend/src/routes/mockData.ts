// Mock data for initial launch
export const mockWars = [
  {
    id: 1,
    title: "PEPE vs SHIB - The Ultimate Meme Battle",
    token_a_symbol: "PEPE",
    token_a_address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    token_a_start_price: 0.000001,
    token_a_end_price: 0.000001,
    token_b_symbol: "SHIB", 
    token_b_address: "So11111111111111111111111111111111111111112",
    token_b_start_price: 0.000008,
    token_b_end_price: 0.000008,
    start_time: new Date(),
    end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    status: "active",
    total_pot: 1000,
    participants: 156,
    description: "🐸 PEPE the Frog takes on 🐕 Shiba Inu in the ultimate meme coin showdown! Winner's Reward System will automatically buy back the champion token. Who will reign supreme?"
  },
  {
    id: 2,
    title: "DOGE vs WIF - OG vs New Gen",
    token_a_symbol: "DOGE",
    token_a_address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    token_a_start_price: 0.08,
    token_a_end_price: 0.08,
    token_b_symbol: "WIF",
    token_b_address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    token_b_start_price: 2.50,
    token_b_end_price: 2.50,
    start_time: new Date(),
    end_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
    status: "active", 
    total_pot: 750,
    participants: 89,
    description: "🐕 The original meme king DOGE faces off against 🧢 the viral dogwifhat! Experience the Winner's Reward System in action with automatic $10K+ buybacks!"
  }
];