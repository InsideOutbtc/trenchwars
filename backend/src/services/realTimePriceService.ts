import WebSocket from 'ws';
import { pool } from '../config/database';

export interface TokenPrice {
  address: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  timestamp: Date;
}

export class RealTimePriceService {
  private dexScreenerWs: WebSocket | null = null;
  private clients: Set<WebSocket> = new Set();
  private priceCache: Map<string, TokenPrice> = new Map();

  constructor() {
    this.initializeDexScreenerConnection();
    this.startWebSocketServer();
    this.schedulePriceUpdates();
  }

  /**
   * Initialize DexScreener WebSocket connection
   */
  private initializeDexScreenerConnection() {
    try {
      this.dexScreenerWs = new WebSocket('wss://io.dexscreener.com/dex/screener/latest/v2');
      
      this.dexScreenerWs.on('open', () => {
        console.log('✅ Connected to DexScreener WebSocket');
        this.subscribeToTrendingTokens();
      });

      this.dexScreenerWs.on('message', (data) => {
        this.handlePriceUpdate(data);
      });

      this.dexScreenerWs.on('close', () => {
        console.log('❌ DexScreener WebSocket closed. Reconnecting in 5s...');
        setTimeout(() => this.initializeDexScreenerConnection(), 5000);
      });

      this.dexScreenerWs.on('error', (error) => {
        console.error('DexScreener WebSocket error:', error);
      });

    } catch (error) {
      console.error('Failed to connect to DexScreener:', error);
      setTimeout(() => this.initializeDexScreenerConnection(), 10000);
    }
  }

  /**
   * Subscribe to trending tokens and active war tokens
   */
  private async subscribeToTrendingTokens() {
    // Get tokens from active wars
    const activeWarsQuery = `
      SELECT DISTINCT token_a_address, token_b_address 
      FROM wars 
      WHERE status = 'active'
    `;
    
    const result = await pool.query(activeWarsQuery);
    const tokenAddresses: string[] = [];
    
    result.rows.forEach(war => {
      tokenAddresses.push(war.token_a_address, war.token_b_address);
    });

    // Subscribe to specific tokens
    if (this.dexScreenerWs && tokenAddresses.length > 0) {
      const subscribeMessage = {
        type: 'subscribe',
        tokens: tokenAddresses
      };
      
      this.dexScreenerWs.send(JSON.stringify(subscribeMessage));
      console.log(`📡 Subscribed to ${tokenAddresses.length} war tokens`);
    }
  }

  /**
   * Handle incoming price updates
   */
  private handlePriceUpdate(data: Buffer) {
    try {
      const update = JSON.parse(data.toString());
      
      if (update.type === 'price_update' && update.data) {
        const tokenPrice: TokenPrice = {
          address: update.data.baseToken.address,
          price: parseFloat(update.data.priceUsd),
          priceChange24h: parseFloat(update.data.priceChange?.h24 || '0'),
          volume24h: parseFloat(update.data.volume?.h24 || '0'),
          marketCap: parseFloat(update.data.marketCap || '0'),
          timestamp: new Date()
        };

        // Update cache
        this.priceCache.set(tokenPrice.address, tokenPrice);

        // Store in database
        this.storePriceHistory(tokenPrice);

        // Broadcast to connected clients
        this.broadcastPriceUpdate(tokenPrice);

        // Check for significant price movements
        this.checkPriceAlerts(tokenPrice);
      }

    } catch (error) {
      console.error('Error handling price update:', error);
    }
  }

  /**
   * Store price history in database
   */
  private async storePriceHistory(tokenPrice: TokenPrice) {
    try {
      const query = `
        INSERT INTO token_price_history 
        (token_address, price_usd, market_cap, volume_24h, price_change_24h, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;

      await pool.query(query, [
        tokenPrice.address,
        tokenPrice.price,
        tokenPrice.marketCap,
        tokenPrice.volume24h,
        tokenPrice.priceChange24h,
        tokenPrice.timestamp
      ]);

    } catch (error) {
      console.error('Error storing price history:', error);
    }
  }

  /**
   * Broadcast price update to connected WebSocket clients
   */
  private broadcastPriceUpdate(tokenPrice: TokenPrice) {
    const message = JSON.stringify({
      type: 'price_update',
      data: tokenPrice
    });

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  /**
   * Check for significant price movements and create alerts
   */
  private checkPriceAlerts(tokenPrice: TokenPrice) {
    const priceChange = Math.abs(tokenPrice.priceChange24h);
    
    // Alert for 20%+ price movements
    if (priceChange >= 20) {
      console.log(`🚨 PRICE ALERT: ${tokenPrice.address} ${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}%`);
      
      // Broadcast price alert
      const alertMessage = JSON.stringify({
        type: 'price_alert',
        data: {
          token: tokenPrice.address,
          priceChange: tokenPrice.priceChange24h,
          currentPrice: tokenPrice.price,
          severity: priceChange >= 50 ? 'high' : 'medium'
        }
      });

      this.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(alertMessage);
        }
      });
    }
  }

  /**
   * Start WebSocket server for frontend connections
   */
  private startWebSocketServer() {
    const port = process.env.WS_PORT || 3002;
    const wss = new WebSocket.Server({ port: Number(port) });

    wss.on('connection', (ws) => {
      console.log('📱 New frontend client connected');
      this.clients.add(ws);

      // Send current price cache to new client
      this.priceCache.forEach(price => {
        ws.send(JSON.stringify({
          type: 'price_update',
          data: price
        }));
      });

      ws.on('close', () => {
        console.log('📱 Frontend client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket client error:', error);
        this.clients.delete(ws);
      });
    });

    console.log(`🌐 Price WebSocket server running on port ${port}`);
  }

  /**
   * Schedule periodic price updates via REST API
   */
  private schedulePriceUpdates() {
    const cron = require('node-cron');
    
    // Update prices every 5 minutes for tokens not in WebSocket feed
    cron.schedule('*/5 * * * *', async () => {
      await this.updateTokenPricesFromAPI();
    });

    // Clean old price history (keep 30 days)
    cron.schedule('0 2 * * *', async () => {
      await this.cleanOldPriceHistory();
    });
  }

  /**
   * Fallback price updates via REST API
   */
  private async updateTokenPricesFromAPI() {
    try {
      const activeTokensQuery = `
        SELECT DISTINCT token_a_address, token_b_address 
        FROM wars 
        WHERE status = 'active'
      `;
      
      const result = await pool.query(activeTokensQuery);
      const tokens: string[] = [];
      
      result.rows.forEach(war => {
        tokens.push(war.token_a_address, war.token_b_address);
      });

      // Batch fetch from DexScreener
      const tokensString = tokens.join(',');
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokensString}`);
      
      if (response.ok) {
        const data = await response.json();
        
        data.pairs?.forEach((pair: any) => {
          if (pair.baseToken && pair.priceUsd) {
            const tokenPrice: TokenPrice = {
              address: pair.baseToken.address,
              price: parseFloat(pair.priceUsd),
              priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
              volume24h: parseFloat(pair.volume?.h24 || '0'),
              marketCap: parseFloat(pair.marketCap || '0'),
              timestamp: new Date()
            };

            this.priceCache.set(tokenPrice.address, tokenPrice);
            this.storePriceHistory(tokenPrice);
            this.broadcastPriceUpdate(tokenPrice);
          }
        });
      }

    } catch (error) {
      console.error('Error updating token prices from API:', error);
    }
  }

  /**
   * Clean old price history to manage database size
   */
  private async cleanOldPriceHistory() {
    try {
      const query = `
        DELETE FROM token_price_history 
        WHERE timestamp < NOW() - INTERVAL '30 days'
      `;
      
      const result = await pool.query(query);
      console.log(`🧹 Cleaned ${result.rowCount} old price records`);

    } catch (error) {
      console.error('Error cleaning old price history:', error);
    }
  }

  /**
   * Get current price for a token
   */
  public getCurrentPrice(tokenAddress: string): TokenPrice | null {
    return this.priceCache.get(tokenAddress) || null;
  }

  /**
   * Get price history for a token
   */
  public async getPriceHistory(tokenAddress: string, hours: number = 24): Promise<TokenPrice[]> {
    const query = `
      SELECT * FROM token_price_history 
      WHERE token_address = $1 
      AND timestamp > NOW() - INTERVAL '${hours} hours'
      ORDER BY timestamp ASC
    `;

    const result = await pool.query(query, [tokenAddress]);
    return result.rows.map(row => ({
      address: row.token_address,
      price: parseFloat(row.price_usd),
      priceChange24h: parseFloat(row.price_change_24h),
      volume24h: parseFloat(row.volume_24h),
      marketCap: parseFloat(row.market_cap),
      timestamp: row.timestamp
    }));
  }
}

export const realTimePriceService = new RealTimePriceService();