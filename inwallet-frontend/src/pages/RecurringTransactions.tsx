import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { recurringTransactionApi } from '../services/api';

const RecurringTransactions: React.FC = () => {
  const { userId } = useAuth();
  const [recurringList, setRecurringList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Genel');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [frequency, setFrequency] = useState('MONTHLY');

  const fetchData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await recurringTransactionApi.getRecurring(Number(userId));
      setRecurringList(data);
    } catch (err) {
      console.error("Hata:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await recurringTransactionApi.createRecurring({
        user: { id: Number(userId) },
        description,
        category,
        amount: Number(amount),
        type,
        frequency
      });
      setDescription('');
      setAmount('');
      fetchData();
    } catch (err) {
      alert("İşlem oluşturulamadı.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bu otomatik işlemi silmek istediğinize emin misiniz?")) return;
    try {
      await recurringTransactionApi.deleteRecurring(id);
      fetchData();
    } catch (err) {
      alert("Silinemedi.");
    }
  };

  const handleManualTrigger = async () => {
    try {
      await recurringTransactionApi.manualProcess();
      alert("Otomatik işlemler kontrol edildi ve vadesi gelenler işlendi.");
      fetchData();
    } catch (err) {
      alert("Hata oluştu.");
    }
  };

  const getFrequencyLabel = (f: string) => {
    switch(f) {
      case 'DAILY': return 'Günlük';
      case 'WEEKLY': return 'Haftalık';
      case 'MONTHLY': return 'Aylık';
      case 'YEARLY': return 'Yıllık';
      default: return f;
    }
  };

  return (
    <div className="dashboard-grid animate-fade-in">
      <div className="col-span-12" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>Otomatik İşlemler</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Kira, maaş ve abonelik gibi tekrarlayan işlemlerini yönet.</p>
        </div>
        <button onClick={handleManualTrigger} className="btn-secondary" style={{ padding: '10px 20px', borderRadius: '10px' }}>
          Şimdi Kontrol Et
        </button>
      </div>

      <div className="col-span-8">
        <div className="glass-card" style={{ padding: '24px' }}>
          <div className="card-header" style={{ marginBottom: '24px' }}>
            <span className="card-title">Aktif Planlar</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Yükleniyor...</div>
            ) : recurringList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                Henüz otomatik bir işlem tanımlamadınız.
              </div>
            ) : (
              recurringList.map(item => (
                <div key={item.id} className="glass-card" style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '20px', background: 'rgba(255,255,255,0.02)',
                  borderLeft: `4px solid ${item.type === 'INCOME' ? 'var(--accent-green)' : 'var(--accent-blue)'}`
                }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.description}</div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <span>{item.category}</span>
                      <span>•</span>
                      <span>{getFrequencyLabel(item.frequency)}</span>
                      <span>•</span>
                      <span>Sonraki: {item.nextRunDate ? new Date(item.nextRunDate).toLocaleDateString('tr-TR') : '---'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: item.type === 'INCOME' ? 'var(--accent-green)' : 'var(--text-primary)' }}>
                        {item.type === 'INCOME' ? '+' : '-'}₺{item.amount.toLocaleString()}
                      </div>
                    </div>
                    <button onClick={() => handleDelete(item.id)} className="btn-danger" style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', background: 'rgba(239,68,68,0.1)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="col-span-4">
        <div className="glass-card" style={{ padding: '24px' }}>
          <div className="card-header" style={{ marginBottom: '24px' }}>
            <span className="card-title">Yeni Plan Ekle</span>
          </div>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Açıklama</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Örn: Ev Kirası" required />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Kategori</label>
              <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="Örn: Konut" required />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Tutar (₺)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>İşlem Türü</label>
              <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                <option value="EXPENSE">Gider</option>
                <option value="INCOME">Gelir</option>
              </select>
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Sıklık</label>
              <select value={frequency} onChange={e => setFrequency(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                <option value="DAILY">Her Gün</option>
                <option value="WEEKLY">Her Hafta</option>
                <option value="MONTHLY">Her Ay</option>
                <option value="YEARLY">Her Yıl</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '14px', borderRadius: '10px', fontWeight: 800 }}>Otomatik Planı Başlat</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecurringTransactions;
