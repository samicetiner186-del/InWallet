import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import FinancialGoalsModal from './FinancialGoalsModal';
import ScheduledTransactionsModal from './ScheduledTransactionsModal';
import { useAuth } from '../context/AuthContext';
import { assetApi, goalApi } from '../services/api';

const COLORS = ['#00d2ff', '#f59e0b', '#8b5cf6', '#10b981', '#3b82f6'];

const Dashboard: React.FC = () => {
  const { userId } = useAuth();
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [scheduledModalType, setScheduledModalType] = useState<'debt' | 'receivable' | null>(null);
  
  const [assets, setAssets] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [refreshKey, setRefreshKey] = useState(0);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);

  const getProgressColor = (percent: number) => {
    if (percent >= 80) return 'var(--accent-green)';
    if (percent >= 40) return 'var(--accent-blue)';
    return '#ef4444';
  };

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const [assetData, goalData] = await Promise.all([
          assetApi.getAssets(userId),
          goalApi.getGoals(userId)
        ]);
        setAssets(assetData);
        setGoals(goalData);
      } catch (error) {
        console.error('Veri çekme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, refreshKey]);

  // Varlıkları grafiğe uygun formata dönüştür
  const portfolioData = assets.reduce((acc: any[], asset) => {
    const existing = acc.find(item => item.name === asset.type);
    const value = (asset.quantity || 0) * (asset.currentPrice || asset.averageBuyPrice || 0);
    
    if (existing) {
      existing.value += value;
    } else {
      acc.push({ 
        name: asset.type, 
        value: value,
        color: COLORS[acc.length % COLORS.length]
      });
    }
    return acc;
  }, []);

  const totalNetWorth = portfolioData.reduce((sum, item) => sum + item.value, 0);

  const handleModalClose = () => {
    setIsGoalsModalOpen(false);
    setIsEmergencyModalOpen(false);
    setIsSavingsModalOpen(false);
    setScheduledModalType(null);
    setRefreshKey(prev => prev + 1); // Verileri yenile
  };

  return (
    <div className="dashboard-grid">
      
      {/* Top Stats Section */}
      <div className="col-span-12">
        <div className="dashboard-grid">
          <div className="col-span-3 glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="card-header">
              <span className="card-title">Toplam Net Varlık</span>
            </div>
            <div className="stat-value heading-gradient sensitive-data">
              ₺{totalNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
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
        <div style={{ height: '340px', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {portfolioData.length > 0 ? (
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
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📊</div>
              <p className="text-muted">Henüz varlık verisi yok. Portföyünü oluşturmaya başla!</p>
            </div>
          )}
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
        {goals.length > 0 ? goals.map((goal, idx) => (
          <div key={idx} style={{ marginBottom: '20px', marginTop: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>{goal.name}</span>
              <span className="text-muted">%{Math.round(((goal.currentAmount || 0) / (goal.targetAmount || 1)) * 100)}</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${Math.min(100, ((goal.currentAmount || 0) / (goal.targetAmount || 1)) * 100)}%`, 
                height: '100%', 
                background: COLORS[idx % COLORS.length] 
                  {/* Dinamik Hedef Listesi */}
        {goals.length > 0 ? goals.map((goal, idx) => {
          const progress = Math.round(((goal.currentAmount || 0) / (goal.targetAmount || 1)) * 100);
          return (
            <div key={idx} style={{ marginBottom: '20px', marginTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>{goal.name}</span>
                <span style={{ color: getProgressColor(progress), fontWeight: 'bold' }}>%{progress}</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${Math.min(100, progress)}%`, 
                  height: '100%', 
                  background: getProgressColor(progress)
                }}></div>
              </div>
            </div>
          );
        }) : (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🎯</div>
            <p className="text-muted">Hedef belirlemek başarının yarısıdır!</p>
          </div>
        )}

        {/* Acil Durum Fonu Mini Widget (Arkadaştan Gelen) */}
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
        </div>

        {/* Fiyat Alarmları Widget (Arkadaştan Gelen) */}
        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-neon-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              Canlı Fiyat Alarmları
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '14px', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px' }}>XAU</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>Altın (Gram)</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Hedef: ₺2,600</div>
                </div>
              </div>
              <div style={{ fontWeight: '800', fontSize: '14px', color: '#f59e0b' }}>%94</div>
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
      </div>ve-data" style={{ fontWeight: 'bold' }}>+₺3,250.00</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <FinancialGoalsModal 
        isOpen={isGoalsModalOpen} 
        onClose={handleModalClose} 
      />
      <ScheduledTransactionsModal
        isOpen={scheduledModalType !== null}
        onClose={handleModalClose}
        type={scheduledModalType}
      />
    </div>
  );
};

export default Dashboard;
