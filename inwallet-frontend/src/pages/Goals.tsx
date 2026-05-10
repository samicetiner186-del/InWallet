import React, { useState } from 'react';
import '../components/FinancialGoalsModal.css';

const Goals: React.FC = () => {
  const [goalsList, setGoalsList] = useState([
    { id: 1, title: 'Ev Peşinatı', target: 500000, current: 225000, inflationRate: 0.45 },
    { id: 2, title: 'Araba (Enflasyon Ayarlı)', target: 300000, current: 36000, inflationRate: 0.12 },
    { id: 3, title: 'Yaz Tatili', target: 50000, current: 15000, inflationRate: 0.05 },
  ]);

  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const newGoal = {
      id: Date.now(),
      title: newGoalTitle,
      target: Number(newGoalTarget),
      current: 0,
      inflationRate: 0
    };
    setGoalsList([...goalsList, newGoal]);
    setNewGoalTitle('');
    setNewGoalTarget('');
  };

  return (
    <div className="dashboard-grid">
      <div className="col-span-8 glass-card">
        <div className="card-header">
          <span className="card-title" style={{ fontSize: '24px' }}>Tüm Hedeflerim</span>
        </div>
        
        <div className="goals-list" style={{ marginTop: '20px' }}>
          {goalsList.map(goal => {
            const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
            return (
              <div key={goal.id} className="goal-item" style={{ padding: '20px' }}>
                <div className="goal-info">
                  <h4 style={{ fontSize: '18px' }}>{goal.title}</h4>
                  <span className="goal-stats" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    ₺{goal.current.toLocaleString()} / ₺{goal.target.toLocaleString()}
                  </span>
                </div>
                <div className="goal-progress-bar" style={{ height: '12px', marginTop: '12px' }}>
                  <div 
                    className="goal-progress-fill" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="goal-footer text-muted" style={{ marginTop: '8px', fontSize: '14px' }}>
                  İlerleme: %{progress.toFixed(1)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="col-span-4 glass-card">
        <div className="card-header">
          <span className="card-title">Yeni Hedef Ekle</span>
        </div>
        <form className="add-goal-form" style={{ marginTop: '0', borderTop: 'none', paddingTop: '0' }} onSubmit={handleAddGoal}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Hedef Adı</label>
            <input 
              type="text" 
              placeholder="Örn: Dünya Turu" 
              value={newGoalTitle}
              onChange={e => setNewGoalTitle(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Hedef Tutarı (₺)</label>
            <input 
              type="number" 
              placeholder="Örn: 100000" 
              value={newGoalTarget}
              onChange={e => setNewGoalTarget(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Hedefe Başla</button>
        </form>
      </div>
    </div>
  );
};

export default Goals;
