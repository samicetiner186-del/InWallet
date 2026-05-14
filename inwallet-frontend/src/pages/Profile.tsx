import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';

const Profile: React.FC = () => {
  const { userId, updateUserInfo } = useAuth();
  
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!userId) return;
    userApi.getMe(Number(userId)).then(d => {
      setEditFirstName(d?.firstName || '');
      setEditLastName(d?.lastName || '');
      setEditUsername(d?.username || '');
      setEditEmail(d?.email || '');
    }).catch(() => {});
  }, [userId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (oldPassword || newPassword || confirmPassword) {
      if (!oldPassword) { setMsg({ type: 'error', text: 'Mevcut şifrenizi girin.' }); return; }
      if (newPassword !== confirmPassword) { setMsg({ type: 'error', text: 'Yeni şifreler eşleşmiyor.' }); return; }
      if (newPassword.length < 6) { setMsg({ type: 'error', text: 'Yeni şifre en az 6 karakter olmalıdır.' }); return; }
    }

    setIsSaving(true);
    setMsg(null);
    try {
      const updated = await userApi.updateMe(Number(userId), {
        firstName: editFirstName,
        lastName: editLastName,
        username: editUsername,
        email: editEmail,
      });

      if (oldPassword && newPassword) {
        await userApi.changePassword(Number(userId), oldPassword, newPassword);
        setOldPassword(''); setNewPassword(''); setConfirmPassword('');
      }

      setMsg({ type: 'success', text: 'Bilgiler başarıyla güncellendi.' });
      updateUserInfo({
        firstName: updated.firstName || null,
        lastName: updated.lastName || null,
        username: updated.username,
      });
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Güncelleme başarısız.' });
    } finally {
      setIsSaving(false);
    }
  };

  const initials = ((editFirstName[0] || '') + (editLastName[0] || '') || editUsername[0] || 'U').toUpperCase();
  const fullName = [editFirstName, editLastName].filter(Boolean).join(' ') || editUsername || 'Kullanıcı';

  return (
    <div className="dashboard-grid animate-fade-in">

      {/* Page Header */}
      <div className="col-span-12" style={{ marginBottom: '8px' }}>
        <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>Profil Ayarları</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '14px' }}>
          Hesap bilgilerinizi ve şifrenizi buradan güncelleyebilirsiniz.
        </p>
      </div>

      {/* Avatar Card */}
      <div className="col-span-12 glass-card" style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '28px' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-blue), #6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '32px', fontWeight: 800, color: 'white',
          flexShrink: 0,
          boxShadow: '0 8px 24px rgba(59,130,246,0.35)',
        }}>
          {initials}
        </div>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>{fullName}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>{editEmail}</div>
          <div style={{
            display: 'inline-block',
            marginTop: '8px',
            padding: '3px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            background: 'rgba(59,130,246,0.12)',
            color: 'var(--accent-blue)',
            border: '1px solid rgba(59,130,246,0.2)',
          }}>
            @{editUsername}
          </div>
        </div>
      </div>

      {/* Alert Message */}
      {msg && (
        <div className="col-span-12" style={{
          padding: '14px 20px',
          borderRadius: '14px',
          background: msg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${msg.type === 'success' ? 'var(--accent-green)' : '#ef4444'}`,
          color: msg.type === 'success' ? 'var(--accent-green)' : '#ef4444',
          fontWeight: 600,
          fontSize: '14px',
        }}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'contents' }}>

        {/* Personal Info Section */}
        <div className="col-span-12 glass-card" style={{ padding: '28px' }}>
          <div style={{
            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '1px', color: 'var(--accent-blue)',
            marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            Kişisel Bilgiler
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '8px' }}>Ad</label>
              <input
                type="text" value={editFirstName} onChange={e => setEditFirstName(e.target.value)}
                placeholder="Adınız"
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '12px',
                  border: '1.5px solid var(--border-color)',
                  background: 'var(--bg-primary)', color: 'var(--text-primary)',
                  fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '8px' }}>Soyad</label>
              <input
                type="text" value={editLastName} onChange={e => setEditLastName(e.target.value)}
                placeholder="Soyadınız"
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '12px',
                  border: '1.5px solid var(--border-color)',
                  background: 'var(--bg-primary)', color: 'var(--text-primary)',
                  fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '8px' }}>Kullanıcı Adı</label>
              <input
                type="text" value={editUsername} onChange={e => setEditUsername(e.target.value)} required
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '12px',
                  border: '1.5px solid var(--border-color)',
                  background: 'var(--bg-primary)', color: 'var(--text-primary)',
                  fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '8px' }}>E-Posta</label>
              <input
                type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '12px',
                  border: '1.5px solid var(--border-color)',
                  background: 'var(--bg-primary)', color: 'var(--text-primary)',
                  fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="col-span-12 glass-card" style={{ padding: '28px' }}>
          <div style={{
            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '1px', color: '#f59e0b',
            marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Şifre Değiştir
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', marginTop: '-10px' }}>
            Şifrenizi değiştirmek istemiyorsanız alanları boş bırakın.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '8px' }}>Mevcut Şifre</label>
              <input
                type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)}
                placeholder="Mevcut şifreniz"
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '12px',
                  border: '1.5px solid var(--border-color)',
                  background: 'var(--bg-primary)', color: 'var(--text-primary)',
                  fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={e => e.target.style.borderColor = '#f59e0b'}
                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '8px' }}>Yeni Şifre</label>
              <input
                type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="En az 6 karakter"
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '12px',
                  border: '1.5px solid var(--border-color)',
                  background: 'var(--bg-primary)', color: 'var(--text-primary)',
                  fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={e => e.target.style.borderColor = '#f59e0b'}
                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '8px' }}>Yeni Şifre (Tekrar)</label>
              <input
                type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Şifreyi tekrarlayın"
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '12px',
                  border: '1.5px solid var(--border-color)',
                  background: 'var(--bg-primary)', color: 'var(--text-primary)',
                  fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={e => e.target.style.borderColor = '#f59e0b'}
                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="col-span-12" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary"
            style={{ padding: '13px 36px', fontSize: '15px', fontWeight: 700, opacity: isSaving ? 0.7 : 1 }}
          >
            {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default Profile;
