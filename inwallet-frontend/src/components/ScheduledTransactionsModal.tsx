import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  type: 'debt' | 'receivable' | null;
}

const ScheduledTransactionsModal: React.FC<Props> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 className="card-title">
            {type === 'debt' ? 'Planlanmış Borç Detayları' : 'Planlanmış Alacak Detayları'}
          </h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="transaction-list">
          {type === 'debt' ? (
            <>
              <div style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', marginBottom: '10px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 'bold' }}>Konut Kredisi Taksiti</span>
                  <span className="text-danger" style={{ fontWeight: 'bold' }}>-₺12,500.00</span>
                </div>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>Son Ödeme: 15 Mayıs 2026 • Kalan Taksit: 84 • Faiz: %1.20</div>
              </div>
              <div style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', marginBottom: '10px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 'bold' }}>Kredi Kartı Ekstresi</span>
                  <span className="text-danger" style={{ fontWeight: 'bold' }}>-₺8,450.00</span>
                </div>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>Son Ödeme: 22 Mayıs 2026 • Asgari Tutar: ₺3,380.00</div>
              </div>
              <div style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 'bold' }}>Araç Sigortası (Kasko)</span>
                  <span className="text-danger" style={{ fontWeight: 'bold' }}>-₺4,200.00</span>
                </div>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>Son Ödeme: 05 Haziran 2026 • Kurum: Allianz</div>
              </div>
            </>
          ) : (
            <>
              <div style={{ padding: '15px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', marginBottom: '10px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 'bold' }}>Freelance Proje Ödemesi</span>
                  <span className="text-success" style={{ fontWeight: 'bold' }}>+₺15,000.00</span>
                </div>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>Beklenen Tarih: 12 Mayıs 2026 • Müşteri: TechCorp Inc.</div>
              </div>
              <div style={{ padding: '15px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', marginBottom: '10px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 'bold' }}>Kira Geliri (Kadıköy Ev)</span>
                  <span className="text-success" style={{ fontWeight: 'bold' }}>+₺18,500.00</span>
                </div>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>Beklenen Tarih: 20 Mayıs 2026 • Kiracı: Ahmet Y.</div>
              </div>
              <div style={{ padding: '15px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 'bold' }}>Hisse Temettü Ödemesi</span>
                  <span className="text-success" style={{ fontWeight: 'bold' }}>+₺3,250.00</span>
                </div>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>Beklenen Tarih: 28 Mayıs 2026 • Şirket: THYAO</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduledTransactionsModal;
