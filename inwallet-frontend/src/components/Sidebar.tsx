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
  { id: 'favorites', icon: '⭐', label: 'Favoriler', desc: 'Sık kullanılan işlemler', color: 'rgba(250, 204, 21, 0.2)', iconColor: '#facc15' },
  { id: 'settings', icon: '⚙️', label: 'Ayarlar', desc: 'Uygulama tercihleri', badge: '!', color: 'rgba(236, 72, 153, 0.2)', iconColor: '#ec4899' },
];

const financialQuotes = [
  { text: "Kural 1: Asla para kaybetme. Kural 2: Birinci kuralı asla unutma.", author: "Warren Buffett" },
  { text: "Fiyat, ödediğinizdir. Değer ise elde ettiğinizdir.", author: "Warren Buffett" },
  { text: "Borsa, sabırsızlardan sabırlılara para aktarma aracıdır.", author: "Warren Buffett" },
  { text: "En iyi yatırım, kendine yaptığın yatırımdır.", author: "Benjamin Franklin" },
  { text: "Zenginler zamanı, fakirler parayı satın alır.", author: "Robert Kiyosaki" },
  { text: "Fırsatlar her gün gelir, önemli olan onları görebilmektir.", author: "Peter Lynch" },
  { text: "Parayı kontrol etmeyi öğrenemezsen, para seni kontrol eder.", author: "Dave Ramsey" },
  { text: "Risk, ne yaptığını bilmemekten gelir.", author: "Warren Buffett" },
  { text: "Bugün bir ağacın gölgesinde oturabilmenizin sebebi, birinin yıllar önce o ağacı dikmiş olmasıdır.", author: "Warren Buffett" },
  { text: "İyi bir yatırım portföyü, bir sabun kalıbı gibidir; ne kadar çok dokunursan o kadar küçülür.", author: "Eugene Fama" },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentView, onNavigate }) => {
  
  const handleNavigation = (id: string) => {
    onNavigate(id);
    onClose();
  };

  // Get daily quote based on the day of the year
  const getDailyQuote = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = (today.getTime() - start.getTime()) + ((start.getTimezoneOffset() - today.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return financialQuotes[dayOfYear % financialQuotes.length];
  };

  const dailyQuote = getDailyQuote();

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="4" width="18" height="12" rx="2" fill="#10B981" style={{ filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.4))' }}/>
              <circle cx="17" cy="10" r="2" fill="#047857"/>
              <rect x="10" y="6" width="3" height="1" fill="#047857"/>
              <rect x="21" y="6" width="3" height="1" fill="#047857"/>
              <rect x="23" y="7" width="7" height="9" rx="1.5" fill="#F8FAFC" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}/>
              <rect x="24" y="9" width="5" height="2" rx="0.5" fill="#CBD5E1"/>
              <path d="M4 14C4 11.79 5.79 10 8 10H28C30.21 10 32 11.79 32 14V26C32 28.21 30.21 30 28 30H8C5.79 30 4 28.21 4 26V14Z" fill="url(#side_main_w_bg)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" style={{ filter: 'drop-shadow(0 6px 12px rgba(37, 99, 235, 0.5))' }}/>
              
              <rect x="8" y="12" width="20" height="10" rx="1.5" fill="url(#titanium_card)" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}/>
              <rect x="10" y="14" width="3" height="2" rx="0.5" fill="#FBBF24"/>
              <circle cx="24" cy="15" r="1.5" fill="#EF4444" opacity="0.8"/>
              <circle cx="25.5" cy="15" r="1.5" fill="#F59E0B" opacity="0.8"/>

              <path d="M4 16C4 16 12 19 18 19C24 19 32 16 32 16V26C32 28.21 30.21 30 28 30H8C5.79 30 4 28.21 4 26V16Z" fill="url(#side_main_w_front)"/>
              <path d="M4 16C4 16 12 19 18 19C24 19 32 16 32 16" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M11 22.5 L14.5 28 L18 22.5 L21.5 28 L25 22.5" stroke="#92400E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}/>
              <path d="M11 21 L14.5 26.5 L18 21 L21.5 26.5 L25 21" stroke="url(#hologram_w)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11 21 L14.5 26.5 L18 21 L21.5 26.5 L25 21" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
              <defs>
                <linearGradient id="titanium_card" x1="8" y1="12" x2="28" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#E2E8F0"/>
                  <stop offset="0.5" stopColor="#CBD5E1"/>
                  <stop offset="1" stopColor="#94A3B8"/>
                </linearGradient>
                <linearGradient id="hologram_w" x1="10" y1="21" x2="26" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FDF08B"/>
                  <stop offset="0.25" stopColor="#F59E0B"/>
                  <stop offset="0.5" stopColor="#FCE7F3"/>
                  <stop offset="0.75" stopColor="#FCD34D"/>
                  <stop offset="1" stopColor="#FBBF24"/>
                </linearGradient>
                <linearGradient id="side_main_w_bg" x1="4" y1="10" x2="32" y2="30" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#1E3A8A"/>
                  <stop offset="1" stopColor="#172554"/>
                </linearGradient>
                <linearGradient id="side_main_w_front" x1="4" y1="16" x2="32" y2="30" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3B82F6"/>
                  <stop offset="1" stopColor="#1D4ED8"/>
                </linearGradient>
              </defs>
            </svg>
            <div className="app-logo heading-gradient">InWallet</div>
          </div>
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

        {/* Daily Motivation Quote */}
        <div className="sidebar-quote-card">
          <div className="quote-text">{dailyQuote.text}</div>
          <div className="quote-author">
            <span className="author-name">~ {dailyQuote.author}</span>
          </div>
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
