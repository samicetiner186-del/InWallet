import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';

const Settings: React.FC = () => {
  const { userId, username } = useAuth();
  const [userData, setUserData] = useState<any>(null);

  // Tema: varsayılan açık (light)
  const [theme, setTheme] = useState(() => localStorage.getItem('inwallet_theme') || 'light');
  const [aiNotifications, setAiNotifications] = useState(true);
  const [goalNotifications, setGoalNotifications] = useState(false);
  const [defaultPrivacy, setDefaultPrivacy] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('inwallet_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!userId) return;
    userApi.getMe(Number(userId)).then(setUserData).catch(() => {});
  }, [userId]);

  const displayName = userData?.username || username || 'Kullanıcı';
  const displayEmail = userData?.email || '';
  const initials = displayName.slice(0, 2).toUpperCase();

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <div
      onClick={onChange}
      style={{
        width: '50px',
        height: '28px',
        background: checked ? 'var(--accent-blue)' : 'rgba(128,128,128,0.3)',
        borderRadius: '20px',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 0.3s ease',
        boxShadow: checked ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none',
        flexShrink: 0,
      }}
    >
      <div style={{
        width: '24px',
        height: '24px',
        background: 'white',
        borderRadius: '50%',
        position: 'absolute',
        top: '2px',
        left: checked ? '24px' : '2px',
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
              <h3 style={{ color: 'var(--accent-neon-blue)', marginBottom: '16px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>
                Profil Bilgileri
              </h3>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', background: 'rgba(128,128,128,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-neon-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: 'white', boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)', flexShrink: 0 }}>
                  {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayName}
                  </div>
                  {displayEmail && (
                    <div style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {displayEmail}
                    </div>
                  )}
                  <div style={{ color: 'var(--accent-green)', fontSize: '12px', fontWeight: 600, marginTop: '6px' }}>
                    ✓ Aktif Üye
                  </div>
                </div>
              </div>
            </section>

            {/* Gizlilik */}
            <section>
              <h3 style={{ color: 'var(--accent-neon-blue)', marginBottom: '16px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>
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
              <h3 style={{ color: 'var(--accent-neon-blue)', marginBottom: '16px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>
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

            {/* Finansal Ayarlar */}
            <section>
              <h3 style={{ color: 'var(--accent-neon-blue)', marginBottom: '16px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>
                Finansal Ayarlar
              </h3>
              <div style={{ background: 'rgba(128,128,128,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Varsayılan Para Birimi</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Tüm portföy değerlemeleri için baz kur.</div>
                  </div>
                  <select style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', outline: 'none' }}>
                    <option value="TRY">₺ Türk Lirası (TRY)</option>
                    <option value="USD">$ Amerikan Doları (USD)</option>
                    <option value="EUR">€ Euro (EUR)</option>
                  </select>
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
