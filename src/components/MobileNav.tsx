import React from 'react';
import { LayoutDashboard, Receipt, Lightbulb } from 'lucide-react';
import { Tab } from '../App';

interface Props {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
}

export function MobileNav({ activeTab, setActiveTab }: Props) {
  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: <LayoutDashboard size={20} strokeWidth={1.6} /> },
    { id: 'transactions' as Tab, label: 'Transactions', icon: <Receipt size={20} strokeWidth={1.6} /> },
    { id: 'insights' as Tab, label: 'Insights', icon: <Lightbulb size={20} strokeWidth={1.6} /> },
  ];

  return (
    <nav className="mobile-nav">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`mobile-nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className="mobile-nav-icon">{tab.icon}</span>
          <span className="mobile-nav-label">{tab.label}</span>
          {activeTab === tab.id && <span className="mobile-nav-indicator" />}
        </button>
      ))}
    </nav>
  );
}
