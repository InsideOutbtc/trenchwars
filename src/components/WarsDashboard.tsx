'use client';

import { useActiveWars } from '@/hooks/useWar';
import WarCard from './WarCard';
import SocialFeed from './SocialFeed';
import TrendingHashtags from './TrendingHashtags';
import { Clock, Sword } from 'lucide-react';

export default function WarsDashboard() {
  const { wars, loading, error } = useActiveWars();

  if (loading) {
    return (
      <section id="wars" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Active Wars</h2>
            <p className="text-gray-400">Loading current battles...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="wars" className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Wars</h2>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="wars" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center space-x-3 mb-4">
            <Sword className="w-8 h-8 text-purple-400" />
            <h2 className="text-4xl font-bold text-white">Active Wars</h2>
            <Sword className="w-8 h-8 text-purple-400 scale-x-[-1]" />
          </div>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose your champion and bet on which token will dominate the battlefield!
          </p>
        </div>

        {/* Wars Grid */}
        {wars.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No Active Wars</h3>
            <p className="text-gray-500">New battles will begin soon. Check back later!</p>
          </div>
        ) : (
          <>
            {/* Main Wars Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {wars.map((war) => (
                    <WarCard key={war.id} war={war} />
                  ))}
                </div>
              </div>
              
              {/* Social Sidebar */}
              <div className="space-y-6">
                <TrendingHashtags />
                <SocialFeed warId={wars[0]?.id?.toString() || '1'} />
              </div>
            </div>
          </>
        )}

        {/* How it works */}
        <div className="mt-20 bg-gray-800/50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white text-center mb-8">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h4 className="text-lg font-semibold text-white mb-2">Choose Your Fighter</h4>
              <p className="text-gray-400">Select which token you think will have the bigger price increase</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h4 className="text-lg font-semibold text-white mb-2">Place Your Bet</h4>
              <p className="text-gray-400">Bet SOL on your chosen token and join the battle</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h4 className="text-lg font-semibold text-white mb-2">Claim Victory</h4>
              <p className="text-gray-400">If your token wins, claim your share of the prize pool!</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}