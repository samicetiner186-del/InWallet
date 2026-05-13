import React, { useState, useEffect, useMemo } from 'react';
import AssetChartModal from '../components/AssetChartModal';
import { useAuth } from '../context/AuthContext';
import { assetApi, marketApi, transactionApi } from '../services/api';

const COLORS = {
  Hisse: '#3b82f6',
  Kripto: '#8b5cf6',
  Altın: '#f59e0b',
  Döviz: '#10b981',
  Diğer: '#94a3b8'
};

// SVG Delete Icon
const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

// SVG icons for asset type selector
const TypeIcons: Record<string, React.ReactNode> = {
  Hisse: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),
  Kripto: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.5 8H13a2.5 2.5 0 0 1 0 5H9.5V8z" />
      <path d="M9.5 13H14a2.5 2.5 0 0 1 0 5H9.5v-5z" />
      <line x1="9.5" y1="8" x2="9.5" y2="18" />
    </svg>
  ),
  Altın: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Döviz: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Diğer: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  ),
};

const typeOptions = [
  { value: 'Hisse', label: 'Hisse Senedi' },
  { value: 'Kripto', label: 'Kripto Para' },
  { value: 'Altın', label: 'Emtia (Altın/Gümüş)' },
  { value: 'Döviz', label: 'Döviz' },
  { value: 'Diğer', label: 'Diğer' },
];

const Portfolio: React.FC = () => {
  const { userId } = useAuth();
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [marketPrices, setMarketPrices] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  
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
      // 1. Create the Asset
      await assetApi.createAsset({
        name: newName,
        symbol: newSymbol.toUpperCase(),
        type: newType,
        quantity: Number(newQuantity),
        averageBuyPrice: Number(newBuyPrice),
        user: { id: Number(userId) }
      });

      // 2. Create a corresponding BUY Transaction
      await transactionApi.createTransaction({
        userId: Number(userId),
        amount: Number(newQuantity) * Number(newBuyPrice),
        type: 'BUY',
        category: 'Yatırım',
        description: `${newSymbol.toUpperCase()} alımı (Portföyden eklendi)`,
        date: new Date().toISOString(),
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

  const selectedTypeColor = (COLORS as any)[newType] || COLORS.Diğer;

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Varlıklar yükleniyor...</div>;

  return (
    <div className="dashboard-grid animate-fade-in">
      {/* Portfolio Header Stats */}
      <div className="col-span-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* Toplam Portföy Değeri - Light/Dark mode aware */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-blue)', background: 'var(--portfolio-card-bg, rgba(59,130,246,0.06))' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Toplam Portföy Değeri</div>
          <div style={{
            fontSize: '36px',
            fontWeight: 900,
            marginTop: '10px',
            color: 'var(--text-primary)',
            letterSpacing: '-1px',
            lineHeight: 1.1,
          }}>
            ₺{stats.currentTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Maliyet:</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>₺{stats.costTotal.toLocaleString('tr-TR')}</span>
          </div>
        </div>

        {/* Toplam Kâr / Zarar */}
        <div className="glass-card" style={{ borderLeft: `4px solid ${stats.profit >= 0 ? 'var(--accent-green)' : '#ef4444'}` }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Toplam Kâr / Zarar</div>
          <div style={{ fontSize: '36px', fontWeight: 900, marginTop: '10px', color: stats.profit >= 0 ? 'var(--accent-green)' : '#ef4444', letterSpacing: '-1px' }}>
            {stats.profit >= 0 ? '+' : ''}₺{stats.profit.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '8px', padding: '3px 10px', borderRadius: '8px', background: stats.profit >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: stats.profit >= 0 ? 'var(--accent-green)' : '#ef4444' }}>
            <span style={{ fontSize: '12px', fontWeight: 800 }}>{stats.profit >= 0 ? '▲' : '▼'} %{Math.abs(stats.profitPct).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Asset List Section */}
      <div className="col-span-8 glass-card">
        <div className="card-header" style={{ marginBottom: '24px' }}>
          <span className="card-title">Varlıklarım</span>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{assets.length} varlık</span>
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
                  padding: '20px 24px', background: 'rgba(255,255,255,0.02)', borderLeft: `5px solid ${color}`,
                  cursor: 'pointer', position: 'relative', overflow: 'hidden'
                }}
                onClick={() => setSelectedAsset(asset)}
              >
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', zIndex: 1 }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${color}20`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900, border: `1px solid ${color}40`, letterSpacing: '-0.5px' }}>
                    {asset.symbol ? asset.symbol.slice(0, 3) : '---'}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{asset.name} <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 400 }}>{asset.symbol}</span></h4>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '5px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{asset.quantity} Adet</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Ort. Alış: ₺{Number(asset.averageBuyPrice).toLocaleString('tr-TR')}</span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', zIndex: 1, display: 'flex', gap: '24px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)' }}>₺{currentVal.toLocaleString('tr-TR')}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ 
                        fontSize: '12px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px',
                        background: profit >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: profit >= 0 ? 'var(--accent-green)' : '#ef4444'
                      }}>
                        {profit >= 0 ? '▲' : '▼'} %{Math.abs(profitPct).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Redesigned Delete Button - SVG only, no emoji */}
                  <button
                    onClick={(e) => handleDeleteAsset(e, asset.id)}
                    style={{
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      color: '#ef4444',
                      cursor: 'pointer',
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.18)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.5)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.2)';
                    }}
                    title="Varlığı Sil"
                  >
                    <DeleteIcon />
                  </button>
                </div>
                
                {/* Progress bar */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, height: '3px', width: '100%', background: 'rgba(255,255,255,0.05)' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (Number(asset.averageBuyPrice) / currentPrice) * 100)}%`, background: color, opacity: 0.4 }} />
                </div>
              </div>
            );
          }) : (
            <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-secondary)' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '20px',
                background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px auto'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <p style={{ margin: 0, fontWeight: 600 }}>Henüz varlık eklemedin.</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '13px' }}>Sağdaki formu kullanarak portföyünü oluşturmaya başla.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Asset Form Sidebar - Redesigned Type Selector */}
      <div className="col-span-4 glass-card">
        <div className="card-header">
          <span className="card-title">Yeni Varlık Ekle</span>
        </div>
        <form onSubmit={handleAddAsset} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Varlık Adı</label>
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Örn: Astor Enerji" required />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sembol</label>
            <input type="text" value={newSymbol} onChange={e => setNewSymbol(e.target.value)} placeholder="Örn: ASTOR, BTC, XAU" required />
          </div>

          {/* Premium Custom Type Selector */}
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Varlık Türü</label>
            <button
              type="button"
              onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: `1.5px solid ${selectedTypeColor}60`,
                background: `${selectedTypeColor}10`,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '14px',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                textAlign: 'left',
              }}
            >
              <span style={{ color: selectedTypeColor, display: 'flex', alignItems: 'center' }}>
                {TypeIcons[newType]}
              </span>
              <span style={{ flex: 1 }}>{typeOptions.find(t => t.value === newType)?.label}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)', transform: isTypeDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {isTypeDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0, right: 0,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                overflow: 'hidden',
                zIndex: 100,
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              }}>
                {typeOptions.map(opt => {
                  const optColor = (COLORS as any)[opt.value] || COLORS.Diğer;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setNewType(opt.value); setIsTypeDropdownOpen(false); }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: 'none',
                        background: newType === opt.value ? `${optColor}12` : 'transparent',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '14px',
                        fontWeight: newType === opt.value ? 700 : 500,
                        transition: 'background 0.15s ease',
                        textAlign: 'left',
                      }}
                      onMouseEnter={e => { if (newType !== opt.value) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(128,128,128,0.06)'; }}
                      onMouseLeave={e => { if (newType !== opt.value) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                    >
                      <span style={{ color: optColor, display: 'flex', alignItems: 'center', width: '18px' }}>{TypeIcons[opt.value]}</span>
                      <span style={{ flex: 1 }}>{opt.label}</span>
                      {newType === opt.value && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={optColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Adet / Miktar</label>
            <input type="number" value={newQuantity} onChange={e => setNewQuantity(e.target.value)} placeholder="0.00" step="any" required />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ortalama Alış Fiyatı (₺)</label>
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
