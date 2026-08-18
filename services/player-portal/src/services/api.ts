const DEFAULT_BACKEND_URL = 'https://sports-exchange-backend-j1aj.onrender.com';

const getApiBase = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '') + '/api';
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
  }
  return `${DEFAULT_BACKEND_URL}/api`;
};

const API_BASE = getApiBase();

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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      signal: options.signal || controller.signal,
      headers
    });

    clearTimeout(timeoutId);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `HTTP error ${response.status}`);
    }

    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export const api = {
  auth: {
    login: (credentials: { username: string; password: string }) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData: { username: string; password: string; phone?: string; referralCode?: string }) =>
      request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getMe: () => request('/auth/me')
  },
  paymentMethods: {
    getActive: () => request('/payment-methods')
  },
  markets: {
    getAll: () => request('/markets'),
    getDetails: (marketId: string) => request(`/markets/${marketId}`),
    getLiveTelemetry: () => request('/markets/live/telemetry'),
    getTelemetry: (marketId: string) => request(`/markets/telemetry/${marketId}`),
    syncRealFeed: () => request('/markets/real-feed/sync', { method: 'POST' })
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
    getHistory: (limit: number = 20) => request(`/ledger/history?limit=${limit}`),
    submitDepositRequest: (payload: {
      amount: number;
      paymentMethod: string;
      utrReference: string;
      depositAccountId?: string;
      proofImageUrl?: string;
      proofUrl?: string;
    }) => request('/ledger/deposit-request', { method: 'POST', body: JSON.stringify(payload) }),
    requestWithdrawal: (payload: {
      amount: number;
      payoutMethod: 'BANK' | 'UPI' | 'CRYPTO';
      accountDetails: Record<string, any>;
    }) => request('/ledger/withdraw', { method: 'POST', body: JSON.stringify(payload) }),
    getMyDeposits: () => request('/ledger/my-deposits'),
    getMyWithdrawals: () => request('/ledger/my-withdrawals')
  }
};
