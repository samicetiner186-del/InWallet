import React, { useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import AIChatWidget from './components/AIChatWidget';
import Sidebar from './components/Sidebar';

// Pages
import Portfolio from './pages/Portfolio';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';
import Settings from './pages/Settings';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch(currentView) {
      case 'dashboard': return <Dashboard />;
      case 'portfolio': return <Portfolio />;
      case 'transactions': return <Transactions />;
      case 'goals': return <Goals />;
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
                <rect x="4" y="12" width="28" height="18" rx="6" fill="url(#app_bg_grad)" style={{ filter: 'drop-shadow(0 4px 10px rgba(37, 99, 235, 0.5))' }}/>
                <rect x="8" y="6" width="20" height="14" rx="3" fill="#FFFFFF" fillOpacity="0.95"/>
                <path d="M12 11L15 15L18 11L21 15L24 11" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="4" y="16" width="28" height="14" rx="6" fill="url(#app_front_grad)"/>
                <path d="M4 20C12 23 24 23 32 20" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none"/>
                <defs>
                  <linearGradient id="app_bg_grad" x1="4" y1="12" x2="32" y2="30" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1E3A8A"/>
                    <stop offset="1" stopColor="#1D4ED8"/>
                  </linearGradient>
                  <linearGradient id="app_front_grad" x1="4" y1="16" x2="32" y2="30" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#60A5FA"/>
                    <stop offset="1" stopColor="#2563EB"/>
                  </linearGradient>
                </defs>
              </svg>
              <div className="app-logo heading-gradient">InWallet</div>
            </div>
          </div>
          <div className="user-profile">
            <div className="text-muted">Hoş Geldiniz, Sami</div>
            <div className="avatar">SE</div>
          </div>
        </header>
        
        <main>
          {renderView()}
        </main>

        <AIChatWidget />
      </div>
    </>
  );
}

export default App;
