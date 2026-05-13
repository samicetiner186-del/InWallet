import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';

const CURRENCIES = [
  { value: 'TRY', symbol: '₺', label: 'Türk Lirası', code: 'TRY' },
  { value: 'USD', symbol: '$', label: 'Amerikan Doları', code: 'USD' },
  { value: 'EUR', symbol: '€', label: 'Euro', code: 'EUR' },
];

const Settings: React.FC = () => {
  const { userId, username, updateUserInfo } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('inwallet_theme') || 'light');
  const [aiNotifications, setAiNotifications] = useState(true);
  const [goalNotifications, setGoalNotifications] = useState(false);
  const [defaultPrivacy, setDefaultPrivacy] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('TRY');
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editMsg, setEditMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('inwallet_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!userId) return;
    userApi.getMe(Number(userId)).then(d => {
      setUserData(d);
      setEditFirstName(d?.firstName || '');
      setEditLastName(d?.lastName || '');
      setEditUsername(d?.username || '');
      setEditEmail(d?.email || '');
    }).catch(() => {});
  }, [userId]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', text: 'Yeni şifreler eşleşmiyor.' });
      return;
    }
    if (newPassword.length < 6) {
      setPwMsg({ type: 'error', text: 'Yeni şifre en az 6 karakter olmalıdır.' });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    try {
      await userApi.changePassword(Number(userId), oldPassword, newPassword);
      setPwMsg({ type: 'success', text: 'Şifre başarıyla güncellendi.' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
      setTimeout(() => setPwMsg(null), 3000);
    } catch (err: any) {
      setPwMsg({ type: 'error', text: err.message || 'Şifre değiştirilemedi.' });
    } finally {
      setPwSaving(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    // Şifre alanı doluysa önce doğrula
    if (oldPassword || newPassword || confirmPassword) {
      if (!oldPassword) { setEditMsg({ type: 'error', text: 'Mevcut şifrenizi girin.' }); return; }
      if (newPassword !== confirmPassword) { setEditMsg({ type: 'error', text: 'Yeni şifreler eşleşmiyor.' }); return; }
      if (newPassword.length < 6) { setEditMsg({ type: 'error', text: 'Yeni şifre en az 6 karakter olmalıdır.' }); return; }
    }

    setEditSaving(true);
    setEditMsg(null);
    try {
      const updated = await userApi.updateMe(Number(userId), {
        firstName: editFirstName,
        lastName: editLastName,
        username: editUsername,
        email: editEmail,
      });
      setUserData(updated);

      // Şifre değiştirme isteği varsa ayrıca gönder
      if (oldPassword && newPassword) {
        await userApi.changePassword(Number(userId), oldPassword, newPassword);
        setOldPassword(''); setNewPassword(''); setConfirmPassword('');
      }

      setIsEditing(false);
      setEditMsg({ type: 'success', text: 'Bilgiler başarıyla güncellendi.' });
      updateUserInfo({
        firstName: updated.firstName || null,
        lastName: updated.lastName || null,
        username: updated.username,
      });
      setTimeout(() => setEditMsg(null), 3000);
    } catch (err: any) {
      setEditMsg({ type: 'error', text: err.message || 'Güncelleme başarısız. Lütfen tekrar deneyin.' });
    } finally {
      setEditSaving(false);
    }
  };

  const fullName = [userData?.firstName, userData?.lastName].filter(Boolean).join(' ');
  const displayName = fullName || userData?.username || username || 'Kullanıcı';
  const displayEmail = userData?.email || '';
  const initials = fullName
    ? (userData.firstName[0] + (userData.lastName?.[0] || '')).toUpperCase()
    : (userData?.username || username || 'IW').slice(0, 2).toUpperCase();

  const activeCurrency = CURRENCIES.find(c => c.value === selectedCurrency) || CURRENCIES[0];

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <div
      onClick={onChange}
      style={{
        width: '50px',
        height: '28px',
        background: checked ? 'var(--accent-blue)' : 'rgba(128,128,128,0.25)',
        borderRadius: '20px',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 0.3s ease',
        boxShadow: checked ? '0 0 10px rgba(59, 130, 246, 0.4)' : 'none',
        flexShrink: 0,
        border: '1px solid ' + (checked ? 'rgba(59,130,246,0.5)' : 'var(--border-color)'),
      }}
    >
      <div style={{
        width: '22px',
        height: '22px',
        background: 'white',
        borderRadius: '50%',
        position: 'absolute',
        top: '2px',
        left: checked ? '25px' : '2px',
        transition: 'left 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
      }} />
    </div>
  );

  return (
    <div className="dashboard-grid">
      <div className="col-span-12 glass-card">
        <div className="card-header" style={{ marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
          <div>
            <span className="card-title" style={{ fontSize: '26px', display: 'block' }}>Ayarlar ve Tercihler</span>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '6px' }}>
              Hesap bilgilerinizi, bildirimlerinizi ve uygulama deneyiminizi yönetin.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>

          {/* Sol Kolon */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Profil Bilgileri */}
            <section>
              <h3 style={{ color: 'var(--accent-blue)', marginBottom: '16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>
                Profil Bilgileri
              </h3>
              <div style={{ background: 'rgba(128,128,128,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: isEditing ? '20px' : 0 }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: 'white', boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)', flexShrink: 0 }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {displayName}
                    </div>
                    {/* Eğer ad soyad varsa kullanıcı adını da göster */}
                    {(userData?.firstName || userData?.lastName) && (
                      <div style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '13px', fontWeight: 500 }}>
                        @{userData?.username}
                      </div>
                    )}
                    {displayEmail && (
                      <div style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {displayEmail}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-green)', fontSize: '12px', fontWeight: 700, marginTop: '6px' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Aktif Üye
                    </div>
                  </div>
                  {/* Bilgileri Düzenle Button */}
                  {!isEditing && (
                    <button
                      onClick={() => { setIsEditing(true); setEditMsg(null); }}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '10px',
                        border: '1.5px solid var(--accent-blue)',
                        background: 'transparent',
                        color: 'var(--accent-blue)',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        flexShrink: 0,
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.1)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                    >
                      Bilgileri Düzenle
                    </button>
                  )}
                </div>

                {/* Feedback message */}
                {editMsg && (
                  <div style={{
                    padding: '10px 14px', borderRadius: '10px', marginBottom: '16px',
                    background: editMsg.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                    border: `1px solid ${editMsg.type === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                    color: editMsg.type === 'success' ? 'var(--accent-green)' : '#ef4444',
                    fontSize: '13px', fontWeight: 600,
                  }}>
                    {editMsg.text}
                  </div>
                )}

                {/* Edit Form */}
                {isEditing && (
                  <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Ad & Soyad — yan yana */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ad</label>
                        <input
                          type="text"
                          value={editFirstName}
                          onChange={e => setEditFirstName(e.target.value)}
                          placeholder="Adınız"
                          style={{
                            width: '100%', padding: '11px 14px', borderRadius: '10px',
                            border: '1.5px solid var(--border-color)',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                            transition: 'border-color 0.2s ease',
                          }}
                          onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent-blue)'; }}
                          onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Soyad</label>
                        <input
                          type="text"
                          value={editLastName}
                          onChange={e => setEditLastName(e.target.value)}
                          placeholder="Soyadınız"
                          style={{
                            width: '100%', padding: '11px 14px', borderRadius: '10px',
                            border: '1.5px solid var(--border-color)',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                            transition: 'border-color 0.2s ease',
                          }}
                          onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent-blue)'; }}
                          onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kullanıcı Adı</label>
                      <input
                        type="text"
                        value={editUsername}
                        onChange={e => setEditUsername(e.target.value)}
                        required
                        style={{
                          width: '100%', padding: '11px 14px', borderRadius: '10px',
                          border: '1.5px solid var(--border-color)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                          transition: 'border-color 0.2s ease',
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent-blue)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>E-posta</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={e => setEditEmail(e.target.value)}
                        style={{
                          width: '100%', padding: '11px 14px', borderRadius: '10px',
                          border: '1.5px solid var(--border-color)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                          transition: 'border-color 0.2s ease',
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent-blue)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                      />
                    </div>
                    {/* Şifre Değiştir — opsiyonel */}
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', marginTop: '2px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Şifre Değiştir (İsteğe Bağlı)</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                          { label: 'Mevcut Şifre', value: oldPassword, setter: setOldPassword, placeholder: 'Boş bırakırsanız şifre değişmez' },
                          { label: 'Yeni Şifre', value: newPassword, setter: setNewPassword, placeholder: 'En az 6 karakter' },
                          { label: 'Yeni Şifre (Tekrar)', value: confirmPassword, setter: setConfirmPassword, placeholder: 'Yeni şifrenizi tekrar girin' },
                        ].map(({ label, value, setter, placeholder }) => (
                          <div key={label}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
                            <input
                              type="password"
                              value={value}
                              onChange={e => setter(e.target.value)}
                              placeholder={placeholder}
                              style={{
                                width: '100%', padding: '11px 14px', borderRadius: '10px',
                                border: '1.5px solid var(--border-color)',
                                background: 'var(--bg-primary)', color: 'var(--text-primary)',
                                fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                                transition: 'border-color 0.2s ease',
                              }}
                              onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent-blue)'; }}
                              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="submit"
                        disabled={editSaving}
                        style={{
                          flex: 1, padding: '11px',
                          borderRadius: '10px',
                          border: 'none',
                          background: editSaving ? 'rgba(59,130,246,0.4)' : 'linear-gradient(135deg, #2563eb, #3b82f6)',
                          color: 'white',
                          fontWeight: 700, fontSize: '14px',
                          cursor: editSaving ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {editSaving ? 'Kaydediliyor...' : 'Kaydet'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setEditMsg(null);
                          setEditFirstName(userData?.firstName || '');
                          setEditLastName(userData?.lastName || '');
                          setEditUsername(userData?.username || '');
                          setEditEmail(userData?.email || '');
                        }}
                        style={{
                          padding: '11px 18px',
                          borderRadius: '10px',
                          border: '1.5px solid var(--border-color)',
                          background: 'transparent',
                          color: 'var(--text-secondary)',
                          fontWeight: 600, fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(128,128,128,0.08)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                      >
                        İptal
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </section>

            {/* Gizlilik */}
            <section>
              <h3 style={{ color: 'var(--accent-blue)', marginBottom: '16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>
                Gizlilik
              </h3>
              <div style={{ background: 'rgba(128,128,128,0.05)', padding: '0 20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Varsayılan Gizlilik Modu</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Uygulama açılışında bakiyeleri gizle (Blur).</div>
                  </div>
                  <ToggleSwitch checked={defaultPrivacy} onChange={() => setDefaultPrivacy(!defaultPrivacy)} />
                </div>
              </div>
            </section>

          </div>

          {/* Sağ Kolon */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Görünüm ve Bildirimler */}
            <section>
              <h3 style={{ color: 'var(--accent-blue)', marginBottom: '16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>
                Görünüm ve Bildirimler
              </h3>
              <div style={{ background: 'rgba(128,128,128,0.05)', padding: '0 20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Koyu Tema</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Arayüzü koyu temada kullanın.</div>
                  </div>
                  <ToggleSwitch checked={theme === 'dark'} onChange={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Yapay Zeka (AI) Uyarıları</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Portföy düşüşlerinde ve fırsatlarda akıllı bildirim.</div>
                  </div>
                  <ToggleSwitch checked={aiNotifications} onChange={() => setAiNotifications(!aiNotifications)} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Hedef Hatırlatıcıları</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Finansal hedefleriniz için haftalık raporlar.</div>
                  </div>
                  <ToggleSwitch checked={goalNotifications} onChange={() => setGoalNotifications(!goalNotifications)} />
                </div>

              </div>
            </section>

            {/* Finansal Ayarlar - Redesigned Currency Selector */}
            <section>
              <h3 style={{ color: 'var(--accent-blue)', marginBottom: '16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>
                Finansal Ayarlar
              </h3>
              <div style={{ background: 'rgba(128,128,128,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Varsayılan Para Birimi</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>Tüm portföy değerlemeleri için baz kur.</div>

                  {/* Custom Currency Dropdown */}
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid var(--border-color)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '15px',
                        fontWeight: 600,
                        transition: 'all 0.2s ease',
                        textAlign: 'left',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-blue)'; }}
                      onMouseLeave={e => { if (!isCurrencyOpen) (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color)'; }}
                    >
                      {/* Currency Symbol Badge */}
                      <span style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'rgba(59,130,246,0.12)',
                        border: '1px solid rgba(59,130,246,0.2)',
                        color: 'var(--accent-blue)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '18px', fontWeight: 900, flexShrink: 0,
                      }}>
                        {activeCurrency.symbol}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{activeCurrency.label}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '1px', fontWeight: 500 }}>{activeCurrency.code}</div>
                      </div>
                      <svg
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ transform: isCurrencyOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', flexShrink: 0 }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {isCurrencyOpen && (
                      <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        left: 0, right: 0,
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        zIndex: 50,
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                      }}>
                        {CURRENCIES.map(cur => (
                          <button
                            key={cur.value}
                            type="button"
                            onClick={() => { setSelectedCurrency(cur.value); setIsCurrencyOpen(false); }}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              border: 'none',
                              background: selectedCurrency === cur.value ? 'rgba(59,130,246,0.08)' : 'transparent',
                              color: 'var(--text-primary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              fontSize: '14px',
                              fontWeight: selectedCurrency === cur.value ? 700 : 500,
                              transition: 'background 0.15s ease',
                              textAlign: 'left',
                            }}
                            onMouseEnter={e => { if (selectedCurrency !== cur.value) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(128,128,128,0.06)'; }}
                            onMouseLeave={e => { if (selectedCurrency !== cur.value) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                          >
                            <span style={{
                              width: '32px', height: '32px', borderRadius: '8px',
                              background: selectedCurrency === cur.value ? 'rgba(59,130,246,0.15)' : 'rgba(128,128,128,0.08)',
                              color: selectedCurrency === cur.value ? 'var(--accent-blue)' : 'var(--text-secondary)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '16px', fontWeight: 900, flexShrink: 0,
                            }}>
                              {cur.symbol}
                            </span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{cur.label}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{cur.code}</div>
                            </div>
                            {selectedCurrency === cur.value && (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
