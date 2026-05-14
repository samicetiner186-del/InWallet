import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { marketApi } from '../services/api';

interface AssetOption {
  id: string;
  label: string;
  annualReturn: number;
  color: string;
  symbol: string;
}

const assetOptions: AssetOption[] = [
  { id: 'gold', label: 'Altın (Gram)', annualReturn: 0.35, color: '#f59e0b', symbol: 'XAU' },
  { id: 'bist', label: 'BIST 100 Endeks', annualReturn: 0.28, color: '#60a5fa', symbol: 'THYAO' },
  { id: 'usd', label: 'Dolar (USD)', annualReturn: 0.18, color: '#10b981', symbol: 'USD' },
  { id: 'crypto', label: 'Kripto (BTC)', annualReturn: 0.55, color: '#a78bfa', symbol: 'BTC' },
];

const inflationRate = 0.45; // Türkiye tahmini yıllık

const DCAPlanner: React.FC = () => {
  const [mode, setMode] = useState<'future' | 'backtest'>('future');
  const [assetId, setAssetId] = useState('gold');
  const [monthly, setMonthly] = useState(3000);
  const [months, setMonths] = useState(24);
  const [historicalData, setHistoricalData] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);

  const asset = assetOptions.find(a => a.id === assetId)!;

  // Geçmiş veriyi çek
  useEffect(() => {
    if (mode === 'backtest') {
      const fetchHistorical = async () => {
        setLoading(true);
        try {
          const data = await marketApi.getHistoricalPrices(asset.symbol, '2y');
          setHistoricalData(data);
        } catch (err) {
          console.error('Geçmiş veri hatası:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchHistorical();
    }
  }, [mode, assetId]);

  // Hesaplama Mantığı
  const result = useMemo(() => {
    if (mode === 'future') {
      const monthlyRate = asset.annualReturn / 12;
      const data = [];
      let total = 0;
      let nominalInvested = 0;

      for (let i = 1; i <= months; i++) {
        total = total * (1 + monthlyRate) + monthly;
        nominalInvested += monthly;
        const monthlyInflation = inflationRate / 12;
        const reel = total / Math.pow(1 + monthlyInflation, i);
        
        if (i % 2 === 0 || i === months) {
          data.push({
            label: i <= 12 ? `${i}. Ay` : `${Math.floor(i/12)}Y ${i%12}A`,
            nominal: Math.round(total),
            reel: Math.round(reel),
            invested: Math.round(nominalInvested),
          });
        }
      }
      return { data, finalNominal: total, finalReel: total / Math.pow(1 + inflationRate/12, months), totalInvested: nominalInvested };
    } else {
      // BACKTEST LOGIC
      const timestamps = Object.keys(historicalData).map(Number).sort();
      if (timestamps.length === 0) return { data: [], finalNominal: 0, finalReel: 0, totalInvested: 0 };

      const data = [];
      let totalValue = 0;
      let totalInvested = 0;
      let totalQuantity = 0;

      // Yaklaşık aylık adımlarla simüle et (her 30 günde bir alım)
      const step = Math.floor(timestamps.length / months);
      
      for (let i = 0; i < months; i++) {
        const idx = Math.min(i * step, timestamps.length - 1);
        const price = historicalData[timestamps[idx]];
        const buyQuantity = monthly / price;
        
        totalQuantity += buyQuantity;
        totalInvested += monthly;
        totalValue = totalQuantity * price;

        data.push({
          label: `${i + 1}. Ay`,
          nominal: Math.round(totalValue),
          invested: Math.round(totalInvested),
          reel: Math.round(totalValue / 1.5) // Basitleştirilmiş reel (geçmiş enflasyon)
        });
      }
      
      return { data, finalNominal: totalValue, finalReel: totalValue / 1.6, totalInvested };
    }
  }, [mode, asset, monthly, months, historicalData]);

  const profit = result.finalNominal - result.totalInvested;
  const profitPct = result.totalInvested > 0 ? Math.round((profit / result.totalInvested) * 100) : 0;

  return (
    <div className="dashboard-grid" style={{ padding: '0' }}>
      <motion.div 
        className="col-span-12 glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ padding: '24px 32px', marginBottom: '24px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              📈 DCA Yatırım Planlayıcısı
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
              Düzenli yatırımın gücünü keşfedin ve stratejinizi oluşturun.
            </p>
          </div>
          
          {/* Mode Switcher */}
          <div style={{ background: 'var(--bg-primary)', padding: '4px', borderRadius: '12px', display: 'flex', gap: '4px' }}>
            <button 
              onClick={() => setMode('future')}
              style={{ 
                padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: mode === 'future' ? 'var(--accent-blue)' : 'transparent',
                color: mode === 'future' ? 'white' : 'var(--text-secondary)',
                fontWeight: 700, fontSize: '13px', transition: 'all 0.2s'
              }}
            >
              🚀 Gelecek Simülasyonu
            </button>
            <button 
              onClick={() => setMode('backtest')}
              style={{ 
                padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: mode === 'backtest' ? 'var(--accent-blue)' : 'transparent',
                color: mode === 'backtest' ? 'white' : 'var(--text-secondary)',
                fontWeight: 700, fontSize: '13px', transition: 'all 0.2s'
              }}
            >
              ⏪ Geçmiş Backtest
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '32px' }}>
          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>Varlık Seçimi</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {assetOptions.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setAssetId(a.id)}
                    style={{
                      padding: '12px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                      background: assetId === a.id ? `${a.color}15` : 'var(--bg-primary)',
                      border: `2px solid ${assetId === a.id ? a.color : 'transparent'}`,
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>{a.symbol}</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{a.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>Aylık Yatırım: ₺{monthly.toLocaleString()}</label>
              <input 
                type="range" min="500" max="20000" step="500" value={monthly} 
                onChange={e => setMonthly(Number(e.target.value))}
                style={{ width: '100%', accentColor: asset.color }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>Süre: {months} Ay</label>
              <input 
                type="range" min="6" max="60" step="6" value={months} 
                onChange={e => setMonths(Number(e.target.value))}
                style={{ width: '100%', accentColor: asset.color }}
              />
            </div>

            <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Beklenen Yıllık Getiri</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: asset.color }}>%{Math.round(asset.annualReturn * 100)}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                * Geçmiş performans gelecek sonuçları garanti etmez.
              </div>
            </div>
          </div>

          {/* Results */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Toplam Ana Para</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', marginTop: '4px' }}>₺{result.totalInvested.toLocaleString()}</div>
              </div>
              <div className="glass-card" style={{ padding: '20px', background: `${asset.color}05` }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Final Değeri</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: asset.color, marginTop: '4px' }}>₺{Math.round(result.finalNominal).toLocaleString()}</div>
              </div>
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Net Kâr Oranı</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: profitPct >= 0 ? 'var(--accent-green)' : '#ef4444', marginTop: '4px' }}>%{profitPct}</div>
              </div>
            </div>

            <div style={{ height: '300px', width: '100%', background: 'var(--bg-primary)', borderRadius: '20px', padding: '20px', border: '1px solid var(--border-color)' }}>
              {loading ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Veriler yükleniyor...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.data}>
                    <defs>
                      <linearGradient id="colorNominal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={asset.color} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={asset.color} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="label" fontSize={11} tick={{fill: 'var(--text-secondary)'}} />
                    <YAxis fontSize={11} tick={{fill: 'var(--text-secondary)'}} tickFormatter={v => `₺${v/1000}k`} />
                    <Tooltip 
                      contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}
                      itemStyle={{ fontWeight: 700 }}
                    />
                    <Area type="monotone" dataKey="invested" stroke="var(--text-secondary)" fill="transparent" strokeDasharray="5 5" />
                    <Area type="monotone" dataKey="nominal" stroke={asset.color} strokeWidth={3} fillOpacity={1} fill="url(#colorNominal)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div style={{ marginTop: '24px', padding: '16px 20px', borderRadius: '12px', background: 'rgba(59,130,246,0.05)', borderLeft: '4px solid var(--accent-blue)' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '4px' }}>💡 AI Strateji Notu</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {mode === 'future' ? (
                  `${asset.label} yatırımı ile düzenli birikim yapmanız durumunda, yıllık %${Math.round(asset.annualReturn*100)} getiri ile 2 yıl sonunda ana paranızı ${profitPct > 50 ? 'ciddi oranda katlamış' : 'artırmış'} olacaksınız.`
                ) : (
                  `Geçmiş 2 yıllık veriler baz alındığında, ${asset.label} üzerinde uygulanan DCA stratejisi size %${profitPct} getiri sağlardı. Bu, enflasyonun üzerinde bir performans göstermiş durumdadır.`
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DCAPlanner;
