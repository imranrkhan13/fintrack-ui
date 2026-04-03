import { Transaction } from '../types';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'dd MMM yyyy');
}

export function getTotalBalance(transactions: Transaction[]): number {
  return transactions.reduce((acc, t) => {
    return t.type === 'income' ? acc + t.amount : acc - t.amount;
  }, 0);
}

export function getTotalIncome(transactions: Transaction[]): number {
  return transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
}

export function getTotalExpenses(transactions: Transaction[]): number {
  return transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
}

export function getSpendingByCategory(transactions: Transaction[]) {
  const expenses = transactions.filter(t => t.type === 'expense');
  const map: Record<string, number> = {};
  expenses.forEach(t => {
    map[t.category] = (map[t.category] || 0) + t.amount;
  });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function getMonthlyTrend(transactions: Transaction[]) {
  const monthMap: Record<string, { income: number; expenses: number; balance: number }> = {};
  transactions.forEach(t => {
    const month = format(parseISO(t.date), 'MMM yyyy');
    if (!monthMap[month]) monthMap[month] = { income: 0, expenses: 0, balance: 0 };
    if (t.type === 'income') monthMap[month].income += t.amount;
    else monthMap[month].expenses += t.amount;
    monthMap[month].balance = monthMap[month].income - monthMap[month].expenses;
  });
  return Object.entries(monthMap)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => {
      const [mA, yA] = a.month.split(' ');
      const [mB, yB] = b.month.split(' ');
      return new Date(`${mA} 1 ${yA}`).getTime() - new Date(`${mB} 1 ${yB}`).getTime();
    });
}

export function getHighestSpendingCategory(transactions: Transaction[]) {
  const breakdown = getSpendingByCategory(transactions);
  return breakdown[0] || null;
}

export function getMonthlyComparison(transactions: Transaction[]) {
  const trend = getMonthlyTrend(transactions);
  if (trend.length < 2) return null;
  const current = trend[trend.length - 1];
  const previous = trend[trend.length - 2];
  const expenseChange = ((current.expenses - previous.expenses) / previous.expenses) * 100;
  const incomeChange = ((current.income - previous.income) / previous.income) * 100;
  return { current, previous, expenseChange, incomeChange };
}

export function getSavingsRate(transactions: Transaction[]): number {
  const income = getTotalIncome(transactions);
  const expenses = getTotalExpenses(transactions);
  if (income === 0) return 0;
  return ((income - expenses) / income) * 100;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
