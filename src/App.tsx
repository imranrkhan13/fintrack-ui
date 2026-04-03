import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { SummaryCards } from './components/SummaryCards';
import { TrendChart, CategoryChart, BalanceBarChart } from './components/Charts';
import { Transactions } from './components/Transactions';
import { Insights } from './components/Insights';
import { Eye } from 'lucide-react';
import './index.css';

function RoleBanner() {
  const { state, dispatch } = useAppContext();
  if (state.role !== 'viewer') return null;
  return (
    <div className="role-banner">
      <Eye size={12} />
      <span>Viewer mode — read only.</span>
      <button className="banner-link" onClick={() => dispatch({ type: 'SET_ROLE', payload: 'admin' })}>
        Switch to Admin
      </button>
    </div>
  );
}

export type Tab = 'dashboard' | 'transactions' | 'insights';

function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  return (
    <div className="app">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <RoleBanner />

      <main className="main">
        <div key={activeTab} className="page fade-in">
          {activeTab === 'dashboard' && (
            <>
              <div className="page-header">
                <h1 className="page-title">Overview</h1>
                <p className="page-sub">Your financial activity at a glance</p>
              </div>
              <SummaryCards />
              <div className="charts-row">
                <TrendChart />
                <CategoryChart />
              </div>
              <BalanceBarChart />
            </>
          )}
          {activeTab === 'transactions' && (
            <>
              <div className="page-header">
                <h1 className="page-title">Transactions</h1>
                <p className="page-sub">All your financial records</p>
              </div>
              <Transactions />
            </>
          )}
          {activeTab === 'insights' && (
            <>
              <div className="page-header">
                <h1 className="page-title">Insights</h1>
                <p className="page-sub">What your numbers say</p>
              </div>
              <Insights />
            </>
          )}
        </div>
      </main>

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <footer className="footer">
        <div className="footer-inner">
          <span className="footer-logo">Fintrack</span>
          <span className="footer-sep" />
          <span>Imran khan - muhammadimrank034@gmail.com - imran-silk.vercel.app</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  );
}
