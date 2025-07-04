'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Sword, Trophy, User } from 'lucide-react';

export default function Header() {
  const { connected, publicKey } = useWallet();

  return (
    <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Sword className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">TrenchWars</h1>
              <p className="text-xs text-gray-400">Token Battle Arena</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#wars" className="text-gray-300 hover:text-white transition-colors">
              Active Wars
            </a>
            <a href="#leaderboard" className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1">
              <Trophy className="w-4 h-4" />
              <span>Leaderboard</span>
            </a>
            {connected && (
              <a href="#profile" className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </a>
            )}
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {connected && publicKey && (
              <div className="hidden sm:block text-sm text-gray-400">
                {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
              </div>
            )}
            <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-pink-600 !border-0 !rounded-lg !font-semibold hover:!from-purple-700 hover:!to-pink-700 transition-all" />
          </div>
        </div>
      </div>
    </header>
  );
}