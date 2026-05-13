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
import DCAPlanner from './pages/DCAPlanner';
import EmergencyFund from './pages/EmergencyFund';
import Market from './pages/Market';
import RecurringTransactions from './pages/RecurringTransactions';

const AppContent: React.FC = () => {
  const { isLoggedIn, username } = useAuth();
  
  // Sayfa yenilendiğinde kalınan yerden devam etmesi için localStorage kullanımı
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('inwallet_current_view') || 'dashboard';
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  React.useEffect(() => {
    localStorage.setItem('inwallet_current_view', currentView);
  }, [currentView]);

  React.useEffect(() => {
    const handleNavigate = (e: any) => setCurrentView(e.detail);
    window.addEventListener('navigate', handleNavigate);
    return () => window.removeEventListener('navigate', handleNavigate);
  }, []);

  if (!isLoggedIn) return <LoginPage />;

  const renderView = () => {
    switch(currentView) {
      case 'dashboard': return <Dashboard />;
      case 'portfolio': return <Portfolio />;
      case 'market': return <Market />;
      case 'transactions': return <Transactions />;
      case 'goals': return <Goals />;
      case 'recurring': return <RecurringTransactions />;
      case 'dca': return <DCAPlanner />;
      case 'emergency': return <EmergencyFund />;
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
              {/* Inwallet Logo */}
              <div style={{ 
                fontSize: '20px', 
                fontWeight: '900', 
                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-1px',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}>
                InWallet
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
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
            <div className="avatar" style={{ cursor: 'pointer' }} onClick={() => setCurrentView('settings')} title="Profili Düzenle">
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
