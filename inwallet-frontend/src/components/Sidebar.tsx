import React, { useEffect, useState } from 'react';
import './Sidebar.css';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onNavigate: (viewId: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Ana Sayfa', desc: 'Genel özet panosu' },
  { id: 'portfolio', label: 'Portföyüm', desc: 'Varlıklarınızı inceleyin' },
  { id: 'market', label: 'Piyasalar', desc: 'Canlı veriler ve yatırım' },
  { id: 'dca', label: 'DCA Planlayıcı', desc: 'Düzenli yatırım planı' },
  { id: 'transactions', label: 'İşlem Geçmişi', desc: 'Gelir ve gider akışı' },
  { id: 'goals', label: 'Hedeflerim', desc: 'Hayallerinizi planlayın' },
  { id: 'favorites', label: 'Favoriler', desc: 'Sık kullanılan işlemler' },
  { id: 'settings', label: 'Ayarlar', desc: 'Uygulama tercihleri' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentView, onNavigate }) => {
  const { username, userId, logout } = useAuth();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (!userId) return;
    userApi.getMe(Number(userId)).then(setUserData).catch(() => {});
  }, [userId]);

  const displayName = userData?.username || username || 'Kullanıcı';
  const displayEmail = userData?.email || '';
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleNavigation = (id: string) => {
    onNavigate(id);
    onClose();
  };

  const [theme, setTheme] = React.useState(localStorage.getItem('inwallet_theme') || 'light');

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('inwallet_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`sidebar-drawer glass-card ${isOpen ? 'open' : ''}`}>

        <div className="sidebar-brand" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '24px', fontWeight: '900', background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            InWallet
          </div>
          <button className="close-btn" onClick={onClose} style={{ fontSize: '28px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>×</button>
        </div>

        <div className="sidebar-profile" style={{ cursor: 'pointer' }} onClick={() => handleNavigation('settings')}>
          <div className="profile-avatar" style={{ background: 'var(--accent-blue)', color: 'white' }}>
            {initials}
          </div>
          <div className="profile-info">
            <div className="profile-name">{displayName}</div>
            {displayEmail && <div className="profile-email" style={{ fontSize: '12px', opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayEmail}</div>}
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map(item => (
              <li key={item.id}>
                <button
                  className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.id)}
                >
                  <div className="nav-text-content">
                    <span className="nav-label">{item.label}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="quick-action-btn" onClick={toggleTheme} style={{ width: '100%', marginBottom: '10px' }}>
            <span>{theme === 'dark' ? 'Işık Modu' : 'Koyu Mod'}</span>
          </button>
          <button className="nav-item logout-btn" onClick={logout} style={{ border: 'none', background: 'rgba(239, 68, 68, 0.1)', width: '100%', cursor: 'pointer', borderRadius: '10px', padding: '12px' }}>
            <span className="nav-label" style={{ color: '#ef4444', fontWeight: 700 }}>Çıkış Yap</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
