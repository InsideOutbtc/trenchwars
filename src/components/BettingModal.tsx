'use client';

import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { War } from '@/hooks/useWar';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

interface BettingModalProps {
  war: War;
  tokenChoice: 0 | 1;
  onClose: () => void;
}

export default function BettingModal({ war, tokenChoice, onClose }: BettingModalProps) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [betAmount, setBetAmount] = useState('0.1');
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 4chan /biz/ State Management
  const [riskLevel, setRiskLevel] = useState('COMFY');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [currentWojak, setCurrentWojak] = useState('neutral');
  const [doomscrollFeed, setDoomscrollFeed] = useState<string[]>([]);

  const selectedToken = tokenChoice === 0 ? war.token_a : war.token_b;
  const betAmountLamports = parseFloat(betAmount) * LAMPORTS_PER_SOL;

  // Risk level calculation
  useEffect(() => {
    const amount = parseFloat(betAmount);
    if (amount >= 10) {
      setRiskLevel('ABSOLUTE_DEGEN');
      setCurrentWojak('moon');
    } else if (amount >= 5) {
      setRiskLevel('HIGH_RISK_HIGH_REWARD');
      setCurrentWojak('gains');
    } else if (amount >= 1) {
      setRiskLevel('MODERATE_DEGEN');
      setCurrentWojak('gains');
    } else {
      setRiskLevel('COMFY');
      setCurrentWojak('neutral');
    }
  }, [betAmount]);

  // Terminal output simulation
  useEffect(() => {
    const outputs = [
      '> Loading MAXIMUM_DEGENERACY_PROTOCOLS.exe...',
      '> Checking DIAMOND_HANDS.dll status...',
      '> Initializing MOON_MISSION_CALCULATOR.sys...',
      '> Warning: PAPER_HANDS_DETECTOR.exe active',
      '> HOPIUM_INJECTOR.dll loaded successfully',
      '> COPIUM_RESERVES.dat: Status DEPLETED',
      '> Risk assessment: NGMI_PROBABILITY high'
    ];
    
    let index = 0;
    const outputInterval = setInterval(() => {
      setTerminalOutput(prev => [
        ...prev.slice(-4),
        outputs[index % outputs.length]
      ]);
      index++;
    }, 1500);
    
    return () => clearInterval(outputInterval);
  }, []);

  // Doomscroll feed updates
  useEffect(() => {
    const feedItems = [
      'Anonymous 04/20/24(Sat)13:37:00 No.58008135▶ just bought the top again lmao',
      'Anonymous 04/20/24(Sat)13:37:15 No.58008136▶ >>58008135 ngmi fren, should have waited',
      'Anonymous 04/20/24(Sat)13:37:30 No.58008137▶ imagine not buying every dip since 2017',
      'Anonymous 04/20/24(Sat)13:37:45 No.58008138▶ this is it, this is the one that makes me rich',
      'Anonymous 04/20/24(Sat)13:38:00 No.58008139▶ >he bought? dump eet',
      'Anonymous 04/20/24(Sat)13:38:15 No.58008140▶ diamond hands or rope, no in between',
      'Anonymous 04/20/24(Sat)13:38:30 No.58008141▶ just threw my rent money at this, moon mission or foodstamps'
    ];
    
    let index = 0;
    const feedInterval = setInterval(() => {
      setDoomscrollFeed(prev => [
        feedItems[index % feedItems.length],
        ...prev.slice(0, 5)
      ]);
      index++;
    }, 2000);
    
    return () => clearInterval(feedInterval);
  }, []);

  const handlePlaceBet = async () => {
    if (!publicKey) {
      setError('WALLET_NOT_CONNECTED.ERR - Connect wallet or NGMI');
      setTerminalOutput(prev => [...prev, '> ERROR: No wallet detected, are you even trying anon?']);
      return;
    }

    if (parseFloat(betAmount) <= 0) {
      setError('INVALID_BET_AMOUNT.ERR - You need to actually bet something');
      setTerminalOutput(prev => [...prev, '> ERROR: Zero bet detected, this is not a charity']);
      return;
    }

    if (parseFloat(betAmount) >= 100) {
      setError('WHALE_ALERT.WAR - Are you absolutely sure about this level of degeneracy?');
      setTerminalOutput(prev => [...prev, '> WARNING: Whale detected, preparing for maximum chaos']);
      return;
    }

    setIsPlacingBet(true);
    setError(null);
    setTerminalOutput(prev => [...prev, '> Initiating transaction...', '> Preparing for moon mission or financial ruin...']);

    try {
      const programPublicKey = new PublicKey('7KK67M12SbodyTKSetMjMeCWBiDNvB817dkWWvueRbYG');
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: programPublicKey,
          lamports: betAmountLamports,
        })
      );

      setTerminalOutput(prev => [...prev, '> Transaction created, sending to blockchain...']);
      const signature = await sendTransaction(transaction, connection);
      
      setTerminalOutput(prev => [...prev, '> Transaction submitted, waiting for confirmation...']);
      await connection.confirmTransaction(signature, 'confirmed');

      const betData = {
        war_id: war.id,
        user_wallet: publicKey.toString(),
        amount: betAmountLamports,
        token_choice: tokenChoice,
        transaction_signature: signature
      };

      setTerminalOutput(prev => [...prev, '> Recording bet in backend database...']);
      const response = await fetch('https://api.trenchwars.wtf/api/bets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(betData),
      });

      if (!response.ok) {
        throw new Error('Backend recording failed');
      }

      const betResult = await response.json();
      console.log('Bet recorded successfully:', betResult);

      setTerminalOutput(prev => [...prev, '> BET_PLACED_SUCCESSFULLY.OK', '> May the odds be ever in your favor, anon']);
      
      const successMessages = [
        'ABSOLUTELY_SENT.WAV - Your degeneracy has been recorded on-chain',
        'DIAMOND_HANDS_ACTIVATED.EXE - Bet placed successfully',
        'BASED_DETECTED.DLL - You are now in the trenches, anon',
        'MOON_MISSION_INITIATED.SYS - Preparing for takeoff or crash landing',
        'CHAD_ENERGY_DETECTED.WAV - Your balls have been acknowledged'
      ];
      const randomMessage = successMessages[Math.floor(Math.random() * successMessages.length)];
      alert(randomMessage);
      onClose();
    } catch (err: unknown) {
      console.error('Error placing bet:', err);
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      setError(`TRANSACTION_FAILED.ERR - ${errorMessage}`);
      setTerminalOutput(prev => [...prev, `> FATAL_ERROR: ${errorMessage}`, '> Better luck next time, anon']);
    } finally {
      setIsPlacingBet(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[var(--midnight-black)]/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="terminal-window max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Terminal Title Bar */}
        <div className="terminal-header flex justify-between items-center">
          <span>BET_PLACEMENT.EXE - {riskLevel} MODE ACTIVE</span>
          <button
            onClick={onClose}
            className="text-[var(--explosive-red)] hover:text-[var(--pure-white)] font-bold text-lg"
          >
            [X]
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Left Column - Betting Interface */}
          <div className="space-y-6">
            {/* Battle Info */}
            <div className="terminal-window">
              <div className="terminal-header">
                BATTLE_INFO.DAT
              </div>
              <div className="terminal-content">
                <div className="greentext space-y-2">
                  <div className="greentext-item">be anon</div>
                  <div className="greentext-item">see epic battle: {war.token_a.symbol} vs {war.token_b.symbol}</div>
                  <div className="greentext-item">choose weapon: {selectedToken.symbol}</div>
                  <div className="greentext-item">time to absolutely send it</div>
                </div>
                
                <div className="mt-4 p-4 bg-[var(--trench-grey)] border border-[var(--pump-green)] rounded">
                  <div className="data-point text-lg font-black">
                    TARGET: {selectedToken.name}
                  </div>
                  <div className="data-point text-2xl font-black mt-2">
                    ${selectedToken.price?.toFixed(6) || '0.000000'}
                  </div>
                  <div className={`data-point mt-2 ${selectedToken.price_change_24h >= 0 ? 'text-[var(--pump-green)]' : 'text-[var(--explosive-red)]'}`}>
                    24h: {selectedToken.price_change_24h >= 0 ? '+' : ''}{selectedToken.price_change_24h?.toFixed(2) || '0.00'}%
                    {selectedToken.price_change_24h >= 0 ? ' 📈 PUMPING' : ' 📉 DUMPING'}
                  </div>
                </div>
              </div>
            </div>

            {/* Bet Amount Input */}
            <div className="terminal-window">
              <div className="terminal-header">
                BET_AMOUNT_INPUT.SYS
              </div>
              <div className="terminal-content">
                <div className="greentext-item mb-4">
                  How much are you willing to lose, anon?
                </div>
                
                <div className="relative mb-4">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="w-full bg-[var(--midnight-black)] border-2 border-[var(--pump-green)] rounded px-4 py-3 text-[var(--pure-white)] font-mono text-lg terminal-glow focus:border-[var(--explosive-red)] focus:outline-none"
                    placeholder="0.1"
                    min="0.001"
                    step="0.001"
                  />
                  <div className="absolute right-3 top-3 text-[var(--pump-green)] font-mono">
                    SOL
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[
                    { amount: '0.1', label: 'SAFE' },
                    { amount: '0.5', label: 'DEGEN' },
                    { amount: '1.0', label: 'SEND' },
                    { amount: '5.0', label: 'YOLO' }
                  ].map((bet) => (
                    <button
                      key={bet.amount}
                      onClick={() => setBetAmount(bet.amount)}
                      className="btn-send-it text-xs py-2 px-3 rounded font-mono font-black"
                    >
                      {bet.label}<br/>{bet.amount}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-[var(--pump-green)] font-mono">
                  ≈ ${(parseFloat(betAmount) * 100).toFixed(2)} USD
                </div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="doom-hud">
              <div className="text-sm font-mono mb-2">RISK_ASSESSMENT.DLL</div>
              <div className="health-bar mb-2">
                <div 
                  className="health-fill" 
                  style={{ 
                    width: `${Math.min(parseFloat(betAmount) * 20, 100)}%`,
                    background: parseFloat(betAmount) >= 5 ? 'var(--explosive-red)' : 'var(--pump-green)'
                  }}
                ></div>
              </div>
              <div className="ammo-counter text-center">
                RISK_LEVEL: {riskLevel}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="terminal-window">
                <div className="terminal-header text-[var(--explosive-red)]">
                  FATAL_ERROR.LOG
                </div>
                <div className="terminal-content">
                  <div className="text-[var(--explosive-red)] font-mono system-crash">
                    {error}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="flex-1 btn-rekt py-4 rounded font-mono font-black uppercase tracking-wider"
              >
                PAPER_HANDS.EXE
              </button>
              <button
                onClick={handlePlaceBet}
                disabled={isPlacingBet || parseFloat(betAmount) <= 0}
                className="flex-1 btn-send-it py-4 rounded font-mono font-black uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPlacingBet ? 'SENDING...' : 'ABSOLUTELY_SEND_IT.EXE'}
              </button>
            </div>
          </div>

          {/* Right Column - 4chan /biz/ Doomscroll Feed */}
          <div className="space-y-6">
            {/* ASCII Wojak Display */}
            <div className={`wojak-terminal ${currentWojak === 'moon' ? 'wojak-moon' : currentWojak === 'gains' ? 'wojak-gains' : ''}`}>
              {/* Wojak ASCII art is handled by CSS pseudo-elements */}
              <div className="mt-16 text-center">
                <div className="data-point">
                  ANON_STATUS: {currentWojak === 'moon' ? 'ABSOLUTELY_BASED' : currentWojak === 'gains' ? 'COMFY' : 'NGMI'}
                </div>
              </div>
            </div>

            {/* Terminal Output Feed */}
            <div className="terminal-window">
              <div className="terminal-header">
                SYSTEM_OUTPUT.LOG
              </div>
              <div className="doomscroll-feed">
                {terminalOutput.map((output, index) => (
                  <div key={index} className="feed-item">
                    <span className="text-[var(--pump-green)]">[{new Date().toLocaleTimeString()}]</span> {output}
                  </div>
                ))}
              </div>
            </div>

            {/* 4chan Style Doomscroll */}
            <div className="terminal-window">
              <div className="terminal-header">
                /BIZ/_LIVE_FEED.DAT - MAXIMUM_COPIUM_MODE
              </div>
              <div className="doomscroll-feed">
                {doomscrollFeed.map((post, index) => (
                  <div key={index} className="feed-item text-xs">
                    <div className="text-[var(--pump-green)] mb-1">
                      {post}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Potential Returns Calculator */}
            <div className="terminal-window">
              <div className="terminal-header">
                MOON_MISSION_CALCULATOR.EXE
              </div>
              <div className="terminal-content">
                <div className="greentext space-y-2">
                  <div className="greentext-item">calculating potential gains...</div>
                  <div className="greentext-item">if moon: ~{(parseFloat(betAmount) * 1.8).toFixed(3)} SOL</div>
                  <div className="greentext-item">if rope: -{betAmount} SOL</div>
                  <div className="greentext-item">probability of success: unknown</div>
                  <div className="greentext-item">dyor or get rekt</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="terminal-content border-t border-[var(--pump-green)]/30 text-xs text-center">
          <div className="text-[var(--corruption-yellow)] font-mono">
            ⚠️ WARNING: MAXIMUM_DEGENERACY_ZONE_ACTIVE ⚠️<br/>
            NOT_FINANCIAL_ADVICE.DLL | ONLY_BET_WHAT_YOU_CAN_AFFORD_TO_LOSE.SYS<br/>
            TRENCHWARS.WTF = ENTERTAINMENT_PURPOSES_ONLY.EXE
          </div>
        </div>
      </div>
    </div>
  );
}