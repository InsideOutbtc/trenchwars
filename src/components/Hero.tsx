'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import BattleCard from './BattleCard';
import BettingModal from './BettingModal';
import LiveFeed from './LiveFeed';
import { WojakPanel } from './WojakSVG';
import WojakBubble from './WojakBubble';
import { triggerWojakEvent } from '@/utils/wojakEvents';

const mockBattles = [
  {
    warId: '001',
    category: 'MICRO CAP',
    status: 'LIVE' as const,
    timeRemaining: '4d 12h 33m',
    tokenA: {
      symbol: 'PEPE',
      name: 'Pepe the Frog',
      price: 0.00001234,
      priceChange24h: 15.20,
      marketCap: 5200000000,
      volume24h: 420000000,
      icon: '/pepe.svg'
    },
    tokenB: {
      symbol: 'SHIB',
      name: 'Shiba Inu',
      price: 0.00000856,
      priceChange24h: -3.70,
      marketCap: 3800000000,
      volume24h: 280000000,
      icon: '/shib.svg'
    },
    totalVolume: 420.69,
    participantCount: 1234
  },
  {
    warId: '002',
    category: 'MEME LORDS',
    status: 'LIVE' as const,
    timeRemaining: '2d 8h 15m',
    tokenA: {
      symbol: 'DOGE',
      name: 'Dogecoin',
      price: 0.087234,
      priceChange24h: 8.45,
      marketCap: 12800000000,
      volume24h: 890000000,
      icon: '/doge.svg'
    },
    tokenB: {
      symbol: 'WIF',
      name: 'Dogwifhat',
      price: 1.234567,
      priceChange24h: -2.15,
      marketCap: 1200000000,
      volume24h: 156000000,
      icon: '/wif.svg'
    },
    totalVolume: 156.42,
    participantCount: 867
  },
  {
    warId: '003',
    category: 'DEFI WARS',
    status: 'UPCOMING' as const,
    timeRemaining: '6h 42m 18s',
    tokenA: {
      symbol: 'BONK',
      name: 'Bonk',
      price: 0.000012,
      priceChange24h: 22.80,
      marketCap: 780000000,
      volume24h: 67000000,
      icon: '/bonk.svg'
    },
    tokenB: {
      symbol: 'FLOKI',
      name: 'Floki Inu',
      price: 0.000156,
      priceChange24h: -5.60,
      marketCap: 1500000000,
      volume24h: 89000000,
      icon: '/floki.svg'
    },
    totalVolume: 89.33,
    participantCount: 542
  }
];

export default function Hero() {
  const { connected } = useWallet();
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [isBettingModalOpen, setIsBettingModalOpen] = useState(false);
  const [pnl, setPnl] = useState(42.69); // Mock P&L for Wojak
  const [pnlPercentage, setPnlPercentage] = useState(6.4); // Mock percentage
  const balance = 69.420; // Mock balance

  const handleBetClick = (tokenSymbol: string) => {
    const battle = mockBattles.find(b => 
      b.tokenA.symbol === tokenSymbol || b.tokenB.symbol === tokenSymbol
    );
    
    if (battle) {
      const token = battle.tokenA.symbol === tokenSymbol ? battle.tokenA : battle.tokenB;
      const distribution = tokenSymbol === battle.tokenA.symbol ? 67.3 : 32.7;
      const odds = 100 / distribution;
      
      setSelectedToken({
        symbol: token.symbol,
        name: token.name,
        icon: token.icon,
        odds: odds
      });
      setIsBettingModalOpen(true);

      // Trigger new battle event for wojak
      triggerWojakEvent.newBattle(`${battle.tokenA.symbol} vs ${battle.tokenB.symbol}`);
    }
  };

  // Simulate P&L changes for demonstration
  const simulatePnLChange = () => {
    const change = (Math.random() - 0.5) * 100; // -50 to +50
    const newPnl = pnl + change;
    const newPercentage = ((newPnl / 100) * 100); // Simple percentage calc
    
    setPnl(newPnl);
    setPnlPercentage(newPercentage);

    // Simulate battle outcomes
    if (Math.random() > 0.5) {
      triggerWojakEvent.battleWon(Math.abs(change), 'PEPE');
    } else {
      triggerWojakEvent.battleLost(Math.abs(change), 'SHIB');
    }
  };

  const handleQuickBet = () => {
    setIsBettingModalOpen(true);
    triggerWojakEvent.achievement('Quick Bet Master');
  };

  const handleViewPortfolio = () => {
    // Simulate viewing portfolio
    simulatePnLChange();
  };

  return (
    <>
      {/* Wojak Panel */}
      <WojakPanel pnl={pnl} />
      
      {/* Wojak Bubble System */}
      <WojakBubble 
        pnl={pnl}
        pnlPercentage={pnlPercentage}
        onQuickBet={handleQuickBet}
        onViewPortfolio={handleViewPortfolio}
      />

      <main style={{ paddingTop: '80px', paddingBottom: '40px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
          {/* Hero Section */}
          <section style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h1 className="text-3xl" style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>
              Degen Prediction Markets
            </h1>
            <p style={{ 
              fontSize: '18px', 
              color: 'var(--text-secondary)', 
              marginBottom: '32px',
              maxWidth: '600px',
              margin: '0 auto 32px'
            }}>
              Where memes battle for supremacy and anons fight for financial freedom.
              Connect your wallet to join the chaos.
            </p>
            
            {!connected && (
              <div style={{ marginBottom: '32px' }}>
                <WalletMultiButton className="wallet-btn" />
              </div>
            )}
          </section>

          {/* Battle Cards Grid */}
          <section style={{ marginBottom: '48px' }}>
            <div style={{
              display: 'grid',
              gap: '24px',
              gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))'
            }}>
              {mockBattles.map((battle) => (
                <BattleCard
                  key={battle.warId}
                  {...battle}
                  onBetClick={handleBetClick}
                />
              ))}
            </div>
          </section>

          {/* Live Feed */}
          <section style={{ marginBottom: '48px' }}>
            <LiveFeed />
          </section>

          {/* How It Works */}
          <section className="battle-card" style={{ marginBottom: '48px' }}>
            <div className="card-header">
              <div className="war-meta">
                <span className="war-id text-xs">INFO</span>
                <span className="badge">HOW IT WORKS</span>
              </div>
            </div>
            
            <div className="battle-overview">
              <h3 className="battle-title text-xl">How to Battle</h3>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '32px',
              marginTop: '24px'
            }}>
              <div>
                <h4 style={{ color: 'var(--green-positive)', marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>
                  📈 For Degens
                </h4>
                <ul style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
                  <li>• Connect your Solana wallet</li>
                  <li>• Choose your meme coin fighter</li>
                  <li>• Place your bet in SOL</li>
                  <li>• Watch the battle unfold</li>
                  <li>• Collect winnings or get rekt</li>
                </ul>
              </div>
              
              <div>
                <h4 style={{ color: 'var(--red-negative)', marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>
                  ⚠️ Warnings
                </h4>
                <ul style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
                  <li>• Not financial advice</li>
                  <li>• Maximum degeneracy zone</li>
                  <li>• Diamond hands required</li>
                  <li>• Paper hands will be mocked</li>
                  <li>• May cause addiction to chaos</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Wojak Demo Section */}
          <section className="battle-card" style={{ marginBottom: '48px' }}>
            <div className="card-header">
              <div className="war-meta">
                <span className="war-id text-xs">DEMO</span>
                <span className="badge">WOJAK SYSTEM</span>
              </div>
            </div>
            
            <div className="battle-overview">
              <h3 className="battle-title text-xl">Test Wojak Companion</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                Try the interactive wojak bubble in the bottom-right corner!
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px',
              marginTop: '24px'
            }}>
              <button 
                className="quick-bet-btn primary"
                onClick={() => {
                  const bigWin = Math.random() * 200 + 100;
                  setPnl(bigWin);
                  setPnlPercentage((bigWin / 100) * 100);
                  triggerWojakEvent.bigWin(bigWin, 'PEPE');
                }}
              >
                <span className="bet-icon">🚀</span>
                <span className="bet-label">Trigger Big Win</span>
              </button>
              
              <button 
                className="quick-bet-btn"
                onClick={() => {
                  const bigLoss = -(Math.random() * 200 + 100);
                  setPnl(bigLoss);
                  setPnlPercentage((bigLoss / 100) * 100);
                  triggerWojakEvent.bigLoss(bigLoss, 'SHIB');
                }}
                style={{ background: 'var(--red-negative)' }}
              >
                <span className="bet-icon">💀</span>
                <span className="bet-label">Trigger Big Loss</span>
              </button>
              
              <button 
                className="quick-bet-btn"
                onClick={() => triggerWojakEvent.achievement('Demo Master')}
                style={{ background: 'var(--purple-special)' }}
              >
                <span className="bet-icon">🎯</span>
                <span className="bet-label">Achievement</span>
              </button>
              
              <button 
                className="quick-bet-btn"
                onClick={simulatePnLChange}
                style={{ background: 'var(--blue-neutral)' }}
              >
                <span className="bet-icon">🎲</span>
                <span className="bet-label">Random P&L</span>
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Betting Modal */}
      {selectedToken && (
        <BettingModal
          isOpen={isBettingModalOpen}
          onClose={() => {
            setIsBettingModalOpen(false);
            setSelectedToken(null);
          }}
          token={selectedToken}
          balance={balance}
        />
      )}
    </>
  );
}