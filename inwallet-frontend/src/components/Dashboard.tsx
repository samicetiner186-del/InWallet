import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import FinancialGoalsModal from './FinancialGoalsModal';
import ScheduledTransactionsModal from './ScheduledTransactionsModal';

const portfolioData = [
  { name: 'Hisse Senedi', value: 55000, color: '#00d2ff' },
  { name: 'Altın', value: 45000, color: '#f59e0b' },
  { name: 'Kripto', value: 14500, color: '#8b5cf6' },
  { name: 'Döviz', value: 10000, color: '#10b981' },
];

const Dashboard: React.FC = () => {
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [scheduledModalType, setScheduledModalType] = useState<'debt' | 'receivable' | null>(null);

  return (
    <div className="dashboard-grid">
      
      {/* Top Stats Section */}
      <div className="col-span-12">
        <div className="dashboard-grid">
          <div className="col-span-4 glass-card">
            <div className="card-header">
              <span className="card-title">Toplam Net Varlık</span>
            </div>
            <div className="stat-value heading-gradient">₺124,500.00</div>
            <div className={`stat-label ${'+5.2%'.startsWith('+') ? 'text-success' : 'text-danger'}`}>
              {'+5.2%'.startsWith('+') ? '▲' : '▼'} {'+5.2%'} bu ay
            </div>
          </div>
          
          <div className="col-span-4 glass-card">
            <div className="card-header">
              <span className="card-title">Aylık Gelir</span>
            </div>
            <div className="stat-value">₺45,000.00</div>
            <div className="stat-label text-muted">Sabit Maaş</div>
          </div>

          <div className="col-span-4 glass-card">
            <div className="card-header">
              <span className="card-title">Aylık Gider</span>
            </div>
            <div className="stat-value">₺18,200.00</div>
            <div className="stat-label text-danger">Kredi & Faturalar</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="col-span-7 glass-card" style={{ minHeight: '400px' }}>
        <div className="card-header">
          <span className="card-title">Portföy Dağılımı & Analiz</span>
        </div>
        <div style={{ height: '340px', marginTop: '10px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={portfolioData}
                cx="50%"
                cy="50%"
                innerRadius={90}
                outerRadius={130}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {portfolioData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `₺${value.toLocaleString()}`}
                contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sidebar Area */}
      <div className="col-span-5 glass-card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="card-title">Finansal Hedefler</span>
          <button 
            onClick={() => setIsGoalsModalOpen(true)}
            style={{
              background: 'transparent',
              border: '1px solid var(--accent-blue)',
              color: 'var(--accent-blue)',
              padding: '4px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Tümünü Gör
          </button>
        </div>
        <div style={{ marginBottom: '20px', marginTop: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Ev Peşinatı</span>
            <span className="text-success">45%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: '45%', height: '100%', background: 'var(--accent-blue)' }}></div>
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Araba (Enflasyon Ayarlı)</span>
            <span className="text-muted">12%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: '12%', height: '100%', background: 'var(--accent-neon-blue)' }}></div>
          </div>
        </div>
      </div>

      {/* Scheduled Debts & Receivables */}
      <div className="col-span-12">
        <div className="dashboard-grid">
          <div 
            className="col-span-6 glass-card interactive-card" 
            style={{ cursor: 'pointer', padding: '20px' }}
            onClick={() => setScheduledModalType('debt')}
          >
            <div className="card-header">
              <span className="card-title">Planlanmış Tarihli Borçlar</span>
            </div>
            <div style={{ marginTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>Konut Kredisi Taksiti</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '2px' }}>15 Mayıs 2026</div>
                </div>
                <div className="text-danger" style={{ fontWeight: 'bold' }}>-₺12,500.00</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>Kredi Kartı Ekstresi</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '2px' }}>22 Mayıs 2026</div>
                </div>
                <div className="text-danger" style={{ fontWeight: 'bold' }}>-₺8,450.00</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>Araç Sigortası</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '2px' }}>05 Haziran 2026</div>
                </div>
                <div className="text-danger" style={{ fontWeight: 'bold' }}>-₺4,200.00</div>
              </div>
            </div>
          </div>

          <div 
            className="col-span-6 glass-card interactive-card" 
            style={{ cursor: 'pointer', padding: '20px' }}
            onClick={() => setScheduledModalType('receivable')}
          >
            <div className="card-header">
              <span className="card-title">Planlanmış Tarihli Alacaklar</span>
            </div>
            <div style={{ marginTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>Freelance Proje</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '2px' }}>12 Mayıs 2026</div>
                </div>
                <div className="text-success" style={{ fontWeight: 'bold' }}>+₺15,000.00</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>Kira Geliri</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '2px' }}>20 Mayıs 2026</div>
                </div>
                <div className="text-success" style={{ fontWeight: 'bold' }}>+₺18,500.00</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>Temettü Ödemesi</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '2px' }}>28 Mayıs 2026</div>
                </div>
                <div className="text-success" style={{ fontWeight: 'bold' }}>+₺3,250.00</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <FinancialGoalsModal 
        isOpen={isGoalsModalOpen} 
        onClose={() => setIsGoalsModalOpen(false)} 
      />
      <ScheduledTransactionsModal
        isOpen={scheduledModalType !== null}
        onClose={() => setScheduledModalType(null)}
        type={scheduledModalType}
      />
    </div>
  );
};

export default Dashboard;
