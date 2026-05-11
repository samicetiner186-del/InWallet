import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { marketApi, assetApi } from '../services/api';

const Market: React.FC = () => {
  const { userId } = useAuth();
  const [prices, setPrices] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [quantity, setQuantity] = useState('');

  const fetchPrices = async () => {
    try {
      const data = await marketApi.getPrices();
      setPrices(data);
    } catch (err) {
      console.error("Fiyat çekme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 15000); // 15 saniyede bir güncelle
    return () => clearInterval(interval);
  }, []);

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !selectedAsset) return;
    try {
      await assetApi.createAsset({
        symbol: selectedAsset.symbol,
        name: selectedAsset.symbol, // Basitlik için
        type: selectedAsset.type,
        quantity: Number(quantity),
        averageBuyPrice: selectedAsset.price,
        user: { id: Number(userId) }
      });
      alert(`${selectedAsset.symbol} portföyünüze eklendi!`);
      setSelectedAsset(null);
      setQuantity('');
    } catch (err) {
      alert("İşlem başarısız.");
    }
  };

  const marketAssets = [
    { symbol: 'THYAO', type: 'Hisse', category: 'BIST' },
    { symbol: 'ASTOR', type: 'Hisse', category: 'BIST' },
    { symbol: 'TUPRS', type: 'Hisse', category: 'BIST' },
    { symbol: 'BTC', type: 'Kripto', category: 'Global' },
    { symbol: 'AAPL', type: 'Hisse', category: 'US' },
    { symbol: 'XAU', type: 'Altın', category: 'Emtia' }
  ].filter(a => a.symbol.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="dashboard-grid animate-fade-in">
      <div className="col-span-12" style={{ marginBottom: '30px' }}>
        <h2 className="heading-gradient" style={{ fontSize: '32px', fontWeight: 800 }}>Piyasalar & Yatırım</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Canlı fiyatları takip et ve portföyüne anında ekleme yap.</p>
      </div>

      <div className="col-span-12" style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Hisse veya varlık ara... (Örn: ASTOR, BTC)" 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '15px', borderRadius: '15px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
      </div>

      <div className="col-span-8 glass-card">
        <div className="card-header">
          <span className="card-title">Canlı İzleme Listesi</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
          {marketAssets.map(asset => {
            const price = prices[asset.symbol] || 0;
            return (
              <div key={asset.symbol} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 25px', background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div style={{ padding: '8px 12px', background: 'var(--accent-blue)15', color: 'var(--accent-blue)', borderRadius: '10px', fontWeight: 800 }}>
                    {asset.symbol}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{asset.category}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{asset.type}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 900 }}>₺{price.toLocaleString()}</div>
                  <button 
                    onClick={() => setSelectedAsset({ ...asset, price })}
                    className="btn-primary" 
                    style={{ padding: '8px 20px', borderRadius: '10px', fontSize: '13px' }}
                  >
                    Yatırım Yap
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="col-span-4">
        {selectedAsset ? (
          <div className="glass-card animate-scale-in" style={{ border: '2px solid var(--accent-blue)' }}>
            <div className="card-header">
              <span className="card-title">Hızlı Yatırım: {selectedAsset.symbol}</span>
            </div>
            <form onSubmit={handleInvest} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Güncel Fiyat</label>
                <div style={{ fontSize: '24px', fontWeight: 900 }}>₺{selectedAsset.price.toLocaleString()}</div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Alım Miktarı (Adet)</label>
                <input 
                  type="number" 
                  step="any" 
                  value={quantity} 
                  onChange={e => setQuantity(e.target.value)} 
                  placeholder="0.00" 
                  required 
                />
              </div>
              <div style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Tahmini Maliyet</div>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>₺{(Number(quantity) * selectedAsset.price).toLocaleString()}</div>
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '15px' }}>Portföye Ekle</button>
              <button type="button" onClick={() => setSelectedAsset(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>Vazgeç</button>
            </form>
          </div>
        ) : (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', opacity: 0.5 }}>
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>👈</div>
            <p>Yatırım yapmak istediğiniz varlığı listeden seçin.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Market;
