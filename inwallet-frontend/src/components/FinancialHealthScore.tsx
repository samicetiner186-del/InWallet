import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface Metric {
  key: string;
  label: string;
  weight: number;
  score: number;
  color: string;
  icon: React.ReactNode;
  tip: string;
  explainTitle: string;
  explainBody: string;
  formula: string;
  ideal: string;
  detail: string;
}

interface FinancialHealthScoreProps {
  stats: {
    income: number;
    expense: number;
    realExpense: number;
    cashBalance: number;
    assetValue: number;
    totalNetWorth: number;
  };
  assets: any[];
  goals: any[];
  onNavigate?: (view: string) => void;
}

const FinancialHealthScore: React.FC<FinancialHealthScoreProps> = ({ stats, assets, goals }) => {
  const [expanded, setExpanded] = useState(false);
  const [activeMetric, setActiveMetric] = useState<Metric | null>(null);

  // ─── Sayaç Animasyonu (0 → totalScore) ──────────────────────
  const motionScore = useMotionValue(0);
  const springScore = useSpring(motionScore, { stiffness: 60, damping: 18 });
  const displayScore = useTransform(springScore, (v) => Math.round(v));

  const metrics: Metric[] = useMemo(() => {
    // 1. Tasarruf Oranı: (Gelir - Gerçek Gider) / Gelir
    const savingsRate = stats.income > 0 ? ((stats.income - stats.realExpense) / stats.income) * 100 : 0;
    const savingsScore = Math.min(100, Math.max(0, (savingsRate / 40) * 100)); // %40 tasarruf = 100 puan

    // 2. Borç/Gelir (Şimdilik Gider/Gelir olarak kullanıyoruz)
    const debtRatio = stats.income > 0 ? (stats.realExpense / stats.income) * 100 : 0;
    const debtScore = Math.min(100, Math.max(0, 100 - (debtRatio * 2))); // %50+ gider = 0 puan

    // 3. Çeşitlilik: Farklı varlık türü sayısı
    const uniqueTypes = new Set(assets.map(a => a.type)).size;
    const divScore = Math.min(100, (uniqueTypes / 4) * 100); // 4 farklı tür = 100 puan

    // 4. Acil Durum Fonu: Nakit / Aylık Gider
    const monthlyExpense = stats.realExpense || 1;
    const emergencyMonths = stats.cashBalance / monthlyExpense;
    const emergencyScore = Math.min(100, (emergencyMonths / 6) * 100); // 6 aylık gider = 100 puan

    // 5. Hedef Tamamlama
    const avgGoalProgress = goals.length > 0 
      ? goals.reduce((sum, g) => {
          const target = Number(g.currentTargetPrice || g.targetAmount || 1);
          return sum + Math.min(100, (stats.totalNetWorth / target) * 100);
        }, 0) / goals.length 
      : 0;
    const goalScore = Math.min(100, avgGoalProgress);

    return [
      {
        key: 'savings',
        label: 'Tasarruf Oranı',
        weight: 30,
        score: Math.round(savingsScore),
        color: '#10b981',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>
          </svg>
        ),
        tip: savingsRate >= 40 ? '%40 hedefini aştın! Mükemmel.' : `Tasarruf oranın %${savingsRate.toFixed(1)}. Bunu %40'a çıkarmaya çalış.`,
        explainTitle: 'Tasarruf Oranı Nedir?',
        explainBody: 'Aylık net gelirinizin yüzde kaçını harcamadan yatırıma veya birikime yönlendirdiğinizi gösterir.',
        formula: 'Tasarruf Oranı = (Gelir − Gerçek Gider) ÷ Gelir × 100',
        ideal: `İdeal: %20+ | Mevcut: %${savingsRate.toFixed(1)}`,
        detail: 'Bu oran finansal özgürlüğün anahtarıdır.',
      },
      {
        key: 'debt',
        label: 'Gider/Gelir Oranı',
        weight: 25,
        score: Math.round(debtScore),
        color: '#f59e0b',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        ),
        tip: debtRatio < 30 ? 'Giderlerin kontrol altında!' : 'Giderlerin gelire oranı yüksek. Sabit giderleri azaltmalısın.',
        explainTitle: 'Gider/Gelir Oranı Nedir?',
        explainBody: 'Aylık harcamalarınızın gelirinize oranıdır. Ne kadar düşükse o kadar güvendesiniz.',
        formula: 'Oran = Aylık Harcamalar ÷ Aylık Gelir × 100',
        ideal: `İdeal: %30 altı | Mevcut: %${debtRatio.toFixed(1)}`,
        detail: 'Harcama disiplini için en kritik göstergedir.',
      },
      {
        key: 'diversification',
        label: 'Portföy Çeşitliliği',
        weight: 20,
        score: Math.round(divScore),
        color: '#60a5fa',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
          </svg>
        ),
        tip: uniqueTypes >= 3 ? 'Güzel çeşitlendirilmiş bir portföy.' : 'Daha fazla varlık sınıfı ekleyerek riski dağıt.',
        explainTitle: 'Portföy Çeşitliliği Nedir?',
        explainBody: 'Yatırımlarınızın kaç farklı varlık sınıfına dağıtıldığını ölçer.',
        formula: 'Çeşitlilik = Varlık Sınıfı Sayısı / 4',
        ideal: `İdeal: 4+ varlık | Mevcut: ${uniqueTypes} varlık`,
        detail: 'Riski azaltmanın en iyi yolu çeşitliliktir.',
      },
      {
        key: 'emergency',
        label: 'Acil Durum Fonu',
        weight: 15,
        score: Math.round(emergencyScore),
        color: '#ef4444',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        ),
        tip: emergencyMonths >= 3 ? 'Acil durum fonun hazır!' : 'Acil durum fonunu en az 3 aylık giderine çıkar.',
        explainTitle: 'Acil Durum Fonu Nedir?',
        explainBody: 'Hızlıca nakde dönebilir, güvence rezervinizdir.',
        formula: 'Fon = Nakit / Aylık Gider',
        ideal: `İdeal: 3-6 ay | Mevcut: ${emergencyMonths.toFixed(1)} ay`,
        detail: 'Beklenmedik durumlara karşı kalkanınızdır.',
      },
      {
        key: 'goals',
        label: 'Hedef İlerleme',
        weight: 10,
        score: Math.round(goalScore),
        color: '#a78bfa',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
          </svg>
        ),
        tip: goalScore >= 50 ? 'Hedeflerine emin adımlarla ilerliyorsun!' : 'Hedeflerin için daha fazla birikim yapabilirsin.',
        explainTitle: 'Hedef İlerleme Oranı Nedir?',
        explainBody: 'Toplam net varlığınızın hedeflerinize oranını gösterir.',
        formula: 'Ort. İlerleme = (Net Varlık / Hedef) × 100',
        ideal: 'İdeal: %100 | Mevcut: %' + goalScore.toFixed(1),
        detail: 'Hedeflerinize olan gerçek mesafenizi gösterir.',
      },
    ];
  }, [stats, assets, goals]);

  const totalScore = Math.round(metrics.reduce((sum, m) => sum + (m.score * m.weight) / 100, 0));

  // Skor değişince animasyonu tetikle
  useEffect(() => {
    motionScore.set(totalScore);
  }, [totalScore]);

  const getGrade = (score: number) => {
    if (score >= 90) return { label: 'Mükemmel', color: '#10b981', emoji: '🏆' };
    if (score >= 75) return { label: 'Çok İyi', color: '#60a5fa', emoji: '⭐' };
    if (score >= 60) return { label: 'İyi', color: '#f59e0b', emoji: '👍' };
    if (score >= 45) return { label: 'Orta', color: '#f97316', emoji: '📈' };
    return { label: 'Geliştirilmeli', color: '#ef4444', emoji: '⚠️' };
  };

  const grade = getGrade(totalScore);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (totalScore / 100) * circumference;

  return (
    <>
      <div className="col-span-12 glass-card animate-slide-up" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>{grade.emoji}</span> Finansal Sağlık Skoru
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Verilerine göre anlık hesaplanan skorunuz.
            </p>
          </div>
          <button onClick={() => setExpanded(!expanded)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
            {expanded ? 'Gizle' : 'Detaylar'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ position: 'relative', width: '140px', height: '140px' }}>
              <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--bg-primary)" strokeWidth="12" />
                <motion.circle
                  cx="70" cy="70" r={radius} fill="none"
                  stroke={grade.color} strokeWidth="12"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: dashOffset }}
                  transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 8px ${grade.color}80)` }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div style={{ fontSize: '34px', fontWeight: 900, color: grade.color }}>
                  {displayScore}
                </motion.div>
              </div>
            </div>
            <div style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, color: grade.color, background: `${grade.color}18` }}>
              {grade.label}
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '260px' }}>
            {metrics.map(m => (
              <div key={m.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600 }}>
                    <span style={{ color: m.color }}>{m.icon}</span> {m.label}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: m.color }}>%{m.score}</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${m.score}%`, height: '100%', background: m.color, transition: 'width 1s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              key="details"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ paddingTop: '24px', borderTop: '1px dashed var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px', overflow: 'hidden' }}
            >
              {metrics.map((m, i) => (
                <motion.div
                  key={m.key}
                  onClick={() => setActiveMetric(m)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  whileHover={{ y: -3, boxShadow: `0 8px 24px ${m.color}20` }}
                  style={{ padding: '14px', background: `${m.color}08`, borderRadius: '12px', cursor: 'pointer', border: `1px solid ${m.color}18` }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 700, color: m.color, marginBottom: '4px' }}>{m.label}</div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{m.tip}</div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <MetricDetailModal metric={activeMetric} onClose={() => setActiveMetric(null)} />
    </>
  );
};

const MetricDetailModal: React.FC<{ metric: Metric | null; onClose: () => void }> = ({ metric, onClose }) => {
  if (!metric) return null;
  return (
    <div className="modal-overlay" style={{ zIndex: 2000 }}>
      <div className="glass-card animate-slide-up" style={{ maxWidth: '450px', width: '90%', padding: '32px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '24px', cursor: 'pointer' }}>×</button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${metric.color}15`, color: metric.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {metric.icon}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>{metric.explainTitle}</h3>
            <div style={{ fontSize: '12px', fontWeight: 700, color: metric.color, marginTop: '2px' }}>Ağırlık: %{metric.weight}</div>
          </div>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
          {metric.explainBody}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Nasıl Hesaplanır?</div>
            <div style={{ fontSize: '13px', fontFamily: 'monospace', color: metric.color }}>{metric.formula}</div>
          </div>

          <div style={{ padding: '16px', background: `${metric.color}08`, borderRadius: '12px', border: `1px solid ${metric.color}20` }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: metric.color, textTransform: 'uppercase', marginBottom: '6px' }}>Senin Durumun</div>
            <div style={{ fontSize: '15px', fontWeight: 700 }}>{metric.ideal}</div>
          </div>
        </div>

        <button onClick={onClose} className="btn-primary" style={{ width: '100%', marginTop: '30px', padding: '14px', background: metric.color }}>
          Anladım
        </button>
      </div>
    </div>
  );
};

export default FinancialHealthScore;
