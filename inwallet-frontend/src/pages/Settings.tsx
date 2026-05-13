import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';

const CURRENCIES = [
  { value: 'TRY', symbol: '₺', label: 'Türk Lirası', code: 'TRY' },
  { value: 'USD', symbol: '$', label: 'Amerikan Doları', code: 'USD' },
  { value: 'EUR', symbol: '€', label: 'Euro', code: 'EUR' },
];

const Settings: React.FC = () => {
  const { userId } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem('inwallet_theme') || 'light');
  const [aiNotifications, setAiNotifications] = useState(true);
  const [goalNotifications, setGoalNotifications] = useState(false);
  const [defaultPrivacy, setDefaultPrivacy] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('TRY');
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);




  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('inwallet_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!userId) return;
    userApi.getMe(Number(userId)).catch(() => {});
  }, [userId]);





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
