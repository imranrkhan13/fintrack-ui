import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, BarChart2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency, getTotalBalance, getTotalIncome, getTotalExpenses, getSavingsRate } from '../utils';

function useCountUp(target: number, duration = 900) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>();
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(from + (target - from) * ease));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);
  return val;
}

function AnimatedAmount({ amount }: { amount: number }) {
  const counted = useCountUp(amount);
  return <>{formatCurrency(counted)}</>;
}

interface CardProps {
  label: string;
  amount: number;
  sub: string;
  icon: React.ReactNode;
  barPct: number;
  delay: number;
  accent?: boolean;
}

function Card({ label, amount, sub, icon, barPct, delay, accent }: CardProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className={`summary-card ${visible ? 'card-visible' : ''} ${accent ? 'card-accent' : ''}`}>
      <div className="card-top">
        <span className="card-label">{label}</span>
        <span className="card-icon">{icon}</span>
      </div>
      <div className="card-value">
        {visible ? <AnimatedAmount amount={Math.abs(amount)} /> : formatCurrency(0)}
      </div>
      <div className="card-sub">{sub}</div>
      <div className="card-bar-track">
        <div className="card-bar-fill" style={{ width: visible ? `${Math.min(Math.max(barPct, 2), 100)}%` : '0%' }} />
      </div>
    </div>
  );
}

export function SummaryCards() {
  const { state, insights } = useAppContext();
  const { transactions } = state;

  const balance = insights?.summary?.totalBalance ?? getTotalBalance(transactions);
  const income = insights?.summary?.totalIncome ?? getTotalIncome(transactions);
  const expenses = insights?.summary?.totalExpenses ?? getTotalExpenses(transactions);
  const savingsRate = insights?.summary?.savingsRate ?? getSavingsRate(transactions);
  const txCount = insights?.summary?.transactionCount ?? transactions.length;

  return (
    <div className="summary-grid">
      <Card label="Total Balance" amount={balance} sub={`${savingsRate.toFixed(1)}% savings rate`}
        icon={<Wallet size={16} strokeWidth={1.6} />} barPct={Math.max(savingsRate, 0)} delay={0} accent />
      <Card label="Total Income" amount={income} sub={`${insights?.summary?.incomeCount ?? transactions.filter(t => t.type === 'income').length} transactions`}
        icon={<TrendingUp size={16} strokeWidth={1.6} />} barPct={100} delay={80} />
      <Card label="Total Expenses" amount={expenses} sub={`${insights?.summary?.expenseCount ?? transactions.filter(t => t.type === 'expense').length} transactions`}
        icon={<TrendingDown size={16} strokeWidth={1.6} />} barPct={income > 0 ? (expenses / income) * 100 : 0} delay={160} />
      <Card label="Net Transactions" amount={txCount} sub="Total records in database"
        icon={<BarChart2 size={16} strokeWidth={1.6} />} barPct={75} delay={240} />
    </div>
  );
}
