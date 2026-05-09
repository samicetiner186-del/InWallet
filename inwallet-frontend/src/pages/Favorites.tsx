import React from 'react';

const Favorites: React.FC = () => {
  return (
    <div className="dashboard-grid">
      <div className="col-span-12 glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⭐</div>
        <h2 className="heading-gradient" style={{ fontSize: '32px', marginBottom: '12px' }}>Favorileriniz</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: '1.6' }}>
          Sık kullandığınız işlemler, favori varlıklarınız ve hızlı erişim kısayollarınız yakında bu sayfada listelenecek.
        </p>
      </div>
    </div>
  );
};

export default Favorites;
