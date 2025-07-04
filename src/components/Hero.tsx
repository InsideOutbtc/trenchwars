'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Zap, TrendingUp, Users, Shield } from 'lucide-react';

export default function Hero() {
  const { connected } = useWallet();

  return (
    <section className="relative py-20 px-4 text-center">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-6xl mx-auto">
        <div className="space-y-8">
          {/* Main heading */}
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Crypto Meme Wars
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Battle of the tokens! Bet on which crypto will have the biggest gains in epic weekly wars.
            </p>
          </div>

          {/* CTA */}
          {!connected ? (
            <div className="space-y-4">
              <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-pink-600 !border-0 !rounded-xl !px-8 !py-4 !text-lg !font-bold hover:!from-purple-700 hover:!to-pink-700 !transition-all !transform hover:!scale-105" />
              <p className="text-sm text-gray-400">Connect your wallet to start betting</p>
            </div>
          ) : (
            <div className="space-y-4">
              <button 
                onClick={() => document.getElementById('wars')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
              >
                View Active Wars
              </button>
              <p className="text-sm text-gray-400">Ready to battle! Choose your tokens below.</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Zap className="w-8 h-8 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-sm text-gray-400">Active Battles</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">$500K+</div>
              <div className="text-sm text-gray-400">Total Volume</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">10K+</div>
              <div className="text-sm text-gray-400">Warriors</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Shield className="w-8 h-8 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-white">Audited</div>
              <div className="text-sm text-gray-400">Smart Contracts</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}