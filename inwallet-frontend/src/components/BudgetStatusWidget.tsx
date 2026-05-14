import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { budgetApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface BudgetStatus {
  category: string;
  limitAmount: number;
  spentAmount: number;
  usagePercentage: number;
  status: 'ON_TRACK' | 'NEAR_LIMIT' | 'EXCEEDED';
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'EXCEEDED': return '#ef4444';
    case 'NEAR_LIMIT': return '#f59e0b';
    default: return '#10b981';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'EXCEEDED': return 'Limit Aşımı!';
    case 'NEAR_LIMIT': return 'Sınıra Yakın';
    default: return 'Bütçe Yolunda';
  }
};

const BudgetStatusWidget: React.FC = () => {
  const { userId } = useAuth();
  const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchStatus = async () => {
      try {
        const data = await budgetApi.getBudgetStatus(Number(userId));
        setBudgets(data);
      } catch (err) {
        console.error('Bütçe durumu yüklenemedi:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [userId]);

  if (loading) return null;
  if (budgets.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
      style={{ padding: '24px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🛡️ Bütçe Zekası
        </h3>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>BU AY</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {budgets.map((budget, index) => {
          const color = getStatusColor(budget.status);
          return (
            <motion.div
              key={budget.category}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{budget.category}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                  ₺{budget.spentAmount.toLocaleString()} / <span style={{ opacity: 0.7 }}>₺{budget.limitAmount.toLocaleString()}</span>
                </span>
              </div>
              
              <div style={{ height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, budget.usagePercentage)}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 + 0.3 }}
                  style={{
                    height: '100%',
                    background: color,
                    borderRadius: '4px',
                    boxShadow: budget.status !== 'ON_TRACK' ? `0 0 10px ${color}50` : 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: color, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  {getStatusLabel(budget.status)}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>
                  %{Math.round(budget.usagePercentage)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {budgets.some(b => b.status === 'EXCEEDED') && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            marginTop: '20px',
            padding: '12px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}
        >
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <p style={{ margin: 0, fontSize: '12px', color: '#ef4444', fontWeight: 600, lineHeight: 1.4 }}>
            Bazı kategorilerde bütçenizi aştınız! Tasarruf moduna geçmeniz önerilir.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default BudgetStatusWidget;
