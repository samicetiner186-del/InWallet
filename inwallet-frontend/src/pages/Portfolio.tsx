import React, { useState, useEffect } from 'react';
import AssetChartModal from '../components/AssetChartModal';
import { useAuth } from '../context/AuthContext';
import { assetApi } from '../services/api';

const Portfolio: React.FC = () => {
  const { userId } = useAuth();
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('Hisse');
  const [newQuantity, setNewQuantity] = useState('');
  const [newBuyPrice, setNewBuyPrice] = useState('');

  const fetchAssets = async () => {
    if (!userId) return;
    try {
      const data = await assetApi.getAssets(userId);
      setAssets(data);
    } catch (err) {
      console.error("Varlıklar yüklenemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [userId]);

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    try {
      await assetApi.createAsset({
        name: newName,
        type: newType,
        quantity: Number(newQuantity),
        averageBuyPrice: Number(newBuyPrice),
        user: { id: userId }
      });
      setNewName('');
      setNewQuantity('');
      setNewBuyPrice('');
      fetchAssets();
    } catch (err) {
      alert("Varlık eklenirken hata oluştu.");
    }
  };

  const handleDeleteAsset = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm("Bu varlığı silmek istediğinize emin misiniz?")) return;
    try {
      await assetApi.deleteAsset(id);
      fetchAssets();
    } catch (err) {
      alert("Silme işlemi başarısız.");
    }
  };

  const totalNetWorth = assets.reduce((sum, a) => sum + (a.quantity * (a.currentPrice || a.averageBuyPrice || 0)), 0);
  const totalCost = assets.reduce((sum, a) => sum + (a.quantity * (a.averageBuyPrice || 0)), 0);
  const totalProfitPct = totalCost > 0 ? ((totalNetWorth - totalCost) / totalCost) * 100 : 0;

  const getAssetColor = (type: string) => {
    switch(type.toLowerCase()) {
      case 'hisse': return '#00d2ff';
      case 'kripto': return '#8b5cf6';
      case 'altın': return '#f59e0b';
      case 'döviz': return '#10b981';
      default: return '#3b82f6';
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Varlıklar yükleniyor...</div>;

  return (
    <div className="dashboard-grid">
      <div className="col-span-8 glass-card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px', marginBottom: '10px' }}>
          <div>
            <span className="card-title" style={{ fontSize: '24px', display: 'block', color: 'var(--text-secondary)' }}>Toplam Portföy Değeri</span>
            <div className="heading-gradient sensitive-data" style={{ fontSize: '36px', fontWeight: 'bold', marginTop: '8px' }}>
              ₺{totalNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
          
          <div className="sensitive-data" style={{ 
            background: totalProfitPct >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: totalProfitPct >= 0 ? 'var(--success)' : 'var(--danger)',
            padding: '8px 16px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {totalProfitPct >= 0 ? '▲' : '▼'} %{Math.abs(totalProfitPct).toFixed(2)}
          </div>
        </div>
        
        <div style={{ marginTop: '32px' }}>
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontWeight: 500 }}>Varlık Dağılımı</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {assets.length > 0 ? assets.map((asset, index) => {
              const currentVal = asset.quantity * (asset.currentPrice || asset.averageBuyPrice || 0);
              const profit = asset.currentPrice ? ((asset.currentPrice - asset.averageBuyPrice) / asset.averageBuyPrice) * 100 : 0;
              const color = getAssetColor(asset.type);

              return (
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
                    borderLeft: `6px solid ${color}`,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onClick={() => setSelectedAsset(asset)}
                >
                  <button 
                    onClick={(e) => handleDeleteAsset(e, asset.id)}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '18px', opacity: 0.6 }}
                    title="Sil"
                  >
                    🗑️
                  </button>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)', fontWeight: 600 }}>{asset.name} ({asset.type})</h4>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>{asset.quantity} Adet</div>
                  </div>
                  <div style={{ textAlign: 'right', marginRight: '30px' }}>
                    <div className="sensitive-data" style={{ fontSize: '22px', fontWeight: 'bold' }}>
                      ₺{currentVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div style={{ 
                      display: 'inline-block',
                      background: profit >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: profit >= 0 ? 'var(--success)' : 'var(--danger)', 
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      marginTop: '8px',
                      fontWeight: 600
                    }}>
                      {profit >= 0 ? '▲' : '▼'} %{Math.abs(profit).toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p className="text-muted">Henüz varlık eklemediniz.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="col-span-4 glass-card">
        <div className="card-header">
          <span className="card-title">Yeni Varlık Ekle</span>
        </div>
        <form onSubmit={handleAddAsset} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>Varlık Adı</label>
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Örn: Bitcoin, Apple, Altın" required style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white' }} />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>Tür</label>
            <select value={newType} onChange={e => setNewType(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white' }}>
              <option value="Hisse">Hisse Senedi</option>
              <option value="Kripto">Kripto Para</option>
              <option value="Altın">Emtia (Altın/Gümüş)</option>
              <option value="Döviz">Döviz</option>
              <option value="Nakit">Nakit/Mevduat</option>
            </select>
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>Miktar</label>
            <input type="number" value={newQuantity} onChange={e => setNewQuantity(e.target.value)} placeholder="0.00" step="any" required style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white' }} />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>Ortalama Alış Fiyatı (₺)</label>
            <input type="number" value={newBuyPrice} onChange={e => setNewBuyPrice(e.target.value)} placeholder="0.00" step="any" required style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white' }} />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '10px', padding: '14px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Ekle</button>
        </form>
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
