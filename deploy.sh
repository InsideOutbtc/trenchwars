#!/bin/bash

echo "🚀 CryptoColosseum Smart Contract Deployment Script"
echo "=================================================="

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo "📦 Installing Solana CLI..."
    sh -c "$(curl -sSfL https://release.solana.com/v1.16.0/install)"
    
    # Add to PATH for current session
    export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
    
    echo "✅ Solana CLI installed!"
else
    echo "✅ Solana CLI already installed"
fi

# Check if Anchor is installed
if ! command -v anchor &> /dev/null; then
    echo "📦 Installing Anchor..."
    cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
    avm install latest
    avm use latest
    echo "✅ Anchor installed!"
else
    echo "✅ Anchor already installed"
fi

# Set up Solana config for devnet
echo "🔧 Setting up Solana configuration..."
solana config set --url devnet

# Create keypair if it doesn't exist
if [ ! -f ~/.config/solana/id.json ]; then
    echo "🔑 Creating new Solana keypair..."
    solana-keygen new --outfile ~/.config/solana/id.json --no-passphrase
    echo "✅ Keypair created!"
else
    echo "✅ Keypair already exists"
fi

# Get wallet address
WALLET=$(solana address)
echo "💼 Your wallet address: $WALLET"

# Check SOL balance
BALANCE=$(solana balance --url devnet)
echo "💰 Current devnet balance: $BALANCE"

# Airdrop SOL if balance is low
if [[ "$BALANCE" == "0 SOL" ]]; then
    echo "💸 Requesting devnet SOL airdrop..."
    solana airdrop 2 --url devnet
    echo "✅ Airdrop complete!"
fi

# Install dependencies
echo "📦 Installing dependencies..."
yarn install

# Build the contracts
echo "🔨 Building smart contracts..."
anchor build

# Deploy to devnet
echo "🚀 Deploying to Solana devnet..."
anchor deploy --provider.cluster devnet

# Get the deployed program ID
PROGRAM_ID=$(solana address -k target/deploy/betting_contract-keypair.json)
echo ""
echo "🎉 DEPLOYMENT SUCCESSFUL!"
echo "========================"
echo "Program ID: $PROGRAM_ID"
echo "Network: Solana Devnet"
echo "Wallet: $WALLET"
echo ""
echo "🔗 View on Solana Explorer:"
echo "https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet"
echo ""
echo "✨ Your CryptoColosseum smart contracts are now live on devnet!"
echo "Update your frontend with the Program ID above."