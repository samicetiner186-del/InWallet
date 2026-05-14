import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import FinancialGoalsModal from './FinancialGoalsModal';
import ScheduledTransactionsModal from './ScheduledTransactionsModal';
import FinancialHealthScore from './FinancialHealthScore';
import BudgetStatusWidget from './BudgetStatusWidget';
import { useAuth } from '../context/AuthContext';

import { assetApi, goalApi, userApi, marketApi, transactionApi } from '../services/api';

// ─── Animasyon Varyantları ───────────────────────────────────────────────────
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden:  { opacity: 0, y: 28, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.45, ease: 'easeOut' } },
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

const Dashboard: React.FC = () => {
  const { userId, username } = useAuth();
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
    // 1. Toplam Gelir (Maaş, Satış vb.)
    const income = transactions
      .filter(t => ['INCOME', 'SELL'].includes((t.type || "").toUpperCase()))
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    
    // 2. Gerçek Giderler (Kira, Fatura, Yemek vb. - Geri gelmeyecek para)
    const realExpense = transactions
      .filter(t => (t.type || "").toUpperCase() === 'EXPENSE')
      .reduce((s, t) => s + Number(t.amount || 0), 0);

    // 3. Yatırımlar (Hisse Alımı, Kripto Alımı vb. - Hala senin olan para)
    const investments = transactions
      .filter(t => ['BUY', 'INVESTMENT'].includes((t.type || "").toUpperCase()))
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    
    // 4. Nakit Bakiyesi (Cebindeki para)
    const cashBalance = income - realExpense - investments;

    // 5. Varlık Değeri (Portföyündeki varlıkların güncel piyasa değeri)
    const assetValue = assets.reduce((sum, asset) => {
      const price = Number(marketPrices[asset.symbol] || asset.currentPrice || asset.averageBuyPrice || 0);
      return sum + (Number(asset.quantity) * price);
    }, 0);

    // 6. TOPLAM NET VARLIK (Nakit + Yatırımlar)
    const totalNetWorth = cashBalance + assetValue;

    return { income, expense: realExpense + investments, realExpense, cashBalance, assetValue, totalNetWorth };
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
    <motion.div
      className="dashboard-grid"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >

      {/* Header */}
      <motion.div variants={cardVariants} className="col-span-12" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '0 10px' }}>
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
      </motion.div>

      {/* Main Stats — Stagger */}
      <motion.div variants={cardVariants} className="col-span-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <motion.div variants={cardVariants} className="glass-card" style={{ borderLeft: '4px solid var(--accent-blue)', background: 'rgba(59, 130, 246, 0.08)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>TOPLAM NET VARLIK (Nakit + Yatırım)</div>
          <div className="sensitive-data" style={{ fontSize: '32px', fontWeight: 900, marginTop: '8px', color: 'var(--text-primary)' }}>
            ₺{stats.totalNetWorth.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px', fontSize: '12px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Nakit: ₺{stats.cashBalance.toLocaleString()}</span>
            <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Varlık: ₺{stats.assetValue.toLocaleString()}</span>
          </div>
        </motion.div>
        
        <motion.div variants={cardVariants} className="glass-card" style={{ borderLeft: '4px solid var(--accent-green)', background: 'rgba(16, 185, 129, 0.05)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>TOPLAM GELİR</div>
          <div style={{ fontSize: '32px', fontWeight: 900, marginTop: '8px', color: 'var(--accent-green)' }} className="sensitive-data">
            ₺{stats.income.toLocaleString()}
          </div>
        </motion.div>

        <motion.div variants={cardVariants} className="glass-card" style={{ borderLeft: '4px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>GERÇEK GİDERLER</div>
          <div style={{ fontSize: '32px', fontWeight: 900, marginTop: '8px', color: '#ef4444' }} className="sensitive-data">
            ₺{stats.realExpense.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '5px' }}>Yatırımlar hariç net harcama.</div>
        </motion.div>
      </motion.div>

      {/* Financial Health Score */}
      <motion.div variants={cardVariants} className="col-span-12">
        <FinancialHealthScore stats={stats} assets={assets} goals={goals} onNavigate={handleNavigate} />
      </motion.div>

      {/* Portfolio Distribution & Analytics */}
      <motion.div variants={cardVariants} className="col-span-8 glass-card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="card-title">Portföy Dağılımı</span>
          <button onClick={() => handleNavigate('portfolio')} className="btn-secondary" style={{ fontSize: '12px', padding: '6px 14px' }}>Varlıkları Yönet</button>
        </div>
        <div style={{ height: '350px', width: '100%' }}>
          {portfolioData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={portfolioData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={8}>
                  {portfolioData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (

            <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-secondary)' }}>
              <p>Henüz yatırım verisi yok.</p>
              <button onClick={() => handleNavigate('portfolio')} className="btn-primary" style={{ marginTop: '15px' }}>Varlık Ekle</button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Side Widgets Column */}
      <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Goals Sidebar */}
        <motion.div variants={cardVariants} className="glass-card" style={{ flex: 1 }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title">Hedefler</span>
            <button onClick={() => handleNavigate('goals')} className="btn-secondary" style={{ fontSize: '11px', padding: '4px 10px' }}>Tümü →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
            {goals.length > 0 ? goals.slice(0, 3).map(goal => {
              const target = Number(goal.currentTargetPrice || goal.targetAmount || 1);
              const progress = Math.min(100, (stats.totalNetWorth / target) * 100);
              return (
                <div key={goal.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{goal.name}</span>
                    <span style={{ fontWeight: 800, color: 'var(--accent-blue)' }}>%{progress.toFixed(0)}</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      style={{ 
                        height: '100%', 
                        width: `${progress}%`, 
                        background: 'linear-gradient(90deg, var(--accent-blue), #6366f1)', 
                        borderRadius: '4px',
                        boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)'
                      }} 
                    />
                  </div>
                </div>
              );
            }) : (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px', padding: '20px' }}>Henüz hedef yok.</p>
            )}
          </div>
        </motion.div>

        {/* Budget Status Widget */}
        <motion.div variants={cardVariants}>
          <BudgetStatusWidget />
        </motion.div>
      </div>



      <FinancialGoalsModal isOpen={isGoalsModalOpen} onClose={() => { setIsGoalsModalOpen(false); setRefreshKey(k => k + 1); }} />
      {scheduledModalType && (
        <ScheduledTransactionsModal type={scheduledModalType} isOpen={!!scheduledModalType} onClose={() => { setScheduledModalType(null); setRefreshKey(k => k + 1); }} />
      )}
    </motion.div>
  );
};

export default Dashboard;
