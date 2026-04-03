import React, { useState } from 'react';
import {
  LayoutDashboard, Receipt, Lightbulb,
  Shield, Eye, Download, Wifi, WifiOff, X, Menu
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Tab } from '../App';

interface Props {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
}

function exportCSV(transactions: any[]) {
  const rows = [
    ['Date', 'Description', 'Category', 'Type', 'Amount (INR)'],
    ...transactions.map(t => [t.date, `"${t.description}"`, t.category, t.type, t.amount]),
  ];
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fintrack-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function Header({ activeTab, setActiveTab }: Props) {
  const { state, dispatch, isOnline } = useAppContext();
  const { role, transactions } = state;
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} strokeWidth={1.8} /> },
    { id: 'transactions', label: 'Transactions', icon: <Receipt size={14} strokeWidth={1.8} /> },
    { id: 'insights', label: 'Insights', icon: <Lightbulb size={14} strokeWidth={1.8} /> },
  ];

  const handleTab = (t: Tab) => { setActiveTab(t); setMenuOpen(false); };

  return (
    <>
      <header className="header">
        {/* Left */}
        <div className="header-left">
          <div className="logo">
            <span className="logo-mark">F</span>
            <span className="logo-text">Fintrack</span>
          </div>
          <nav className="desktop-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Right */}
        <div className="header-right">
          <div className={`conn-pill ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
            <span className="conn-label">{isOnline ? 'Live' : 'Offline'}</span>
          </div>

          <button className="hdr-btn" onClick={() => exportCSV(transactions)} title="Export CSV">
            <Download size={14} strokeWidth={1.8} />
            <span className="hdr-btn-label">Export</span>
          </button>

          <div className="role-toggle">
            <button
              className={`role-opt ${role === 'viewer' ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_ROLE', payload: 'viewer' })}
              title="Viewer — read only"
            >
              <Eye size={12} /> Viewer
            </button>
            <button
              className={`role-opt ${role === 'admin' ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_ROLE', payload: 'admin' })}
              title="Admin — full access"
            >
              <Shield size={12} /> Admin
            </button>
          </div>

          {/* Mobile menu toggle — only shows on small screens */}
          <button className="menu-toggle" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMenuOpen(false)}>
          <div className="mobile-drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-logo">
              <span className="logo-mark">F</span>
              <span className="logo-text">Fintrack</span>
              <button className="drawer-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <X size={18} />
              </button>
            </div>
            <nav className="drawer-nav">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`drawer-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => handleTab(tab.id)}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>
            <div className="drawer-divider" />
            <div className="drawer-actions">
              <button className="drawer-action-btn" onClick={() => { exportCSV(transactions); setMenuOpen(false); }}>
                <Download size={14} /> Export CSV
              </button>
              <div className="role-toggle drawer-role">
                <button className={`role-opt ${role === 'viewer' ? 'active' : ''}`}
                  onClick={() => dispatch({ type: 'SET_ROLE', payload: 'viewer' })}>
                  <Eye size={12} /> Viewer
                </button>
                <button className={`role-opt ${role === 'admin' ? 'active' : ''}`}
                  onClick={() => dispatch({ type: 'SET_ROLE', payload: 'admin' })}>
                  <Shield size={12} /> Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}