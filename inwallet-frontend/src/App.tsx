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
            <div className="app-logo heading-gradient">InWallet</div>
          </div>
          <div className="user-profile">
            <div className="text-muted">Hoş Geldiniz, Yuşa</div>
            <div className="avatar">YM</div>
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
