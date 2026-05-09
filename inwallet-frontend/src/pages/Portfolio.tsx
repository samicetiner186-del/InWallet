import React from 'react';

const Portfolio: React.FC = () => {
  const assets = [
    { name: 'Hisse Senedi (BIST 100)', amount: '₺55,000.00', profit: '+%8.4', color: '#00d2ff' },
    { name: 'Altın (Gram)', amount: '₺45,000.00', profit: '+%3.2', color: '#f59e0b' },
    { name: 'Kripto (BTC, ETH)', amount: '₺14,500.00', profit: '-%1.5', color: '#8b5cf6' },
    { name: 'Döviz (USD)', amount: '₺10,000.00', profit: '+%0.8', color: '#10b981' },
  ];

  return (
    <div className="dashboard-grid">
      <div className="col-span-12 glass-card">
        <div className="card-header">
          <span className="card-title" style={{ fontSize: '24px' }}>Detaylı Portföyüm</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
          {assets.map((asset, index) => (
            <div 
              key={index} 
              style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '20px', 
                background: 'rgba(255,255,255,0.03)', 
                borderRadius: '12px',
                borderLeft: `4px solid ${asset.color}`
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>{asset.name}</h4>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Anlık Değerleme</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{asset.amount}</div>
                <div style={{ color: asset.profit.startsWith('+') ? 'var(--success)' : 'var(--danger)', fontSize: '14px' }}>
                  {asset.profit} (Son 30 Gün)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
