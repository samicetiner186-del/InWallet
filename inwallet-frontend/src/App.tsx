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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.4))' }}>
                <rect x="2" y="5" width="20" height="14" rx="4" fill="url(#logo_gradient)"/>
                <path d="M22 10H16C14.8954 10 14 10.8954 14 12C14 13.1046 14.8954 14 16 14H22V10Z" fill="rgba(255,255,255,0.2)"/>
                <circle cx="18" cy="12" r="1.5" fill="white"/>
                <defs>
                  <linearGradient id="logo_gradient" x1="2" y1="5" x2="22" y2="19" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#60A5FA"/>
                    <stop offset="1" stopColor="#3B82F6"/>
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
