import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { transactionApi } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// SVG Icons
const IncomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

const ExpenseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </svg>
);

const InvestmentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const getTxVisual = (type: string) => {
  const t = (type || '').toUpperCase();
  if (t === 'INCOME') return {
    icon: <IncomeIcon />,
    iconColor: 'var(--accent-green)',
    iconBg: 'rgba(16,185,129,0.12)',
    themeColor: 'var(--accent-green)',
    cardBg: 'rgba(16,185,129,0.04)',
    cardBorder: 'rgba(16,185,129,0.15)',
    leftBorder: '#10b981',
    label: 'GELİR',
    sign: '+',
  };
  if (t === 'INVESTMENT' || t === 'BUY') return {
    icon: <InvestmentIcon />,
    iconColor: '#8b5cf6',
    iconBg: 'rgba(139,92,246,0.12)',
    themeColor: '#8b5cf6',
    cardBg: 'rgba(139,92,246,0.04)',
    cardBorder: 'rgba(139,92,246,0.15)',
    leftBorder: '#8b5cf6',
    label: 'YATIRIM',
    sign: '−',
  };
  // EXPENSE (default)
  return {
    icon: <ExpenseIcon />,
    iconColor: '#ef4444',
    iconBg: 'rgba(239,68,68,0.12)',
    themeColor: '#ef4444',
    cardBg: 'rgba(239,68,68,0.04)',
    cardBorder: 'rgba(239,68,68,0.15)',
    leftBorder: '#ef4444',
    label: 'GİDER',
    sign: '−',
  };
};

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

  // Edit state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<any>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState('expense');
  const [editCategory, setEditCategory] = useState('Diğer');

  const fetchTransactions = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await transactionApi.getTransactions(Number(userId)).catch(() => []);
      setTransactions(Array.isArray(data) ? data : []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    try {
      await transactionApi.createTransaction({
        amount: Number(newAmount),
        type: newType.toUpperCase(),
        description: newTitle,
        category: newCategory,
        transactionDate: new Date().toISOString(),
        user: { id: Number(userId) },
      });
      setIsModalOpen(false);
      setNewTitle('');
      setNewAmount('');
      setTimeout(() => fetchTransactions(), 1500);
      alert('İşlem başarıyla kaydedildi!');
    } catch (err: any) {
      alert(`Hata: ${err.message || 'İşlem kaydedilemedi.'}`);
    }
  };

  const openEditModal = (tx: any) => {
    setEditingTx(tx);
    setEditTitle(tx.description || '');
    setEditAmount(String(tx.amount || ''));
    setEditType((tx.type || 'EXPENSE').toLowerCase());
    setEditCategory(tx.category || 'Diğer');
    setIsEditModalOpen(true);
  };

  const handleEditTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !editingTx) return;
    try {
      await transactionApi.updateTransaction(editingTx.id, {
        amount: Number(editAmount),
        type: editType.toUpperCase(),
        description: editTitle,
        category: editCategory,
        transactionDate: editingTx.transactionDate,
        user: { id: Number(userId) },
      });
      setIsEditModalOpen(false);
      setEditingTx(null);
      setTimeout(() => fetchTransactions(), 1000);
      alert('İşlem başarıyla güncellendi!');
    } catch (err: any) {
      alert(`Hata: ${err.message || 'İşlem güncellenemedi.'}`);
    }
  };

  const stats = useMemo(() => {
    const income = transactions
      .filter(tx => tx.type?.toLowerCase() === 'income')
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    const expense = transactions
      .filter(tx => ['expense', 'investment'].includes(tx.type?.toLowerCase() || ''))
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const chartData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();
    return last7Days.map(date => {
      const dayTxs = transactions.filter(tx => tx.transactionDate?.startsWith(date));
      const inc = dayTxs.filter(tx => tx.type?.toLowerCase() === 'income').reduce((s, t) => s + Number(t.amount), 0);
      const exp = dayTxs.filter(tx => tx.type?.toLowerCase() === 'expense').reduce((s, t) => s + Number(t.amount), 0);
      return { name: new Date(date).toLocaleDateString('tr-TR', { weekday: 'short' }), gelir: inc, gider: exp };
    });
  }, [transactions]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu işlemi silmek istediğinize emin misiniz?')) return;
    try {
      await transactionApi.deleteTransaction(id);
      fetchTransactions();
    } catch {
      alert('İşlem silinemedi.');
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const rawType = (tx.type || '').toUpperCase().trim();
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
      {/* Stats Cards */}
      <div className="col-span-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ borderLeft: '4px solid #10b981', padding: '20px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Toplam Gelir</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#10b981', marginTop: '10px' }}>₺{stats.income.toLocaleString('tr-TR')}</div>
        </div>
        <div className="glass-card" style={{ borderLeft: '4px solid #ef4444', padding: '20px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Toplam Gider</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#ef4444', marginTop: '10px' }}>₺{stats.expense.toLocaleString('tr-TR')}</div>
        </div>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-blue)', padding: '20px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Nakit Bakiyesi</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: stats.balance >= 0 ? '#10b981' : '#ef4444', marginTop: '10px' }}>₺{stats.balance.toLocaleString('tr-TR')}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="col-span-12 glass-card" style={{ marginBottom: '24px', padding: '24px' }}>
        <div className="card-header" style={{ marginBottom: '20px' }}>
          <span className="card-title">Haftalık Nakit Akışı</span>
        </div>
        <div style={{ height: '240px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorGelir" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorGider" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="gelir" stroke="#10b981" fillOpacity={1} fill="url(#colorGelir)" />
              <Area type="monotone" dataKey="gider" stroke="#ef4444" fillOpacity={1} fill="url(#colorGider)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction List */}
      <div className="col-span-12 glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>Son İşlemler</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0 0' }}>{transactions.length} kayıt</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Filter tabs */}
            <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              {([
                { key: 'all', label: 'Tümü' },
                { key: 'income', label: 'Gelirler' },
                { key: 'expense', label: 'Giderler' },
              ] as { key: 'all' | 'income' | 'expense'; label: string }[]).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  style={{
                    background: filter === tab.key
                      ? (tab.key === 'income' ? 'rgba(16,185,129,0.15)' : tab.key === 'expense' ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)')
                      : 'transparent',
                    color: filter === tab.key
                      ? (tab.key === 'income' ? '#10b981' : tab.key === 'expense' ? '#ef4444' : 'var(--accent-blue)')
                      : 'var(--text-secondary)',
                    border: 'none',
                    padding: '7px 14px',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: filter === tab.key ? 700 : 500,
                    transition: 'all 0.2s ease',
                  }}
                >{tab.label}</button>
              ))}
            </div>
            <button onClick={() => { setNewType('income'); setIsModalOpen(true); }} className="btn-secondary" style={{ padding: '10px 16px', borderRadius: '10px', fontWeight: 700, color: '#10b981', borderColor: '#10b981' }}>
              + Gelir Ekle
            </button>
            <button onClick={() => { setNewType('expense'); setIsModalOpen(true); }} className="btn-secondary" style={{ padding: '10px 16px', borderRadius: '10px', fontWeight: 700, color: '#ef4444', borderColor: '#ef4444' }}>
              + Gider Ekle
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {loading && transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Veriler yükleniyor...</div>
          ) : filteredTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Henüz işlem kaydı bulunmuyor.</div>
          ) : filteredTransactions.map(tx => {
            const v = getTxVisual(tx.type);
            return (
              <div
                key={tx.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 20px',
                  background: v.cardBg,
                  borderRadius: '14px',
                  border: `1px solid ${v.cardBorder}`,
                  borderLeft: `4px solid ${v.leftBorder}`,
                }}
              >
                {/* Left: icon + info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: v.iconBg,
                    color: v.iconColor,
                    flexShrink: 0,
                  }}>
                    {v.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                      {tx.description || tx.type}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                      {new Date(tx.transactionDate).toLocaleDateString('tr-TR')} · {tx.category || 'Genel'}
                    </div>
                  </div>
                </div>

                {/* Right: amount + label + actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    {/* Amount with explicit color */}
                    <div style={{
                      fontSize: '17px',
                      fontWeight: 900,
                      color: v.themeColor,
                      letterSpacing: '-0.3px',
                    }}>
                      {v.sign} ₺{Number(tx.amount || 0).toLocaleString('tr-TR')}
                    </div>
                    {/* Type label badge */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '10px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.7px',
                      color: v.themeColor,
                      marginTop: '4px',
                      padding: '2px 8px',
                      borderRadius: '20px',
                      background: v.cardBorder.replace('0.15', '0.08'),
                      border: `1px solid ${v.cardBorder}`,
                    }}>
                      {v.label}
                    </div>
                  </div>
                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => openEditModal(tx)}
                      style={{
                        background: 'rgba(59,130,246,0.07)',
                        border: '1px solid rgba(59,130,246,0.2)',
                        color: 'var(--accent-blue)',
                        cursor: 'pointer',
                        width: '34px', height: '34px',
                        borderRadius: '9px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}
                      title="İşlemi Düzenle"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      style={{
                        background: 'rgba(239,68,68,0.07)',
                        border: '1px solid rgba(239,68,68,0.15)',
                        color: '#ef4444',
                        cursor: 'pointer',
                        width: '34px', height: '34px',
                        borderRadius: '9px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}
                      title="İşlemi Sil"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px',
        }}>
          <div style={{
            width: '100%', maxWidth: '480px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>Yeni İşlem</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Gelir veya gider ekleyin</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >×</button>
            </div>

            {/* Type Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => setNewType('expense')}
                style={{
                  padding: '12px', borderRadius: '14px',
                  border: `2px solid ${newType === 'expense' ? '#ef4444' : 'var(--border-color)'}`,
                  background: newType === 'expense' ? 'rgba(239,68,68,0.08)' : 'transparent',
                  color: newType === 'expense' ? '#ef4444' : 'var(--text-secondary)',
                  fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                <ExpenseIcon /> Gider
              </button>
              <button
                type="button"
                onClick={() => setNewType('income')}
                style={{
                  padding: '12px', borderRadius: '14px',
                  border: `2px solid ${newType === 'income' ? '#10b981' : 'var(--border-color)'}`,
                  background: newType === 'income' ? 'rgba(16,185,129,0.08)' : 'transparent',
                  color: newType === 'income' ? '#10b981' : 'var(--text-secondary)',
                  fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                <IncomeIcon /> Gelir
              </button>
            </div>

            <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '8px' }}>Açıklama</label>
                <input
                  type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
                  placeholder="Örn: Market alışverişi" required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '8px' }}>Tutar (₺)</label>
                <input
                  type="number" value={newAmount} onChange={e => setNewAmount(e.target.value)}
                  placeholder="0.00" required min="0" step="any"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '20px', fontWeight: 700, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '8px' }}>Kategori</label>
                <select
                  value={newCategory} onChange={e => setNewCategory(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}
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
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button" onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '1.5px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                >İptal</button>
                <button
                  type="submit"
                  style={{
                    flex: 2, padding: '13px', borderRadius: '12px', border: 'none',
                    background: newType === 'income' ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #dc2626, #ef4444)',
                    color: 'white', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                    boxShadow: newType === 'income' ? '0 4px 15px rgba(16,185,129,0.3)' : '0 4px 15px rgba(239,68,68,0.3)',
                  }}
                >
                  {newType === 'income' ? 'Gelir Kaydet' : 'Gider Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Transaction Modal */}
      {isEditModalOpen && editingTx && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px',
        }}>
          <div style={{
            width: '100%', maxWidth: '480px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>İşlemi Düzenle</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Bilgileri güncelleyin</p>
              </div>
              <button
                onClick={() => { setIsEditModalOpen(false); setEditingTx(null); }}
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => setEditType('expense')}
                style={{
                  padding: '12px', borderRadius: '14px',
                  border: `2px solid ${editType === 'expense' ? '#ef4444' : 'var(--border-color)'}`,
                  background: editType === 'expense' ? 'rgba(239,68,68,0.08)' : 'transparent',
                  color: editType === 'expense' ? '#ef4444' : 'var(--text-secondary)',
                  fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              ><ExpenseIcon /> Gider</button>
              <button
                type="button"
                onClick={() => setEditType('income')}
                style={{
                  padding: '12px', borderRadius: '14px',
                  border: `2px solid ${editType === 'income' ? '#10b981' : 'var(--border-color)'}`,
                  background: editType === 'income' ? 'rgba(16,185,129,0.08)' : 'transparent',
                  color: editType === 'income' ? '#10b981' : 'var(--text-secondary)',
                  fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              ><IncomeIcon /> Gelir</button>
            </div>

            <form onSubmit={handleEditTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '8px' }}>Açıklama</label>
                <input
                  type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                  placeholder="Açıklama girin" required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '8px' }}>Tutar (₺)</label>
                <input
                  type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)}
                  placeholder="0.00" required min="0" step="any"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '20px', fontWeight: 700, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '8px' }}>Kategori</label>
                <select
                  value={editCategory} onChange={e => setEditCategory(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}
                >
                  <option value="Market">Market</option>
                  <option value="Maaş">Maaş</option>
                  <option value="Ulaşım">Ulaşım</option>
                  <option value="Kira">Kira</option>
                  <option value="Faturalar">Faturalar</option>
                  <option value="Eğlence">Ğlenme</option>
                  <option value="Yatırım">Yatırım</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button" onClick={() => { setIsEditModalOpen(false); setEditingTx(null); }}
                  style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '1.5px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                >İptal</button>
                <button
                  type="submit"
                  style={{
                    flex: 2, padding: '13px', borderRadius: '12px', border: 'none',
                    background: editType === 'income' ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #dc2626, #ef4444)',
                    color: 'white', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                    boxShadow: editType === 'income' ? '0 4px 15px rgba(16,185,129,0.3)' : '0 4px 15px rgba(239,68,68,0.3)',
                  }}
                >
                  Güncelle
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
