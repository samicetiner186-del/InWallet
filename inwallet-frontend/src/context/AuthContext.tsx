import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, getToken } from '../services/api';

interface AuthContextType {
  isLoggedIn: boolean;
  userId: number | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserInfo: (data: { firstName?: string | null; lastName?: string | null; username?: string | null }) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!getToken());
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);

  // Sayfa yenilendiğinde token'dan kullanıcı bilgilerini çöz
  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length !== 3) throw new Error("Geçersiz Token");
        
        // JWT payload'ını decode et (UTF-8 destekli)
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(decodeURIComponent(escape(window.atob(base64))));
        
        setUsername(payload.sub);
        setUserId(Number(payload.userId));
        setIsLoggedIn(true);
        
        // İlk yüklemede ek bilgileri çek
        import('../services/api').then(({ userApi }) => {
          userApi.getMe(Number(payload.userId)).then(data => {
            setFirstName(data.firstName);
            setLastName(data.lastName);
          });
        });
      } catch (err) {
        console.error("Token çözme hatası:", err);
        authApi.logout();
        setIsLoggedIn(false);
      }
    }
  }, []);

  const refreshUser = async () => {
    // userId state gecikmeli olabilir, token'dan direkt oku
    const token = getToken();
    let uid = userId;
    if (!uid && token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(decodeURIComponent(escape(window.atob(base64))));
          uid = Number(payload.userId);
        }
      } catch (_) {}
    }
    if (!uid) return;
    const { userApi } = await import('../services/api');
    const data = await userApi.getMe(uid);
    setUsername(data.username);
    setFirstName(data.firstName || null);
    setLastName(data.lastName || null);
  };

  const updateUserInfo = (data: { firstName?: string | null; lastName?: string | null; username?: string | null }) => {
    if (data.firstName !== undefined) setFirstName(data.firstName || null);
    if (data.lastName !== undefined) setLastName(data.lastName || null);
    if (data.username) setUsername(data.username);
  };

  const login = async (user: string, password: string) => {
    await authApi.login(user, password);
    const token = getToken();
    if (token) {
      const parts = token.split('.');
      if (parts.length === 3) {
        // JWT payload'ını decode et (UTF-8 destekli)
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(decodeURIComponent(escape(window.atob(base64))));
        
        const uid = Number(payload.userId);
        setUsername(payload.sub);
        setUserId(uid);
        setIsLoggedIn(true);

        // Giriş sonrası ad/soyad bilgilerini çek
        const { userApi } = await import('../services/api');
        try {
          const data = await userApi.getMe(uid);
          setFirstName(data.firstName || null);
          setLastName(data.lastName || null);
        } catch (_) {}
      }
    }
  };

  const register = async (user: string, email: string, password: string) => {
    await authApi.register(user, email, password);
  };

  const logout = () => {
    authApi.logout();
    setIsLoggedIn(false);
    setUserId(null);
    setUsername(null);
    setFirstName(null);
    setLastName(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userId, username, firstName, lastName, login, register, logout, refreshUser, updateUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

// Kullanım kolaylığı için hook
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
