const API_BASE = (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api');

export function getAuthToken(): string | null {
  return localStorage.getItem('exchange_player_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('exchange_player_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('exchange_player_token');
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data;
}

export const api = {
  auth: {
    login: (credentials: { username: string; password: string }) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    getMe: () => request('/auth/me')
  },
  markets: {
    getAll: () => request('/markets'),
    getDetails: (marketId: string) => request(`/markets/${marketId}`),
    getLiveTelemetry: () => request('/markets/live/telemetry'),
    getTelemetry: (marketId: string) => request(`/markets/telemetry/${marketId}`)
  },

  bets: {
    placeBet: (betData: { marketId: string; selectionId: number; type: 'BACK' | 'LAY'; price: number; stake: number }) =>
      request('/bets', { method: 'POST', body: JSON.stringify(betData) }),
    cancelBet: (betId: string) =>
      request(`/bets/${betId}/cancel`, { method: 'POST' }),
    getMyBets: (marketId?: string, status?: string) => {
      let query = '';
      if (marketId) query += `?marketId=${marketId}`;
      if (status) query += `${query ? '&' : '?'}status=${status}`;
      return request(`/bets/my-bets${query}`);
    },
    getMarketExposure: (marketId: string) =>
      request(`/bets/market/${marketId}/exposure`)
  },
  ledger: {
    getHistory: (limit: number = 20) => request(`/ledger/history?limit=${limit}`)
  }
};
