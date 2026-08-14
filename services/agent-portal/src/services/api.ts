const API_BASE = (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api');

export function getAuthToken(): string | null {
  return localStorage.getItem('exchange_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('exchange_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('exchange_token');
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
  hierarchy: {
    getTree: () => request('/hierarchy/tree'),
    getSubordinates: () => request('/hierarchy/subordinates'),
    createUser: (userData: { username: string; password: string; initialCredit?: number; role?: string }) =>
      request('/hierarchy/users', { method: 'POST', body: JSON.stringify(userData) }),
    toggleStatus: (userId: string, isActive: boolean) =>
      request(`/hierarchy/users/${userId}/status`, { method: 'PATCH', body: JSON.stringify({ isActive }) })
  },
  ledger: {
    allocateCredit: (payload: { receiverId: string; amount: number; notes?: string }) =>
      request('/ledger/allocate', { method: 'POST', body: JSON.stringify(payload) }),
    recallCredit: (payload: { receiverId: string; amount: number; notes?: string }) =>
      request('/ledger/recall', { method: 'POST', body: JSON.stringify(payload) }),
    getHistory: (limit: number = 50, offset: number = 0) =>
      request(`/ledger/history?limit=${limit}&offset=${offset}`)
  },
  markets: {
    getAll: () => request('/markets'),
    getDetails: (marketId: string) => request(`/markets/${marketId}`),
    createMarket: (marketData: any) =>
      request('/markets', { method: 'POST', body: JSON.stringify(marketData) }),
    toggleLock: (marketId: string, isLocked: boolean) =>
      request(`/markets/${marketId}/lock`, { method: 'POST', body: JSON.stringify({ isLocked }) }),
    settle: (marketId: string, winningSelectionId: number) =>
      request(`/markets/${marketId}/settle`, { method: 'POST', body: JSON.stringify({ winningSelectionId }) })
  },
  reports: {
    getRiskSummary: () => request('/reports/risk-summary')
  }
};
