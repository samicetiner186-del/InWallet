import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { marketApi, assetApi, transactionApi } from '../services/api';

// Görsel zenginleştirme metadata'sı — fiyatlar tamamen API'den gelir
const ASSET_META: Record<string, { label: string; type: string; category: string }> = {
  THYAO: { label: 'Türk Hava Yolları', type: 'Hisse',  category: 'BIST'   },
  ASTOR: { label: 'Astor Enerji',       type: 'Hisse',  category: 'BIST'   },
  TUPRS: { label: 'Tüpraş',            type: 'Hisse',  category: 'BIST'   },
  BTC:   { label: 'Bitcoin',            type: 'Kripto', category: 'Global' },
  AAPL:  { label: 'Apple Inc.',         type: 'Hisse',  category: 'US'     },
  XAU:   { label: 'Gram Altın',         type: 'Emtia',  category: 'Emtia'  },
};

const Market: React.FC = () => {
  const { userId } = useAuth();
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [_loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [quantity, setQuantity] = useState('');
  const [investing, setInvesting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchPrices = async () => {
    try {
      const data = await marketApi.getPrices();
      setPrices(data);
    } catch (err) {
      console.error('Fiyat çekme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !selectedAsset) return;
    setInvesting(true);
    setErrorMsg('');
    try {
      // 1. Create the Asset
      await assetApi.createAsset({
        symbol: selectedAsset.symbol,
        name: selectedAsset.meta.label,
        type: selectedAsset.meta.type,
        quantity: Number(quantity),
        averageBuyPrice: selectedAsset.price,
        user: { id: Number(userId) },
      });

      // 2. Create a corresponding BUY Transaction to deduct from cash
      await transactionApi.createTransaction({
        userId: Number(userId),
        amount: Number(quantity) * selectedAsset.price,
        type: 'BUY',
        category: 'Yatırım',
        description: `${selectedAsset.symbol} alımı (${quantity} adet)`,
        date: new Date().toISOString(),
      });

      setSuccessMsg(`${selectedAsset.symbol} portföyünüze eklendi ve bakiyeniz güncellendi!`);
      setQuantity('');
      setTimeout(() => {
        setSuccessMsg('');
        setSelectedAsset(null);
      }, 2500);
    } catch (err) {
      setErrorMsg('İşlem gerçekleştirilemedi. Lütfen tekrar deneyin.');
    } finally {
      setInvesting(false);
    }
  };

  // API'den gelen tüm sembolleri listele, ASSET_META varsa zengin bilgiyle göster
  const marketAssets = useMemo(() => {
    return Object.keys(prices)
      .filter(sym => sym.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(sym => ({
        symbol: sym,
        price: prices[sym] ?? 0,
        meta: ASSET_META[sym] ?? { label: sym, type: 'Diğer', category: 'Diğer' },
      }));
  }, [prices, searchTerm]);

  return (
    <div className="dashboard-grid animate-fade-in">
      <div className="col-span-12" style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>Piyasalar &amp; Yatırım</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>Canlı fiyatları takip et ve portföyüne anında ekleme yap.</p>
      </div>

      <div className="col-span-12" style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Hisse veya varlık ara... (Örn: ASTOR, BTC)"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            width: '100%', padding: '15px', borderRadius: '15px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--text-primary)',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div className="col-span-8 glass-card">
        <div className="card-header">
          <span className="card-title">Canlı İzleme Listesi</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
          {marketAssets.map(asset => (
            <div key={asset.symbol} className="glass-card" style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '15px 25px', background: 'rgba(255,255,255,0.01)',
            }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div style={{
                  padding: '8px 12px',
                  background: 'rgba(59,130,246,0.1)',
                  color: 'var(--accent-blue)',
                  borderRadius: '10px', fontWeight: 800,
                }}>
                  {asset.symbol}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{asset.meta.category}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{asset.meta.type}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)' }}>
                  ₺{asset.price.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                </div>
                <button
                  onClick={() => { setSelectedAsset(asset); setQuantity(''); setSuccessMsg(''); setErrorMsg(''); }}
                  className="btn-primary"
                  style={{ padding: '8px 20px', borderRadius: '10px', fontSize: '13px' }}
                >
                  Yatırım Yap
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Yatırım Paneli — sadece bu kısım yeniden tasarlandı */}
      <div className="col-span-4">
        {selectedAsset ? (
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1.5px solid var(--accent-blue)',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 8px 32px rgba(59,130,246,0.12)',
          }}>
            {/* Başlık */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                fontSize: '11px', fontWeight: 700, color: 'var(--accent-blue)',
                textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px',
              }}>
                Hızlı Yatırım
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {selectedAsset.symbol}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {selectedAsset.meta.label}
              </div>
            </div>

            {/* Güncel Fiyat */}
            <div style={{
              padding: '16px 20px', borderRadius: '14px',
              background: 'rgba(59,130,246,0.06)',
              border: '1px solid rgba(59,130,246,0.15)',
              marginBottom: '20px',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Güncel Fiyat
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)' }}>
                ₺{selectedAsset.price.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
              </div>
            </div>

            {/* Mesajlar */}
            {successMsg && (
              <div style={{
                padding: '12px 16px', borderRadius: '12px', marginBottom: '16px',
                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
                color: '#10b981', fontSize: '13px', fontWeight: 600,
              }}>
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div style={{
                padding: '12px 16px', borderRadius: '12px', marginBottom: '16px',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                color: '#ef4444', fontSize: '13px', fontWeight: 600,
              }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleInvest} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Miktar */}
              <div>
                <label style={{
                  fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)',
                  textTransform: 'uppercase', letterSpacing: '0.8px',
                  display: 'block', marginBottom: '8px',
                }}>
                  Alım Miktarı (Adet)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  placeholder="0.00"
                  required
                  style={{
                    width: '100%', padding: '13px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '18px', fontWeight: 700,
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent-blue)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                />
              </div>

              {/* Tahmini Maliyet */}
              {Number(quantity) > 0 && (
                <div style={{
                  padding: '14px 18px', borderRadius: '12px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Tahmini Maliyet
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-blue)' }}>
                    ₺{(Number(quantity) * selectedAsset.price).toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {quantity} adet × ₺{selectedAsset.price.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                  </div>
                </div>
              )}

              {/* Butonlar */}
              <button
                type="submit"
                disabled={investing || !quantity}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: (investing || !quantity)
                    ? 'rgba(59,130,246,0.35)'
                    : 'linear-gradient(135deg, #2563eb, #3b82f6)',
                  color: 'white',
                  fontSize: '15px', fontWeight: 700,
                  cursor: (investing || !quantity) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: (!investing && quantity) ? '0 4px 15px rgba(59,130,246,0.3)' : 'none',
                }}
              >
                {investing ? 'İşlem yapılıyor...' : 'Portföye Ekle'}
              </button>

              <button
                type="button"
                onClick={() => { setSelectedAsset(null); setQuantity(''); setSuccessMsg(''); setErrorMsg(''); }}
                style={{
                  padding: '10px', borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--border-color)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                Vazgeç
              </button>
            </form>
          </div>
        ) : (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', opacity: 0.5 }}>
            <p>Yatırım yapmak istediğiniz varlığı listeden seçin.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Market;
