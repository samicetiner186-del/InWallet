// API Base URL - tüm backend istekleri buradan geçer
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const AI_URL = import.meta.env.VITE_AI_BASE_URL || 'http://localhost:8081';

// ─── Auth Token Yönetimi ────────────────────────────────
export const getToken = (): string | null => localStorage.getItem('inwallet_token');
export const setToken = (token: string) => localStorage.setItem('inwallet_token', token);
export const removeToken = () => localStorage.removeItem('inwallet_token');

// Yetkilendirilmiş HTTP başlıkları
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

// ─── Auth Endpoints ────────────────────────────────────
export const authApi = {
  login: async (username: string, password: string) => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error('Giriş başarısız. Kullanıcı adı veya şifre hatalı.');
    const data = await res.json();
    setToken(data.token);
    return data;
  },

  register: async (username: string, email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    if (!res.ok) throw new Error('Kayıt başarısız. Kullanıcı adı zaten kullanılıyor olabilir.');
    return res.json();
  },

  logout: () => removeToken(),
};

// ─── User / Portfolio Endpoints ─────────────────────────
export const userApi = {
  getMe: async (userId: number) => {
    const res = await fetch(`${BASE_URL}/api/users/${userId}`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Kullanıcı bilgileri alınamadı.');
    return res.json();
  },
};

export const assetApi = {
  getAssets: async (userId: number) => {
    const res = await fetch(`${BASE_URL}/api/assets/user/${userId}`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Varlık bilgileri alınamadı.');
    return res.json();
  },

  createAsset: async (asset: object) => {
    const res = await fetch(`${BASE_URL}/api/assets`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(asset),
    });
    if (!res.ok) throw new Error('Varlık eklenemedi.');
    return res.json();
  },
};

export const transactionApi = {
  getTransactions: async (userId: number) => {
    const res = await fetch(`${BASE_URL}/api/transactions/user/${userId}`, { headers: authHeaders() });
    if (!res.ok) throw new Error('İşlem geçmişi alınamadı.');
    return res.json();
  },

  createTransaction: async (transaction: object) => {
    const res = await fetch(`${BASE_URL}/api/transactions`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(transaction),
    });
    if (!res.ok) throw new Error('İşlem oluşturulamadı.');
    return res.json();
  },
};

export const goalApi = {
  getGoals: async (userId: number) => {
    const res = await fetch(`${BASE_URL}/api/goals/user/${userId}`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Hedefler alınamadı.');
    return res.json();
  },

  createGoal: async (goal: object) => {
    const res = await fetch(`${BASE_URL}/api/goals`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(goal),
    });
    if (!res.ok) throw new Error('Hedef oluşturulamadı.');
    return res.json();
  },
};

// ─── AI Assistant Endpoint ──────────────────────────────
export const aiApi = {
  chat: async (userId: number, message: string) => {
    const res = await fetch(`${AI_URL}/api/ai/chat?userId=${userId}&message=${encodeURIComponent(message)}`);
    if (!res.ok) throw new Error('AI yanıt veremedi.');
    return res.text();
  },
};

// ─── Market Data Endpoint ────────────────────────────────
export const marketApi = {
  getPrices: async () => {
    const res = await fetch(`${BASE_URL}/api/market/prices`);
    if (!res.ok) throw new Error('Piyasa verileri alınamadı.');
    return res.json();
  },
};
