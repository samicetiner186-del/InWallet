import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, getToken } from '../services/api';

interface AuthContextType {
  isLoggedIn: boolean;
  userId: number | null;
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!getToken());
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  // Sayfa yenilendiğinde token'dan kullanıcı bilgilerini çöz
  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        // JWT payload'ını decode et (base64)
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUsername(payload.sub);
        setUserId(1); // Geliştirme aşamasında userId=1, ileride /api/me endpoint'i ile alınacak
        setIsLoggedIn(true);
      } catch {
        authApi.logout();
        setIsLoggedIn(false);
      }
    }
  }, []);

  const login = async (user: string, password: string) => {
    await authApi.login(user, password);
    const token = getToken()!;
    const payload = JSON.parse(atob(token.split('.')[1]));
    setUsername(payload.sub);
    setUserId(1);
    setIsLoggedIn(true);
  };

  const register = async (user: string, email: string, password: string) => {
    await authApi.register(user, email, password);
  };

  const logout = () => {
    authApi.logout();
    setIsLoggedIn(false);
    setUserId(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userId, username, login, register, logout }}>
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
