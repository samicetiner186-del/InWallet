import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { transactionApi } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Transactions: React.FC = () => {
  const { userId } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState('expense');
  const [newCategory, setNewCategory] = useState('Diğer');

  const fetchTransactions = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      console.log("İşlem Geçmişi Yükleniyor... UserID:", userId);
      const data = await transactionApi.getTransactions(Number(userId)).catch(err => {
        console.error("API Hatası (İşlemler):", err);
        return [];
      });
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Yükleme sırasında hata oluştu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 10000); // 10 saniyede bir otomatik yenile
    return () => clearInterval(interval);
  }, [userId]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      const payload = {
        amount: Number(newAmount),
        type: newType.toUpperCase(),
        description: newTitle,
        category: newCategory,
        transactionDate: new Date().toISOString(),
        user: { id: Number(userId) }
      };

      await transactionApi.createTransaction(payload);
      setIsModalOpen(false);
      setNewTitle('');
      setNewAmount('');
      
      // Delay for DB consistency
      setTimeout(() => fetchTransactions(), 1500); 
      alert("İşlem başarıyla kaydedildi!");
    } catch (err: any) {
      alert(`Hata: ${err.message || 'İşlem kaydedilemedi.'}`);
    }
  };

  // İstatistikleri hesapla
  const stats = useMemo(() => {
    const income = transactions
      .filter(tx => tx.type?.toLowerCase() === 'income')
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    const expense = transactions
      .filter(tx => tx.type?.toLowerCase() === 'expense' || tx.type?.toLowerCase() === 'investment')
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  // Grafik verisini hazırla
  const chartData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayTransactions = transactions.filter(tx => tx.transactionDate?.startsWith(date));
      const inc = dayTransactions.filter(tx => tx.type?.toLowerCase() === 'income').reduce((s, t) => s + Number(t.amount), 0);
      const exp = dayTransactions.filter(tx => tx.type?.toLowerCase() === 'expense').reduce((s, t) => s + Number(t.amount), 0);
      return { 
        name: new Date(date).toLocaleDateString('tr-TR', { weekday: 'short' }),
        gelir: inc,
        gider: exp
      };
    });
  }, [transactions]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bu işlemi silmek istediğinize emin misiniz?")) return;
    try {
      await transactionApi.deleteTransaction(id);
      fetchTransactions();
    } catch (err) {
      alert("İşlem silinemedi.");
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const rawType = (tx.type || "").toUpperCase().trim();
    if (filter === 'all') return true;
    if (filter === 'income') return rawType === 'INCOME';
    if (filter === 'expense') return rawType === 'EXPENSE' || rawType === 'INVESTMENT';
    return true;
  }).sort((a, b) => {
    const dateA = a.transactionDate ? new Date(a.transactionDate).getTime() : 0;
    const dateB = b.transactionDate ? new Date(b.transactionDate).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="dashboard-grid animate-fade-in">
      {/* Top Stats Cards */}
      <div className="col-span-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-green)', padding: '20px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Toplam Gelir</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-green)', marginTop: '8px' }}>₺{stats.income.toLocaleString()}</div>
        </div>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-red)', padding: '20px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Toplam Gider</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-red)', marginTop: '8px' }}>₺{stats.expense.toLocaleString()}</div>
        </div>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-blue)', padding: '20px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Nakit Bakiyesi</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px' }}>₺{stats.balance.toLocaleString()}</div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="col-span-12 glass-card" style={{ marginBottom: '24px', padding: '24px' }}>
        <div className="card-header" style={{ marginBottom: '20px' }}>
          <span className="card-title">Haftalık Nakit Akışı Trendi</span>
        </div>
        <div style={{ height: '240px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorGelir" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-green)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--accent-green)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorGider" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-red)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--accent-red)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="gelir" stroke="var(--accent-green)" fillOpacity={1} fill="url(#colorGelir)" />
              <Area type="monotone" dataKey="gider" stroke="var(--accent-red)" fillOpacity={1} fill="url(#colorGider)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction List Section */}
      <div className="col-span-12 glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '20px' }}>Son İşlemler</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0 0' }}>{transactions.length} kayıt listeleniyor</p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '10px' }}>
              <button onClick={() => setFilter('all')} style={{ background: filter === 'all' ? 'var(--accent-blue)' : 'transparent', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>Tümü</button>
              <button onClick={() => setFilter('income')} style={{ background: filter === 'income' ? 'var(--accent-green)' : 'transparent', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>Gelirler</button>
              <button onClick={() => setFilter('expense')} style={{ background: filter === 'expense' ? 'var(--accent-red)' : 'transparent', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>Giderler</button>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ padding: '10px 20px', borderRadius: '10px' }}>+ Yeni İşlem</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {loading && transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Veriler yükleniyor...</div>
          ) : filteredTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Henüz işlem kaydı bulunmuyor.</div>
          ) : (
            filteredTransactions.map(tx => (
              <div key={tx.id} className="transaction-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: tx.type?.toLowerCase() === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: tx.type?.toLowerCase() === 'income' ? 'var(--accent-green)' : 'var(--accent-red)'
                  }}>
                    {tx.type?.toLowerCase() === 'income' ? '💰' : '💸'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{tx.description || tx.type}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {new Date(tx.transactionDate).toLocaleDateString('tr-TR')} • {tx.category || 'Genel'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: tx.type?.toLowerCase() === 'income' ? 'var(--accent-green)' : 'var(--text-primary)' }}>
                    {tx.type?.toLowerCase() === 'income' ? '+' : '-'} ₺{Number(tx.amount || 0).toLocaleString()}
                  </div>
                  <button onClick={() => handleDelete(tx.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '18px', opacity: 0.5 }}>🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Premium Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            width: '100%', maxWidth: '480px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
            animation: 'fadeIn 0.2s ease',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>Yeni İşlem</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Gelir veya gider ekleyin</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  border: '1px solid var(--border-color)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: '20px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--border-color)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >×</button>
            </div>

            {/* Type Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => setNewType('expense')}
                style={{
                  padding: '12px',
                  borderRadius: '14px',
                  border: `2px solid ${newType === 'expense' ? '#ef4444' : 'var(--border-color)'}`,
                  background: newType === 'expense' ? 'rgba(239,68,68,0.08)' : 'transparent',
                  color: newType === 'expense' ? '#ef4444' : 'var(--text-secondary)',
                  fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >Gider</button>
              <button
                type="button"
                onClick={() => setNewType('income')}
                style={{
                  padding: '12px',
                  borderRadius: '14px',
                  border: `2px solid ${newType === 'income' ? '#10b981' : 'var(--border-color)'}`,
                  background: newType === 'income' ? 'rgba(16,185,129,0.08)' : 'transparent',
                  color: newType === 'income' ? '#10b981' : 'var(--text-secondary)',
                  fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >Gelir</button>
            </div>

            <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Description */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Açıklama</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Örn: Market alışverişi"
                  required
                  style={{
                    width: '100%', padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent-blue)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                />
              </div>

              {/* Amount */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Tutar (₺)</label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={e => setNewAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  min="0"
                  step="any"
                  style={{
                    width: '100%', padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '20px', fontWeight: 700,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent-blue)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                />
              </div>

              {/* Category */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Kategori</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                  }}
                >
                  <option value="Market">Market</option>
                  <option value="Maaş">Maaş</option>
                  <option value="Ulaşım">Ulaşım</option>
                  <option value="Kira">Kira</option>
                  <option value="Faturalar">Faturalar</option>
                  <option value="Eğlence">Eğlence</option>
                  <option value="Yatırım">Yatırım</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1, padding: '13px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--border-color)',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: '14px', fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--border-color)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >İptal</button>
                <button
                  type="submit"
                  style={{
                    flex: 2, padding: '13px',
                    borderRadius: '12px',
                    border: 'none',
                    background: newType === 'income'
                      ? 'linear-gradient(135deg, #059669, #10b981)'
                      : 'linear-gradient(135deg, #dc2626, #ef4444)',
                    color: 'white',
                    fontSize: '14px', fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: newType === 'income'
                      ? '0 4px 15px rgba(16,185,129,0.3)'
                      : '0 4px 15px rgba(239,68,68,0.3)',
                  }}
                >
                  {newType === 'income' ? 'Gelir Kaydet' : 'Gider Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
