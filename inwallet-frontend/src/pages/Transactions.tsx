import React, { useState } from 'react';

const allTransactions = [
  { id: 1, title: 'Kira Ödemesi', date: '01 Mayıs 2026', amount: '-₺12,000.00', type: 'expense' },
  { id: 2, title: 'Maaş Yatma', date: '01 Mayıs 2026', amount: '+₺45,000.00', type: 'income' },
  { id: 3, title: 'Altın Alış (10gr)', date: '28 Nisan 2026', amount: '-₺24,500.00', type: 'investment' },
  { id: 4, title: 'Market Harcaması', date: '25 Nisan 2026', amount: '-₺1,250.00', type: 'expense' },
  { id: 5, title: 'Hisse Senedi Satış', date: '20 Nisan 2026', amount: '+₺5,400.00', type: 'income' },
];

const Transactions: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const filteredTransactions = allTransactions.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'income') return tx.type === 'income';
    if (filter === 'expense') return tx.type === 'expense' || tx.type === 'investment';
    return true;
  });

  return (
    <div className="dashboard-grid">
      <div className="col-span-12 glass-card">
        <div className="card-header" style={{ marginBottom: '30px' }}>
          <span className="card-title" style={{ fontSize: '24px' }}>İşlem Geçmişi</span>
          
          {/* Filters */}
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '12px' }}>
            <button 
              onClick={() => setFilter('all')}
              style={{
                background: filter === 'all' ? 'var(--accent-blue)' : 'transparent',
                color: filter === 'all' ? 'white' : 'var(--text-secondary)',
                border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.3s ease'
              }}
            >
              Tümü
            </button>
            <button 
              onClick={() => setFilter('income')}
              style={{
                background: filter === 'income' ? 'rgba(16, 185, 129, 0.8)' : 'transparent',
                color: filter === 'income' ? 'white' : 'var(--text-secondary)',
                border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.3s ease'
              }}
            >
              Gelirler
            </button>
            <button 
              onClick={() => setFilter('expense')}
              style={{
                background: filter === 'expense' ? 'rgba(239, 68, 68, 0.8)' : 'transparent',
                color: filter === 'expense' ? 'white' : 'var(--text-secondary)',
                border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.3s ease'
              }}
            >
              Giderler
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Bu kategoride işlem bulunmuyor.</div>
          ) : (
            filteredTransactions.map(tx => (
              <div 
                key={tx.id} 
                style={{
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '20px', 
                  background: 'rgba(255,255,255,0.02)', 
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  transition: 'background 0.3s ease',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ 
                    width: '48px', height: '48px', borderRadius: '12px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: tx.type === 'income' ? 'rgba(16, 185, 129, 0.15)' : tx.type === 'investment' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    fontSize: '24px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                  }}>
                    {tx.type === 'income' ? '⬇️' : tx.type === 'investment' ? '📈' : '💸'}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)', fontWeight: 600 }}>{tx.title}</h4>
                    <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>{tx.date} • {tx.type === 'investment' ? 'Yatırım Hesabı' : 'Vadesiz Hesap'}</div>
                  </div>
                </div>
                <div style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold',
                  color: tx.amount.startsWith('+') ? 'var(--success)' : 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {tx.amount}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;
