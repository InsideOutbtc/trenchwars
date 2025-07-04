import { useState, useEffect } from 'react';
import axios from 'axios';

export interface Token {
  id: number;
  symbol: string;
  name: string;
  price: number;
  market_cap: number;
  price_change_24h: number;
}

export interface War {
  id: number;
  token_a_id: number;
  token_b_id: number;
  start_time: string;
  end_time: string;
  total_bets_a: number;
  total_bets_b: number;
  is_settled: boolean;
  winner?: number;
  token_a: Token;
  token_b: Token;
}

export interface WarStats {
  total_bets_a: number;
  total_bets_b: number;
  total_pool: number;
  total_bets: number;
  unique_bettors: number;
  odds_a: number;
  odds_b: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://cryptocolosseum-api-v2.onrender.com/api';

export function useActiveWars() {
  const [wars, setWars] = useState<War[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWars() {
      try {
        // Add timeout and retry logic for Render wake-up
        const response = await axios.get(`${API_BASE}/wars/active`, {
          timeout: 60000, // 60 second timeout for Render wake-up
        });
        setWars(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch active wars');
        console.error('Error fetching wars:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchWars();
    
    // Refresh every 30 seconds (also keeps Render awake)
    const interval = setInterval(fetchWars, 30000);
    return () => clearInterval(interval);
  }, []);

  return { wars, loading, error, refetch: () => window.location.reload() };
}

export function useWarStats(warId: number) {
  const [stats, setStats] = useState<WarStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!warId) return;

    async function fetchStats() {
      try {
        const response = await axios.get(`${API_BASE}/wars/${warId}/stats`);
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching war stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
    
    // Refresh every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [warId]);

  return { stats, loading };
}

export function useTokens() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTokens() {
      try {
        const response = await axios.get(`${API_BASE}/prices/tokens`);
        setTokens(response.data);
      } catch (err) {
        console.error('Error fetching tokens:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTokens();
  }, []);

  return { tokens, loading };
}