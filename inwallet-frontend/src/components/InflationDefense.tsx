import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { financialHealthApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface InflationData {
  currentCash: number;
  inflationRate: number;
  scenarios: Array<{
    years: number;
    realValue: number;
    purchasingPowerLoss: number;
    requiredInvestment: number;
    monthlyRequired: number;
  }>;
}

const INFLATION_PRESETS = [
  { label: '%35 (Düşük)', value: 35, color: '#10b981' },
  { label: '%45 (Mevcut)', value: 45, color: '#f59e0b' },
  { label: '%60 (Yüksek)', value: 60, color: '#ef4444' },
  { label: '%80 (Kriz)', value: 80, color: '#9333ea' },
];

const InflationDefense: React.FC = () => {
  const { userId } = useAuth();
  const [data, setData] = useState<InflationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRate, setSelectedRate] = useState(45);
  const [customCash, setCustomCash] = useState<string>('');
  const [showCustom, setShowCustom] = useState(false);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await financialHealthApi.getInflationDefense(Number(userId), selectedRate);
      setData(result);
    } catch {
      setError('Enflasyon analizi şu an alınamıyor. Servis başlatıldığında tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }, [userId, selectedRate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Satın alma gücünü yüzde olarak hesapla (görselleştirme için)
  const getPowerPercent = (loss: number) => Math.max(0, 100 - loss);

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' }
    })
  };

  return (
    <div style={{ padding: '0' }}>
      {/* Başlık */}
      <div className="glass-card" style={{ marginBottom: '20px', padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              🔥 Enflasyon Savunma Analizi
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Nakit paranın gerçek değeri zaman içinde nasıl azalıyor? Bunu durdurmak için ne yapmalısın?
            </p>
          </div>
          <button onClick={fetchData} className="btn-secondary" disabled={loading} style={{ padding: '8px 16px', fontSize: '13px' }}>
            {loading ? '⏳ Yükleniyor...' : '🔄 Güncelle'}
          </button>
        </div>

        {/* Enflasyon Oranı Seçimi */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Yıllık Enflasyon Oranı
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {INFLATION_PRESETS.map(preset => (
              <motion.button
                key={preset.value}
                onClick={() => setSelectedRate(preset.value)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: `2px solid ${selectedRate === preset.value ? preset.color : 'var(--border-color)'}`,
                  background: selectedRate === preset.value ? `${preset.color}18` : 'transparent',
                  color: selectedRate === preset.value ? preset.color : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {preset.label}
              </motion.button>
            ))}
            <motion.button
              whileHover={{ scale: 1.04 }}
              onClick={() => setShowCustom(!showCustom)}
              style={{
                padding: '8px 16px', borderRadius: '20px',
                border: '2px dashed var(--border-color)',
                background: 'transparent', color: 'var(--text-secondary)',
                fontWeight: 700, fontSize: '13px', cursor: 'pointer',
              }}
            >
              ✏️ Özel
            </motion.button>
          </div>

          <AnimatePresence>
            {showCustom && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ marginTop: '12px', display: 'flex', gap: '10px', alignItems: 'center', overflow: 'hidden' }}
              >
                <input
                  type="number"
                  placeholder="Özel oran (örn: 55)"
                  value={customCash}
                  onChange={e => setCustomCash(e.target.value)}
                  style={{
                    padding: '8px 14px', borderRadius: '10px', width: '180px',
                    background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)', fontSize: '14px'
                  }}
                />
                <button
                  onClick={() => { if (customCash) { setSelectedRate(Number(customCash)); setShowCustom(false); } }}
                  className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  Uygula
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Hata Durumu */}
      {error && (
        <div className="glass-card" style={{ padding: '24px', textAlign: 'center', color: '#ef4444', background: 'rgba(239,68,68,0.05)' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚠️</div>
          <div>{error}</div>
        </div>
      )}

      {/* Yükleniyor */}
      {loading && !data && (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }} style={{ fontSize: '28px', display: 'inline-block' }}>⚙️</motion.div>
          <div style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>Analiz hesaplanıyor...</div>
        </div>
      )}

      {/* Senaryo Kartları */}
      {data && (
        <>
          {/* Mevcut Nakit Özeti */}
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: '20px', padding: '20px 28px', background: 'rgba(239,68,68,0.04)', borderLeft: '4px solid #ef4444' }}
          >
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>Mevcut Nakit</div>
                <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', marginTop: '4px' }}>
                  ₺{(data.currentCash || 0).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>Seçilen Oran</div>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#ef4444', marginTop: '4px' }}>%{data.inflationRate}</div>
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  💡 Bu nakit miktarını yastık altında tutarsan, her yıl yaklaşık <strong style={{ color: '#ef4444' }}>%{data.inflationRate}'lik reel değer kaybı</strong> yaşarsın. Buna karşı yatırım yapmalısın.
                </div>
              </div>
            </div>
          </motion.div>

          {/* Senaryo Kartları */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {data.scenarios?.map((scenario, i) => {
              const powerPct = getPowerPercent(scenario.purchasingPowerLoss);
              const yearColor = i === 0 ? '#10b981' : i === 1 ? '#f59e0b' : '#ef4444';
              return (
                <motion.div
                  key={scenario.years}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -4, boxShadow: `0 12px 32px ${yearColor}20` }}
                  className="glass-card"
                  style={{ padding: '20px', border: `1px solid ${yearColor}25` }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: yearColor }}>
                      {scenario.years} Yıl Sonra
                    </div>
                    <div style={{ padding: '4px 10px', borderRadius: '12px', background: `${yearColor}15`, fontSize: '12px', fontWeight: 700, color: yearColor }}>
                      -%{scenario.purchasingPowerLoss?.toFixed(0)}
                    </div>
                  </div>

                  {/* Satın Alma Gücü Çubuğu */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>Satın Alma Gücü Kaldı</div>
                    <div style={{ height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: '100%' }}
                        animate={{ width: `${powerPct}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut', delay: i * 0.1 + 0.3 }}
                        style={{ height: '100%', background: yearColor, borderRadius: '4px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      <span>%0</span>
                      <span style={{ fontWeight: 700, color: yearColor }}>%{powerPct.toFixed(0)}</span>
                      <span>%100</span>
                    </div>
                  </div>

                  {/* Değerler */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Gerçek Değer</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        ₺{(scenario.realValue || 0).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Korunmak İçin Gerekli</span>
                      <span style={{ fontWeight: 700, color: yearColor }}>
                        ₺{(scenario.requiredInvestment || 0).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div style={{
                      marginTop: '4px', padding: '10px', borderRadius: '10px',
                      background: `${yearColor}10`, border: `1px solid ${yearColor}20`
                    }}>
                      <div style={{ fontSize: '11px', color: yearColor, fontWeight: 700, marginBottom: '2px' }}>Aylık Gerekli Yatırım</div>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: yearColor }}>
                        ₺{(scenario.monthlyRequired || 0).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Tavsiye Kutusu */}
          <motion.div
            className="glass-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ padding: '20px 24px', background: 'rgba(59,130,246,0.05)', borderLeft: '4px solid var(--accent-blue)' }}
          >
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '10px' }}>
              💡 Enflasyona Karşı Stratejiler
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
              {[
                { emoji: '🥇', title: 'Altın', desc: 'Tarihsel enflasyon kalkanı' },
                { emoji: '📈', title: 'BIST Hisseleri', desc: 'Uzun vadede enflasyonu geçer' },
                { emoji: '🏠', title: 'Gayrimenkul', desc: 'Kira getirisi + değer artışı' },
                { emoji: '💱', title: 'Döviz/Kripto', desc: 'TL riskine karşı koruma' },
              ].map(s => (
                <div key={s.title} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '20px' }}>{s.emoji}</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{s.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default InflationDefense;
