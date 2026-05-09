import React, { useState } from 'react';
import AssetChartModal from '../components/AssetChartModal';

const watchListMock = [
  { id: 1, symbol: 'THYAO.IS', name: 'Türk Hava Yolları', price: '₺294.50', change: '+%2.4', type: 'BIST 100', color: '#3b82f6' },
  { id: 2, symbol: 'XAU/USD', name: 'Ons Altın', price: '$2,345.10', change: '+%0.8', type: 'Maden', color: '#facc15' },
  { id: 3, symbol: 'XAG/USD', name: 'Gümüş', price: '$29.40', change: '-%1.2', type: 'Maden', color: '#cbd5e1' },
  { id: 4, symbol: 'AAPL', name: 'Apple Inc.', price: '$189.20', change: '+%1.5', type: 'ABD Borsa', color: '#a855f7' },
  { id: 5, symbol: 'NVDA', name: 'Nvidia Corp.', price: '$942.30', change: '+%4.2', type: 'ABD Borsa', color: '#10b981' },
  { id: 6, symbol: 'EREGL.IS', name: 'Ereğli Demir Çelik', price: '₺45.60', change: '-%0.5', type: 'BIST 100', color: '#ef4444' },
];

const Favorites: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  return (
    <div className="dashboard-grid">
      <div className="col-span-12 glass-card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
          <div>
            <span className="card-title" style={{ fontSize: '26px', display: 'block', color: 'var(--text-primary)' }}>İzleme Listesi (Favoriler)</span>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '6px' }}>
              Satın almadan piyasa hareketlerini takip ettiğiniz maden, hisse senedi ve endeksler.
            </p>
          </div>
          <button style={{
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-neon-blue))',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
            transition: 'transform 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span>+</span> Varlık Ekle
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {watchListMock.map(asset => (
            <div key={asset.id} style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              padding: '24px',
              borderTop: `4px solid ${asset.color}`,
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
            onClick={() => setSelectedAsset({
              name: `${asset.symbol} - ${asset.name}`,
              amount: asset.price,
              profit: asset.change,
              color: asset.color
            })}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = `0 10px 25px ${asset.color}20`;
              e.currentTarget.style.border = `1px solid ${asset.color}50`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)';
            }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', letterSpacing: '0.5px' }}>{asset.symbol}</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>{asset.name}</div>
                </div>
                <div style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  padding: '6px 10px', 
                  borderRadius: '8px', 
                  fontSize: '12px', 
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  {asset.type}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)' }} className="sensitive-data">
                  {asset.price}
                </div>
                <div style={{
                  background: asset.change.startsWith('+') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: asset.change.startsWith('+') ? 'var(--success)' : 'var(--danger)',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: asset.change.startsWith('+') ? '0 0 15px rgba(16, 185, 129, 0.1)' : '0 0 15px rgba(239, 68, 68, 0.1)'
                }} className="sensitive-data">
                  {asset.change.startsWith('+') ? '▲' : '▼'} {asset.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <AssetChartModal 
        isOpen={selectedAsset !== null} 
        onClose={() => setSelectedAsset(null)} 
        asset={selectedAsset} 
      />
    </div>
  );
};

export default Favorites;
