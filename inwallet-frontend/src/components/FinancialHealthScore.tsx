import React, { useState } from 'react';

const metrics = [
  {
    key: 'savings',
    label: 'Tasarruf Oranı',
    weight: 30,
    score: 92,
    color: '#10b981',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>
      </svg>
    ),
    tip: '%60 hedefine çok yakınsın! Mükemmel.',
    explainTitle: 'Tasarruf Oranı Nedir?',
    explainBody: 'Aylık net gelirinizin yüzde kaçını harcamadan yatırıma yönlendirdiğinizi gösterir. Finansal özgürlüğe giden yolun en güçlü belirleyicisidir; maaş büyüklüğünden bile daha önemlidir.',
    formula: 'Tasarruf Oranı = (Gelir − Gider) ÷ Gelir × 100',
    ideal: 'İdeal: %20+ | Mevcut: %59.5 ✅',
    detail: `Her %10'luk artış, hedefe ulaşma süresini yıllarca kısaltabilir. %60 üzeri oranlar "agresif tasarruf" kategorisindedir ve FIRE (Erken Emeklilik) hareketinin temelidir.`,
  },
  {
    key: 'debt',
    label: 'Borç/Gelir Oranı',
    weight: 25,
    score: 61,
    color: '#f59e0b',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    tip: 'Gider/gelir oranın biraz yüksek. Sabit giderleri %30\'a indirmeyi hedefle.',
    explainTitle: 'Borç/Gelir Oranı Nedir?',
    explainBody: 'Aylık sabit giderlerinizin (kira, kredi taksiti, faturalar) gelirinize oranını gösterir. Bu oran ne kadar düşükse o kadar finansal esnekliğiniz vardır.',
    formula: 'Borç/Gelir = Aylık Sabit Giderler ÷ Aylık Gelir × 100',
    ideal: 'İdeal: %30 altı | Mevcut: %40.4 ⚠️',
    detail: `Bankalar ev kredisi verirken bu oranı %43'ün altında görmek ister. %30 altında tutmak, beklenmedik gelir düşüşlerine karşı tampon oluşturur.`,
  },
  {
    key: 'diversification',
    label: 'Portföy Çeşitliliği',
    weight: 20,
    score: 78,
    color: '#60a5fa',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
      </svg>
    ),
    tip: '4 farklı varlık sınıfı iyi. Tahvil/fon ekleyerek mükemmelleştirebilirsin.',
    explainTitle: 'Portföy Çeşitliliği Nedir?',
    explainBody: 'Yatırımlarınızın kaç farklı varlık sınıfına (hisse, altın, döviz, kripto, tahvil vb.) dağıtıldığını ölçer. Çeşitlilik, tek bir varlığın çöküşünden tüm portföyü korur.',
    formula: 'Çeşitlilik Skoru = Farklı Varlık Sınıfı Sayısı ÷ 5 × 100',
    ideal: 'İdeal: 5+ varlık sınıfı | Mevcut: 4 varlık ✅',
    detail: `"Tüm yumurtaları aynı sepete koyma" prensibi. Birbiriyle negatif korelasyonlu varlıklar (örn. altın + borsa) kriz anlarında kaybı dengeler.`,
  },
  {
    key: 'emergency',
    label: 'Acil Durum Fonu',
    weight: 15,
    score: 20,
    color: '#ef4444',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    tip: `Sadece 1.2 aylık giderin güvende! Acil fonunu en az 3 aya çıkar.`,
    explainTitle: `Acil Durum Fonu Nedir?`,
    explainBody: `Anında likide edilebilir (banka hesabı/para piyasası fonu) olarak tuttuğunuz ve yalnızca gerçek acil durumlar için ayrılan nakit rezervidir. Yatırım değil, sigorta olarak düşünülmelidir.`,
    formula: `Acil Fon = Aylık Gider × Hedef Ay Sayısı (3–6 ay)`,
    ideal: `İdeal: 3–6 aylık gider | Mevcut: 1.2 ay 🔴`,
    detail: `Bu fon olmadan iş kaybı veya büyük gider, yatırımlarınızı en kötü zamanda — piyasa düşüşünde — satmak zorunda bırakır. Bu "davranışsal finans" tuzağı en iyi portföyleri bile mahveder.`,
  },
  {
    key: 'goals',
    label: 'Hedef Tamamlama',
    weight: 10,
    score: 44,
    color: '#a78bfa',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
      </svg>
    ),
    tip: 'Hedeflerinin %32\'sini tamamladın. İyi başlangıç, devam et!',
    explainTitle: 'Hedef Tamamlama Oranı Nedir?',
    explainBody: 'Belirlediğiniz finansal hedeflere (ev peşinatı, araç, tatil vb.) toplamda ne kadar yaklaştığınızı ölçer. Hedefsiz tasarruf motivasyonu düşürür ve odağı dağıtır.',
    formula: 'Ort. Tamamlanma = (Biriktirilen ÷ Hedef) × 100 (tüm hedeflerin ortalaması)',
    ideal: 'İdeal: Tüm hedeflerde ilerlemeli büyüme | Mevcut: %32 📈',
    detail: `Her hedef için net bir son tarih ve enflasyon ayarlaması yapmak, birikimin gerçekçi kalmasını sağlar. Enflasyon hedefinizin ötesinde büyüyorsa reel değer kaybediyorsunuzdur.`,
  },
];

const totalScore = Math.round(metrics.reduce((sum, m) => sum + (m.score * m.weight) / 100, 0));

const getGrade = (score: number) => {
  if (score >= 90) return { label: 'Mükemmel', color: '#10b981', emoji: '🏆' };
  if (score >= 75) return { label: 'Çok İyi', color: '#60a5fa', emoji: '⭐' };
  if (score >= 60) return { label: 'İyi', color: '#f59e0b', emoji: '👍' };
  if (score >= 45) return { label: 'Orta', color: '#f97316', emoji: '📈' };
  return { label: 'Geliştirilmeli', color: '#ef4444', emoji: '⚠️' };
};

interface MetricDetailModalProps {
  metric: typeof metrics[0] | null;
  onClose: () => void;
}

const MetricDetailModal: React.FC<MetricDetailModalProps> = ({ metric, onClose }) => {
  if (!metric) return null;
  return (
    <div
      className="modal-overlay open"
      onClick={onClose}
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 9999 }}
    >
      <div
        className="modal-content animate-slide-up"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '400px',
          width: '95%',
          padding: 0,
          background: 'var(--bg-primary)',
          border: `1px solid ${metric.color}30`,
          borderTop: `4px solid ${metric.color}`,
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
        }}
      >
        <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: `${metric.color}18`, border: `1px solid ${metric.color}30`, color: metric.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {metric.icon}
            </div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {metric.explainTitle}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '16px', cursor: 'pointer', width: '30px', height: '30px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
        <div style={{ padding: '20px 24px 24px' }}>
          <p style={{ margin: 0, fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: '1.75' }}>
            {metric.explainBody}
          </p>
        </div>
      </div>
    </div>
  );
};

interface FinancialHealthScoreProps {
  onNavigate?: (view: string) => void;
}

const FinancialHealthScore: React.FC<FinancialHealthScoreProps> = () => {
  const [expanded, setExpanded] = useState(false);
  const [activeMetric, setActiveMetric] = useState<typeof metrics[0] | null>(null);
  const grade = getGrade(totalScore);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (totalScore / 100) * circumference;

  return (
    <>
      <div
        className="col-span-12 glass-card animate-slide-up"
        style={{
          background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
          border: '1px solid var(--border-color)',
          padding: '28px',
        }}
      >
        {/* Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '22px' }}>{grade.emoji}</span>
              Finansal Sağlık Skoru
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              5 kritik metriğin ağırlıklı ortalaması · <span style={{ color: 'var(--accent-blue)' }}>Metrik adına tıklayarak detay öğren</span>
            </p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
              borderRadius: '10px', padding: '8px 16px', fontSize: '13px', fontWeight: 600,
              color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s ease',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            {expanded ? 'Gizle' : 'İpuçları'}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points={expanded ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Score Ring */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <div style={{ position: 'relative', width: '140px', height: '140px' }}>
              <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--bg-primary)" strokeWidth="12" />
                <circle
                  cx="70" cy="70" r={radius} fill="none"
                  stroke={grade.color} strokeWidth="12"
                  strokeDasharray={circumference} strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)', filter: `drop-shadow(0 0 8px ${grade.color}80)` }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '34px', fontWeight: 900, color: grade.color, letterSpacing: '-2px', lineHeight: 1 }}>{totalScore}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '3px' }}>/ 100</div>
              </div>
            </div>
            <div style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, color: grade.color, background: `${grade.color}18`, border: `1px solid ${grade.color}30` }}>
              {grade.label}
            </div>
          </div>

          {/* Metrics List */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '260px' }}>
            {metrics.map(m => (
              <div key={m.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <button
                    onClick={() => setActiveMetric(m)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600,
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      padding: '3px 8px 3px 0', borderRadius: '6px',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.color = m.color;
                      (e.currentTarget as HTMLButtonElement).style.background = `${m.color}12`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    }}
                    title={`${m.label} hakkında bilgi al`}
                  >
                    <span style={{ color: m.color }}>{m.icon}</span>
                    {m.label}
                    <span style={{ fontSize: '11px', opacity: 0.55 }}>(Ağırlık: %{m.weight})</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                  </button>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: m.color }}>
                    {m.score}<span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)' }}>/100</span>
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${m.score}%`, height: '100%',
                    background: `linear-gradient(90deg, ${m.color}cc, ${m.color})`,
                    borderRadius: '3px',
                    transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expanded Tips */}
        {expanded && (
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px dashed var(--border-color)' }}>
            <h4 style={{ margin: '0 0 16px', fontSize: '15px', color: 'var(--text-primary)', fontWeight: 700 }}>
              🧠 Skorunu Artırmak İçin Öneriler
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {metrics.map(m => (
                <div
                  key={m.key}
                  onClick={() => setActiveMetric(m)}
                  style={{
                    padding: '14px 16px', background: `${m.color}08`, border: `1px solid ${m.color}20`,
                    borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start',
                    cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 20px ${m.color}18`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                  }}
                >
                  <div style={{ color: m.color, marginTop: '2px', flexShrink: 0 }}>{m.icon}</div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: m.color, marginBottom: '4px' }}>{m.label}</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{m.tip}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <MetricDetailModal metric={activeMetric} onClose={() => setActiveMetric(null)} />
    </>
  );
};

export default FinancialHealthScore;
