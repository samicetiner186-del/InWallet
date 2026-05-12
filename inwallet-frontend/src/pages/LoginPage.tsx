import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(form.username, form.email, form.password);
        setIsRegister(false);
        setError('');
        alert('Kayıt başarılı! Giriş yapabilirsiniz.');
      } else {
        await login(form.username, form.password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '48px 40px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="app-logo heading-gradient" style={{ fontSize: '2.4rem', marginBottom: '8px' }}>InWallet</div>
          <div className="text-muted" style={{ fontSize: '0.95rem' }}>
            {isRegister ? 'Hesap oluşturun' : 'Portföyünüze giriş yapın'}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="text-muted" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Kullanıcı Adı</label>
            <input
              type="text"
              required
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="kullaniciadi"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-primary)', fontSize: '1rem', boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          {isRegister && (
            <div>
              <label className="text-muted" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>E-Posta</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="ornek@mail.com"
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text-primary)', fontSize: '1rem', boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>
          )}

          <div>
            <label className="text-muted" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Şifre</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-primary)', fontSize: '1rem', boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <div style={{ color: 'var(--danger)', fontSize: '0.85rem', padding: '10px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-neon-blue))',
              color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '8px', opacity: loading ? 0.7 : 1, transition: 'all 0.3s',
            }}
          >
            {loading ? '⏳ Bekleniyor...' : (isRegister ? 'Kayıt Ol' : 'Giriş Yap')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <span className="text-muted" style={{ fontSize: '0.9rem' }}>
            {isRegister ? 'Zaten hesabın var mı? ' : 'Hesabın yok mu? '}
          </span>
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--accent-neon-blue)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
          >
            {isRegister ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
