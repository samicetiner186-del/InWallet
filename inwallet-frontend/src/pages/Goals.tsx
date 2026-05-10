import React, { useState, useEffect } from 'react';
import '../components/FinancialGoalsModal.css';
import { useAuth } from '../context/AuthContext';
import { goalApi, userApi } from '../services/api';

const Goals: React.FC = () => {
  const { userId } = useAuth();
  const [goalsList, setGoalsList] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalInflation, setNewGoalInflation] = useState('40'); // Default %40 inflation
  const [newGoalDate, setNewGoalDate] = useState('');

  const fetchGoalsAndUser = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // Hedefleri çek
      const gData = await goalApi.getGoals(userId);
      setGoalsList(gData);
      
      // Kullanıcı verisini çek (ayrıca, hata alsa da hedefleri bozmasın)
      try {
        const uData = await userApi.getMe(userId);
        setUserData(uData);
      } catch (uErr) {
        console.warn("Kullanıcı profili yüklenemedi, hesaplamalar kısıtlı olabilir.");
      }
    } catch (err) {
      console.error("Hedefler yüklenemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalsAndUser();
  }, [userId]);

  const monthlySavings = (userData?.monthlyIncome || 0) - (userData?.monthlyExpense || 0);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    const goalData = {
      name: newGoalTitle,
      initialPrice: Number(newGoalTarget),
      targetAmount: Number(newGoalTarget),
      currentAmount: 0,
      expectedInflationRate: Number(newGoalInflation),
      targetDate: newGoalDate + "T00:00:00",
      user: { id: Number(userId) } // Ensure ID is a number
    };

    try {
      console.log("Hedef oluşturuluyor:", goalData);
      await goalApi.createGoal(goalData);
      setNewGoalTitle('');
      setNewGoalTarget('');
      setNewGoalDate('');
      fetchGoalsAndUser(); // Listeyi yenile
    } catch (err) {
      console.error("Hedef oluşturma hatası:", err);
      alert("Hedef oluşturulurken hata oluştu. Lütfen tüm alanları kontrol edin.");
    }
  };

  const handleDeleteGoal = async (id: number) => {
    if (!window.confirm("Bu hedefi silmek istediğinize emin misiniz?")) return;
    try {
      await goalApi.deleteGoal(id);
      fetchGoalsAndUser();
    } catch (err) {
      alert("Hedef silinemedi.");
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Hedefler yükleniyor...</div>;

  return (
    <div className="dashboard-grid">
      <div className="col-span-8 glass-card">
        <div className="card-header">
          <span className="card-title" style={{ fontSize: '24px' }}>Tüm Hedeflerim</span>
        </div>
        
        <div className="goals-list" style={{ marginTop: '20px' }}>
          {goalsList.length > 0 ? goalsList.map(goal => {
            const currentAmount = Number(goal.currentAmount || 0);
            const targetAmount = Number(goal.currentTargetPrice || goal.targetAmount || 1);
            const progress = Number(goal.completionPercentage || (currentAmount / targetAmount * 100) || 0);
            const remainingAmount = targetAmount - currentAmount;
            const etaMonths = monthlySavings > 0 ? Math.ceil(remainingAmount / monthlySavings) : null;

            return (
              <div key={goal.id} className="goal-item animate-slide-up" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', marginBottom: '16px', position: 'relative' }}>
                <button 
                  onClick={() => handleDeleteGoal(goal.id)}
                  style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '18px', opacity: 0.6 }}
                  title="Sil"
                >
                  🗑️
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="goal-info">
                    <h4 style={{ fontSize: '20px', margin: 0, color: 'var(--text-primary)' }}>{goal.name}</h4>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(96, 165, 250, 0.1)', color: 'var(--accent-blue)' }}>
                        %{goal.expectedInflationRate || 0} Enflasyon Ayarlı
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', marginRight: '30px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      ₺{currentAmount.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Hedef: ₺{targetAmount.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="goal-progress-bar" style={{ height: '14px', marginTop: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '7px' }}>
                  <div 
                    className="goal-progress-fill" 
                    style={{ 
                      width: `${Math.min(100, progress)}%`,
                      background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-neon-blue))',
                      boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)'
                    }}
                  ></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    İlerleme: <strong style={{ color: 'var(--accent-blue)' }}>%{progress.toFixed(1)}</strong>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {etaMonths !== null ? (
                      <span>Tahmini Varış (ETA): <strong style={{ color: 'var(--accent-green)' }}>{etaMonths} Ay</strong></span>
                    ) : (
                      <span style={{ color: 'var(--accent-red)' }}>Birikim yetersiz</span>
                    )}
                  </div>
                </div>
              </div>
            );
          }) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Henüz hedef eklenmemiş.</div>
          )}
        </div>
      </div>

      <div className="col-span-4 glass-card">
        <div className="card-header">
          <span className="card-title">Yeni Hedef Ekle</span>
        </div>
        <form className="add-goal-form" style={{ marginTop: '0', borderTop: 'none', paddingTop: '0' }} onSubmit={handleAddGoal}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>Hedef Adı</label>
            <input 
              type="text" 
              placeholder="Örn: Tesla Model Y" 
              value={newGoalTitle}
              onChange={e => setNewGoalTitle(e.target.value)}
              required 
            />
          </div>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>Bugünkü Fiyat (₺)</label>
            <input 
              type="number" 
              placeholder="Örn: 2500000" 
              value={newGoalTarget}
              onChange={e => setNewGoalTarget(e.target.value)}
              required 
            />
          </div>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>Yıllık Beklenen Enflasyon (%)</label>
            <input 
              type="number" 
              placeholder="Örn: 40" 
              value={newGoalInflation}
              onChange={e => setNewGoalInflation(e.target.value)}
              required 
            />
          </div>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>Hedef Tarihi</label>
            <input 
              type="date" 
              value={newGoalDate}
              onChange={e => setNewGoalDate(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px' }}>Hedefe Başla</button>
        </form>

        <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '20px' }}>💡</span>
            <div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                <strong>Akıllı Tahmin:</strong> Aylık tasarruf miktarını artırarak (Bütçe Analizi sayfasından) hedeflerine ne kadar daha hızlı ulaşabileceğini görebilirsin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Goals;
