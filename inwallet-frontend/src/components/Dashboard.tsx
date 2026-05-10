import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import FinancialGoalsModal from './FinancialGoalsModal';
import ScheduledTransactionsModal from './ScheduledTransactionsModal';
import { useAuth } from '../context/AuthContext';
import { assetApi, goalApi, userApi, marketApi } from '../services/api';

const COLORS = ['#00d2ff', '#f59e0b', '#8b5cf6', '#10b981', '#3b82f6'];

const Dashboard: React.FC = () => {
  const { userId } = useAuth();
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [scheduledModalType, setScheduledModalType] = useState<'debt' | 'receivable' | null>(null);
  
  const [assets, setAssets] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [marketPrices, setMarketPrices] = useState<any>({});
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
        const [assetData, goalData, profileData, priceData] = await Promise.all([
          assetApi.getAssets(userId),
          goalApi.getGoals(userId),
          userApi.getMe(userId),
          marketApi.getPrices()
        ]);
        setAssets(assetData);
        setGoals(goalData);
        setUserData(profileData);
        setMarketPrices(priceData);
      } catch (error) {
        console.error('Veri çekme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // 30 saniyede bir güncelle
    return () => clearInterval(interval);
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

  const emergencyFundMonthlyExpense = userData?.monthlyExpense || 0;
  const emergencyFundCurrent = assets
    .filter(a => a.type.toLowerCase().includes('nakit') || a.type.toLowerCase().includes('mevduat'))
    .reduce((sum, a) => sum + (a.quantity * (a.currentPrice || a.averageBuyPrice || 0)), 0);
  
  const emergencyFundTarget = emergencyFundMonthlyExpense * 6;
  const emergencyFundMonths = emergencyFundMonthlyExpense > 0 ? +(emergencyFundCurrent / emergencyFundMonthlyExpense).toFixed(1) : 0;
  const emergencyFundPercent = emergencyFundTarget > 0 ? Math.min(100, Math.round((emergencyFundCurrent / emergencyFundTarget) * 100)) : 0;

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
          </div>
          
          <div className="col-span-3 glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="card-header">
              <span className="card-title" style={{ fontSize: '14px' }}>Aylık Gelir</span>
            </div>
            <div className="stat-value sensitive-data">₺{(userData?.monthlyIncome || 0).toLocaleString()}</div>
            <div className="stat-label text-muted">Sabit Gelir</div>
          </div>

          <div className="col-span-3 glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <div className="card-header">
              <span className="card-title" style={{ fontSize: '14px' }}>Aylık Gider</span>
            </div>
            <div className="stat-value sensitive-data" style={{ fontSize: '24px' }}>₺{(userData?.monthlyExpense || 0).toLocaleString()}</div>
            <div className="stat-label text-danger" style={{ fontSize: '12px' }}>Tahmini Giderler</div>
            
            {/* Anomali Tespiti (Vision Item #3) */}
            {(userData?.monthlyExpense > 0) && (
              <div style={{ position: 'absolute', top: '10px', right: '10px', animation: 'pulse 2s infinite' }}>
                <span title="Anomali Tespiti yayında!" style={{ cursor: 'help' }}>🛡️</span>
              </div>
            )}
          </div>

          {/* Tasarruf Hızı */}
          <div className="col-span-3 glass-card interactive-card" onClick={() => setIsSavingsModalOpen(true)} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.02) 100%)', border: '1px solid rgba(16, 185, 129, 0.2)', cursor: 'pointer', transition: 'all 0.3s ease' }}>
            <div className="card-header" style={{ marginBottom: '8px' }}>
              <span className="card-title" style={{ fontSize: '14px', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
                Tasarruf Hızı
              </span>
            </div>
            {userData?.monthlyIncome > 0 ? (
              <>
                <div className="stat-value sensitive-data" style={{ fontSize: '28px', color: 'var(--accent-green)' }}>
                  %{Math.max(0, Math.round(((userData.monthlyIncome - userData.monthlyExpense) / userData.monthlyIncome) * 100))}
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', marginTop: '8px', marginBottom: '6px' }}>
                  <div style={{ width: `${Math.max(0, Math.round(((userData.monthlyIncome - userData.monthlyExpense) / userData.monthlyIncome) * 100))}%`, height: '100%', background: 'var(--accent-green)', borderRadius: '3px' }}></div>
                </div>
                <div className="stat-label text-muted" style={{ fontSize: '11px' }}>₺{Math.max(0, userData.monthlyIncome - userData.monthlyExpense).toLocaleString()} Tasarruf / Ay</div>
              </>
            ) : (
              <div className="stat-label text-muted">Profil verisi bekleniyor</div>
            )}
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
        {/* Dinamik Hedef Listesi */}
        {goals.length > 0 ? goals.slice(0, 3).map((goal, idx) => {
          const progress = Math.round(((goal.currentAmount || 0) / (goal.currentTargetPrice || goal.targetAmount || 1)) * 100);
          return (
            <div key={idx} style={{ marginBottom: '20px', marginTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>{goal.name}</span>
                <span style={{ color: getProgressColor(progress), fontWeight: 'bold', fontSize: '14px' }}>%{progress}</span>
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
            <p className="text-muted">Henüz hedef belirlemedin.</p>
          </div>
        )}

        {/* Acil Durum Fonu Mini Widget */}
        <div 
          onClick={() => setIsEmergencyModalOpen(true)}
          style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: emergencyFundPercent < 50 ? '#ef4444' : 'var(--accent-green)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Acil Durum Fonu
            </span>
            <span style={{ fontSize: '11px', background: emergencyFundPercent < 50 ? 'rgba(239,68,68,0.1)' : 'rgba(16, 185, 129, 0.1)', color: emergencyFundPercent < 50 ? '#ef4444' : 'var(--accent-green)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
              {emergencyFundPercent < 50 ? '⚠️ Düşük' : '✅ Güvende'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{emergencyFundMonths} / 6 ay karşılandı</span>
            <span style={{ color: emergencyFundPercent < 50 ? '#ef4444' : 'var(--accent-green)', fontWeight: 700 }}>%{emergencyFundPercent}</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${emergencyFundPercent}%`, height: '100%', background: emergencyFundPercent < 50 ? '#ef4444' : 'var(--accent-green)', borderRadius: '3px' }}></div>
          </div>
        </div>

        {/* Canlı Piyasa İzleme (Vision Item #2) */}
        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-neon-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                <polyline points="16 7 22 7 22 13"></polyline>
              </svg>
              Canlı Piyasa İzleme
            </span>
            <span style={{ fontSize: '10px', color: 'var(--accent-green)', fontWeight: 800 }}>LIVE</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { symbol: 'XAU', label: 'Altın (Gram)', price: marketPrices.XAU, icon: '🟡' },
              { symbol: 'BTC', label: 'Bitcoin', price: marketPrices.BTC, icon: '🟠' },
              { symbol: 'AAPL', label: 'Apple Inc.', price: marketPrices.AAPL, icon: '🍎' }
            ].map(m => (
              <div key={m.symbol} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>{m.icon}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{m.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{m.symbol}/TRY</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '800', fontSize: '14px' }}>₺{m.price ? m.price.toLocaleString() : '---'}</div>
                  <div style={{ fontSize: '10px', color: 'var(--accent-green)' }}>+0.45% ▲</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <FinancialGoalsModal isOpen={isGoalsModalOpen} onClose={handleModalClose} />
      <ScheduledTransactionsModal
        isOpen={scheduledModalType !== null}
        onClose={handleModalClose}
        type={scheduledModalType}
      />
    </div>
  );
};

export default Dashboard;
