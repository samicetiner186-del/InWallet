import React, { useState } from 'react';

const Settings: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [aiNotifications, setAiNotifications] = useState(true);
  const [goalNotifications, setGoalNotifications] = useState(false);
  
  // New Settings States
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [biometricLogin, setBiometricLogin] = useState(true);
  const [defaultPrivacy, setDefaultPrivacy] = useState(false);

  // Reusable Switch Component
  const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <div 
      onClick={onChange}
      style={{
        width: '50px',
        height: '28px',
        background: checked ? 'var(--accent-blue)' : 'rgba(255,255,255,0.15)',
        borderRadius: '20px',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 0.3s ease',
        boxShadow: checked ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none'
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
        <div className="card-header" style={{ marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
          <div>
            <span className="card-title" style={{ fontSize: '26px', display: 'block', color: 'var(--text-primary)' }}>Ayarlar ve Tercihler</span>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '6px' }}>Hesap güvenliğinizi, bildirimlerinizi ve uygulama deneyiminizi yönetin.</p>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            <section>
              <h3 style={{ color: 'var(--accent-neon-blue)', marginBottom: '16px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>Profil Bilgileri</h3>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-neon-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: 'white', boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)' }}>SE</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>Sami Eren</div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '14px' }}>sami@inwallet.app</div>
                  <div style={{ color: 'var(--accent-green)', fontSize: '12px', fontWeight: 600, marginTop: '6px' }}>✓ Premium Üye</div>
                </div>
                <button style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s ease', fontSize: '13px' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
                  Düzenle
                </button>
              </div>
            </section>

            <section>
              <h3 style={{ color: 'var(--accent-neon-blue)', marginBottom: '16px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>Güvenlik ve Gizlilik</h3>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'white' }}>Biyometrik Giriş (Face ID)</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Uygulamaya girişte yüz tanıma kullan.</div>
                  </div>
                  <ToggleSwitch checked={biometricLogin} onChange={() => setBiometricLogin(!biometricLogin)} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'white' }}>İki Faktörlü Doğrulama (2FA)</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Hesap güvenliğinizi artırmak için SMS onayı.</div>
                  </div>
                  <ToggleSwitch checked={twoFactorAuth} onChange={() => setTwoFactorAuth(!twoFactorAuth)} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'white' }}>Varsayılan Gizlilik Modu</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Uygulama açılışında bakiyeleri gizle (Blur).</div>
                  </div>
                  <ToggleSwitch checked={defaultPrivacy} onChange={() => setDefaultPrivacy(!defaultPrivacy)} />
                </div>

              </div>
            </section>

          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            <section>
              <h3 style={{ color: 'var(--accent-neon-blue)', marginBottom: '16px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>Görünüm ve Bildirimler</h3>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'white' }}>Karanlık Mod (Dark Mode)</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Uygulama arayüzünü koyu temada kullanın.</div>
                  </div>
                  <ToggleSwitch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'white' }}>Yapay Zeka (AI) Uyarıları</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Portföy düşüşlerinde ve fırsatlarda akıllı bildirim.</div>
                  </div>
                  <ToggleSwitch checked={aiNotifications} onChange={() => setAiNotifications(!aiNotifications)} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'white' }}>Hedef Hatırlatıcıları</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Finansal hedefleriniz için haftalık raporlar.</div>
                  </div>
                  <ToggleSwitch checked={goalNotifications} onChange={() => setGoalNotifications(!goalNotifications)} />
                </div>

              </div>
            </section>

            <section>
              <h3 style={{ color: 'var(--accent-neon-blue)', marginBottom: '16px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>Finansal Ayarlar</h3>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'white' }}>Varsayılan Para Birimi</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Tüm portföy değerlemeleri için baz kur.</div>
                  </div>
                  <select style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', outline: 'none' }}>
                    <option value="TRY">₺ Türk Lirası (TRY)</option>
                    <option value="USD">$ Amerikan Doları (USD)</option>
                    <option value="EUR">€ Euro (EUR)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'white' }}>Banka ve Borsa Bağlantıları</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Açık bankacılık ve API anahtarları yönetimi.</div>
                  </div>
                  <button style={{ padding: '6px 12px', background: 'var(--accent-neon-blue)', border: 'none', borderRadius: '8px', color: 'var(--bg-primary)', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>
                    Yönet
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'white' }}>Verileri Dışa Aktar</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Tüm işlemlerinizi Excel (CSV) formatında indirin.</div>
                  </div>
                  <button style={{ padding: '6px 12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>
                    İndir
                  </button>
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
