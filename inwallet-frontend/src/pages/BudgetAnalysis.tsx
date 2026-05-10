import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';

const BudgetAnalysis: React.FC = () => {
  const { userId } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchUser = async () => {
      try {
        const data = await userApi.getMe(userId);
        setUserData(data);
      } catch (err) {
        console.error("Kullanıcı verisi yüklenemedi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Analiz hazırlanıyor...</div>;

  const income = userData?.monthlyIncome || 0;
  const expense = userData?.monthlyExpense || 0;
  const savings = Math.max(0, income - expense);

  const needs = expense; // Şimdilik tüm sabit giderleri ihtiyaç sayıyoruz
  const wants = 0;
  const investments = savings;

  const idealNeeds = income * 0.50;
  const idealWants = income * 0.30;
  const idealInvestments = income * 0.20;

  const segmentsActual = [
    {
      label: 'İhtiyaçlar',
      sublabel: 'Sabit Giderler',
      amount: needs,
      pct: income > 0 ? Math.round((needs / income) * 100) : 0,
      idealPct: 50,
      color: '#60a5fa',
      ideal: idealNeeds,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      label: 'İstekler',
      sublabel: 'Değişken Giderler',
      amount: wants,
      pct: income > 0 ? Math.round((wants / income) * 100) : 0,
      idealPct: 30,
      color: '#f59e0b',
      ideal: idealWants,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      ),
    },
    {
      label: 'Yatırım/Tasarruf',
      sublabel: 'Portföy & Birikim',
      amount: investments,
      pct: income > 0 ? Math.round((investments / income) * 100) : 0,
      idealPct: 20,
      color: '#10b981',
      ideal: idealInvestments,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="dashboard-grid">
      <div className="col-span-12 glass-card animate-slide-up">
        {/* Page Header */}
        <div style={{ marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '13px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
              </svg>
            </div>
            50/30/20 Bütçe Analizi
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Mevcut finansal durumunuzun ideal bütçe dağılımı ile karşılaştırması.
          </p>
        </div>

        {income === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Aylık gelir ve gider verisi bulunamadı. Lütfen profil sayfasından bilgilerinizi güncelleyin.
          </div>
        ) : (
          <div>
            {/* 50/30/20 Visual */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', height: '20px', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px' }}>
                {segmentsActual.map(s => (
                  <div key={s.label} style={{ width: `${s.pct || 1}%`, background: s.color, transition: 'width 0.8s ease' }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {segmentsActual.map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: s.color }} />
                    {s.label}: <strong style={{ color: s.color }}>%{s.pct}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
              {segmentsActual.map(s => {
                const diff = s.pct - s.idealPct;
                const overBudget = diff > 0 && s.label !== 'Yatırım/Tasarruf';
                const underBudget = diff < 0 && s.label === 'Yatırım/Tasarruf';
                const status = overBudget || underBudget ? 'warn' : 'good';
                return (
                  <div key={s.label} style={{
                    padding: '24px',
                    background: `${s.color}08`,
                    border: `1px solid ${s.color}25`,
                    borderTop: `4px solid ${s.color}`,
                    borderRadius: '16px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ color: s.color }}>{s.icon}</div>
                      <div style={{
                        fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px',
                        background: status === 'good' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                        color: status === 'good' ? '#10b981' : '#f59e0b',
                        border: `1px solid ${status === 'good' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
                      }}>
                        {status === 'good' ? '✓ İdeal' : `${Math.abs(diff) > 0 ? (diff > 0 ? '+' : '') + diff : ''}% sapma`}
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>{s.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', opacity: 0.6, marginBottom: '12px' }}>{s.sublabel}</div>
                    <div style={{ fontSize: '28px', fontWeight: 900, color: s.color, letterSpacing: '-1px' }}>
                      %{s.pct}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      ₺{s.amount.toLocaleString()} <span style={{ opacity: 0.6 }}>/ ideal %{s.idealPct}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Advice */}
            <div style={{
              padding: '20px 24px',
              background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.03))',
              border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: '14px',
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start',
            }}>
              <div style={{ fontSize: '28px', lineHeight: 1 }}>💡</div>
              <div>
                <strong style={{ color: 'var(--text-primary)', fontSize: '15px', display: 'block', marginBottom: '6px' }}>Finansal Öneri</strong>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
                  {segmentsActual[2].pct >= 20 ? 
                    `Tebrikler! Tasarruf oranınız (%${segmentsActual[2].pct}) ideal seviyenin üzerinde. Bu hızı koruyarak finansal özgürlüğünüze çok daha hızlı ulaşabilirsiniz.` : 
                    `Tasarruf oranınızı %20 seviyesine çıkarmak için "İhtiyaçlar" kategorisindeki giderlerinizi optimize etmeyi düşünebilirsiniz. Küçük kesintiler, uzun vadede büyük birikimlere dönüşür.`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetAnalysis;
