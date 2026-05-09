import React, { useState } from 'react';
import './FinancialGoalsModal.css';

interface FinancialGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const goals = [
  { id: 1, title: 'Ev Peşinatı', target: 500000, current: 225000, inflationRate: 0.45 },
  { id: 2, title: 'Araba (Enflasyon Ayarlı)', target: 300000, current: 36000, inflationRate: 0.12 }
];

const FinancialGoalsModal: React.FC<FinancialGoalsModalProps> = ({ isOpen, onClose }) => {
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');

  if (!isOpen) return null;

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    // Geliştirmede buraya API çağrısı eklenecek
    alert(`Yeni hedef eklendi: ${newGoalTitle} - ${newGoalTarget}`);
    setNewGoalTitle('');
    setNewGoalTarget('');
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
            {goals.map(goal => {
              const progress = (goal.current / goal.target) * 100;
              return (
                <div key={goal.id} className="goal-item">
                  <div className="goal-info">
                    <h4>{goal.title}</h4>
                    <span className="goal-stats">
                      ₺{goal.current.toLocaleString()} / ₺{goal.target.toLocaleString()}
                    </span>
                  </div>
                  <div className="goal-progress-bar">
                    <div 
                      className="goal-progress-fill" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="goal-footer text-muted">
                    İlerleme: %{progress.toFixed(1)}
                  </div>
                </div>
              );
            })}
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
            <button type="submit" className="btn-primary">Hedef Ekle</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FinancialGoalsModal;
