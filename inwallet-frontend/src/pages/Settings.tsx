import React, { useState } from 'react';

const Settings: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [aiNotifications, setAiNotifications] = useState(true);
  const [goalNotifications, setGoalNotifications] = useState(false);

  // Reusable Switch Component
  const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <div 
      onClick={onChange}
      style={{
        width: '50px',
        height: '28px',
        background: checked ? 'var(--accent-blue)' : 'rgba(255,255,255,0.2)',
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
        <div className="card-header" style={{ marginBottom: '30px' }}>
          <span className="card-title" style={{ fontSize: '24px' }}>Ayarlar</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          <section>
            <h3 style={{ color: 'var(--accent-blue)', marginBottom: '20px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>Profil Bilgileri</h3>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-neon-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold', color: 'white', boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)' }}>SE</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'white' }}>Sami</div>
                <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>sami@inwallet.app</div>
              </div>
              <button style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 600, transition: 'background 0.3s ease' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
                Profili Düzenle
              </button>
            </div>
          </section>

          <section>
            <h3 style={{ color: 'var(--accent-blue)', marginBottom: '20px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>Görünüm ve Tema</h3>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0 24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 500, color: 'white' }}>Karanlık Mod (Dark Mode)</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Uygulama arayüzünü koyu temada kullanın.</div>
                </div>
                <ToggleSwitch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
              </div>
            </div>
          </section>

          <section>
            <h3 style={{ color: 'var(--accent-blue)', marginBottom: '20px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>Bildirim Tercihleri</h3>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0 24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 500, color: 'white' }}>Yapay Zeka (AI) Uyarıları</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Portföy düşüşlerinde ve fırsatlarda anında uyarılın.</div>
                </div>
                <ToggleSwitch checked={aiNotifications} onChange={() => setAiNotifications(!aiNotifications)} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 500, color: 'white' }}>Hedef Hatırlatıcıları</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Finansal hedeflerinize yaklaştığınızda bildirim alın.</div>
                </div>
                <ToggleSwitch checked={goalNotifications} onChange={() => setGoalNotifications(!goalNotifications)} />
              </div>
              
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Settings;
