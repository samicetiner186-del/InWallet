import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AssetChartModal from '../components/AssetChartModal';

const data = [
  { name: 'Oca', value: 85000 },
  { name: 'Şub', value: 92000 },
  { name: 'Mar', value: 88000 },
  { name: 'Nis', value: 105000 },
  { name: 'May', value: 118000 },
  { name: 'Haz', value: 124500 },
];

const Portfolio: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  
  const assets = [
    { name: 'Hisse Senedi (BIST 100)', amount: '₺55,000.00', profit: '+%8.4', color: '#00d2ff' },
    { name: 'Altın (Gram)', amount: '₺45,000.00', profit: '+%3.2', color: '#f59e0b' },
    { name: 'Kripto (BTC, ETH)', amount: '₺14,500.00', profit: '-%1.5', color: '#8b5cf6' },
    { name: 'Döviz (USD)', amount: '₺10,000.00', profit: '+%0.8', color: '#10b981' },
  ];

  return (
    <div className="dashboard-grid">
      <div className="col-span-12 glass-card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px', marginBottom: '10px' }}>
          <div>
            <span className="card-title" style={{ fontSize: '24px', display: 'block', color: 'var(--text-secondary)' }}>Toplam Portföy Değeri</span>
            <div className="heading-gradient" style={{ fontSize: '36px', fontWeight: 'bold', marginTop: '8px' }}>₺124,500.00</div>
          </div>
          
          {/* Dynamic Overall Profit/Loss Indicator */}
          <div style={{ 
            background: '+%5.2'.startsWith('+') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: '+%5.2'.startsWith('+') ? 'var(--success)' : 'var(--danger)',
            padding: '8px 16px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '+%5.2'.startsWith('+') ? '0 0 15px rgba(16, 185, 129, 0.2)' : '0 0 15px rgba(239, 68, 68, 0.2)'
          }}>
            {'+%5.2'.startsWith('+') ? '▲' : '▼'} {'+%5.2'} (Genel)
          </div>
        </div>
        
        {/* Trend Chart */}
        <div style={{ height: '250px', marginTop: '20px', marginBottom: '32px' }}>
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontWeight: 500 }}>Son 6 Ay Varlık Değişimi</h4>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₺${val/1000}k`} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <Tooltip 
                formatter={(value: number) => `₺${value.toLocaleString()}`}
                contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="value" stroke="var(--accent-blue)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Assets List */}
        <h4 style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontWeight: 500 }}>Varlık Dağılımı</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {assets.map((asset, index) => (
            <div 
              key={index} 
              style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '24px 20px', 
                background: 'rgba(255,255,255,0.03)', 
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.05)',
                borderLeft: `6px solid ${asset.color}`,
                transition: 'transform 0.3s ease, background 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedAsset(asset)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(8px)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)', fontWeight: 600 }}>{asset.name}</h4>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>Anlık Değerleme</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '22px', fontWeight: 'bold' }}>{asset.amount}</div>
                <div style={{ 
                  display: 'inline-block',
                  background: asset.profit.startsWith('+') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: asset.profit.startsWith('+') ? 'var(--success)' : 'var(--danger)', 
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  marginTop: '8px',
                  fontWeight: 600
                }}>
                  {asset.profit.startsWith('+') ? '▲' : '▼'} {asset.profit}
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

export default Portfolio;
