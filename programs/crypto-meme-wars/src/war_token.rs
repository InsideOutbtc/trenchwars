use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("WarToken1111111111111111111111111111111111111");

#[program]
pub mod war_token {
    use super::*;

    // Initialize the $WAR token mint
    pub fn initialize_token(ctx: Context<InitializeToken>, total_supply: u64) -> Result<()> {
        let token_data = &mut ctx.accounts.token_data;
        token_data.authority = ctx.accounts.authority.key();
        token_data.total_supply = total_supply;
        token_data.circulating_supply = 0;
        token_data.staked_supply = 0;
        token_data.burned_supply = 0;
        token_data.fee_multiplier = 100; // 1.0x (in basis points)
        token_data.staking_apr = 1500; // 15% APR (in basis points)
        token_data.governance_threshold = total_supply / 100; // 1% for proposals
        token_data.bump = ctx.bumps.token_data;

        // Mint initial supply to treasury
        let cpi_accounts = token::MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.treasury.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::mint_to(cpi_ctx, total_supply)?;

        token_data.circulating_supply = total_supply;

        emit!(TokenInitialized {
            mint: ctx.accounts.mint.key(),
            total_supply,
            authority: ctx.accounts.authority.key(),
        });

        Ok(())
    }

    // Stake $WAR tokens for enhanced betting multipliers
    pub fn stake_tokens(ctx: Context<StakeTokens>, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);

        let token_data = &mut ctx.accounts.token_data;
        let stake_account = &mut ctx.accounts.stake_account;

        // Transfer tokens to staking pool
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.staking_pool.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        // Update stake account
        if stake_account.owner == Pubkey::default() {
            stake_account.owner = ctx.accounts.user.key();
            stake_account.bump = ctx.bumps.stake_account;
        }

        stake_account.staked_amount += amount;
        stake_account.last_stake_time = Clock::get()?.unix_timestamp;
        stake_account.pending_rewards += calculate_pending_rewards(stake_account, token_data.staking_apr)?;

        // Update global staking data
        token_data.staked_supply += amount;
        token_data.circulating_supply -= amount;

        emit!(TokensStaked {
            user: ctx.accounts.user.key(),
            amount,
            total_staked: stake_account.staked_amount,
        });

        Ok(())
    }

    // Unstake $WAR tokens
    pub fn unstake_tokens(ctx: Context<UnstakeTokens>, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);

        let token_data = &mut ctx.accounts.token_data;
        let stake_account = &mut ctx.accounts.stake_account;

        require!(stake_account.staked_amount >= amount, ErrorCode::InsufficientStake);

        // Calculate and claim rewards first
        let rewards = calculate_pending_rewards(stake_account, token_data.staking_apr)?;
        if rewards > 0 {
            claim_staking_rewards(
                &ctx.accounts.staking_pool,
                &ctx.accounts.user_token_account,
                &ctx.accounts.token_data,
                &ctx.accounts.token_program,
                rewards,
            )?;
        }

        // Transfer staked tokens back to user
        let seeds = &[
            b"token_data",
            &[token_data.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.staking_pool.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.token_data.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, amount)?;

        // Update stake account
        stake_account.staked_amount -= amount;
        stake_account.last_stake_time = Clock::get()?.unix_timestamp;
        stake_account.pending_rewards = 0;

        // Update global staking data
        token_data.staked_supply -= amount;
        token_data.circulating_supply += amount;

        emit!(TokensUnstaked {
            user: ctx.accounts.user.key(),
            amount,
            rewards_claimed: rewards,
        });

        Ok(())
    }

    // Apply fee discounts for $WAR holders
    pub fn calculate_fee_discount(ctx: Context<CalculateFeeDiscount>, base_fee: u64) -> Result<u64> {
        let stake_account = &ctx.accounts.stake_account;
        let token_data = &ctx.accounts.token_data;
        
        let user_balance = ctx.accounts.user_token_account.amount;
        let staked_amount = stake_account.staked_amount;
        let total_war_holdings = user_balance + staked_amount;

        // Calculate discount based on holdings
        let discount_bps = if total_war_holdings >= 1_000_000 * 10_u64.pow(6) { // 1M+ WAR
            5000 // 50% discount
        } else if total_war_holdings >= 100_000 * 10_u64.pow(6) { // 100K+ WAR
            3000 // 30% discount
        } else if total_war_holdings >= 10_000 * 10_u64.pow(6) { // 10K+ WAR
            1500 // 15% discount
        } else if total_war_holdings >= 1_000 * 10_u64.pow(6) { // 1K+ WAR
            500 // 5% discount
        } else {
            0 // No discount
        };

        let discounted_fee = base_fee * (10000 - discount_bps) / 10000;

        emit!(FeeDiscountCalculated {
            user: ctx.accounts.user.key(),
            base_fee,
            discount_bps,
            final_fee: discounted_fee,
        });

        Ok(discounted_fee)
    }

    // Burn tokens to reduce supply
    pub fn burn_tokens(ctx: Context<BurnTokens>, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);

        let token_data = &mut ctx.accounts.token_data;

        // Burn tokens
        let cpi_accounts = token::Burn {
            mint: ctx.accounts.mint.to_account_info(),
            from: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::burn(cpi_ctx, amount)?;

        // Update supply tracking
        token_data.burned_supply += amount;
        token_data.circulating_supply -= amount;

        emit!(TokensBurned {
            user: ctx.accounts.user.key(),
            amount,
            total_burned: token_data.burned_supply,
        });

        Ok(())
    }

    // Create governance proposal
    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description: String,
        voting_period: i64,
    ) -> Result<()> {
        let stake_account = &ctx.accounts.stake_account;
        let token_data = &ctx.accounts.token_data;
        let proposal = &mut ctx.accounts.proposal;

        // Check if user has enough tokens to create proposal
        let user_balance = ctx.accounts.user_token_account.amount;
        let staked_amount = stake_account.staked_amount;
        let total_holdings = user_balance + staked_amount;

        require!(
            total_holdings >= token_data.governance_threshold,
            ErrorCode::InsufficientTokensForProposal
        );

        // Initialize proposal
        proposal.proposer = ctx.accounts.user.key();
        proposal.title = title;
        proposal.description = description;
        proposal.created_at = Clock::get()?.unix_timestamp;
        proposal.voting_ends_at = Clock::get()?.unix_timestamp + voting_period;
        proposal.votes_for = 0;
        proposal.votes_against = 0;
        proposal.executed = false;
        proposal.bump = ctx.bumps.proposal;

        emit!(ProposalCreated {
            proposal_id: proposal.key(),
            proposer: ctx.accounts.user.key(),
            title: proposal.title.clone(),
        });

        Ok(())
    }

    // Vote on governance proposal
    pub fn vote_on_proposal(
        ctx: Context<VoteOnProposal>,
        vote_type: VoteType,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let stake_account = &ctx.accounts.stake_account;
        let vote_record = &mut ctx.accounts.vote_record;

        require!(
            Clock::get()?.unix_timestamp <= proposal.voting_ends_at,
            ErrorCode::VotingPeriodEnded
        );

        require!(
            vote_record.voter == Pubkey::default(),
            ErrorCode::AlreadyVoted
        );

        // Calculate voting power (staked tokens have 2x power)
        let user_balance = ctx.accounts.user_token_account.amount;
        let staked_amount = stake_account.staked_amount;
        let voting_power = user_balance + (staked_amount * 2);

        require!(voting_power > 0, ErrorCode::NoVotingPower);

        // Record vote
        vote_record.voter = ctx.accounts.user.key();
        vote_record.proposal = proposal.key();
        vote_record.vote_type = vote_type.clone();
        vote_record.voting_power = voting_power;
        vote_record.bump = ctx.bumps.vote_record;

        // Update proposal vote counts
        match vote_type {
            VoteType::For => proposal.votes_for += voting_power,
            VoteType::Against => proposal.votes_against += voting_power,
        }

        emit!(VoteCast {
            proposal_id: proposal.key(),
            voter: ctx.accounts.user.key(),
            vote_type,
            voting_power,
        });

        Ok(())
    }
}

// Helper functions
fn calculate_pending_rewards(stake_account: &StakeAccount, apr_bps: u16) -> Result<u64> {
    let current_time = Clock::get()?.unix_timestamp;
    let time_diff = current_time - stake_account.last_stake_time;
    
    if time_diff <= 0 {
        return Ok(0);
    }

    // Calculate rewards: staked_amount * APR * time_fraction
    let annual_rewards = stake_account.staked_amount * apr_bps as u64 / 10000;
    let time_fraction = time_diff as u64 * 1000000 / (365 * 24 * 60 * 60); // in microseconds for precision
    let rewards = annual_rewards * time_fraction / 1000000;

    Ok(rewards)
}

fn claim_staking_rewards(
    staking_pool: &Account<TokenAccount>,
    user_token_account: &Account<TokenAccount>,
    token_data: &Account<TokenData>,
    token_program: &Program<Token>,
    amount: u64,
) -> Result<()> {
    let seeds = &[
        b"token_data",
        &[token_data.bump],
    ];
    let signer = &[&seeds[..]];

    let cpi_accounts = Transfer {
        from: staking_pool.to_account_info(),
        to: user_token_account.to_account_info(),
        authority: token_data.to_account_info(),
    };
    let cpi_ctx = CpiContext::new_with_signer(token_program.to_account_info(), cpi_accounts, signer);
    token::transfer(cpi_ctx, amount)?;

    Ok(())
}

// Account structures
#[account]
pub struct TokenData {
    pub authority: Pubkey,
    pub total_supply: u64,
    pub circulating_supply: u64,
    pub staked_supply: u64,
    pub burned_supply: u64,
    pub fee_multiplier: u16,        // Basis points (100 = 1%)
    pub staking_apr: u16,          // Basis points (1500 = 15%)
    pub governance_threshold: u64,  // Minimum tokens needed for proposals
    pub bump: u8,
}

#[account]
pub struct StakeAccount {
    pub owner: Pubkey,
    pub staked_amount: u64,
    pub last_stake_time: i64,
    pub pending_rewards: u64,
    pub bump: u8,
}

#[account]
pub struct Proposal {
    pub proposer: Pubkey,
    pub title: String,
    pub description: String,
    pub created_at: i64,
    pub voting_ends_at: i64,
    pub votes_for: u64,
    pub votes_against: u64,
    pub executed: bool,
    pub bump: u8,
}

#[account]
pub struct VoteRecord {
    pub voter: Pubkey,
    pub proposal: Pubkey,
    pub vote_type: VoteType,
    pub voting_power: u64,
    pub bump: u8,
}

// Context structures
#[derive(Accounts)]
pub struct InitializeToken<'info> {
    #[account(
        init,
        payer = authority,
        mint::decimals = 6,
        mint::authority = authority,
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = authority,
        seeds = [b"token_data"],
        bump,
        space = 8 + 32 + 8 + 8 + 8 + 8 + 2 + 2 + 8 + 1
    )]
    pub token_data: Account<'info, TokenData>,

    #[account(
        init,
        payer = authority,
        associated_token::mint = mint,
        associated_token::authority = authority,
    )]
    pub treasury: Account<'info, TokenAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct StakeTokens<'info> {
    #[account(
        init_if_needed,
        payer = user,
        seeds = [b"stake", user.key().as_ref()],
        bump,
        space = 8 + 32 + 8 + 8 + 8 + 1
    )]
    pub stake_account: Account<'info, StakeAccount>,

    #[account(
        mut,
        seeds = [b"token_data"],
        bump = token_data.bump
    )]
    pub token_data: Account<'info, TokenData>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = user,
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = token_data,
    )]
    pub staking_pool: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UnstakeTokens<'info> {
    #[account(
        mut,
        seeds = [b"stake", user.key().as_ref()],
        bump = stake_account.bump
    )]
    pub stake_account: Account<'info, StakeAccount>,

    #[account(
        mut,
        seeds = [b"token_data"],
        bump = token_data.bump
    )]
    pub token_data: Account<'info, TokenData>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = user,
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = token_data,
    )]
    pub staking_pool: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CalculateFeeDiscount<'info> {
    #[account(
        seeds = [b"stake", user.key().as_ref()],
        bump = stake_account.bump
    )]
    pub stake_account: Account<'info, StakeAccount>,

    #[account(
        seeds = [b"token_data"],
        bump = token_data.bump
    )]
    pub token_data: Account<'info, TokenData>,

    #[account(
        associated_token::mint = mint,
        associated_token::authority = user,
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct BurnTokens<'info> {
    #[account(
        mut,
        seeds = [b"token_data"],
        bump = token_data.bump
    )]
    pub token_data: Account<'info, TokenData>,

    #[account(mut)]
    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = user,
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(
        init,
        payer = user,
        seeds = [b"proposal", user.key().as_ref(), &Clock::get().unwrap().unix_timestamp.to_le_bytes()],
        bump,
        space = 8 + 32 + 4 + 64 + 4 + 256 + 8 + 8 + 8 + 8 + 1 + 1
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(
        seeds = [b"stake", user.key().as_ref()],
        bump = stake_account.bump
    )]
    pub stake_account: Account<'info, StakeAccount>,

    #[account(
        seeds = [b"token_data"],
        bump = token_data.bump
    )]
    pub token_data: Account<'info, TokenData>,

    #[account(
        associated_token::mint = mint,
        associated_token::authority = user,
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VoteOnProposal<'info> {
    #[account(
        init,
        payer = user,
        seeds = [b"vote", proposal.key().as_ref(), user.key().as_ref()],
        bump,
        space = 8 + 32 + 32 + 1 + 8 + 1
    )]
    pub vote_record: Account<'info, VoteRecord>,

    #[account(mut)]
    pub proposal: Account<'info, Proposal>,

    #[account(
        seeds = [b"stake", user.key().as_ref()],
        bump = stake_account.bump
    )]
    pub stake_account: Account<'info, StakeAccount>,

    #[account(
        associated_token::mint = mint,
        associated_token::authority = user,
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// Enums and events
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum VoteType {
    For,
    Against,
}

#[event]
pub struct TokenInitialized {
    pub mint: Pubkey,
    pub total_supply: u64,
    pub authority: Pubkey,
}

#[event]
pub struct TokensStaked {
    pub user: Pubkey,
    pub amount: u64,
    pub total_staked: u64,
}

#[event]
pub struct TokensUnstaked {
    pub user: Pubkey,
    pub amount: u64,
    pub rewards_claimed: u64,
}

#[event]
pub struct FeeDiscountCalculated {
    pub user: Pubkey,
    pub base_fee: u64,
    pub discount_bps: u16,
    pub final_fee: u64,
}

#[event]
pub struct TokensBurned {
    pub user: Pubkey,
    pub amount: u64,
    pub total_burned: u64,
}

#[event]
pub struct ProposalCreated {
    pub proposal_id: Pubkey,
    pub proposer: Pubkey,
    pub title: String,
}

#[event]
pub struct VoteCast {
    pub proposal_id: Pubkey,
    pub voter: Pubkey,
    pub vote_type: VoteType,
    pub voting_power: u64,
}

// Error codes
#[error_code]
pub enum ErrorCode {
    #[msg("Invalid amount provided")]
    InvalidAmount,
    #[msg("Insufficient staked tokens")]
    InsufficientStake,
    #[msg("Insufficient tokens for creating proposal")]
    InsufficientTokensForProposal,
    #[msg("Voting period has ended")]
    VotingPeriodEnded,
    #[msg("User has already voted on this proposal")]
    AlreadyVoted,
    #[msg("User has no voting power")]
    NoVotingPower,
}