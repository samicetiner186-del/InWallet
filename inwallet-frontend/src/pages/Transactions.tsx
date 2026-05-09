import React from 'react';

const Transactions: React.FC = () => {
  const transactions = [
    { id: 1, title: 'Kira Ödemesi', date: '01 Mayıs 2026', amount: '-₺12,000.00', type: 'expense' },
    { id: 2, title: 'Maaş Yatma', date: '01 Mayıs 2026', amount: '+₺45,000.00', type: 'income' },
    { id: 3, title: 'Altın Alış (10gr)', date: '28 Nisan 2026', amount: '-₺24,500.00', type: 'investment' },
    { id: 4, title: 'Market Harcaması', date: '25 Nisan 2026', amount: '-₺1,250.00', type: 'expense' },
    { id: 5, title: 'Hisse Senedi Satış', date: '20 Nisan 2026', amount: '+₺5,400.00', type: 'income' },
  ];

  return (
    <div className="dashboard-grid">
      <div className="col-span-12 glass-card">
        <div className="card-header">
          <span className="card-title" style={{ fontSize: '24px' }}>İşlem Geçmişi</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
          {transactions.map(tx => (
            <div 
              key={tx.id} 
              style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '16px 20px', 
                background: 'rgba(255,255,255,0.03)', 
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '50%', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: tx.type === 'income' ? 'rgba(16, 185, 129, 0.2)' : tx.type === 'investment' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  fontSize: '20px'
                }}>
                  {tx.type === 'income' ? '⬇️' : tx.type === 'investment' ? '📈' : '💸'}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>{tx.title}</h4>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>{tx.date}</div>
                </div>
              </div>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: 'bold',
                color: tx.amount.startsWith('+') ? 'var(--success)' : 'var(--text-primary)'
              }}>
                {tx.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Transactions;
