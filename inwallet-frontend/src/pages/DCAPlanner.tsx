import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const assetOptions = [
  { id: 'gold', label: 'Altın (Gram)', annualReturn: 0.35, color: '#f59e0b', symbol: 'XAU' },
  { id: 'bist', label: 'BIST 100 Endeks', annualReturn: 0.28, color: '#60a5fa', symbol: 'BIST' },
  { id: 'usd', label: 'Dolar (USD)', annualReturn: 0.18, color: '#10b981', symbol: 'USD' },
  { id: 'crypto', label: 'Kripto (BTC)', annualReturn: 0.55, color: '#a78bfa', symbol: 'BTC' },
  { id: 'fund', label: 'Değişken Fon', annualReturn: 0.22, color: '#f97316', symbol: 'FUND' },
];

const inflationRate = 0.42; // Turkey estimated

function calcDCA(monthly: number, months: number, annualReturn: number) {
  const monthlyRate = annualReturn / 12;
  const data = [];
  let total = 0;
  let nominalInvested = 0;

  for (let i = 1; i <= months; i++) {
    total = total * (1 + monthlyRate) + monthly;
    nominalInvested += monthly;
    const monthlyInflation = inflationRate / 12;
    const reel = total / Math.pow(1 + monthlyInflation, i);
    if (i % 3 === 0 || i === months) {
      const label = i <= 12 ? `Ay ${i}` : `${Math.floor(i / 12)}Y ${i % 12 > 0 ? i % 12 + 'A' : ''}`.trim();
      data.push({
        label,
        nominal: Math.round(total),
        reel: Math.round(reel),
        invested: Math.round(nominalInvested),
      });
    }
  }
  return { data, finalNominal: Math.round(total), finalReel: Math.round(total / Math.pow(1 + inflationRate / 12, months)), totalInvested: Math.round(nominalInvested) };
}

const DCAPlanner: React.FC = () => {
  const [assetId, setAssetId] = useState('gold');
  const [monthly, setMonthly] = useState(3000);
  const [months, setMonths] = useState(36);

  const asset = assetOptions.find(a => a.id === assetId)!;
  const result = useMemo(() => calcDCA(monthly, months, asset.annualReturn), [monthly, months, asset]);

  const profit = result.finalNominal - result.totalInvested;
  const profitPct = Math.round((profit / result.totalInvested) * 100);
  // const reelProfit = result.finalReel - result.totalInvested;

  return (
    <div className="dashboard-grid">
      <div className="col-span-12 glass-card animate-slide-up">
        {/* Header */}
        <div style={{ marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '13px', background: 'rgba(139,92,246,0.15)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
              </svg>
            </div>
            DCA Yatırım Planlayıcısı
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Düzenli yatırımın (Dollar-Cost Averaging) bileşik büyüme etkisini simüle et.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '28px', alignItems: 'flex-start' }}>
          {/* Controls Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Asset selector */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Yatırım Aracı
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {assetOptions.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setAssetId(a.id)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '12px 16px',
                      background: assetId === a.id ? `${a.color}15` : 'var(--bg-secondary)',
                      border: assetId === a.id ? `1.5px solid ${a.color}50` : '1px solid var(--border-color)',
                      borderRadius: '10px', cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: a.color }} />
                      <span style={{ fontSize: '14px', fontWeight: assetId === a.id ? 700 : 500, color: assetId === a.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {a.label}
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: a.color, background: `${a.color}15`, padding: '3px 8px', borderRadius: '6px' }}>
                      ~%{Math.round(a.annualReturn * 100)} yıllık
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly Amount */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Aylık Yatırım
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '16px' }}>₺</span>
                <input
                  type="number"
                  value={monthly}
                  min={500} max={50000} step={500}
                  onChange={e => setMonthly(Number(e.target.value))}
                  style={{
                    width: '100%', padding: '14px 14px 14px 36px',
                    background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                    borderRadius: '10px', color: 'var(--text-primary)', fontSize: '16px', fontWeight: 700,
                    outline: 'none',
                  }}
                  onFocus={e => e.target.style.borderColor = asset.color}
                  onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>
              <input type="range" min={500} max={20000} step={500} value={monthly}
                onChange={e => setMonthly(Number(e.target.value))}
                style={{ width: '100%', marginTop: '10px', accentColor: asset.color }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span>₺500</span><span>₺20,000</span>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Süre: <span style={{ color: asset.color }}>{months >= 12 ? `${Math.floor(months / 12)} Yıl ${months % 12 > 0 ? months % 12 + ' Ay' : ''}` : `${months} Ay`}</span>
              </label>
              <input type="range" min={6} max={120} step={6} value={months}
                onChange={e => setMonths(Number(e.target.value))}
                style={{ width: '100%', accentColor: asset.color }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span>6 Ay</span><span>10 Yıl</span>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              {[
                { label: 'Toplam Yatırılan', value: `₺${result.totalInvested.toLocaleString()}`, sub: `${months} ay × ₺${monthly.toLocaleString()}`, color: 'var(--text-secondary)' },
                { label: 'Nominal Getiri', value: `₺${result.finalNominal.toLocaleString()}`, sub: `+%${profitPct} kâr`, color: asset.color },
                { label: 'Reel Getiri', value: `₺${result.finalReel.toLocaleString()}`, sub: 'Enflasyondan arındırılmış', color: '#60a5fa' },
              ].map(kpi => (
                <div key={kpi.label} style={{
                  padding: '18px', background: 'var(--bg-secondary)',
                  borderRadius: '14px', border: '1px solid var(--border-color)',
                }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{kpi.label}</div>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: kpi.color, letterSpacing: '-0.5px' }}>{kpi.value}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{kpi.sub}</div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div style={{ height: '260px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dcaNominal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={asset.color} stopOpacity={0.6} />
                      <stop offset="95%" stopColor={asset.color} stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="dcaReel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="dcaInvested" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--text-secondary)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--text-secondary)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />
                  <XAxis dataKey="label" stroke="var(--text-secondary)" fontSize={11} tick={{ fill: 'var(--text-secondary)', fontWeight: 600 }} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} tick={{ fill: 'var(--text-secondary)' }} tickLine={false} axisLine={false} tickFormatter={v => `₺${v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                  <Tooltip
                    formatter={(val: number, name: string) => [`₺${val.toLocaleString()}`, name === 'nominal' ? 'Nominal' : name === 'reel' ? 'Reel' : 'Yatırılan']}
                    contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 16px' }}
                    itemStyle={{ fontWeight: 700 }}
                  />
                  <Area type="monotone" dataKey="invested" stroke="var(--text-secondary)" strokeWidth={1.5} strokeDasharray="4 3" fill="url(#dcaInvested)" />
                  <Area type="monotone" dataKey="reel" stroke="#60a5fa" strokeWidth={2} fill="url(#dcaReel)" />
                  <Area type="monotone" dataKey="nominal" stroke={asset.color} strokeWidth={3} fill="url(#dcaNominal)" style={{ filter: `drop-shadow(0 2px 8px ${asset.color}60)` }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {[
                { color: asset.color, label: 'Nominal Getiri (Beklenen)' },
                { color: '#60a5fa', label: 'Reel Getiri (Enflasyondan Arındırılmış)' },
                { color: 'var(--text-secondary)', label: 'Yatırılan Tutar (DCA)', dashed: true },
              ].map(l => (
                <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  <div style={{ width: '24px', height: '3px', background: l.color, borderRadius: '2px', borderTop: l.dashed ? '2px dashed' : 'none', boxSizing: 'border-box' }} />
                  {l.label}
                </span>
              ))}
            </div>

            {/* AI Insight */}
            <div style={{
              padding: '16px 20px',
              background: `${asset.color}08`, border: `1px solid ${asset.color}20`,
              borderRadius: '12px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6',
            }}>
              <strong style={{ color: 'var(--text-primary)' }}>🧠 AI Yorumu: </strong>
              Aylık <strong style={{ color: asset.color }}>₺{monthly.toLocaleString()}</strong>'yi {months >= 12 ? `${Math.floor(months / 12)} yıl boyunca` : `${months} ay boyunca`} <strong>{asset.label}</strong>'a yatırırsanız, nominal değeriniz{' '}
              <strong style={{ color: asset.color }}>₺{result.finalNominal.toLocaleString()}</strong>'ye ulaşır.
              {' '}Enflasyondan arındırıldığında reel gücünüz ise{' '}
              <strong style={{ color: '#60a5fa' }}>₺{result.finalReel.toLocaleString()}</strong> olur.
              {' '}Toplam <strong style={{ color: '#10b981' }}>₺{profit.toLocaleString()}</strong> kâr edersiniz!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DCAPlanner;
