import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="dashboard-grid">
      <div className="col-span-12 glass-card">
        <div className="card-header">
          <span className="card-title" style={{ fontSize: '24px' }}>Ayarlar</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '20px' }}>
          
          <section>
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Profil Bilgileri</h3>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-neon-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>YM</div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Yuşa</div>
                <div style={{ color: 'var(--text-muted)' }}>yusa@inwallet.app</div>
                <button style={{ marginTop: '8px', padding: '6px 12px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>Profili Düzenle</button>
              </div>
            </div>
          </section>

          <section>
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Görünüm</h3>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="radio" name="theme" value="dark" defaultChecked />
                Dark Mode (Varsayılan)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', opacity: 0.5 }}>
                <input type="radio" name="theme" value="light" disabled />
                Light Mode (Yakında)
              </label>
            </div>
          </section>

          <section>
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Bildirimler</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked />
              <span>Yapay Zeka (AI) Önerileri ve Portföy Uyarıları</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked />
              <span>Hedeflere Yaklaşma Bildirimleri</span>
            </label>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Settings;
