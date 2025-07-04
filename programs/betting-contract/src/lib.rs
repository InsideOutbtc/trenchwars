use anchor_lang::prelude::*;

declare_id!("7KK67M12SbodyTKSetMjMeCWBiDNvB817dkWWvueRbYG");

#[program]
pub mod betting_contract {
    use super::*;

    pub fn initialize_war(
        ctx: Context<InitializeWar>,
        token_a: Pubkey,
        token_b: Pubkey,
        start_time: i64,
        end_time: i64,
    ) -> Result<()> {
        let war = &mut ctx.accounts.war;
        war.authority = ctx.accounts.authority.key();
        war.token_a = token_a;
        war.token_b = token_b;
        war.start_time = start_time;
        war.end_time = end_time;
        war.total_bets_a = 0;
        war.total_bets_b = 0;
        war.is_settled = false;
        war.winner = None;
        Ok(())
    }

    pub fn place_bet(
        ctx: Context<PlaceBet>,
        amount: u64,
        token_choice: u8, // 0 for token_a, 1 for token_b
    ) -> Result<()> {
        let war = &mut ctx.accounts.war;
        let bet = &mut ctx.accounts.bet;
        
        require!(!war.is_settled, BettingError::WarAlreadySettled);
        require!(token_choice <= 1, BettingError::InvalidTokenChoice);
        
        let clock = Clock::get()?;
        require!(clock.unix_timestamp >= war.start_time, BettingError::WarNotStarted);
        require!(clock.unix_timestamp < war.end_time, BettingError::WarEnded);

        // Transfer SOL from user to program
        let transfer_instruction = anchor_lang::system_program::Transfer {
            from: ctx.accounts.user.to_account_info(),
            to: ctx.accounts.program_account.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            transfer_instruction,
        );
        anchor_lang::system_program::transfer(cpi_ctx, amount)?;

        // Record bet details
        bet.user = ctx.accounts.user.key();
        bet.war = war.key();
        bet.amount = amount;
        bet.token_choice = token_choice;
        bet.timestamp = clock.unix_timestamp;

        // Update war totals
        if token_choice == 0 {
            war.total_bets_a = war.total_bets_a.checked_add(amount).unwrap();
        } else {
            war.total_bets_b = war.total_bets_b.checked_add(amount).unwrap();
        }

        Ok(())
    }

    pub fn settle_war(
        ctx: Context<SettleWar>,
        token_a_price_change: i64,
        token_b_price_change: i64,
    ) -> Result<()> {
        let war = &mut ctx.accounts.war;
        
        require!(!war.is_settled, BettingError::WarAlreadySettled);
        require!(ctx.accounts.authority.key() == war.authority, BettingError::Unauthorized);
        
        let clock = Clock::get()?;
        require!(clock.unix_timestamp >= war.end_time, BettingError::WarNotEnded);

        // Determine winner based on price changes
        war.winner = if token_a_price_change > token_b_price_change {
            Some(0) // Token A wins
        } else if token_b_price_change > token_a_price_change {
            Some(1) // Token B wins
        } else {
            None // Tie - refund all bets
        };

        war.is_settled = true;
        Ok(())
    }

    pub fn claim_winnings(ctx: Context<ClaimWinnings>) -> Result<()> {
        let war = &ctx.accounts.war;
        let bet = &ctx.accounts.bet;
        
        require!(war.is_settled, BettingError::WarNotSettled);
        require!(bet.user == ctx.accounts.user.key(), BettingError::Unauthorized);

        let payout = match war.winner {
            Some(winning_token) if winning_token == bet.token_choice => {
                // Calculate proportional payout
                let total_winning_bets = if winning_token == 0 {
                    war.total_bets_a
                } else {
                    war.total_bets_b
                };
                let total_pool = war.total_bets_a + war.total_bets_b;
                let platform_fee = total_pool * 3 / 100; // 3% fee
                let prize_pool = total_pool - platform_fee;
                
                (bet.amount * prize_pool) / total_winning_bets
            }
            None => bet.amount, // Tie - refund original bet
            _ => 0, // Lost bet
        };

        if payout > 0 {
            // Transfer payout from program to user
            **ctx.accounts.program_account.to_account_info().try_borrow_mut_lamports()? -= payout;
            **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += payout;
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeWar<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 8 + 8 + 8 + 8 + 1 + 1 + 1
    )]
    pub war: Account<'info, War>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub war: Account<'info, War>,
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 32 + 8 + 1 + 8
    )]
    pub bet: Account<'info, Bet>,
    #[account(mut)]
    pub user: Signer<'info>,
    /// CHECK: Program account to receive SOL
    #[account(mut)]
    pub program_account: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SettleWar<'info> {
    #[account(mut)]
    pub war: Account<'info, War>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
    pub war: Account<'info, War>,
    pub bet: Account<'info, Bet>,
    #[account(mut)]
    pub user: Signer<'info>,
    /// CHECK: Program account to send SOL from
    #[account(mut)]
    pub program_account: AccountInfo<'info>,
}

#[account]
pub struct War {
    pub authority: Pubkey,
    pub token_a: Pubkey,
    pub token_b: Pubkey,
    pub start_time: i64,
    pub end_time: i64,
    pub total_bets_a: u64,
    pub total_bets_b: u64,
    pub is_settled: bool,
    pub winner: Option<u8>, // 0 = token_a, 1 = token_b, None = tie
}

#[account]
pub struct Bet {
    pub user: Pubkey,
    pub war: Pubkey,
    pub amount: u64,
    pub token_choice: u8,
    pub timestamp: i64,
}

#[error_code]
pub enum BettingError {
    #[msg("War has already been settled")]
    WarAlreadySettled,
    #[msg("Invalid token choice")]
    InvalidTokenChoice,
    #[msg("War has not started yet")]
    WarNotStarted,
    #[msg("War has ended")]
    WarEnded,
    #[msg("War has not ended yet")]
    WarNotEnded,
    #[msg("War has not been settled yet")]
    WarNotSettled,
    #[msg("Unauthorized")]
    Unauthorized,
}