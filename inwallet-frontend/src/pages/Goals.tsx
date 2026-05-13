import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { goalApi, userApi, assetApi, transactionApi, marketApi } from '../services/api';
import FinancialGoalsModal from '../components/FinancialGoalsModal';

// SVG Goal Type Icons - replaces emojis
const GoalTypeIcon = ({ type, size = 40 }: { type: string; size?: number }): React.ReactNode => {
  const icons: Record<string, React.ReactNode> = {
    HOUSE: (
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    CAR: (
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 12.5L9.5 9c.3-.6.9-1 1.6-1h3.8c.7 0 1.3.4 1.6 1l1.5 3.5" />
        <path d="M2 12.5h20v2c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1v-2z" />
        <path d="M2 14.5h3a2 2 0 0 1 4 0h6a2 2 0 0 1 4 0h3" />
        <circle cx="7" cy="16.5" r="2" />
        <circle cx="17" cy="16.5" r="2" />
      </svg>
    ),
    VACATION: (
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16v-2l-8-5V3a1 1 0 0 0-2 0v6l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5l7 2.5z" />
      </svg>
    ),
    EDUCATION: (
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
    SAVINGS: (
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    OTHER: (
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  };
  return icons[type] || icons['OTHER'];
};

// Goal icon colors by type
const goalTypeColors: Record<string, string> = {
  HOUSE: '#3b82f6',
  CAR: '#8b5cf6',
  VACATION: '#f59e0b',
  EDUCATION: '#10b981',
  SAVINGS: '#06b6d4',
  OTHER: '#94a3b8',
};

// Goal type labels
const goalTypeLabels: Record<string, string> = {
  HOUSE: 'Konut',
  CAR: 'Araç',
  VACATION: 'Tatil',
  EDUCATION: 'Eğitim',
  SAVINGS: 'Birikim',
  OTHER: 'Diğer',
};

// Edit SVG icon
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

// Delete SVG icon
const DeleteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

// Stats card icons
const TargetIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const TrophyIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
  </svg>
);

const TrendIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const Goals: React.FC = () => {
  const { userId } = useAuth();
  const [goalsList, setGoalsList] = useState<any[]>([]);
  const [_userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<any>(null);

  const [assets, setAssets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [marketPrices, setMarketPrices] = useState<any>({});

  const fetchData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const uId = Number(userId);
      const [gData, uData, aData, tData, pData] = await Promise.all([
        goalApi.getGoals(uId).catch(() => []),
        userApi.getMe(uId).catch(() => null),
        assetApi.getAssets(uId).catch(() => []),
        transactionApi.getTransactions(uId).catch(() => []),
        marketApi.getPrices().catch(() => ({}))
      ]);
      setGoalsList(Array.isArray(gData) ? gData : []);
      setUserData(uData);
      setAssets(aData);
      setTransactions(tData);
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

  const totalNetWorth = useMemo(() => {
    const income = transactions
      .filter(t => ['INCOME', 'SELL'].includes((t.type || "").toUpperCase()))
      .reduce((s, t) => s + Number(t.amount || 0), 0);

    const realExpense = transactions
      .filter(t => (t.type || "").toUpperCase() === 'EXPENSE')
      .reduce((s, t) => s + Number(t.amount || 0), 0);

    const investments = transactions
      .filter(t => ['BUY', 'INVESTMENT'].includes((t.type || "").toUpperCase()))
      .reduce((s, t) => s + Number(t.amount || 0), 0);

    const cashBalance = income - realExpense - investments;

    const assetValue = assets.reduce((sum, asset) => {
      const price = Number(marketPrices[asset.symbol] || asset.currentPrice || asset.averageBuyPrice || 0);
      return sum + (Number(asset.quantity) * price);
    }, 0);

    return cashBalance + assetValue;
  }, [transactions, assets, marketPrices]);

  const stats = useMemo(() => {
    if (goalsList.length === 0) return { total: 0, completed: 0, avgProgress: 0 };
    const total = goalsList.length;

    const sortedGoals = [...goalsList].sort((a, b) => (Number(a.priority) || 99) - (Number(b.priority) || 99));
    let currentPool = totalNetWorth;

    const progressList = sortedGoals.map(g => {
      const target = Number(g.currentTargetPrice || g.targetAmount || 1);
      const progress = Math.min(100, (currentPool / target) * 100);
      currentPool = Math.max(0, currentPool - target);
      return progress;
    });

    const completed = progressList.filter(p => p >= 100).length;
    const avgProgress = progressList.reduce((sum, p) => sum + p, 0) / total;

    return { total, completed, avgProgress };
  }, [goalsList, totalNetWorth]);

  const handleDeleteGoal = async (id: number) => {
    if (!window.confirm("Bu hedefi silmek istediğinize emin misiniz?")) return;
    try {
      await goalApi.deleteGoal(id);
      fetchData();
    } catch (err) {
      alert("Hedef silinemedi.");
    }
  };

  const handleEditGoal = (goal: any) => {
    setGoalToEdit(goal);
    setIsModalOpen(true);
  };

  const handleOpenNewGoalModal = () => {
    setGoalToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="dashboard-grid animate-fade-in">
      {/* Header */}
      <div className="col-span-12" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>Finansal Hedeflerin</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0 0' }}>Hayallerine giden yolda ne kadar yaklaştığını takip et.</p>
        </div>
        <button onClick={handleOpenNewGoalModal} className="btn-primary" style={{ padding: '12px 24px', borderRadius: '12px', fontSize: '15px', fontWeight: 700 }}>
          + Yeni Hedef Ekle
        </button>
      </div>

      {/* Stats Cards */}
      <div className="col-span-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden', borderLeft: '4px solid var(--accent-blue)', background: 'rgba(59, 130, 246, 0.05)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Mevcut Net Varlık</div>
          <div style={{ fontSize: '28px', fontWeight: 900, marginTop: '12px', color: 'var(--text-primary)' }}>₺{totalNetWorth.toLocaleString()}</div>
          <div style={{ position: 'absolute', right: '16px', bottom: '16px', opacity: 0.1, color: 'var(--accent-blue)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden', borderLeft: '4px solid var(--accent-blue)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Aktif Hedefler</div>
          <div style={{ fontSize: '28px', fontWeight: 900, marginTop: '12px', color: 'var(--text-primary)' }}>{stats.total}</div>
          <div style={{ position: 'absolute', right: '16px', bottom: '16px', opacity: 0.08, color: 'var(--accent-blue)' }}><TargetIcon /></div>
        </div>
        <div className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden', borderLeft: '4px solid var(--accent-green)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Tamamlanan</div>
          <div style={{ fontSize: '28px', fontWeight: 900, marginTop: '12px', color: 'var(--accent-green)' }}>{stats.completed}</div>
          <div style={{ position: 'absolute', right: '16px', bottom: '16px', opacity: 0.08, color: 'var(--accent-green)' }}><TrophyIcon /></div>
        </div>
        <div className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden', borderLeft: '4px solid var(--accent-blue)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Ortalama İlerleme</div>
          <div style={{ fontSize: '28px', fontWeight: 900, marginTop: '12px', color: 'var(--text-primary)' }}>%{Math.round(stats.avgProgress)}</div>
          <div style={{ position: 'absolute', right: '16px', bottom: '16px', opacity: 0.08, color: 'var(--accent-blue)' }}><TrendIcon /></div>
        </div>
      </div>

      {/* Goal Cards */}
      <div className="col-span-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
        {loading && goalsList.length === 0 ? (
          <div className="col-span-full" style={{ textAlign: 'center', padding: '100px', color: 'var(--text-secondary)' }}>Hedefleriniz yükleniyor...</div>
        ) : goalsList.length === 0 ? (
          <div className="col-span-full glass-card" style={{ textAlign: 'center', padding: '80px' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', color: 'var(--accent-blue)' }}><TargetIcon /></div>
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Henüz bir hedefin yok mu?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Hemen birikim yapmaya başlamak için ilk hedefini oluştur!</p>
            <button onClick={handleOpenNewGoalModal} className="btn-primary" style={{ padding: '12px 32px' }}>Şimdi Başla</button>
          </div>
        ) : (
          (() => {
            const sortedGoals = [...goalsList].sort((a, b) => (Number(a.priority) || 99) - (Number(b.priority) || 99));
            let currentPool = totalNetWorth;

            return sortedGoals.map(goal => {
              const target = Number(goal.currentTargetPrice || goal.targetAmount || 1);
              const allocated = Math.min(currentPool, target);
              const progress = Math.min(100, (allocated / target) * 100);
              const remainingNeeded = Math.max(0, target - allocated);

              const availableInThisStep = currentPool;
              currentPool = Math.max(0, currentPool - target);

              const today = new Date();
              const targetDate = goal.targetDate ? new Date(goal.targetDate) : null;
              const monthsLeft = targetDate ? (targetDate.getFullYear() - today.getFullYear()) * 12 + (targetDate.getMonth() - today.getMonth()) : 0;
              const monthlySavings = monthsLeft > 0 ? (remainingNeeded / monthsLeft) : remainingNeeded;

              const typeColor = goalTypeColors[goal.type] || goalTypeColors['OTHER'];

              return (
                <div key={goal.id} className="glass-card animate-hover" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative', borderTop: `4px solid ${typeColor}`, overflow: 'hidden', opacity: availableInThisStep <= 0 ? 0.6 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1, position: 'relative' }}>
                    <div style={{ flex: 1, paddingRight: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `${typeColor}18`, color: typeColor, border: `1px solid ${typeColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <GoalTypeIcon type={goal.type} size={18} />
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: typeColor, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{goalTypeLabels[goal.type] || goal.type}</span>
                      </div>
                      <h3 style={{ margin: 0, fontSize: '21px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{goal.name}</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0, zIndex: 10 }}>
                      <button onClick={() => handleEditGoal(goal)} className="btn-secondary" style={{ width: '34px', height: '34px', borderRadius: '9px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Hedefi Düzenle"><EditIcon /></button>
                      <button onClick={() => handleDeleteGoal(goal.id)} className="btn-danger" style={{ width: '34px', height: '34px', borderRadius: '9px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.1)' }} title="Hedefi Sil"><DeleteIcon /></button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', position: 'relative', zIndex: 1 }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: `${typeColor}15`, color: typeColor, border: `1px solid ${typeColor}30`, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>
                      Öncelik {goal.priority}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: 'rgba(128,128,128,0.1)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                      {targetDate ? targetDate.toLocaleDateString('tr-TR') : '---'}
                    </span>
                  </div>

                  <div style={{ marginTop: '5px', position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Hedef İlerlemesi</span>
                      <span style={{ fontWeight: 800, color: progress >= 100 ? 'var(--accent-green)' : typeColor }}>%{progress.toFixed(1)}</span>
                    </div>
                    <div style={{ height: '10px', background: 'rgba(128,128,128,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${progress}%`, background: progress >= 100 ? 'var(--accent-green)' : `linear-gradient(90deg, ${typeColor} 0%, ${typeColor}cc 100%)`, boxShadow: progress >= 100 ? '0 0 16px rgba(34,197,94,0.4)' : `0 0 16px ${typeColor}40`, transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)', borderRadius: '10px' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', position: 'relative', zIndex: 1 }}>
                    <div style={{ padding: '14px', background: 'rgba(128,128,128,0.05)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {progress >= 100 ? 'Ayrılan Tutar' : 'Kalan Varlıktan Pay'}
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)' }}>₺{allocated.toLocaleString()}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>Öncelik sırasına göre.</div>
                    </div>
                    <div style={{ padding: '14px', background: 'rgba(128,128,128,0.05)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vade Sonu Tahmini</div>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)' }}>₺{target.toLocaleString()}</div>
                    </div>
                  </div>

                  {remainingNeeded > 0 ? (
                    <div style={{ position: 'relative', zIndex: 1, padding: '14px', background: `${typeColor}0d`, borderRadius: '12px', border: `1px solid ${typeColor}25` }}>
                      <div style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Aylık Hedef:</span>
                        <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '15px' }}>₺{Math.round(monthlySavings).toLocaleString()}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '5px' }}>Bu hedefe {monthsLeft > 0 ? `${monthsLeft} ayda` : 'kısa sürede'} ulaşmak için gereken birikim.</div>
                    </div>
                  ) : (
                    <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: 'var(--accent-green)', fontWeight: 800, fontSize: '15px', padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <TrophyIcon />
                      Tebrikler! Bu Hedef İçin Kaynak Ayrıldı
                    </div>
                  )}
                </div>
              );
            });
          })()
        )}
      </div>

      <FinancialGoalsModal
        isOpen={isModalOpen}
        goalToEdit={goalToEdit}
        onClose={() => {
          setIsModalOpen(false);
          setGoalToEdit(null);
          fetchData();
        }}
      />
    </div>
  );
};

export default Goals;
