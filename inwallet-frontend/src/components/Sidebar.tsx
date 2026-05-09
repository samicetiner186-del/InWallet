import React from 'react';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onNavigate: (viewId: string) => void;
}

const menuItems = [
  { id: 'dashboard', icon: '🏠', label: 'Ana Sayfa' },
  { id: 'portfolio', icon: '💼', label: 'Portföyüm' },
  { id: 'transactions', icon: '🔁', label: 'İşlem Geçmişi' },
  { id: 'goals', icon: '🎯', label: 'Hedeflerim' },
  { id: 'settings', icon: '⚙️', label: 'Ayarlar' },
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
        <div className="sidebar-header">
          <div className="app-logo heading-gradient">InWallet</div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map(item => (
              <li key={item.id}>
                <button 
                  className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={() => alert('Çıkış yapılıyor...')}>
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Çıkış Yap</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
