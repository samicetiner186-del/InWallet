import React, { useState, useEffect } from 'react';
import './FinancialGoalsModal.css';
import { goalApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface FinancialGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const templates = [
  { type: 'HOUSE', icon: '🏠', label: 'Ev' },
  { type: 'CAR', icon: '🚗', label: 'Araba' },
  { type: 'VACATION', icon: '✈️', label: 'Tatil' },
  { type: 'EDUCATION', icon: '🎓', label: 'Eğitim' },
  { type: 'SAVINGS', icon: '💰', label: 'Birikim' },
  { type: 'OTHER', icon: '🎯', label: 'Diğer' },
];

const FinancialGoalsModal: React.FC<FinancialGoalsModalProps> = ({ isOpen, onClose }) => {
  const { userId } = useAuth();
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [selectedType, setSelectedType] = useState('OTHER');
  const [priority, setPriority] = useState(1);
  const [targetDate, setTargetDate] = useState(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]);
  const [inflationRate, setInflationRate] = useState('45');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Modal açıldığında yapılacak işlemler (varsa)
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    const goalData = {
      user: { id: Number(userId) },
      name: newGoalTitle,
      type: selectedType,
      priority: Number(priority),
      initialPrice: parseFloat(newGoalTarget),
      targetAmount: parseFloat(newGoalTarget),
      currentAmount: 0,
      expectedInflationRate: parseFloat(inflationRate),
      targetDate: new Date(targetDate).toISOString()
    };

    try {
      setLoading(true);
      await goalApi.createGoal(goalData);
      setNewGoalTitle('');
      setNewGoalTarget('');
      
      alert('Hayalin başarıyla planlandı! 🚀');
      onClose();
    } catch (error: any) {
      alert('Hata: ' + (error.message || 'Hedef eklenemedi'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div className="glass-card modal-content animate-slide-up" style={{ maxWidth: '550px' }}>
        <div className="modal-header">
          <h3 className="card-title">Hedefini Belirle</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <form className="add-goal-form" onSubmit={handleAddGoal} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div>
              <label className="text-muted" style={{ fontSize: '13px', display: 'block', marginBottom: '10px' }}>Hayalin Ne?</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {templates.map(t => (
                  <div 
                    key={t.type}
                    onClick={() => {
                      setSelectedType(t.type);
                      if (!newGoalTitle || templates.some(tmp => tmp.label === newGoalTitle)) {
                        setNewGoalTitle(t.label);
                      }
                    }}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      background: selectedType === t.type ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${selectedType === t.type ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)'}`,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>{t.icon}</div>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>{t.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }}>
              <div className="form-group">
                <label className="text-muted" style={{ fontSize: '12px' }}>Öncelik (1-10)</label>
                <input 
                  type="number" 
                  min="1"
                  max="10"
                  value={priority}
                  onChange={e => setPriority(Number(e.target.value))}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="text-muted" style={{ fontSize: '12px' }}>Hedef Adı</label>
                <input 
                  type="text" 
                  placeholder="Örn: Yeni Evim" 
                  value={newGoalTitle}
                  onChange={e => setNewGoalTitle(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="text-muted" style={{ fontSize: '12px' }}>Hedef Tutar (₺)</label>
                <input 
                  type="number" 
                  placeholder="5.000.000" 
                  value={newGoalTarget}
                  onChange={e => setNewGoalTarget(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="text-muted" style={{ fontSize: '12px' }}>Yıllık Enflasyon (%)</label>
                <input 
                  type="number" 
                  value={inflationRate}
                  onChange={e => setInflationRate(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="text-muted" style={{ fontSize: '12px' }}>Hedef Tarihi (Vade)</label>
              <input 
                type="date" 
                value={targetDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setTargetDate(e.target.value)}
                required 
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '16px', fontSize: '16px' }}>
              {loading ? 'Planlanıyor...' : 'Hayalini Planla 🚀'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FinancialGoalsModal;
