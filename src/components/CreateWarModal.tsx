'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { X, Search, Calendar, DollarSign, Info, Sword, TrendingUp } from 'lucide-react';

interface Token {
  id: string;
  symbol: string;
  name: string;
  price?: number;
  price_change_24h?: number;
  market_cap?: number;
  logo?: string;
}

interface CreateWarModalProps {
  onClose: () => void;
  onWarCreated?: (war: any) => void;
}

export default function CreateWarModal({ onClose, onWarCreated }: CreateWarModalProps) {
  const { publicKey } = useWallet();
  const [step, setStep] = useState(1); // 1: Select tokens, 2: Configure war, 3: Review & create
  const [tokenA, setTokenA] = useState<Token | null>(null);
  const [tokenB, setTokenB] = useState<Token | null>(null);
  const [availableTokens, setAvailableTokens] = useState<Token[]>([]);
  const [searchA, setSearchA] = useState('');
  const [searchB, setSearchB] = useState('');
  const [duration, setDuration] = useState(24); // hours
  const [minBet, setMinBet] = useState(0.001); // SOL
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableTokens();
  }, []);

  const fetchAvailableTokens = async () => {
    try {
      const response = await fetch('https://api.trenchwars.wtf/api/prices/trending');
      if (response.ok) {
        const tokens = await response.json();
        setAvailableTokens(tokens.slice(0, 50)); // Limit to top 50 tokens
      }
    } catch (error) {
      console.error('Error fetching tokens:', error);
      // Fallback to popular tokens
      setAvailableTokens([
        { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
        { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
        { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
        { id: 'shiba-inu', symbol: 'SHIB', name: 'Shiba Inu' },
        { id: 'pepe', symbol: 'PEPE', name: 'Pepe' },
        { id: 'solana', symbol: 'SOL', name: 'Solana' },
      ]);
    }
  };

  const filterTokens = (search: string) => {
    return availableTokens.filter(token => 
      token.symbol.toLowerCase().includes(search.toLowerCase()) ||
      token.name.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 10);
  };

  const handleCreateWar = async () => {
    if (!publicKey || !tokenA || !tokenB) return;

    setIsCreating(true);
    setError(null);

    try {
      const warData = {
        token_a: tokenA,
        token_b: tokenB,
        duration_hours: duration,
        min_bet_amount: minBet * 1e9, // Convert SOL to lamports
        description: description || `${tokenA.symbol} vs ${tokenB.symbol} - TrenchWars Battle`,
        creator_wallet: publicKey.toBase58(),
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + duration * 60 * 60 * 1000).toISOString(),
      };

      const response = await fetch('https://api.trenchwars.wtf/api/wars/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(warData),
      });

      if (!response.ok) {
        throw new Error('Failed to create war');
      }

      const createdWar = await response.json();
      
      if (onWarCreated) {
        onWarCreated(createdWar);
      }

      alert('War created successfully! It will be reviewed by moderators before going live.');
      onClose();
    } catch (err: any) {
      console.error('Error creating war:', err);
      setError(err.message || 'Failed to create war');
    } finally {
      setIsCreating(false);
    }
  };

  const canProceedToStep2 = tokenA && tokenB && tokenA.id !== tokenB.id;
  const canCreateWar = canProceedToStep2 && duration >= 1 && duration <= 168 && minBet >= 0.001;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sword className="w-6 h-6 text-purple-400" />
            Create New War
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step Progress */}
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${step >= 1 ? 'text-purple-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-purple-600' : 'bg-gray-600'}`}>
                1
              </div>
              <span className="ml-2 text-sm">Select Tokens</span>
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-600'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-purple-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-purple-600' : 'bg-gray-600'}`}>
                2
              </div>
              <span className="ml-2 text-sm">Configure</span>
            </div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-purple-600' : 'bg-gray-600'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-purple-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-purple-600' : 'bg-gray-600'}`}>
                3
              </div>
              <span className="ml-2 text-sm">Review</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Choose Your Fighters</h3>
                <p className="text-gray-400">Select two tokens to battle it out in the arena</p>
              </div>

              {/* Token A Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Token A</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchA}
                    onChange={(e) => setSearchA(e.target.value)}
                    placeholder="Search for a token..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  />
                  <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                </div>
                
                {searchA && (
                  <div className="mt-2 bg-gray-700 rounded-lg border border-gray-600 max-h-48 overflow-y-auto">
                    {filterTokens(searchA).map((token) => (
                      <button
                        key={token.id}
                        onClick={() => {
                          setTokenA(token);
                          setSearchA(token.symbol);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-600 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold">{token.symbol.slice(0, 2)}</span>
                        </div>
                        <div>
                          <div className="font-medium text-white">{token.symbol}</div>
                          <div className="text-sm text-gray-400">{token.name}</div>
                        </div>
                        {token.price && (
                          <div className="ml-auto">
                            <div className="text-sm text-white">${token.price.toFixed(4)}</div>
                            {token.price_change_24h && (
                              <div className={`text-xs ${token.price_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {token.price_change_24h >= 0 ? '+' : ''}{token.price_change_24h.toFixed(2)}%
                              </div>
                            )}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {tokenA && (
                  <div className="mt-3 p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold">{tokenA.symbol.slice(0, 2)}</span>
                      </div>
                      <div>
                        <div className="font-medium text-white">{tokenA.symbol}</div>
                        <div className="text-sm text-gray-400">{tokenA.name}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* VS Divider */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full">
                  <span className="text-white font-bold">VS</span>
                </div>
              </div>

              {/* Token B Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Token B</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchB}
                    onChange={(e) => setSearchB(e.target.value)}
                    placeholder="Search for a token..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  />
                  <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                </div>
                
                {searchB && (
                  <div className="mt-2 bg-gray-700 rounded-lg border border-gray-600 max-h-48 overflow-y-auto">
                    {filterTokens(searchB).filter(token => token.id !== tokenA?.id).map((token) => (
                      <button
                        key={token.id}
                        onClick={() => {
                          setTokenB(token);
                          setSearchB(token.symbol);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-600 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold">{token.symbol.slice(0, 2)}</span>
                        </div>
                        <div>
                          <div className="font-medium text-white">{token.symbol}</div>
                          <div className="text-sm text-gray-400">{token.name}</div>
                        </div>
                        {token.price && (
                          <div className="ml-auto">
                            <div className="text-sm text-white">${token.price.toFixed(4)}</div>
                            {token.price_change_24h && (
                              <div className={`text-xs ${token.price_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {token.price_change_24h >= 0 ? '+' : ''}{token.price_change_24h.toFixed(2)}%
                              </div>
                            )}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {tokenB && (
                  <div className="mt-3 p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold">{tokenB.symbol.slice(0, 2)}</span>
                      </div>
                      <div>
                        <div className="font-medium text-white">{tokenB.symbol}</div>
                        <div className="text-sm text-gray-400">{tokenB.name}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Configure War Settings</h3>
                <p className="text-gray-400">Set the rules for this epic battle</p>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  War Duration (hours)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  min="1"
                  max="168"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                />
                <div className="text-xs text-gray-400 mt-1">
                  Min: 1 hour, Max: 168 hours (7 days)
                </div>
              </div>

              {/* Minimum Bet */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Minimum Bet (SOL)
                </label>
                <input
                  type="number"
                  value={minBet}
                  onChange={(e) => setMinBet(Number(e.target.value))}
                  min="0.001"
                  step="0.001"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                />
                <div className="text-xs text-gray-400 mt-1">
                  Minimum: 0.001 SOL
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Info className="w-4 h-4 inline mr-1" />
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this war or add context..."
                  rows={4}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none resize-none"
                />
                <div className="text-xs text-gray-400 mt-1">
                  {description.length}/500 characters
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Review & Create War</h3>
                <p className="text-gray-400">Double-check everything before creating your war</p>
              </div>

              {/* War Preview */}
              <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">War Details</h4>
                  <div className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm">
                    Pending Review
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  {/* Token A */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-lg font-bold">{tokenA?.symbol.slice(0, 2)}</span>
                    </div>
                    <div className="font-medium text-white">{tokenA?.symbol}</div>
                    <div className="text-sm text-gray-400">{tokenA?.name}</div>
                  </div>

                  {/* Token B */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-lg font-bold">{tokenB?.symbol.slice(0, 2)}</span>
                    </div>
                    <div className="font-medium text-white">{tokenB?.symbol}</div>
                    <div className="text-sm text-gray-400">{tokenB?.name}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white ml-2">{duration} hours</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Min Bet:</span>
                    <span className="text-white ml-2">{minBet} SOL</span>
                  </div>
                </div>

                {description && (
                  <div className="mt-4 pt-4 border-t border-gray-700/50">
                    <div className="text-sm text-gray-400 mb-1">Description:</div>
                    <div className="text-white">{description}</div>
                  </div>
                )}
              </div>

              {/* Important Notice */}
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-yellow-400 mb-1">Important Notice</div>
                    <div className="text-sm text-gray-300">
                      Your war will be submitted for moderation review. It may take a few minutes to hours before it goes live.
                      Wars that violate community guidelines may be rejected.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-6">
              <div className="text-red-400 text-sm">{error}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-700">
          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                Back
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !canProceedToStep2}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleCreateWar}
                disabled={!canCreateWar || isCreating}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Sword className="w-4 h-4" />
                    Create War
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}