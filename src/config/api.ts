// API Configuration
export const API_BASE_URL = 'https://api.trenchwars.wtf/api';

export const API_ENDPOINTS = {
  wars: {
    active: `${API_BASE_URL}/wars/active`,
    all: `${API_BASE_URL}/wars`,
    byId: (id: number) => `${API_BASE_URL}/wars/${id}`,
    stats: (id: number) => `${API_BASE_URL}/wars/${id}/stats`,
  },
  bets: `${API_BASE_URL}/bets`,
  prices: `${API_BASE_URL}/prices`,
  users: `${API_BASE_URL}/users`,
};