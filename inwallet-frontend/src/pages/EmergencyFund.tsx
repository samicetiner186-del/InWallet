import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi, assetApi } from '../services/api';

const EmergencyFund: React.FC = () => {
  const { userId } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      try {
        const [uData, aData] = await Promise.all([
          userApi.getMe(userId),
          assetApi.getAssets(userId)
        ]);
        setUserData(uData);
        setAssets(aData);
      } catch (err) {
        console.error("Veri yüklenemedi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Veriler yükleniyor...</div>;

  const monthlyExpense = userData?.monthlyExpense || 0;
  
  // Nakit varlıkları veya toplam varlığın bir kısmını fon olarak kabul et
  const currentFund = assets
    .filter(a => a.type.toLowerCase().includes('nakit') || a.type.toLowerCase().includes('mevduat'))
    .reduce((sum, a) => sum + (a.quantity * (a.currentPrice || a.averageBuyPrice || 0)), 0);

  const targetMonths = 6;
  const targetAmount = monthlyExpense * targetMonths;
  const dynamicMonths = monthlyExpense > 0 ? +(currentFund / monthlyExpense).toFixed(1) : 0;
  const dynamicPercent = targetAmount > 0 ? Math.min(100, Math.round((currentFund / targetAmount) * 100)) : 0;

  const statusColor =
    dynamicMonths < 1 ? '#ef4444' :
    dynamicMonths < 3 ? '#f59e0b' :
    dynamicMonths < 6 ? '#60a5fa' : '#10b981';

  const milestones = [
    { months: 1, label: '1 Ay', amount: monthlyExpense * 1 },
    { months: 3, label: '3 Ay', amount: monthlyExpense * 3 },
    { months: 6, label: '6 Ay', amount: monthlyExpense * 6 },
  ];

  return (
    <div className="dashboard-grid">

      {/* Header Card */}
      <div className="col-span-12 glass-card animate-slide-up" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1c1917 0%, #292524 60%, #1c1917 100%)',
          borderBottom: `3px solid ${statusColor}`,
          padding: '32px 36px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', borderRadius: '50%', background: `${statusColor}06` }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '30%', width: '150px', height: '150px', borderRadius: '50%', background: `${statusColor}04` }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: `${statusColor}25`, border: `1px solid ${statusColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: statusColor }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#fff' }}>Acil Durum Fonu</h2>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '3px' }}>
                    {monthlyExpense === 0 ? 'Lütfen profilinizden aylık giderinizi tanımlayın.' : 
                     dynamicMonths < 3 ? '⚠️ Risk altındasın — harekete geç!' : dynamicMonths < 6 ? '📈 İyi gidiyorsun, devam et!' : '🎉 Tebrikler! Finansal güvencedesin.'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '52px', fontWeight: 900, color: statusColor, letterSpacing: '-3px', lineHeight: 1 }}>{dynamicMonths}</div>
                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>Aylık gider karşılığı</div>
                </div>
                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '40px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>₺{currentFund.toLocaleString()}</div>
                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>Mevcut fon</div>
                </div>
                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '40px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>₺{targetAmount.toLocaleString()}</div>
                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>6 Aylık hedef</div>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div style={{
              padding: '16px 24px',
              background: `${statusColor}18`,
              border: `1px solid ${statusColor}35`,
              borderRadius: '16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '36px', fontWeight: 900, color: statusColor }}>%{dynamicPercent}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Tamamlandı</div>
            </div>
          </div>
        </div>

        {/* Progress Bar with Milestones */}
        <div style={{ padding: '28px 36px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ position: 'relative', paddingTop: '28px' }}>
            {/* Milestone Labels */}
            {milestones.map(ms => {
              const pct = (ms.months / targetMonths) * 100;
              const reached = currentFund >= ms.amount;
              return (
                <div key={ms.months} style={{ position: 'absolute', left: `${pct}%`, top: 0, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: reached ? statusColor : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{ms.label}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', opacity: 0.7, whiteSpace: 'nowrap' }}>₺{(ms.amount / 1000).toFixed(0)}k</span>
                </div>
              );
            })}

            {/* Bar */}
            <div style={{ width: '100%', height: '14px', background: 'var(--bg-primary)', borderRadius: '7px', overflow: 'visible', position: 'relative' }}>
              <div style={{
                width: `${dynamicPercent}%`, height: '100%',
                background: `linear-gradient(90deg, ${statusColor}aa, ${statusColor})`,
                borderRadius: '7px',
                boxShadow: `0 0 16px ${statusColor}50`,
                transition: 'width 0.6s ease',
              }} />
              {milestones.map(ms => {
                const pct = (ms.months / targetMonths) * 100;
                const reached = currentFund >= ms.amount;
                return (
                  <div key={ms.months} style={{
                    position: 'absolute', left: `${pct}%`, top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '18px', height: '18px', borderRadius: '50%',
                    background: reached ? statusColor : 'var(--bg-secondary)',
                    border: `2px solid ${reached ? statusColor : 'var(--border-color)'}`,
                    zIndex: 10,
                    boxShadow: reached ? `0 0 10px ${statusColor}80` : 'none',
                    transition: 'all 0.4s ease',
                  }} />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-12 glass-card animate-slide-up" style={{ padding: '40px', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>🛡️ Acil Durum Fonu Analizi</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
          Acil durum fonu, iş kaybı, sağlık sorunları veya beklenmedik büyük masraflar karşısında finansal güvenliğinizi sağlar. 
          İdeal bir fon, aylık giderlerinizin en az <strong>6 katını</strong> kapsamalıdır. 
          Şu anki birikimlerinizle <strong>{dynamicMonths} aylık</strong> giderinizi karşılayabiliyorsunuz.
        </p>
      </div>

    </div>
  );
};

export default EmergencyFund;
