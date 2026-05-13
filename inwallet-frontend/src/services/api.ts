// API Base URL - tüm backend istekleri buradan geçer
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const AI_URL = import.meta.env.VITE_AI_BASE_URL || '';

// ─── Auth Token Yönetimi ────────────────────────────────
export const getToken = (): string | null => localStorage.getItem('inwallet_token');
export const setToken = (token: string) => localStorage.setItem('inwallet_token', token);
export const removeToken = () => localStorage.removeItem('inwallet_token');

export const getRefreshToken = (): string | null => localStorage.getItem('inwallet_refresh');
export const setRefreshToken = (token: string) => localStorage.setItem('inwallet_refresh', token);
export const removeRefreshToken = () => localStorage.removeItem('inwallet_refresh');

// Merkezi İstek Helper'ı (Refresh Token Mantığı İçeren)
const request = async (url: string, options: any = {}) => {
  let res = await fetch(url, options);

  // Eğer 401 (Unauthorized) dönerse, token'ı yenilemeyi dene
  if (res.status === 401) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setToken(data.token);
          setRefreshToken(data.refreshToken);

          // Orijinal isteği yeni token ile tekrarla
          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${data.token}`,
          };
          res = await fetch(url, options);
        } else {
          // Refresh token da geçersizse logout yap
          authApi.logout();
          window.location.href = '/login';
        }
      } catch (err) {
        authApi.logout();
        window.location.href = '/login';
      }
    }
  }
  return res;
};

// Yetkilendirilmiş HTTP başlıkları
const authHeaders = (isPost = true) => {
  const headers: any = {
    Authorization: `Bearer ${getToken()}`,
  };
  if (isPost) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

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
    setRefreshToken(data.refreshToken);
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

  logout: () => {
    removeToken();
    removeRefreshToken();
  },
};

// ─── User / Portfolio Endpoints ─────────────────────────
export const userApi = {
  getMe: async (userId: number) => {
    const res = await request(`${BASE_URL}/api/users/${userId}`, { headers: authHeaders(false) });
    if (!res.ok) throw new Error('Kullanıcı bilgileri alınamadı.');
    return res.json();
  },

  updateMe: async (userId: number, userData: object) => {
    const res = await request(`${BASE_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error('Kullanıcı bilgileri güncellenemedi.');
    return res.json();
  },
};

export const assetApi = {
  getAssets: async (userId: number) => {
    const res = await request(`${BASE_URL}/api/assets/user/${userId}`, { headers: authHeaders(false) });
    if (!res.ok) throw new Error('Varlık bilgileri alınamadı.');
    return res.json();
  },

  createAsset: async (asset: object) => {
    const res = await request(`${BASE_URL}/api/assets`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(asset),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Varlık eklenemedi.');
    }
    return res.json();
  },

  deleteAsset: async (assetId: number) => {
    const res = await request(`${BASE_URL}/api/assets/${assetId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Varlık silinemedi.');
    return true;
  },
};

export const transactionApi = {
  getTransactions: async (userId: number) => {
    const res = await request(`${BASE_URL}/api/transactions/user/${userId}`, { headers: authHeaders(false) });
    if (!res.ok) throw new Error('İşlem geçmişi alınamadı.');
    return res.json();
  },

  createTransaction: async (transaction: object) => {
    const res = await request(`${BASE_URL}/api/transactions`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(transaction),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'İşlem oluşturulamadı.');
    }
    return res.json();
  },

  deleteTransaction: async (id: number) => {
    const res = await request(`${BASE_URL}/api/transactions/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('İşlem silinemedi.');
    return true;
  },
};

export const goalApi = {
  getGoals: async (userId: number) => {
    const res = await request(`${BASE_URL}/api/goals/user/${userId}`, { headers: authHeaders(false) });
    if (!res.ok) throw new Error('Hedefler alınamadı.');
    return res.json();
  },

  createGoal: async (goal: object) => {
    const res = await request(`${BASE_URL}/api/goals`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(goal),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Hedef oluşturulamadı.');
    }
    return res.json();
  },

  deleteGoal: async (goalId: number) => {
    const res = await request(`${BASE_URL}/api/goals/${goalId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Hedef silinemedi.');
    return true;
  },

  updateGoal: async (goalId: number, goal: object) => {
    const res = await request(`${BASE_URL}/api/goals/${goalId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(goal),
    });
    if (!res.ok) throw new Error('Hedef güncellenemedi.');
    return res.json();
  },

  updateGoalProgress: async (goalId: number, amount: number) => {
    const res = await request(`${BASE_URL}/api/goals/${goalId}/add-progress?amount=${amount}`, {
      method: 'POST',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Birikim eklenemedi.');
    return res.json();
  },
};

// ─── AI Assistant Endpoint ──────────────────────────────
export const aiApi = {
  chat: async (userId: number, message: string) => {
    const res = await request(`${AI_URL}/api/ai/chat?userId=${userId}&message=${encodeURIComponent(message)}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('AI yanıt veremedi.');
    return res.text();
  },

  chatWithAudio: async (userId: number, audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice.webm');
    formData.append('userId', userId.toString());

    const res = await fetch(`${AI_URL}/api/ai/chat/audio`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('AI sesli yanıt veremedi.');
    return res.blob();
  },
};

// ─── Market Data Endpoint ────────────────────────────────
export const marketApi = {
  getPrices: async () => {
    const res = await request(`${BASE_URL}/api/market/prices`);
    if (!res.ok) throw new Error('Piyasa verileri alınamadı.');
    return res.json();
  },
};
