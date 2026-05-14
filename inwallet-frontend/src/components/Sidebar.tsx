import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import './Sidebar.css';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onNavigate: (viewId: string) => void;
}

const menuItems = [
  { id: 'dashboard',    label: 'Ana Sayfa',          icon: '🏠', desc: 'Genel özet panosu' },
  { id: 'portfolio',    label: 'Portföyüm',          icon: '💼', desc: 'Varlıklarınızı inceleyin' },
  { id: 'market',       label: 'Piyasalar',          icon: '📈', desc: 'Canlı veriler ve yatırım' },
  { id: 'recurring',    label: 'Otomatik İşlemler',  icon: '🔁', desc: 'Tekrarlayan gelir/gider' },
  { id: 'dca',          label: 'DCA Planlayıcı',     icon: '💰', desc: 'Düzenli yatırım planı' },
  { id: 'inflation',    label: 'Enflasyon Savunma',  icon: '🔥', desc: 'Satın alma gücü analizi' },
  { id: 'transactions', label: 'İşlem Geçmişi',      icon: '📋', desc: 'Gelir ve gider akışı' },
  { id: 'goals',        label: 'Hedeflerim',         icon: '🎯', desc: 'Hayallerinizi planlayın' },
  { id: 'profile',      label: 'Profilim',           icon: '👤', desc: 'Bilgilerinizi güncelleyin' },
  { id: 'settings',     label: 'Ayarlar',            icon: '⚙️', desc: 'Uygulama tercihleri' },
];


// ─── Animasyon Varyantları ────────────────────────────────────────────────────
const drawerVariants: Variants = {
  hidden: { x: '-100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', damping: 28, stiffness: 260 }
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: { duration: 0.22, ease: 'easeInOut' }
  }
};

const overlayVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.18 } }
};

const navContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
};

const navItemVariants: Variants = {
  hidden:  { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } }
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentView, onNavigate }) => {
  const { username, userId, logout } = useAuth();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (!userId) return;
    userApi.getMe(Number(userId)).then(setUserData).catch(() => {});
  }, [userId]);

  const displayName  = userData?.username || username || 'Kullanıcı';
  const displayEmail = userData?.email || '';
  const initials     = displayName.slice(0, 2).toUpperCase();

  const handleNavigation = (id: string) => {
    onNavigate(id);
    onClose();
  };

  const [theme, setTheme] = React.useState(localStorage.getItem('inwallet_theme') || 'light');

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('inwallet_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            className="sidebar-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            className="sidebar-drawer"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ position: 'fixed' }}
          >

            {/* Brand Header */}
            <div className="sidebar-brand" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                InWallet
              </div>
              <motion.button
                className="close-btn"
                onClick={onClose}
                whileHover={{ rotate: 90, scale: 1.1 }}
                transition={{ duration: 0.2 }}
                style={{ fontSize: '28px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                ×
              </motion.button>
            </div>

            {/* Profil */}
            <motion.div
              className="sidebar-profile"
              style={{ cursor: 'pointer' }}
              onClick={() => handleNavigation('profile')}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="profile-avatar" style={{ background: 'var(--accent-blue)', color: 'white' }}>
                {initials}
              </div>
              <div className="profile-info">
                <div className="profile-name">{displayName}</div>
                {displayEmail && (
                  <div className="profile-email" style={{ fontSize: '12px', opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayEmail}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Navigasyon — Stagger */}
            <nav className="sidebar-nav">
              <motion.ul
                variants={navContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {menuItems.map(item => (
                  <motion.li key={item.id} variants={navItemVariants}>
                    <button
                      className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                      onClick={() => handleNavigation(item.id)}
                    >
                      <span style={{ fontSize: '16px', marginRight: '10px' }}>{item.icon}</span>
                      <div className="nav-text-content">
                        <span className="nav-label">{item.label}</span>
                      </div>
                      {currentView === item.id && (
                        <motion.span
                          layoutId="activeIndicator"
                          style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-blue)', marginLeft: 'auto' }}
                        />
                      )}
                    </button>
                  </motion.li>
                ))}
              </motion.ul>
            </nav>

            {/* Footer */}
            <motion.div
              className="sidebar-footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <button className="quick-action-btn" onClick={toggleTheme} style={{ width: '100%', marginBottom: '10px' }}>
                <span>{theme === 'dark' ? '☀️ Işık Modu' : '🌙 Koyu Mod'}</span>
              </button>
              <button className="nav-item logout-btn" onClick={logout}>
                <span style={{ marginRight: '8px' }}>🚪</span>
                <span className="nav-label">Çıkış Yap</span>
              </button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;

