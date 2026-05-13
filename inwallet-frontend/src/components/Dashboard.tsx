import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import FinancialGoalsModal from './FinancialGoalsModal';
import ScheduledTransactionsModal from './ScheduledTransactionsModal';
import { useAuth } from '../context/AuthContext';
import { assetApi, goalApi, userApi, marketApi, transactionApi } from '../services/api';

const COLORS = ['#00d2ff', '#f59e0b', '#8b5cf6', '#10b981', '#3b82f6'];

const Dashboard: React.FC = () => {
  const { userId, username, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [scheduledModalType, setScheduledModalType] = useState<'debt' | 'receivable' | null>(null);
  
  const [assets, setAssets] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [marketPrices, setMarketPrices] = useState<any>({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const handleNavigate = (viewId: string) => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: viewId }));
  };

  const fetchData = async () => {
    if (!userId) return;
    try {
      const uId = Number(userId);
      const [assetData, goalData, profileData, priceData, transData] = await Promise.all([
        assetApi.getAssets(uId).catch(() => []),
        goalApi.getGoals(uId).catch(() => []),
        userApi.getMe(uId).catch(() => null),
        marketApi.getPrices().catch(() => ({})),
        transactionApi.getTransactions(uId).catch(() => [])
      ]);
      setAssets(assetData);
      setGoals(goalData);
      setUserData(profileData);
      setMarketPrices(priceData);
      setTransactions(transData);
    } catch (error) {
      console.error('Veri çekme hatası:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, [userId, refreshKey]);

  const stats = useMemo(() => {
    const income = transactions
      .filter(t => ['INCOME', 'SELL'].includes((t.type || "").toUpperCase()))
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    
    const expense = transactions
      .filter(t => ['EXPENSE', 'BUY', 'INVESTMENT'].includes((t.type || "").toUpperCase()))
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    
    const cashBalance = income - expense;
    const assetValue = assets.reduce((sum, asset) => {
      const price = Number(marketPrices[asset.symbol] || asset.currentPrice || asset.averageBuyPrice || 0);
      return sum + (Number(asset.quantity) * price);
    }, 0);
    const totalNetWorth = cashBalance + assetValue;
    return { income, expense, cashBalance, assetValue, totalNetWorth };
  }, [transactions, assets, marketPrices]);

  const portfolioData = useMemo(() => {
    return assets.map((asset, index) => {
      const price = Number(marketPrices[asset.symbol] || asset.currentPrice || asset.averageBuyPrice || 0);
      return {
        name: asset.symbol || asset.name || 'Bilinmeyen',
        value: Number(asset.quantity || 0) * price,
        color: COLORS[index % COLORS.length]
      };
    }).filter(a => a.value > 0);
  }, [assets, marketPrices]);

  return (
    <div className="dashboard-grid animate-fade-in">
      <div className="col-span-12" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '0 10px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Hoş Geldin, {userData?.username || username || 'Kullanıcı'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              {currentTime.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span style={{ color: 'var(--accent-blue)', fontWeight: 600, fontSize: '14px' }}>
              {currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => handleNavigate('settings')}
            style={{
              padding: '8px 18px',
              borderRadius: '10px',
              border: '1.5px solid var(--accent-blue)',
              background: 'transparent',
              color: 'var(--accent-blue)',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          >
            Profilim
          </button>
          <button
            onClick={logout}
            style={{
              padding: '8px 18px',
              borderRadius: '10px',
              border: 'none',
              background: 'rgba(239,68,68,0.12)',
              color: '#ef4444',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.22)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.12)'; }}
          >
            Çıkış Yap
          </button>
        </div>
      </div>

      <div className="col-span-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-blue)', background: 'rgba(59, 130, 246, 0.05)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600 }}>TOPLAM NET VARLIK</div>
          <div className="sensitive-data" style={{ fontSize: '30px', fontWeight: 900, marginTop: '8px' }}>₺{stats.totalNetWorth.toLocaleString()}</div>
        </div>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-green)', background: 'rgba(16, 185, 129, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600 }}>TOPLAM GELİR</span>
            <button onClick={() => handleNavigate('transactions')} style={{ fontSize: '10px', color: 'var(--accent-green)', background: 'none', border: 'none', cursor: 'pointer' }}>Ekle</button>
          </div>
          <div style={{ fontSize: '30px', fontWeight: 900, marginTop: '8px', color: 'var(--accent-green)' }} className="sensitive-data">₺{stats.income.toLocaleString()}</div>
        </div>
        <div className="glass-card" style={{ borderLeft: '4px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600 }}>TOPLAM GİDER</span>
            <button onClick={() => handleNavigate('transactions')} style={{ fontSize: '10px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Ekle</button>
          </div>
          <div style={{ fontSize: '30px', fontWeight: 900, marginTop: '8px', color: '#ef4444' }} className="sensitive-data">₺{stats.expense.toLocaleString()}</div>
        </div>
      </div>

      <div className="col-span-8 glass-card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="card-title">Portföy Dağılımı</span>
          <button
            onClick={() => handleNavigate('portfolio')}
            style={{
              fontSize: '12px',
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1.5px solid var(--accent-blue)',
              background: 'transparent',
              color: 'var(--accent-blue)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          >
            Varlıkları Gör
          </button>
        </div>
        <div style={{ height: '300px', width: '100%' }}>
          {portfolioData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={portfolioData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5}>
                  {portfolioData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '12px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-secondary)' }}>Henüz varlık verisi yok.</div>}
        </div>
      </div>

      <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="glass-card" style={{ flex: 1 }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title">Finansal Hedefler</span>
            <button
              onClick={() => handleNavigate('goals')}
              style={{
                fontSize: '12px',
                fontWeight: 700,
                padding: '5px 14px',
                borderRadius: '20px',
                border: '1.5px solid var(--accent-blue)',
                background: 'transparent',
                color: 'var(--accent-blue)',
                cursor: 'pointer',
                letterSpacing: '0.3px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.1)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.transform = 'none';
              }}
            >Tümünü Gör →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
            {goals.length > 0 ? goals.slice(0, 3).map(goal => {
              const target = Number(goal.currentTargetPrice || goal.targetAmount || 1);
              const progress = Math.min(100, (stats.totalNetWorth / target) * 100);
              return (
                <div key={goal.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span>{goal.name}</span>
                    <span style={{ fontWeight: 700 }}>%{progress.toFixed(1)}</span>
                  </div>
                  <div style={{ height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent-blue)', borderRadius: '3px' }}></div>
                  </div>
                </div>
              );
            }) : <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px', padding: '20px' }}>Hedef bulunamadı.</p>}
          </div>
        </div>
      </div>

      <FinancialGoalsModal isOpen={isGoalsModalOpen} onClose={() => { setIsGoalsModalOpen(false); setRefreshKey(k => k + 1); }} />
      {scheduledModalType && (
        <ScheduledTransactionsModal type={scheduledModalType} isOpen={!!scheduledModalType} onClose={() => { setScheduledModalType(null); setRefreshKey(k => k + 1); }} />
      )}
    </div>
  );
};

export default Dashboard;
