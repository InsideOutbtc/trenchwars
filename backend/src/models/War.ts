import { pool } from '../config/database';

export interface War {
  id: number;
  token_a_id: number;
  token_b_id: number;
  start_time: Date;
  end_time: Date;
  total_bets_a: number;
  total_bets_b: number;
  is_settled: boolean;
  winner?: number;
  token_a_start_price?: number;
  token_b_start_price?: number;
  token_a_end_price?: number;
  token_b_end_price?: number;
  solana_program_id?: string;
  created_at: Date;
}

export interface WarWithTokens extends War {
  token_a: {
    symbol: string;
    name: string;
    price: number;
    market_cap: number;
  };
  token_b: {
    symbol: string;
    name: string;
    price: number;
    market_cap: number;
  };
}

export class WarModel {
  static async create(warData: Omit<War, 'id' | 'created_at' | 'total_bets_a' | 'total_bets_b' | 'is_settled'>): Promise<War> {
    const query = `
      INSERT INTO wars (token_a_id, token_b_id, start_time, end_time, token_a_start_price, token_b_start_price, solana_program_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      warData.token_a_id,
      warData.token_b_id,
      warData.start_time,
      warData.end_time,
      warData.token_a_start_price,
      warData.token_b_start_price,
      warData.solana_program_id
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getAll(): Promise<WarWithTokens[]> {
    const query = `
      SELECT 
        w.*,
        ta.symbol as token_a_symbol,
        ta.name as token_a_name,
        ta.price as token_a_price,
        ta.market_cap as token_a_market_cap,
        tb.symbol as token_b_symbol,
        tb.name as token_b_name,
        tb.price as token_b_price,
        tb.market_cap as token_b_market_cap
      FROM wars w
      JOIN tokens ta ON w.token_a_id = ta.id
      JOIN tokens tb ON w.token_b_id = tb.id
      ORDER BY w.created_at DESC
    `;
    
    const result = await pool.query(query);
    return result.rows.map(this.mapRowToWarWithTokens);
  }

  static async getActive(): Promise<WarWithTokens[]> {
    const query = `
      SELECT 
        w.*,
        ta.symbol as token_a_symbol,
        ta.name as token_a_name,
        ta.price as token_a_price,
        ta.market_cap as token_a_market_cap,
        tb.symbol as token_b_symbol,
        tb.name as token_b_name,
        tb.price as token_b_price,
        tb.market_cap as token_b_market_cap
      FROM wars w
      JOIN tokens ta ON w.token_a_id = ta.id
      JOIN tokens tb ON w.token_b_id = tb.id
      WHERE w.start_time <= NOW() AND w.end_time > NOW() AND w.is_settled = FALSE
      ORDER BY w.end_time ASC
    `;
    
    const result = await pool.query(query);
    return result.rows.map(this.mapRowToWarWithTokens);
  }

  static async getById(id: number): Promise<WarWithTokens | null> {
    const query = `
      SELECT 
        w.*,
        ta.symbol as token_a_symbol,
        ta.name as token_a_name,
        ta.price as token_a_price,
        ta.market_cap as token_a_market_cap,
        tb.symbol as token_b_symbol,
        tb.name as token_b_name,
        tb.price as token_b_price,
        tb.market_cap as token_b_market_cap
      FROM wars w
      JOIN tokens ta ON w.token_a_id = ta.id
      JOIN tokens tb ON w.token_b_id = tb.id
      WHERE w.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? this.mapRowToWarWithTokens(result.rows[0]) : null;
  }

  static async settle(id: number, winner: number | null, token_a_end_price: number, token_b_end_price: number): Promise<War> {
    const query = `
      UPDATE wars 
      SET is_settled = TRUE, winner = $2, token_a_end_price = $3, token_b_end_price = $4
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, winner, token_a_end_price, token_b_end_price]);
    return result.rows[0];
  }

  static async updateBetTotals(id: number, token_choice: number, amount: number): Promise<void> {
    const column = token_choice === 0 ? 'total_bets_a' : 'total_bets_b';
    const query = `UPDATE wars SET ${column} = ${column} + $1 WHERE id = $2`;
    await pool.query(query, [amount, id]);
  }

  private static mapRowToWarWithTokens(row: any): WarWithTokens {
    return {
      id: row.id,
      token_a_id: row.token_a_id,
      token_b_id: row.token_b_id,
      start_time: row.start_time,
      end_time: row.end_time,
      total_bets_a: parseInt(row.total_bets_a),
      total_bets_b: parseInt(row.total_bets_b),
      is_settled: row.is_settled,
      winner: row.winner,
      token_a_start_price: parseFloat(row.token_a_start_price),
      token_b_start_price: parseFloat(row.token_b_start_price),
      token_a_end_price: parseFloat(row.token_a_end_price),
      token_b_end_price: parseFloat(row.token_b_end_price),
      solana_program_id: row.solana_program_id,
      created_at: row.created_at,
      token_a: {
        symbol: row.token_a_symbol,
        name: row.token_a_name,
        price: parseFloat(row.token_a_price),
        market_cap: parseInt(row.token_a_market_cap)
      },
      token_b: {
        symbol: row.token_b_symbol,
        name: row.token_b_name,
        price: parseFloat(row.token_b_price),
        market_cap: parseInt(row.token_b_market_cap)
      }
    };
  }
}