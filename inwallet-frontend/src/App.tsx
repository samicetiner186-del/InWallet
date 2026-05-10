import React, { useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import AIChatWidget from './components/AIChatWidget';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Portfolio from './pages/Portfolio';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';
import Settings from './pages/Settings';
import Favorites from './pages/Favorites';

const AppContent: React.FC = () => {
  const { isLoggedIn, username, logout } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  if (!isLoggedIn) return <LoginPage />;

  const renderView = () => {
    switch(currentView) {
      case 'dashboard': return <Dashboard />;
      case 'portfolio': return <Portfolio />;
      case 'transactions': return <Transactions />;
      case 'goals': return <Goals />;
      case 'favorites': return <Favorites />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        currentView={currentView}
        onNavigate={setCurrentView}
      />
      
      <div className="app-container">
        <header className="app-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              className="menu-btn" 
              aria-label="Menu"
              onClick={() => setIsSidebarOpen(true)}
            >
              ☰
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="4" width="18" height="12" rx="2" fill="#10B981" style={{ filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.4))' }}/>
                <circle cx="17" cy="10" r="2" fill="#047857"/>
                <rect x="10" y="6" width="3" height="1" fill="#047857"/>
                <rect x="21" y="6" width="3" height="1" fill="#047857"/>
                <rect x="23" y="7" width="7" height="9" rx="1.5" fill="#F8FAFC" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}/>
                <rect x="24" y="9" width="5" height="2" rx="0.5" fill="#CBD5E1"/>
                <path d="M4 14C4 11.79 5.79 10 8 10H28C30.21 10 32 11.79 32 14V26C32 28.21 30.21 30 28 30H8C5.79 30 4 28.21 4 26V14Z" fill="url(#main_w_bg)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" style={{ filter: 'drop-shadow(0 6px 12px rgba(37, 99, 235, 0.5))' }}/>
                
                <rect x="8" y="12" width="20" height="10" rx="1.5" fill="url(#titanium_card)" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}/>
                <rect x="10" y="14" width="3" height="2" rx="0.5" fill="#FBBF24"/>
                <circle cx="24" cy="15" r="1.5" fill="#EF4444" opacity="0.8"/>
                <circle cx="25.5" cy="15" r="1.5" fill="#F59E0B" opacity="0.8"/>

                <path d="M4 16C4 16 12 19 18 19C24 19 32 16 32 16V26C32 28.21 30.21 30 28 30H8C5.79 30 4 28.21 4 26V16Z" fill="url(#main_w_front)"/>
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
                  <linearGradient id="main_w_bg" x1="4" y1="10" x2="32" y2="30" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1E3A8A"/>
                    <stop offset="1" stopColor="#172554"/>
                  </linearGradient>
                  <linearGradient id="main_w_front" x1="4" y1="16" x2="32" y2="30" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3B82F6"/>
                    <stop offset="1" stopColor="#1D4ED8"/>
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="app-logo heading-gradient">InWallet</div>
                <button 
                  onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isPrivacyMode ? 'var(--accent-neon-blue)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    marginLeft: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    padding: '4px'
                  }}
                  title={isPrivacyMode ? 'Gizlilik Modunu Kapat' : 'Gizlilik Modunu Aç'}
                >
                  {isPrivacyMode ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                      <line x1="2" x2="22" y1="2" y2="22"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="user-profile">
            <div className="text-muted">Hoş Geldiniz, {username || 'Kullanıcı'}</div>
            <div className="avatar" style={{ cursor: 'pointer' }} onClick={logout} title="Çıkış Yap">
              {username ? username.slice(0, 2).toUpperCase() : 'IW'}
            </div>
          </div>
        </header>
        
        <main className={`app-main ${isPrivacyMode ? 'privacy-on' : ''}`}>
          {renderView()}
        </main>

        <AIChatWidget />
      </div>
    </>
  );
}

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
