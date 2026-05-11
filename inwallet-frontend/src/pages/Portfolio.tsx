import React, { useState, useEffect, useMemo } from 'react';
import AssetChartModal from '../components/AssetChartModal';
import { useAuth } from '../context/AuthContext';
import { assetApi, marketApi } from '../services/api';

const COLORS = {
  Hisse: '#3b82f6',
  Kripto: '#8b5cf6',
  Altın: '#f59e0b',
  Döviz: '#10b981',
  Diğer: '#94a3b8'
};

const Portfolio: React.FC = () => {
  const { userId } = useAuth();
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [marketPrices, setMarketPrices] = useState<any>({});
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [newType, setNewType] = useState('Hisse');
  const [newQuantity, setNewQuantity] = useState('');
  const [newBuyPrice, setNewBuyPrice] = useState('');

  const fetchData = async () => {
    if (!userId) return;
    try {
      const [aData, pData] = await Promise.all([
        assetApi.getAssets(Number(userId)).catch(() => []),
        marketApi.getPrices().catch(() => ({}))
      ]);
      setAssets(aData);
      setMarketPrices(pData);
    } catch (err) {
      console.error("Veri yükleme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    try {
      await assetApi.createAsset({
        name: newName,
        symbol: newSymbol.toUpperCase(),
        type: newType,
        quantity: Number(newQuantity),
        averageBuyPrice: Number(newBuyPrice),
        user: { id: Number(userId) }
      });
      setNewName('');
      setNewSymbol('');
      setNewQuantity('');
      setNewBuyPrice('');
      fetchData();
    } catch (err) {
      alert("Varlık eklenirken hata oluştu.");
    }
  };

  const handleDeleteAsset = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm("Bu varlığı silmek istediğinize emin misiniz?")) return;
    try {
      await assetApi.deleteAsset(id);
      fetchData();
    } catch (err) {
      alert("Silme işlemi başarısız.");
    }
  };

  const stats = useMemo(() => {
    let currentTotal = 0;
    let costTotal = 0;
    
    assets.forEach(a => {
      const currentPrice = Number(marketPrices[a.symbol] || a.currentPrice || a.averageBuyPrice || 0);
      currentTotal += (Number(a.quantity) * currentPrice);
      costTotal += (Number(a.quantity) * Number(a.averageBuyPrice));
    });

    const profit = currentTotal - costTotal;
    const profitPct = costTotal > 0 ? (profit / costTotal) * 100 : 0;
    
    return { currentTotal, costTotal, profit, profitPct };
  }, [assets, marketPrices]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Varlıklar yükleniyor...</div>;

  return (
    <div className="dashboard-grid animate-fade-in">
      {/* Portfolio Header Stats */}
      <div className="col-span-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-blue)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600 }}>TOPLAM PORTFÖY DEĞERİ</div>
          <div style={{ fontSize: '36px', fontWeight: 900, marginTop: '10px' }} className="heading-gradient">₺{stats.currentTotal.toLocaleString()}</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '8px' }}>Maliyet: ₺{stats.costTotal.toLocaleString()}</p>
        </div>
        <div className="glass-card" style={{ borderLeft: `4px solid ${stats.profit >= 0 ? 'var(--accent-green)' : '#ef4444'}` }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600 }}>TOPLAM KÂR / ZARAR</div>
          <div style={{ fontSize: '36px', fontWeight: 900, marginTop: '10px', color: stats.profit >= 0 ? 'var(--accent-green)' : '#ef4444' }}>
            {stats.profit >= 0 ? '+' : ''}₺{stats.profit.toLocaleString()}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: stats.profit >= 0 ? 'var(--accent-green)' : '#ef4444', marginTop: '4px' }}>
             %{stats.profitPct.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Asset List Section */}
      <div className="col-span-8 glass-card">
        <div className="card-header" style={{ marginBottom: '24px' }}>
          <span className="card-title">Varlıklarım</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {assets.length > 0 ? assets.map((asset) => {
            const currentPrice = Number(marketPrices[asset.symbol] || asset.currentPrice || asset.averageBuyPrice || 0);
            const currentVal = Number(asset.quantity) * currentPrice;
            const profit = currentPrice - Number(asset.averageBuyPrice);
            const profitPct = (profit / Number(asset.averageBuyPrice)) * 100;
            const color = (COLORS as any)[asset.type] || COLORS.Diğer;

            return (
              <div 
                key={asset.id} 
                className="glass-card animate-hover" 
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '24px', background: 'rgba(255,255,255,0.02)', borderLeft: `5px solid ${color}`,
                  cursor: 'pointer', position: 'relative', overflow: 'hidden'
                }}
                onClick={() => setSelectedAsset(asset)}
              >
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', zIndex: 1 }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `${color}20`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 900, border: `1px solid ${color}40` }}>
                    {asset.symbol ? asset.symbol.slice(0, 3) : '---'}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{asset.name} <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 400 }}>{asset.symbol}</span></h4>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{asset.quantity} Adet</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Maliyet: ₺{Number(asset.averageBuyPrice).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', zIndex: 1, display: 'flex', gap: '30px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900 }}>₺{currentVal.toLocaleString()}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <span style={{ 
                        fontSize: '12px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px',
                        background: profit >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: profit >= 0 ? 'var(--accent-green)' : '#ef4444'
                      }}>
                        {profit >= 0 ? '▲' : '▼'} %{Math.abs(profitPct).toFixed(2)}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: profit >= 0 ? 'var(--accent-green)' : '#ef4444' }}>
                        {profit >= 0 ? '+' : '-'}₺{Math.abs(currentVal - (Number(asset.quantity) * Number(asset.averageBuyPrice))).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button onClick={(e) => handleDeleteAsset(e, asset.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '18px', opacity: 0.3, transition: 'opacity 0.2s' }} className="hover-opacity-100">🗑️</button>
                </div>
                
                {/* Subtle background progress bar showing cost vs current value */}
                <div style={{ 
                  position: 'absolute', bottom: 0, left: 0, height: '3px', 
                  width: '100%', background: 'rgba(255,255,255,0.05)' 
                }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${Math.min(100, (Number(asset.averageBuyPrice) / currentPrice) * 100)}%`, 
                    background: color, opacity: 0.3 
                  }} />
                </div>
              </div>
            );
          }) : (
            <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>📦</div>
              Henüz varlık eklemedin. Sağdaki formu kullanarak portföyünü oluşturmaya başla.
            </div>
          )}
        </div>
      </div>

      {/* Add Asset Form Sidebar */}
      <div className="col-span-4 glass-card">
        <div className="card-header">
          <span className="card-title">Yeni Varlık Ekle</span>
        </div>
        <form onSubmit={handleAddAsset} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>Varlık Adı</label>
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Örn: Astor Enerji" required />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>Sembol (Fiyat için)</label>
            <input type="text" value={newSymbol} onChange={e => setNewSymbol(e.target.value)} placeholder="Örn: ASTOR, BTC, XAU" required />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>Tür</label>
            <select value={newType} onChange={e => setNewType(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
              <option value="Hisse">Hisse Senedi</option>
              <option value="Kripto">Kripto Para</option>
              <option value="Altın">Emtia (Altın/Gümüş)</option>
              <option value="Döviz">Döviz</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>Adet / Miktar</label>
            <input type="number" value={newQuantity} onChange={e => setNewQuantity(e.target.value)} placeholder="0.00" step="any" required />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>Ortalama Alış Fiyatı (₺)</label>
            <input type="number" value={newBuyPrice} onChange={e => setNewBuyPrice(e.target.value)} placeholder="0.00" step="any" required />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '14px', borderRadius: '12px', fontWeight: 800 }}>Varlığı Portföye Ekle</button>
        </form>
      </div>

      {selectedAsset && (
        <AssetChartModal 
          isOpen={!!selectedAsset} 
          onClose={() => setSelectedAsset(null)} 
          asset={selectedAsset} 
        />
      )}
    </div>
  );
};

export default Portfolio;
