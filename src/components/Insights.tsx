import React from 'react';
import { TrendingUp, TrendingDown, Award, PiggyBank, AlertCircle, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import {
  getHighestSpendingCategory, getMonthlyComparison, getSavingsRate,
  formatCurrency, getTotalIncome, getTotalExpenses
} from '../utils';

export function Insights() {
  const { state, insights, insightsLoading } = useAppContext();
  const { transactions } = state;

  const topCat = insights?.topSpendingCategory
    ? { name: insights.topSpendingCategory.category, value: insights.topSpendingCategory.total }
    : getHighestSpendingCategory(transactions);

  const comparison = insights?.monthlyComparison ?? getMonthlyComparison(transactions);
  const savingsRate = insights?.summary?.savingsRate ?? getSavingsRate(transactions);
  const income = insights?.summary?.totalIncome ?? getTotalIncome(transactions);
  const expenses = insights?.summary?.totalExpenses ?? getTotalExpenses(transactions);

  const kpis = [
    {
      icon: <Award size={18} strokeWidth={1.6} />,
      label: 'Top Spending Category',
      value: topCat?.name ?? 'N/A',
      sub: topCat ? `${formatCurrency(topCat.value)} total spent` : 'No expense data',
      highlighted: false,
    },
    {
      icon: <PiggyBank size={18} strokeWidth={1.6} />,
      label: 'Savings Rate',
      value: `${savingsRate.toFixed(1)}%`,
      sub: savingsRate > 20 ? 'Above the recommended 20%' : savingsRate > 0 ? 'Aim for at least 20%' : 'Expenses exceed income',
      highlighted: savingsRate > 20,
    },
    {
      icon: comparison?.expenseChange !== undefined && comparison.expenseChange < 0
        ? <TrendingDown size={18} strokeWidth={1.6} />
        : <TrendingUp size={18} strokeWidth={1.6} />,
      label: 'Expenses vs Last Month',
      value: comparison ? `${comparison.expenseChange > 0 ? '+' : ''}${comparison.expenseChange.toFixed(1)}%` : 'N/A',
      sub: comparison
        ? `${formatCurrency(comparison.current.expenses)} this month vs ${formatCurrency(comparison.previous.expenses)} last`
        : 'Need at least 2 months of data',
      highlighted: !!(comparison && comparison.expenseChange < 0),
    },
    {
      icon: <AlertCircle size={18} strokeWidth={1.6} />,
      label: 'Income / Expense Ratio',
      value: income > 0 && expenses > 0 ? `${(income / expenses).toFixed(2)}x` : 'N/A',
      sub: income > expenses ? `Earning ${(income / expenses).toFixed(2)}x of what you spend` : 'Expenses exceed income',
      highlighted: income > expenses,
    },
  ];

  if (insightsLoading) {
    return <div className="state-box" style={{ padding: '80px 0' }}><Loader2 size={20} className="spin" /><span>Loading insights...</span></div>;
  }

  return (
    <div className="insights-wrap">
      {/* KPI cards */}
      <div className="insights-grid">
        {kpis.map((k, i) => (
          <div key={i} className={`insight-card ${k.highlighted ? 'hl' : ''}`} style={{ animationDelay: `${i * 70}ms` }}>
            <div className="insight-icon">{k.icon}</div>
            <div className="insight-lbl">{k.label}</div>
            <div className="insight-val">{k.value}</div>
            <div className="insight-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Monthly comparison */}
      {comparison && (
        <div className="compare-section">
          <h3 className="section-head">Monthly Comparison</h3>
          <div className="compare-grid">
            {[
              { label: 'Income this month', val: comparison.current.income, prev: comparison.previous.income, change: comparison.incomeChange },
              { label: 'Expenses this month', val: comparison.current.expenses, prev: comparison.previous.expenses, change: comparison.expenseChange },
              { label: 'Net balance this month', val: comparison.current.balance, prev: comparison.previous.balance, change: comparison.current.balance - comparison.previous.balance },
            ].map((row, i) => (
              <div key={i} className="compare-card">
                <span className="compare-lbl">{row.label}</span>
                <span className="compare-val">{formatCurrency(row.val)}</span>
                <span className={`compare-change ${row.change >= 0 ? 'pos' : 'neg'}`}>
                  {row.change >= 0 ? '+' : ''}{typeof row.change === 'number' && Math.abs(row.change) < 500
                    ? formatCurrency(row.change)
                    : `${row.change.toFixed(1)}%`
                  } vs last month
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full breakdown table */}
      {insights?.categoryBreakdown?.length > 0 && (
        <div className="breakdown-section">
          <h3 className="section-head">Full Category Breakdown</h3>
          <div className="breakdown-table-wrap">
            {/* Desktop table */}
            <table className="breakdown-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th className="col-right">Transactions</th>
                  <th className="col-right">Total Spent</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {insights.categoryBreakdown.map((row: any, i: number) => (
                  <tr key={i}>
                    <td><span className="cat-tag">{row.category}</span></td>
                    <td className="col-right muted">{row.count}</td>
                    <td className="col-right">{formatCurrency(row.total)}</td>
                    <td>
                      <div className="share-cell">
                        <div className="share-track"><div className="share-fill" style={{ width: `${row.percentage}%` }} /></div>
                        <span className="share-pct">{row.percentage.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile breakdown cards */}
            <div className="breakdown-cards">
              {insights.categoryBreakdown.map((row: any, i: number) => (
                <div key={i} className="breakdown-card">
                  <div className="breakdown-card-top">
                    <span className="cat-tag">{row.category}</span>
                    <span className="breakdown-amt">{formatCurrency(row.total)}</span>
                  </div>
                  <div className="share-track" style={{ marginTop: 8 }}>
                    <div className="share-fill" style={{ width: `${row.percentage}%` }} />
                  </div>
                  <div className="breakdown-card-bot">
                    <span className="muted">{row.count} transactions</span>
                    <span className="muted">{row.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
