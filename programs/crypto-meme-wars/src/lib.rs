use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

// Re-export modules
pub mod war_token;
pub use war_token::*;

declare_id!("CryptoMemeWars11111111111111111111111111111111");

#[program]
pub mod crypto_meme_wars {
    use super::*;

    // Initialize the betting platform
    pub fn initialize_platform(ctx: Context<InitializePlatform>) -> Result<()> {
        let platform_state = &mut ctx.accounts.platform_state;
        platform_state.authority = ctx.accounts.authority.key();
        platform_state.total_bets = 0;
        platform_state.total_volume = 0;
        platform_state.platform_fee_bps = 300; // 3%
        platform_state.is_paused = false;
        platform_state.bump = ctx.bumps.platform_state;

        emit!(PlatformInitialized {
            authority: ctx.accounts.authority.key(),
            fee_bps: 300,
        });

        Ok(())
    }

    // Create a new betting war between two tokens
    pub fn create_war(
        ctx: Context<CreateWar>,
        token_a_symbol: String,
        token_b_symbol: String,
        duration_hours: u32,
    ) -> Result<()> {
        require!(!ctx.accounts.platform_state.is_paused, ErrorCode::PlatformPaused);
        require!(duration_hours >= 1 && duration_hours <= 168, ErrorCode::InvalidDuration); // 1 hour to 1 week

        let war = &mut ctx.accounts.war;
        let clock = Clock::get()?;

        war.creator = ctx.accounts.creator.key();
        war.token_a_symbol = token_a_symbol.clone();
        war.token_b_symbol = token_b_symbol.clone();
        war.start_time = clock.unix_timestamp;
        war.end_time = clock.unix_timestamp + (duration_hours as i64 * 3600);
        war.total_bets_a = 0;
        war.total_bets_b = 0;
        war.num_bets = 0;
        war.is_settled = false;
        war.winner = None;
        war.bump = ctx.bumps.war;

        emit!(WarCreated {
            war_id: war.key(),
            token_a: token_a_symbol,
            token_b: token_b_symbol,
            end_time: war.end_time,
        });

        Ok(())
    }

    // Place a bet on a war
    pub fn place_bet(
        ctx: Context<PlaceBet>,
        amount: u64,
        token_choice: u8, // 0 for token A, 1 for token B
    ) -> Result<()> {
        require!(!ctx.accounts.platform_state.is_paused, ErrorCode::PlatformPaused);
        require!(amount > 0, ErrorCode::InvalidAmount);
        require!(token_choice <= 1, ErrorCode::InvalidTokenChoice);

        let war = &mut ctx.accounts.war;
        let bet = &mut ctx.accounts.bet;
        let clock = Clock::get()?;

        require!(!war.is_settled, ErrorCode::WarAlreadySettled);
        require!(clock.unix_timestamp < war.end_time, ErrorCode::WarEnded);

        // Calculate platform fee
        let platform_fee = amount * ctx.accounts.platform_state.platform_fee_bps as u64 / 10000;
        let bet_amount = amount - platform_fee;

        // Transfer SOL from user to war escrow
        let transfer_instruction = anchor_lang::system_program::Transfer {
            from: ctx.accounts.user.to_account_info(),
            to: ctx.accounts.war_escrow.to_account_info(),
        };
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                transfer_instruction,
            ),
            bet_amount,
        )?;

        // Transfer platform fee
        if platform_fee > 0 {
            let fee_transfer = anchor_lang::system_program::Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: ctx.accounts.fee_collector.to_account_info(),
            };
            anchor_lang::system_program::transfer(
                CpiContext::new(
                    ctx.accounts.system_program.to_account_info(),
                    fee_transfer,
                ),
                platform_fee,
            )?;
        }

        // Initialize bet account
        bet.user = ctx.accounts.user.key();
        bet.war = war.key();
        bet.amount = bet_amount;
        bet.token_choice = token_choice;
        bet.timestamp = clock.unix_timestamp;
        bet.is_claimed = false;
        bet.bump = ctx.bumps.bet;

        // Update war totals
        if token_choice == 0 {
            war.total_bets_a += bet_amount;
        } else {
            war.total_bets_b += bet_amount;
        }
        war.num_bets += 1;

        // Update platform stats
        let platform_state = &mut ctx.accounts.platform_state;
        platform_state.total_bets += 1;
        platform_state.total_volume += amount;

        emit!(BetPlaced {
            bet_id: bet.key(),
            war_id: war.key(),
            user: ctx.accounts.user.key(),
            amount: bet_amount,
            token_choice,
        });

        Ok(())
    }

    // Settle a war with price data
    pub fn settle_war(
        ctx: Context<SettleWar>,
        token_a_start_price: u64,
        token_a_end_price: u64,
        token_b_start_price: u64,
        token_b_end_price: u64,
    ) -> Result<()> {
        let war = &mut ctx.accounts.war;
        let clock = Clock::get()?;

        require!(!war.is_settled, ErrorCode::WarAlreadySettled);
        require!(clock.unix_timestamp >= war.end_time, ErrorCode::WarNotEnded);

        // Calculate percentage gains
        let token_a_gain = if token_a_start_price > 0 {
            ((token_a_end_price as u128 * 10000) / token_a_start_price as u128) - 10000
        } else {
            0
        };

        let token_b_gain = if token_b_start_price > 0 {
            ((token_b_end_price as u128 * 10000) / token_b_start_price as u128) - 10000
        } else {
            0
        };

        // Determine winner
        war.winner = if token_a_gain > token_b_gain {
            Some(0) // Token A wins
        } else if token_b_gain > token_a_gain {
            Some(1) // Token B wins
        } else {
            None // Tie
        };

        war.is_settled = true;

        emit!(WarSettled {
            war_id: war.key(),
            winner: war.winner,
            token_a_gain: token_a_gain as u64,
            token_b_gain: token_b_gain as u64,
        });

        Ok(())
    }

    // Claim winnings from a settled war
    pub fn claim_winnings(ctx: Context<ClaimWinnings>) -> Result<()> {
        let war = &ctx.accounts.war;
        let bet = &mut ctx.accounts.bet;

        require!(war.is_settled, ErrorCode::WarNotSettled);
        require!(!bet.is_claimed, ErrorCode::AlreadyClaimed);
        require!(bet.user == ctx.accounts.user.key(), ErrorCode::UnauthorizedClaim);

        let payout = if let Some(winner) = war.winner {
            if bet.token_choice == winner {
                // Calculate payout based on pool ratio
                let winning_pool = if winner == 0 { war.total_bets_a } else { war.total_bets_b };
                let total_pool = war.total_bets_a + war.total_bets_b;
                
                if winning_pool > 0 {
                    (bet.amount as u128 * total_pool as u128 / winning_pool as u128) as u64
                } else {
                    bet.amount // Return original bet if no winning pool
                }
            } else {
                0 // Lost bet
            }
        } else {
            bet.amount // Tie - return original bet
        };

        if payout > 0 {
            // Transfer winnings from escrow to user
            let seeds = &[
                b"war_escrow",
                war.key().as_ref(),
                &[ctx.bumps.war_escrow],
            ];
            let signer = &[&seeds[..]];

            **ctx.accounts.war_escrow.to_account_info().try_borrow_mut_lamports()? -= payout;
            **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += payout;
        }

        bet.is_claimed = true;

        emit!(WinningsClaimed {
            bet_id: bet.key(),
            user: ctx.accounts.user.key(),
            payout,
        });

        Ok(())
    }

    // Emergency pause function
    pub fn set_pause_state(ctx: Context<SetPauseState>, paused: bool) -> Result<()> {
        let platform_state = &mut ctx.accounts.platform_state;
        platform_state.is_paused = paused;

        emit!(PauseStateChanged { paused });

        Ok(())
    }
}

// Account structures
#[account]
pub struct PlatformState {
    pub authority: Pubkey,
    pub total_bets: u64,
    pub total_volume: u64,
    pub platform_fee_bps: u16,
    pub is_paused: bool,
    pub bump: u8,
}

#[account]
pub struct War {
    pub creator: Pubkey,
    pub token_a_symbol: String,
    pub token_b_symbol: String,
    pub start_time: i64,
    pub end_time: i64,
    pub total_bets_a: u64,
    pub total_bets_b: u64,
    pub num_bets: u32,
    pub is_settled: bool,
    pub winner: Option<u8>, // None for tie, Some(0) for token A, Some(1) for token B
    pub bump: u8,
}

#[account]
pub struct Bet {
    pub user: Pubkey,
    pub war: Pubkey,
    pub amount: u64,
    pub token_choice: u8,
    pub timestamp: i64,
    pub is_claimed: bool,
    pub bump: u8,
}

// Context structures
#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(
        init,
        payer = authority,
        seeds = [b"platform_state"],
        bump,
        space = 8 + 32 + 8 + 8 + 2 + 1 + 1
    )]
    pub platform_state: Account<'info, PlatformState>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateWar<'info> {
    #[account(
        init,
        payer = creator,
        seeds = [b"war", creator.key().as_ref(), &Clock::get().unwrap().unix_timestamp.to_le_bytes()],
        bump,
        space = 8 + 32 + 4 + 32 + 4 + 32 + 8 + 8 + 8 + 8 + 4 + 1 + 1 + 1
    )]
    pub war: Account<'info, War>,

    #[account(
        mut,
        seeds = [b"platform_state"],
        bump = platform_state.bump
    )]
    pub platform_state: Account<'info, PlatformState>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(
        init,
        payer = user,
        seeds = [b"bet", war.key().as_ref(), user.key().as_ref()],
        bump,
        space = 8 + 32 + 32 + 8 + 1 + 8 + 1 + 1
    )]
    pub bet: Account<'info, Bet>,

    #[account(mut)]
    pub war: Account<'info, War>,

    #[account(
        mut,
        seeds = [b"platform_state"],
        bump = platform_state.bump
    )]
    pub platform_state: Account<'info, PlatformState>,

    #[account(
        mut,
        seeds = [b"war_escrow", war.key().as_ref()],
        bump
    )]
    /// CHECK: This is a PDA that holds escrowed SOL
    pub war_escrow: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: This account collects platform fees
    pub fee_collector: AccountInfo<'info>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SettleWar<'info> {
    #[account(
        mut,
        constraint = war.creator == authority.key() @ ErrorCode::UnauthorizedSettlement
    )]
    pub war: Account<'info, War>,

    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
    #[account(mut)]
    pub bet: Account<'info, Bet>,

    pub war: Account<'info, War>,

    #[account(
        mut,
        seeds = [b"war_escrow", war.key().as_ref()],
        bump
    )]
    /// CHECK: This is a PDA that holds escrowed SOL
    pub war_escrow: AccountInfo<'info>,

    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetPauseState<'info> {
    #[account(
        mut,
        seeds = [b"platform_state"],
        bump = platform_state.bump,
        constraint = platform_state.authority == authority.key() @ ErrorCode::UnauthorizedAction
    )]
    pub platform_state: Account<'info, PlatformState>,

    pub authority: Signer<'info>,
}

// Events
#[event]
pub struct PlatformInitialized {
    pub authority: Pubkey,
    pub fee_bps: u16,
}

#[event]
pub struct WarCreated {
    pub war_id: Pubkey,
    pub token_a: String,
    pub token_b: String,
    pub end_time: i64,
}

#[event]
pub struct BetPlaced {
    pub bet_id: Pubkey,
    pub war_id: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
    pub token_choice: u8,
}

#[event]
pub struct WarSettled {
    pub war_id: Pubkey,
    pub winner: Option<u8>,
    pub token_a_gain: u64,
    pub token_b_gain: u64,
}

#[event]
pub struct WinningsClaimed {
    pub bet_id: Pubkey,
    pub user: Pubkey,
    pub payout: u64,
}

#[event]
pub struct PauseStateChanged {
    pub paused: bool,
}

// Error codes
#[error_code]
pub enum ErrorCode {
    #[msg("Platform is currently paused")]
    PlatformPaused,
    #[msg("Invalid duration provided")]
    InvalidDuration,
    #[msg("Invalid amount provided")]
    InvalidAmount,
    #[msg("Invalid token choice")]
    InvalidTokenChoice,
    #[msg("War has already been settled")]
    WarAlreadySettled,
    #[msg("War has ended, no more bets allowed")]
    WarEnded,
    #[msg("War has not ended yet")]
    WarNotEnded,
    #[msg("War has not been settled yet")]
    WarNotSettled,
    #[msg("Winnings have already been claimed")]
    AlreadyClaimed,
    #[msg("Unauthorized to claim these winnings")]
    UnauthorizedClaim,
    #[msg("Unauthorized to settle this war")]
    UnauthorizedSettlement,
    #[msg("Unauthorized action")]
    UnauthorizedAction,
}