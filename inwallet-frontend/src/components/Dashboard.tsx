import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import FinancialGoalsModal from './FinancialGoalsModal';
import ScheduledTransactionsModal from './ScheduledTransactionsModal';

const portfolioData = [
  { name: 'Hisse Senedi', value: 55000, color: '#00d2ff' },
  { name: 'Altın', value: 45000, color: '#f59e0b' },
  { name: 'Kripto', value: 14500, color: '#8b5cf6' },
  { name: 'Döviz', value: 10000, color: '#10b981' },
];

const Dashboard: React.FC = () => {
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [scheduledModalType, setScheduledModalType] = useState<'debt' | 'receivable' | null>(null);

  return (
    <div className="dashboard-grid">
      
      {/* Top Stats Section */}
      <div className="col-span-12">
        <div className="dashboard-grid">
          <div className="col-span-3 glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="card-header">
              <span className="card-title">Toplam Net Varlık</span>
            </div>
            <div className="stat-value heading-gradient sensitive-data">₺124,500.00</div>
            <div style={{ 
              display: 'inline-block',
              background: '+5.2%'.startsWith('+') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: '+5.2%'.startsWith('+') ? 'var(--accent-green)' : 'var(--accent-red)',
              padding: '6px 12px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 700,
              marginTop: '4px'
            }} className="sensitive-data">
              {'+5.2%'.startsWith('+') ? '▲' : '▼'} {'+5.2%'} bu ay
            </div>
          </div>
          
          <div className="col-span-3 glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="card-header">
              <span className="card-title" style={{ fontSize: '14px' }}>Aylık Gelir</span>
            </div>
            <div className="stat-value sensitive-data">₺45,000.00</div>
            <div className="stat-label text-muted">Sabit Maaş</div>
          </div>

          <div className="col-span-3 glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="card-header">
              <span className="card-title" style={{ fontSize: '14px' }}>Aylık Gider</span>
            </div>
            <div className="stat-value sensitive-data" style={{ fontSize: '24px' }}>₺18,200.00</div>
            <div className="stat-label text-danger" style={{ fontSize: '12px' }}>Kredi & Faturalar</div>
          </div>

          {/* Tasarruf Hızı */}
          <div className="col-span-3 glass-card interactive-card" onClick={() => setIsSavingsModalOpen(true)} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.02) 100%)', border: '1px solid rgba(16, 185, 129, 0.2)', cursor: 'pointer', transition: 'all 0.3s ease' }}>
            <div className="card-header" style={{ marginBottom: '8px' }}>
              <span className="card-title" style={{ fontSize: '14px', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
                Tasarruf Hızı
              </span>
            </div>
            <div className="stat-value sensitive-data" style={{ fontSize: '28px', color: 'var(--accent-green)' }}>%59.5</div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', marginTop: '8px', marginBottom: '6px' }}>
              <div style={{ width: '59.5%', height: '100%', background: 'var(--accent-green)', borderRadius: '3px' }}></div>
            </div>
            <div className="stat-value sensitive-data">₺18,200.00</div>
            <div className="stat-label text-danger">Kredi & Faturalar</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="col-span-7 glass-card" style={{ minHeight: '400px' }}>
        <div className="card-header">
          <span className="card-title">Portföy Dağılımı & Analiz</span>
        </div>
        <div style={{ height: '340px', marginTop: '10px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={portfolioData}
                cx="50%"
                cy="50%"
                innerRadius={90}
                outerRadius={130}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {portfolioData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `₺${value.toLocaleString()}`}
                contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sidebar Area */}
      <div className="col-span-5 glass-card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="card-title">Finansal Hedefler</span>
          <button 
            onClick={() => setIsGoalsModalOpen(true)}
            style={{
              background: 'transparent',
              border: '1px solid var(--accent-blue)',
              color: 'var(--accent-blue)',
              padding: '4px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Tümünü Gör
          </button>
        </div>
        <div style={{ marginBottom: '20px', marginTop: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Ev Peşinatı</span>
            <span className="text-muted">45%</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: '12%', height: '100%', background: getProgressColor(12) }}></div>
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', marginRight: '14px', color: 'var(--accent-green)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 5.5L6.5 16 3 15l-1 1 4 4 1-1-1-3.5 2.5-2.5L14 21l1.2-.7c.4-.2.7-.6.6-1.1z"/>
                </svg>
              </div>
              Yaz Tatili
            </span>
            <span style={{ fontWeight: '500', fontSize: '14px', color: getProgressColor(30) }}>30%</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: '30%', height: '100%', background: getProgressColor(30) }}></div>
          </div>
        </div>

        {/* Acil Durum Fonu Mini Widget */}
        <div 
          onClick={() => setIsEmergencyModalOpen(true)}
          style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Acil Durum Fonu
            </span>
            <span style={{ fontSize: '11px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>⚠️ Düşük</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>1.2 / 6 ay karşılandı</span>
            <span style={{ color: '#ef4444', fontWeight: 700 }}>%20</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: '20%', height: '100%', background: '#ef4444', borderRadius: '3px' }}></div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>Tıkla: Detaylar ve büyütme planı</div>
        </div>

        {/* Fiyat Alarmları Widget */}
        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-neon-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              Canlı Fiyat Alarmları
            </span>
            <span style={{ fontSize: '12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>2 Aktif</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '14px', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px' }}>XAU</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>Altın (Gram)</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Satış Hedefi: ₺2,600</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '800', fontSize: '14px', color: '#f59e0b' }}>%94</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>Yaklaştı</div>
              </div>
            </div>

            <div style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px' }}>THY</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>THYAO</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Alım Hedefi: ₺290</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-primary)' }}>₺310.20</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>Anlık</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scheduled Debts & Receivables */}
      <div className="col-span-12">
        <div className="dashboard-grid">
          <div 
            className="col-span-6 glass-card interactive-card" 
            style={{ cursor: 'pointer', padding: '20px' }}
            onClick={() => setScheduledModalType('debt')}
          >
            <div className="card-header">
              <span className="card-title">Planlanmış Tarihli Borçlar</span>
            </div>
            <div style={{ marginTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>Konut Kredisi Taksiti</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '2px' }}>15 Mayıs 2026</div>
                </div>
                <div className="text-danger sensitive-data" style={{ fontWeight: 'bold' }}>-₺12,500.00</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>Kredi Kartı Ekstresi</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '2px' }}>22 Mayıs 2026</div>
                </div>
                <div className="text-danger sensitive-data" style={{ fontWeight: 'bold' }}>-₺8,450.00</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>Araç Sigortası</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '2px' }}>05 Haziran 2026</div>
                </div>
                <div className="text-danger sensitive-data" style={{ fontWeight: 'bold' }}>-₺4,200.00</div>
              </div>
            </div>
          </div>

          <div 
            className="col-span-6 glass-card interactive-card" 
            style={{ cursor: 'pointer', padding: '20px' }}
            onClick={() => setScheduledModalType('receivable')}
          >
            <div className="card-header">
              <span className="card-title">Planlanmış Tarihli Alacaklar</span>
            </div>
            <div style={{ marginTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>Freelance Proje</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '2px' }}>12 Mayıs 2026</div>
                </div>
                <div className="text-success sensitive-data" style={{ fontWeight: 'bold' }}>+₺15,000.00</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>Kira Geliri</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '2px' }}>20 Mayıs 2026</div>
                </div>
                <div className="text-success sensitive-data" style={{ fontWeight: 'bold' }}>+₺18,500.00</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>Temettü Ödemesi</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '2px' }}>28 Mayıs 2026</div>
                </div>
                <div className="text-success sensitive-data" style={{ fontWeight: 'bold' }}>+₺3,250.00</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scheduled Debts & Receivables */}
      <div className="col-span-12">
        <div className="dashboard-grid">
          <div 
            className="col-span-6 glass-card interactive-card" 
            style={{ cursor: 'pointer', padding: '20px' }}
            onClick={() => setScheduledModalType('debt')}
          >
            <div className="card-header">
              <span className="card-title">Planlanmış Tarihli Borçlar</span>
            </div>
            <div style={{ marginTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>Konut Kredisi Taksiti</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '2px' }}>15 Mayıs 2026</div>
                </div>
                <div className="text-danger sensitive-data" style={{ fontWeight: 'bold' }}>-₺12,500.00</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>Kredi Kartı Ekstresi</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '2px' }}>22 Mayıs 2026</div>
                </div>
                <div className="text-danger sensitive-data" style={{ fontWeight: 'bold' }}>-₺8,450.00</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>Araç Sigortası</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '2px' }}>05 Haziran 2026</div>
                </div>
                <div className="text-danger sensitive-data" style={{ fontWeight: 'bold' }}>-₺4,200.00</div>
              </div>
            </div>
          </div>

          <div 
            className="col-span-6 glass-card interactive-card" 
            style={{ cursor: 'pointer', padding: '20px' }}
            onClick={() => setScheduledModalType('receivable')}
          >
            <div className="card-header">
              <span className="card-title">Planlanmış Tarihli Alacaklar</span>
            </div>
            <div style={{ marginTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>Freelance Proje</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '2px' }}>12 Mayıs 2026</div>
                </div>
                <div className="text-success sensitive-data" style={{ fontWeight: 'bold' }}>+₺15,000.00</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>Kira Geliri</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '2px' }}>20 Mayıs 2026</div>
                </div>
                <div className="text-success sensitive-data" style={{ fontWeight: 'bold' }}>+₺18,500.00</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>Temettü Ödemesi</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '2px' }}>28 Mayıs 2026</div>
                </div>
                <div className="text-success sensitive-data" style={{ fontWeight: 'bold' }}>+₺3,250.00</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <FinancialGoalsModal 
        isOpen={isGoalsModalOpen} 
        onClose={() => setIsGoalsModalOpen(false)} 
      />
      <ScheduledTransactionsModal
        isOpen={scheduledModalType !== null}
        onClose={() => setScheduledModalType(null)}
        type={scheduledModalType}
      />
    </div>
  );
};

export default Dashboard;
