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
                <rect x="8" y="4" width="18" height="12" rx="2" fill="#10B981" style={{ filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.4))' }}/>
                <circle cx="17" cy="10" r="2" fill="#047857"/>
                <rect x="10" y="6" width="3" height="1" fill="#047857"/>
                <rect x="21" y="6" width="3" height="1" fill="#047857"/>
                <rect x="23" y="7" width="7" height="9" rx="1.5" fill="#F8FAFC" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}/>
                <rect x="24" y="9" width="5" height="2" rx="0.5" fill="#CBD5E1"/>
                <path d="M4 14C4 11.79 5.79 10 8 10H28C30.21 10 32 11.79 32 14V26C32 28.21 30.21 30 28 30H8C5.79 30 4 28.21 4 26V14Z" fill="url(#main_w_bg)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" style={{ filter: 'drop-shadow(0 6px 12px rgba(37, 99, 235, 0.5))' }}/>
                <path d="M4 16C4 16 12 19 18 19C24 19 32 16 32 16V26C32 28.21 30.21 30 28 30H8C5.79 30 4 28.21 4 26V16Z" fill="url(#main_w_front)"/>
                <path d="M4 16C4 16 12 19 18 19C24 19 32 16 32 16" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M11 21.5L14.5 27L18 21.5" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))' }}/>
                <path d="M18 21.5L21.5 27L25 21.5" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 2px rgba(96,165,250,0.8))' }}/>
                <defs>
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
