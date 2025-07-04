import { Connection, PublicKey, Transaction, sendAndConfirmTransaction, Keypair } from '@solana/web3.js';
import { pool } from '../config/database';

export interface RewardDistribution {
  warId: number;
  winningToken: string;
  totalFees: number;
  buybackAmount: number;
  participants: number;
}

export class WinnersRewardService {
  private connection: Connection;
  private treasuryWallet: Keypair;

  constructor() {
    this.connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
    );
    
    // Initialize treasury wallet (store private key securely)
    const privateKeyArray = JSON.parse(process.env.TREASURY_PRIVATE_KEY || '[]');
    this.treasuryWallet = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
  }

  /**
   * Execute Winner's Reward System - 50% fee buyback
   */
  async executeRewardDistribution(warId: number): Promise<RewardDistribution> {
    try {
      console.log(`Executing reward distribution for war ${warId}`);

      // 1. Get war results and total fees
      const warData = await this.getWarResults(warId);
      if (!warData) {
        throw new Error(`War ${warId} not found or not completed`);
      }

      // 2. Calculate 50% buyback amount
      const buybackAmount = warData.totalFees * 0.5;
      
      console.log(`War ${warId}: Total fees: ${warData.totalFees} SOL, Buyback: ${buybackAmount} SOL`);

      // 3. Execute token buyback using Jupiter/Orca
      const buybackTxId = await this.executeBuyback(warData.winningToken, buybackAmount);

      // 4. Update database with reward distribution
      await this.recordRewardDistribution({
        warId,
        winningToken: warData.winningToken,
        totalFees: warData.totalFees,
        buybackAmount,
        participants: warData.participants,
        transactionId: buybackTxId
      });

      console.log(`✅ Reward distribution completed for war ${warId}`);
      console.log(`🏆 Bought ${buybackAmount} SOL worth of ${warData.winningToken}`);

      return {
        warId,
        winningToken: warData.winningToken,
        totalFees: warData.totalFees,
        buybackAmount,
        participants: warData.participants
      };

    } catch (error) {
      console.error(`❌ Failed to execute reward distribution for war ${warId}:`, error);
      throw error;
    }
  }

  /**
   * Execute token buyback via Jupiter aggregator
   */
  private async executeBuyback(tokenMint: string, solAmount: number): Promise<string> {
    try {
      // 1. Get Jupiter quote for SOL -> Winning Token
      const quote = await this.getJupiterQuote('So11111111111111111111111111111111111111112', tokenMint, solAmount);
      
      // 2. Get swap transaction
      const swapTransaction = await this.getJupiterSwapTransaction(quote);
      
      // 3. Execute the swap
      const signature = await sendAndConfirmTransaction(
        this.connection,
        swapTransaction,
        [this.treasuryWallet]
      );

      console.log(`✅ Buyback executed: ${signature}`);
      return signature;

    } catch (error) {
      console.error('❌ Buyback execution failed:', error);
      throw error;
    }
  }

  /**
   * Get Jupiter quote for token swap
   */
  private async getJupiterQuote(inputMint: string, outputMint: string, amount: number) {
    const lamports = Math.floor(amount * 1e9); // Convert SOL to lamports
    
    const response = await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${lamports}&slippageBps=50`
    );
    
    if (!response.ok) {
      throw new Error(`Jupiter quote failed: ${response.statusText}`);
    }
    
    return await response.json();
  }

  /**
   * Get swap transaction from Jupiter
   */
  private async getJupiterSwapTransaction(quote: any): Promise<Transaction> {
    const response = await fetch('https://quote-api.jup.ag/v6/swap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey: this.treasuryWallet.publicKey.toString(),
        wrapAndUnwrapSol: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Jupiter swap transaction failed: ${response.statusText}`);
    }

    const { swapTransaction } = await response.json();
    const transactionBuf = Buffer.from(swapTransaction, 'base64');
    return Transaction.from(transactionBuf);
  }

  /**
   * Get war results from database
   */
  private async getWarResults(warId: number) {
    const query = `
      SELECT 
        w.*,
        COUNT(b.id) as participants,
        SUM(b.amount * 0.02) as total_fees,
        CASE 
          WHEN w.token_a_end_price > w.token_a_start_price 
          AND w.token_a_end_price / w.token_a_start_price > w.token_b_end_price / w.token_b_start_price
          THEN w.token_a_address
          ELSE w.token_b_address
        END as winning_token
      FROM wars w
      LEFT JOIN bets b ON w.id = b.war_id
      WHERE w.id = $1 AND w.status = 'completed'
      GROUP BY w.id
    `;

    const result = await pool.query(query, [warId]);
    return result.rows[0];
  }

  /**
   * Record reward distribution in database
   */
  private async recordRewardDistribution(data: any) {
    const query = `
      INSERT INTO reward_distributions 
      (war_id, winning_token, total_fees, buyback_amount, participants, transaction_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `;

    await pool.query(query, [
      data.warId,
      data.winningToken,
      data.totalFees,
      data.buybackAmount,
      data.participants,
      data.transactionId
    ]);
  }

  /**
   * Schedule automatic reward distributions
   */
  async scheduleRewardDistributions() {
    const cron = require('node-cron');
    
    // Run every hour to check for completed wars
    cron.schedule('0 * * * *', async () => {
      console.log('🔍 Checking for completed wars needing reward distribution...');
      
      const query = `
        SELECT id FROM wars 
        WHERE status = 'completed' 
        AND end_time < NOW() 
        AND id NOT IN (SELECT war_id FROM reward_distributions)
        ORDER BY end_time ASC
      `;
      
      const result = await pool.query(query);
      
      for (const war of result.rows) {
        try {
          await this.executeRewardDistribution(war.id);
          // Wait 30 seconds between distributions to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 30000));
        } catch (error) {
          console.error(`Failed to process rewards for war ${war.id}:`, error);
        }
      }
    });

    console.log('✅ Winner\'s Reward System scheduler started');
  }
}

export const rewardService = new WinnersRewardService();