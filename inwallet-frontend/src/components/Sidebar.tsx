import React from 'react';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onNavigate: (viewId: string) => void;
}

const menuItems = [
  { id: 'dashboard', icon: '🏠', label: 'Ana Sayfa', desc: 'Genel özet panosu', color: 'rgba(59, 130, 246, 0.2)', iconColor: '#3b82f6' },
  { id: 'portfolio', icon: '💼', label: 'Portföyüm', desc: 'Varlıklarınızı inceleyin', color: 'rgba(139, 92, 246, 0.2)', iconColor: '#8b5cf6' },
  { id: 'transactions', icon: '🔁', label: 'İşlem Geçmişi', desc: 'Gelir ve gider akışı', badge: 3, color: 'rgba(16, 185, 129, 0.2)', iconColor: '#10b981' },
  { id: 'goals', icon: '🎯', label: 'Hedeflerim', desc: 'Hayallerinizi planlayın', color: 'rgba(245, 158, 11, 0.2)', iconColor: '#f59e0b' },
  { id: 'settings', icon: '⚙️', label: 'Ayarlar', desc: 'Uygulama tercihleri', badge: '!', color: 'rgba(236, 72, 153, 0.2)', iconColor: '#ec4899' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentView, onNavigate }) => {
  
  const handleNavigation = (id: string) => {
    onNavigate(id);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      />

      {/* Sidebar Drawer */}
      <div className={`sidebar-drawer glass-card ${isOpen ? 'open' : ''}`}>
        
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="app-logo heading-gradient">InWallet</div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* User Profile Area */}
        <div className="sidebar-profile">
          <div className="profile-avatar">SE</div>
          <div className="profile-info">
            <div className="profile-name">Sami</div>
            <div className="profile-email">sami@inwallet.app</div>
          </div>
        </div>

        {/* Mini Wallet Card */}
        <div className="sidebar-wallet-card">
          <div className="wallet-label">Toplam Net Değer</div>
          <div className="wallet-amount">₺124,500.00</div>
          <div className="wallet-growth">▲ +5.2% bu ay</div>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">MENÜ</div>
          <ul>
            {menuItems.map(item => (
              <li key={item.id}>
                <button 
                  className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.id)}
                >
                  <div className="nav-icon-wrapper" style={{ background: item.color, border: `1px solid ${item.iconColor}40` }}>
                    <span className="nav-icon">{item.icon}</span>
                  </div>
                  <div className="nav-text-content">
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-desc">{item.desc}</span>
                  </div>
                  {item.badge && (
                    <span className={`nav-badge ${item.badge === '!' ? 'alert-badge' : 'count-badge'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Quick Actions Footer */}
        <div className="sidebar-footer">
          <div className="footer-actions">
            <button className="quick-action-btn">
              <span className="qa-icon">🌗</span>
              <span>Tema</span>
            </button>
            <button className="quick-action-btn">
              <span className="qa-icon">❓</span>
              <span>Yardım</span>
            </button>
          </div>
          <button className="nav-item logout-btn" onClick={() => alert('Çıkış yapılıyor...')}>
            <div className="nav-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
              <span className="nav-icon">🚪</span>
            </div>
            <span className="nav-label" style={{ marginLeft: '12px' }}>Çıkış Yap</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
