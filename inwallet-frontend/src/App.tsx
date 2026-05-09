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
                <path d="M6 12L14 26L22 12" stroke="url(#logo_g1)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 4px 6px rgba(37, 99, 235, 0.5))' }}/>
                <path d="M16 12L24 26L32 12" stroke="url(#logo_g2)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 4px 6px rgba(96, 165, 250, 0.6))' }}/>
                <defs>
                  <linearGradient id="logo_g1" x1="6" y1="12" x2="22" y2="26" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3B82F6"/>
                    <stop offset="1" stopColor="#1E40AF"/>
                  </linearGradient>
                  <linearGradient id="logo_g2" x1="16" y1="12" x2="32" y2="26" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#93C5FD"/>
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
