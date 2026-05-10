import React, { useState, useEffect } from 'react';
import './FinancialGoalsModal.css';
import { goalApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface FinancialGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FinancialGoalsModal: React.FC<FinancialGoalsModalProps> = ({ isOpen, onClose }) => {
  const { userId } = useAuth();
  const [goals, setGoals] = useState<any[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchGoals();
    }
  }, [isOpen, userId]);

  const fetchGoals = async () => {
    try {
      const data = await goalApi.getGoals(userId!);
      setGoals(data);
    } catch (error) {
      console.error('Hedefler çekilemedi:', error);
    }
  };

  if (!isOpen) return null;

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    const goalData = {
      user: { id: Number(userId) },
      name: newGoalTitle,
      initialPrice: parseFloat(newGoalTarget),
      targetAmount: parseFloat(newGoalTarget),
      currentAmount: 0,
      expectedInflationRate: 40, // Default enflasyon
      targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 yıl sonra
    };

    try {
      await goalApi.createGoal(goalData);
      setNewGoalTitle('');
      setNewGoalTarget('');
      fetchGoals(); // Listeyi yenile
    } catch (error) {
      alert('Hedef eklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-card modal-content animate-slide-up">
        <div className="modal-header">
          <h3 className="card-title">Finansal Hedeflerim</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="goals-list">
            {goals.length > 0 ? goals.map(goal => {
              const progress = ((goal.currentAmount || 0) / (goal.targetAmount || 1)) * 100;
              return (
                <div key={goal.id} className="goal-item">
                  <div className="goal-info">
                    <h4>{goal.name}</h4>
                    <span className="goal-stats">
                      ₺{(goal.currentAmount || 0).toLocaleString()} / ₺{(goal.targetAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="goal-progress-bar">
                    <div 
                      className="goal-progress-fill" 
                      style={{ width: `${Math.min(100, progress)}%` }}
                    ></div>
                  </div>
                  <div className="goal-footer text-muted">
                    İlerleme: %{progress.toFixed(1)}
                  </div>
                </div>
              );
            }) : (
              <p className="text-muted" style={{ textAlign: 'center', padding: '20px' }}>Henüz hedef eklenmemiş.</p>
            )}
          </div>

          <form className="add-goal-form" onSubmit={handleAddGoal}>
            <h4>Yeni Hedef Ekle</h4>
            <div className="form-group">
              <input 
                type="text" 
                placeholder="Hedef Adı (örn: Tatil)" 
                value={newGoalTitle}
                onChange={e => setNewGoalTitle(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <input 
                type="number" 
                placeholder="Hedef Tutar (₺)" 
                value={newGoalTarget}
                onChange={e => setNewGoalTarget(e.target.value)}
                required 
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Ekleniyor...' : 'Hedef Ekle'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FinancialGoalsModal;
