import React from 'react';
import './Sidebar.css';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onNavigate: (viewId: string) => void;
}

const menuItems = [
  { id: 'dashboard', icon: '🏠', label: 'Ana Sayfa', desc: 'Genel özet panosu', color: 'rgba(59, 130, 246, 0.2)', iconColor: '#3b82f6' },
  { id: 'portfolio', icon: '💼', label: 'Portföyüm', desc: 'Varlıklarınızı inceleyin', color: 'rgba(139, 92, 246, 0.2)', iconColor: '#8b5cf6' },
  { id: 'market', icon: '💹', label: 'Piyasalar', desc: 'Canlı veriler ve yatırım', color: 'rgba(59, 130, 246, 0.2)', iconColor: '#3b82f6' },
  { id: 'dca', icon: '📈', label: 'DCA Planlayıcı', desc: 'Düzenli yatırım planı', color: 'rgba(99, 102, 241, 0.2)', iconColor: '#6366f1' },
  { id: 'transactions', icon: '🔁', label: 'İşlem Geçmişi', desc: 'Gelir ve gider akışı', badge: 3, color: 'rgba(16, 185, 129, 0.2)', iconColor: '#10b981' },
  { id: 'goals', icon: '🎯', label: 'Hedeflerim', desc: 'Hayallerinizi planlayın', color: 'rgba(245, 158, 11, 0.2)', iconColor: '#f59e0b' },
  { id: 'favorites', icon: '⭐', label: 'Favoriler', desc: 'Sık kullanılan işlemler', color: 'rgba(250, 204, 21, 0.2)', iconColor: '#facc15' },
  { id: 'settings', icon: '⚙️', label: 'Ayarlar', desc: 'Uygulama tercihleri', badge: '!', color: 'rgba(236, 72, 153, 0.2)', iconColor: '#ec4899' },
];

const financialQuotes = [
  { text: "Kural 1: Asla para kaybetme. Kural 2: Birinci kuralı asla unutma.", author: "Warren Buffett" },
  { text: "Fiyat, ödediğinizdir. Değer ise elde ettiğinizdir.", author: "Warren Buffett" },
  { text: "Borsa, sabırsızlardan sabırlılara para aktarma aracıdır.", author: "Warren Buffett" },
  { text: "En iyi yatırım, kendine yaptığın yatırımdır.", author: "Benjamin Franklin" },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentView, onNavigate }) => {
  const { username, userId, logout } = useAuth();
  
  const handleNavigation = (id: string) => {
    onNavigate(id);
    onClose();
  };

  const [theme, setTheme] = React.useState(localStorage.getItem('inwallet_theme') || 'dark');

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
        
        <div className="sidebar-brand" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '24px', fontWeight: '900', background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            InWallet
          </div>
          <button className="close-btn" onClick={onClose} style={{ fontSize: '28px' }}>×</button>
        </div>

        <div className="sidebar-profile" style={{ cursor: 'pointer' }} onClick={() => handleNavigation('settings')}>
          <div className="profile-avatar" style={{ background: 'var(--accent-blue)', color: 'white' }}>
            {(username || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <div className="profile-name">{username || 'Kullanıcı'}</div>
            <div className="profile-email">ID: #{userId || '---'}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map(item => (
              <li key={item.id}>
                <button className={`nav-item ${currentView === item.id ? 'active' : ''}`} onClick={() => handleNavigation(item.id)}>
                  <div className="nav-icon-wrapper" style={{ background: item.color, border: `1px solid ${item.iconColor}40` }}>
                    <span className="nav-icon">{item.icon}</span>
                  </div>
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
            <span>{theme === 'dark' ? '☀️ Işık Modu' : '🌙 Gece Modu'}</span>
          </button>
          <button className="nav-item logout-btn" onClick={logout} style={{ border: 'none', background: 'rgba(239, 68, 68, 0.1)', width: '100%', cursor: 'pointer', borderRadius: '10px', padding: '12px' }}>
            <span className="nav-label" style={{ color: '#ef4444', fontWeight: 700 }}>🚪 Çıkış Yap</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
