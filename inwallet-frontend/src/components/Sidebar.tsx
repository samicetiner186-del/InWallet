import React from 'react';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { id: 'dashboard', icon: '🏠', label: 'Ana Sayfa', active: true },
  { id: 'portfolio', icon: '💼', label: 'Portföyüm', active: false },
  { id: 'transactions', icon: '🔁', label: 'İşlem Geçmişi', active: false },
  { id: 'goals', icon: '🎯', label: 'Hedeflerim', active: false },
  { id: 'settings', icon: '⚙️', label: 'Ayarlar', active: false },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Overlay */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      />

      {/* Sidebar Drawer */}
      <div className={`sidebar-drawer glass-card ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="app-logo heading-gradient">InWallet</div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map(item => (
              <li key={item.id}>
                <button className={`nav-item ${item.active ? 'active' : ''}`}>
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn">
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Çıkış Yap</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
