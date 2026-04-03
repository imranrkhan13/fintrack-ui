import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { useAppContext } from '../context/AppContext';
import { getMonthlyTrend, getSpendingByCategory, formatCurrency } from '../utils';
import { format } from 'date-fns';

const PALETTE = ['#2563eb', '#16a34a', '#dc2626', '#d97706', '#7c3aed', '#0891b2', '#be185d', '#65a30d'];

function fmtMonth(key: string) {
  try { return format(new Date(key + '-01'), 'MMM yy'); } catch { return key; }
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tip">
      <p className="chart-tip-title">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="chart-tip-row" style={{ color: p.color }}>
          <span>{p.name}</span>
          <span>{formatCurrency(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

function PieTip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="chart-tip">
      <p className="chart-tip-title">{d.name}</p>
      <p className="chart-tip-row">
        <span>{formatCurrency(d.value)}</span>
        <span style={{ color: '#999' }}>{d.payload.pct?.toFixed(1)}%</span>
      </p>
    </div>
  );
}

export function TrendChart() {
  const { state, insights } = useAppContext();
  const raw = insights?.monthlyTrend ?? getMonthlyTrend(state.transactions);
  const data = raw.map((d: any) => ({ ...d, month: d.month?.includes('-') ? fmtMonth(d.month) : d.month }));

  return (
    <div className="chart-card chart-card-wide">
      <div className="chart-card-head">
        <div>
          <h3 className="chart-title">Monthly Trend</h3>
          <p className="chart-subtitle">Income vs expenses over time</p>
        </div>
        <div className="chart-legend">
          <span className="legend-item"><span className="legend-dot" style={{ background: '#2563eb' }} />Income</span>
          <span className="legend-item"><span className="legend-dot legend-dashed" style={{ backgroundImage: 'repeating-linear-gradient(90deg,#dc2626 0 4px,transparent 4px 7px)' }} />Expenses</span>
        </div>
      </div>
      {data.length === 0 ? (
        <div className="chart-empty">No data available</div>
      ) : (
        <div style={{ height: 220, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'Inter', fill: '#bbb' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontFamily: 'Inter', fill: '#bbb' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} width={48} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="income" name="Income" stroke="#2563eb" strokeWidth={2} fill="url(#gIncome)" dot={false} activeDot={{ r: 4, fill: '#2563eb' }} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#dc2626" strokeWidth={2} strokeDasharray="5 3" fill="url(#gExp)" dot={false} activeDot={{ r: 4, fill: '#dc2626' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export function CategoryChart() {
  const { state, insights } = useAppContext();
  const raw = insights?.categoryBreakdown
    ? insights.categoryBreakdown.map((c: any) => ({ name: c.category, value: c.total, pct: c.percentage }))
    : getSpendingByCategory(state.transactions).map((c, i, arr) => ({
      ...c, pct: arr.reduce((s, x) => s + x.value, 0) > 0 ? (c.value / arr.reduce((s, x) => s + x.value, 0)) * 100 : 0
    }));
  const data = raw.slice(0, 6);

  return (
    <div className="chart-card chart-card-narrow">
      <div className="chart-card-head">
        <div>
          <h3 className="chart-title">Spending Breakdown</h3>
          <p className="chart-subtitle">Top categories</p>
        </div>
      </div>
      {data.length === 0 ? (
        <div className="chart-empty">No expense data</div>
      ) : (
        <div className="pie-layout">
          <div style={{ width: 140, height: 180, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius="55%" outerRadius="82%" paddingAngle={3} dataKey="value" nameKey="name">
                  {data.map((_: any, i: number) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip content={<PieTip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="pie-legend-list">
            {data.map((item: any, i: number) => (
              <div key={i} className="pie-legend-row">
                <span className="pie-dot-sm" style={{ background: PALETTE[i % PALETTE.length] }} />
                <span className="pie-cat">{item.name}</span>
                <span className="pie-val">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function BalanceBarChart() {
  const { state, insights } = useAppContext();
  const raw = insights?.monthlyTrend ?? getMonthlyTrend(state.transactions);
  const data = raw.map((d: any) => ({ ...d, month: d.month?.includes('-') ? fmtMonth(d.month) : d.month }));
  if (data.length === 0) return null;

  return (
    <div className="chart-card chart-card-full" style={{ marginTop: 12 }}>
      <div className="chart-card-head">
        <div>
          <h3 className="chart-title">Net Balance by Month</h3>
          <p className="chart-subtitle">Income minus expenses each month</p>
        </div>
        <div className="chart-legend">
          <span className="legend-item"><span className="legend-dot" style={{ background: '#16a34a' }} />Positive</span>
          <span className="legend-item"><span className="legend-dot" style={{ background: '#dc2626' }} />Negative</span>
        </div>
      </div>
      <div style={{ height: 220, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'Inter', fill: '#bbb' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fontFamily: 'Inter', fill: '#bbb' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} width={48} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="balance" name="Net Balance" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {data.map((d: any, i: number) => (
                <Cell key={i} fill={d.balance >= 0 ? '#16a34a' : '#dc2626'} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}