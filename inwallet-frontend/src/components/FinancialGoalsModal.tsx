import React, { useState, useEffect } from 'react';
import './FinancialGoalsModal.css';
import { goalApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface FinancialGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: any;
}

// SVG icons per goal type - no emojis
const GoalSVGIcons: Record<string, React.ReactNode> = {
  HOUSE: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  CAR: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 12.5L9.5 9c.3-.6.9-1 1.6-1h3.8c.7 0 1.3.4 1.6 1l1.5 3.5" />
      <path d="M2 12.5h20v2c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1v-2z" />
      <path d="M2 14.5h3a2 2 0 0 1 4 0h6a2 2 0 0 1 4 0h3" />
      <circle cx="7" cy="16.5" r="2" />
      <circle cx="17" cy="16.5" r="2" />
    </svg>
  ),
  VACATION: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16v-2l-8-5V3a1 1 0 0 0-2 0v6l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5l7 2.5z" />
    </svg>
  ),
  EDUCATION: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ),
  SAVINGS: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  OTHER: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5" />
    </svg>
  ),
};

const goalTypeColors: Record<string, string> = {
  HOUSE: '#3b82f6',
  CAR: '#8b5cf6',
  VACATION: '#f59e0b',
  EDUCATION: '#10b981',
  SAVINGS: '#06b6d4',
  OTHER: '#94a3b8',
};

const templates = [
  { type: 'HOUSE', label: 'Konut' },
  { type: 'CAR', label: 'Araç' },
  { type: 'VACATION', label: 'Tatil' },
  { type: 'EDUCATION', label: 'Eğitim' },
  { type: 'SAVINGS', label: 'Birikim' },
  { type: 'OTHER', label: 'Diğer' },
];

const FinancialGoalsModal: React.FC<FinancialGoalsModalProps> = ({ isOpen, onClose, goalToEdit }) => {
  const { userId } = useAuth();
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [selectedType, setSelectedType] = useState('OTHER');
  const [priority, setPriority] = useState(1);
  const [targetDate, setTargetDate] = useState(
    new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  );
  const [inflationRate, setInflationRate] = useState('45');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (goalToEdit) {
      setNewGoalTitle(goalToEdit.name || '');
      setNewGoalTarget(goalToEdit.targetAmount?.toString() || '');
      setSelectedType(goalToEdit.type || 'OTHER');
      setPriority(goalToEdit.priority || 1);
      setTargetDate(goalToEdit.targetDate ? goalToEdit.targetDate.split('T')[0] : '');
      setInflationRate(goalToEdit.expectedInflationRate?.toString() || '45');
    } else {
      setNewGoalTitle('');
      setNewGoalTarget('');
      setSelectedType('OTHER');
      setPriority(1);
      setTargetDate(
        new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
      );
      setInflationRate('45');
    }
  }, [isOpen, goalToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    const goalData = {
      user: { id: Number(userId) },
      name: newGoalTitle,
      type: selectedType,
      priority: Number(priority),
      targetAmount: parseFloat(newGoalTarget),
      expectedInflationRate: parseFloat(inflationRate),
      targetDate: new Date(targetDate).toISOString(),
    };
    try {
      setLoading(true);
      if (goalToEdit) {
        await goalApi.updateGoal(goalToEdit.id, goalData);
        alert('Hedef başarıyla güncellendi!');
      } else {
        await goalApi.createGoal({ ...goalData, currentAmount: 0 });
        alert('Hedef başarıyla oluşturuldu!');
      }
      onClose();
    } catch (error: any) {
      alert('Hata: ' + (error.message || 'İşlem başarısız'));
    } finally {
      setLoading(false);
    }
  };

  const activeColor = goalTypeColors[selectedType] || goalTypeColors['OTHER'];

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    background: 'var(--bg-primary)',
    border: '1.5px solid var(--border-color)',
    borderRadius: '10px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
    fontFamily: 'inherit',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '7px',
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div style={{
        width: '90%',
        maxWidth: '540px',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '24px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
        animation: 'slideUp 0.3s ease-out forwards',
      }}>
        {/* Header with colored top border */}
        <div style={{
          padding: '28px 32px 20px',
          borderBottom: '1px solid var(--border-color)',
          borderTop: `4px solid ${activeColor}`,
          borderRadius: '24px 24px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: `${activeColor}18`,
                border: `1px solid ${activeColor}35`,
                color: activeColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s ease',
              }}>
                {GoalSVGIcons[selectedType]}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {goalToEdit ? 'Hedefi Düzenle' : 'Yeni Hedef Ekle'}
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {goalToEdit ? 'Mevcut hedefini güncelle' : 'Finansal hayalini planla'}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              border: '1px solid var(--border-color)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: '20px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}
          >×</button>
        </div>

        <div style={{ padding: '28px 32px 32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

            {/* Goal Type Selector - SVG icon grid, no emojis */}
            <div>
              <label style={labelStyle}>Hedef Türü</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {templates.map(t => {
                  const tColor = goalTypeColors[t.type] || goalTypeColors['OTHER'];
                  const isSelected = selectedType === t.type;
                  return (
                    <button
                      key={t.type}
                      type="button"
                      onClick={() => {
                        setSelectedType(t.type);
                        if (!newGoalTitle || templates.some(tmp => tmp.label === newGoalTitle)) {
                          setNewGoalTitle(t.label);
                        }
                      }}
                      style={{
                        padding: '14px 10px',
                        borderRadius: '14px',
                        background: isSelected ? `${tColor}15` : 'var(--bg-primary)',
                        border: `1.5px solid ${isSelected ? tColor : 'var(--border-color)'}`,
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        color: isSelected ? tColor : 'var(--text-secondary)',
                        boxShadow: isSelected ? `0 0 0 3px ${tColor}20` : 'none',
                      }}
                      onMouseEnter={e => { if (!isSelected) { (e.currentTarget as HTMLButtonElement).style.borderColor = tColor; (e.currentTarget as HTMLButtonElement).style.background = `${tColor}08`; } }}
                      onMouseLeave={e => { if (!isSelected) { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-primary)'; } }}
                    >
                      {/* SVG icon, no emoji */}
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: isSelected ? `${tColor}20` : 'rgba(128,128,128,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isSelected ? tColor : 'var(--text-secondary)',
                        transition: 'all 0.2s ease',
                        flexShrink: 0,
                      }}>
                        {GoalSVGIcons[t.type]}
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: isSelected ? 700 : 500, transition: 'all 0.2s' }}>
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority + Goal Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Öncelik (1–10)</label>
                <input
                  type="number"
                  min="1" max="10"
                  value={priority}
                  onChange={e => setPriority(Number(e.target.value))}
                  required
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = activeColor; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Hedef Adı</label>
                <input
                  type="text"
                  placeholder="Örn: Yeni Evim"
                  value={newGoalTitle}
                  onChange={e => setNewGoalTitle(e.target.value)}
                  required
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = activeColor; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                />
              </div>
            </div>

            {/* Target Amount + Inflation */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Hedef Tutar (₺)</label>
                <input
                  type="number"
                  placeholder="5.000.000"
                  value={newGoalTarget}
                  onChange={e => setNewGoalTarget(e.target.value)}
                  required
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = activeColor; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Yıllık Enflasyon (%)</label>
                <input
                  type="number"
                  value={inflationRate}
                  onChange={e => setInflationRate(e.target.value)}
                  required
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = activeColor; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                />
              </div>
            </div>

            {/* Target Date */}
            <div>
              <label style={labelStyle}>Hedef Tarihi (Vade)</label>
              <input
                type="date"
                value={targetDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setTargetDate(e.target.value)}
                required
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = activeColor; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '15px',
                borderRadius: '14px',
                border: 'none',
                background: loading ? 'rgba(128,128,128,0.2)' : `linear-gradient(135deg, ${activeColor}, ${activeColor}cc)`,
                color: 'white',
                fontSize: '15px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: loading ? 'none' : `0 4px 20px ${activeColor}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
            >
              {/* Submit button SVG icon */}
              {!loading && (
                goalToEdit ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                )
              )}
              {loading
                ? (goalToEdit ? 'Güncelleniyor...' : 'Oluşturuluyor...')
                : (goalToEdit ? 'Değişiklikleri Kaydet' : 'Hedefi Oluştur')
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FinancialGoalsModal;
