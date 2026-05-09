import React, { useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import AIChatWidget from './components/AIChatWidget';
import Sidebar from './components/Sidebar';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
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
          <Dashboard />
        </main>

        <AIChatWidget />
      </div>
    </>
  );
}

export default App;
