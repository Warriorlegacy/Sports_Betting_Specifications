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
    getMe: () => request('/auth/me'),
    register: (userData: { username: string; password: string; phone?: string; referralCode?: string }) =>
      request('/auth/register', { method: 'POST', body: JSON.stringify(userData) })
  },
  hierarchy: {
    getTree: () => request('/hierarchy/tree'),
    getSubordinates: () => request('/hierarchy/subordinates'),
    getRoles: () => request('/hierarchy/roles'),
    createUser: (userData: { username: string; password: string; initialCredit?: number; role?: string; parentId?: string }) =>
      request('/hierarchy/users', { method: 'POST', body: JSON.stringify(userData) }),
    toggleStatus: (userId: string, isActive: boolean) =>
      request(`/hierarchy/users/${userId}/status`, { method: 'PATCH', body: JSON.stringify({ isActive }) }),
    resetPassword: (userId: string, newPassword: string) =>
      request(`/hierarchy/users/${userId}/password`, { method: 'PATCH', body: JSON.stringify({ newPassword }) }),
    updateRole: (userId: string, newRole: string) =>
      request(`/hierarchy/users/${userId}/role`, { method: 'PATCH', body: JSON.stringify({ newRole }) })
  },
  paymentMethods: {
    getAll: () => request('/payment-methods/admin'),
    getActive: () => request('/payment-methods'),
    create: (accountData: any) =>
      request('/payment-methods', { method: 'POST', body: JSON.stringify(accountData) }),
    update: (id: string, accountData: any) =>
      request(`/payment-methods/${id}`, { method: 'PUT', body: JSON.stringify(accountData) }),
    delete: (id: string) =>
      request(`/payment-methods/${id}`, { method: 'DELETE' })
  },
  ledger: {
    allocateCredit: (payload: { receiverId: string; amount: number; notes?: string }) =>
      request('/ledger/allocate', { method: 'POST', body: JSON.stringify(payload) }),
    recallCredit: (payload: { receiverId: string; amount: number; notes?: string }) =>
      request('/ledger/recall', { method: 'POST', body: JSON.stringify(payload) }),
    getHistory: (limit: number = 50, offset: number = 0) =>
      request(`/ledger/history?limit=${limit}&offset=${offset}`),
    getDeposits: (status?: string, search?: string, limit: number = 50, offset: number = 0) => {
      let query = `?limit=${limit}&offset=${offset}`;
      if (status && status !== 'ALL') query += `&status=${status}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      return request(`/ledger/deposits${query}`);
    },
    processDeposit: (id: string, action: 'APPROVE' | 'REJECT', notes?: string) =>
      request(`/ledger/deposits/${id}/process`, { method: 'POST', body: JSON.stringify({ action, notes }) }),
    getWithdrawals: (status?: string, limit: number = 50, offset: number = 0) => {
      let query = `?limit=${limit}&offset=${offset}`;
      if (status && status !== 'ALL') query += `&status=${status}`;
      return request(`/ledger/withdrawals${query}`);
    },
    processWithdrawal: (id: string, action: 'APPROVE' | 'REJECT', referenceId?: string, notes?: string) =>
      request(`/ledger/withdrawals/${id}/process`, { method: 'POST', body: JSON.stringify({ action, referenceId, notes }) })
  },
  bets: {
    getRecords: (params: {
      username?: string;
      userId?: string;
      marketId?: string;
      sport?: string;
      type?: string;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
      limit?: number;
      offset?: number;
    } = {}) => {
      const q = new URLSearchParams();
      if (params.username) q.append('username', params.username);
      if (params.userId) q.append('userId', params.userId);
      if (params.marketId) q.append('marketId', params.marketId);
      if (params.sport && params.sport !== 'ALL') q.append('sport', params.sport);
      if (params.type && params.type !== 'ALL') q.append('type', params.type);
      if (params.status && params.status !== 'ALL') q.append('status', params.status);
      if (params.dateFrom) q.append('dateFrom', params.dateFrom);
      if (params.dateTo) q.append('dateTo', params.dateTo);
      if (params.limit) q.append('limit', String(params.limit));
      if (params.offset) q.append('offset', String(params.offset));
      return request(`/bets/records?${q.toString()}`);
    }
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
