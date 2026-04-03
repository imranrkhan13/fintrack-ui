import fs from 'fs';
import path from 'path';
import { Transaction } from './types';

const DB_FILE = path.join(__dirname, '../../data/db.json');

// Seed data
const SEED_TRANSACTIONS: Omit<Transaction, 'createdAt' | 'updatedAt'>[] = [
  { id: '1', date: '2024-01-03', description: 'Monthly Salary', amount: 85000, category: 'Salary', type: 'income' },
  { id: '2', date: '2024-01-05', description: 'Swiggy Order', amount: 780, category: 'Food & Dining', type: 'expense' },
  { id: '3', date: '2024-01-07', description: 'Metro Card Recharge', amount: 500, category: 'Transport', type: 'expense' },
  { id: '4', date: '2024-01-09', description: 'Freelance Project - UI Design', amount: 25000, category: 'Freelance', type: 'income' },
  { id: '5', date: '2024-01-11', description: 'Amazon Shopping', amount: 3200, category: 'Shopping', type: 'expense' },
  { id: '6', date: '2024-01-13', description: 'Netflix Subscription', amount: 649, category: 'Entertainment', type: 'expense' },
  { id: '7', date: '2024-01-15', description: 'Rent Payment', amount: 22000, category: 'Rent', type: 'expense' },
  { id: '8', date: '2024-01-17', description: 'Electricity Bill', amount: 1850, category: 'Utilities', type: 'expense' },
  { id: '9', date: '2024-01-19', description: 'Dividend Income', amount: 4500, category: 'Investment', type: 'income' },
  { id: '10', date: '2024-01-21', description: 'Pharmacy', amount: 950, category: 'Healthcare', type: 'expense' },
  { id: '11', date: '2024-01-23', description: 'Udemy Course', amount: 2400, category: 'Education', type: 'expense' },
  { id: '12', date: '2024-01-25', description: 'Restaurant Dinner', amount: 1400, category: 'Food & Dining', type: 'expense' },
  { id: '13', date: '2024-01-27', description: 'Ola Ride', amount: 320, category: 'Transport', type: 'expense' },
  { id: '14', date: '2024-01-29', description: 'Freelance - Backend Dev', amount: 18000, category: 'Freelance', type: 'income' },
  { id: '15', date: '2024-02-02', description: 'Monthly Salary', amount: 85000, category: 'Salary', type: 'income' },
  { id: '16', date: '2024-02-04', description: 'Zomato Order', amount: 620, category: 'Food & Dining', type: 'expense' },
  { id: '17', date: '2024-02-06', description: 'Flight Tickets', amount: 8500, category: 'Travel', type: 'expense' },
  { id: '18', date: '2024-02-08', description: 'Mutual Fund Return', amount: 12000, category: 'Investment', type: 'income' },
  { id: '19', date: '2024-02-10', description: 'Myntra Shopping', amount: 4800, category: 'Shopping', type: 'expense' },
  { id: '20', date: '2024-02-12', description: 'Spotify Premium', amount: 119, category: 'Entertainment', type: 'expense' },
  { id: '21', date: '2024-02-14', description: 'Rent Payment', amount: 22000, category: 'Rent', type: 'expense' },
  { id: '22', date: '2024-02-16', description: 'Internet Bill', amount: 999, category: 'Utilities', type: 'expense' },
  { id: '23', date: '2024-02-18', description: 'Clinic Visit', amount: 1200, category: 'Healthcare', type: 'expense' },
  { id: '24', date: '2024-02-20', description: 'Freelance - Mobile Design', amount: 30000, category: 'Freelance', type: 'income' },
  { id: '25', date: '2024-02-22', description: 'Grocery Shopping', amount: 2800, category: 'Food & Dining', type: 'expense' },
  { id: '26', date: '2024-02-24', description: 'Petrol', amount: 2500, category: 'Transport', type: 'expense' },
  { id: '27', date: '2024-02-26', description: 'Weekend Trip - Goa', amount: 15000, category: 'Travel', type: 'expense' },
  { id: '28', date: '2024-02-28', description: 'Book Purchase', amount: 750, category: 'Education', type: 'expense' },
  { id: '29', date: '2024-03-01', description: 'Monthly Salary', amount: 85000, category: 'Salary', type: 'income' },
  { id: '30', date: '2024-03-03', description: 'Swiggy Order', amount: 890, category: 'Food & Dining', type: 'expense' },
  { id: '31', date: '2024-03-05', description: 'New Laptop', amount: 75000, category: 'Shopping', type: 'expense' },
  { id: '32', date: '2024-03-07', description: 'Dividend Income', amount: 6000, category: 'Investment', type: 'income' },
  { id: '33', date: '2024-03-09', description: 'Gym Membership', amount: 2000, category: 'Healthcare', type: 'expense' },
  { id: '34', date: '2024-03-11', description: 'Concert Tickets', amount: 3500, category: 'Entertainment', type: 'expense' },
  { id: '35', date: '2024-03-13', description: 'Rent Payment', amount: 22000, category: 'Rent', type: 'expense' },
  { id: '36', date: '2024-03-15', description: 'Freelance - Content Writing', amount: 12000, category: 'Freelance', type: 'income' },
  { id: '37', date: '2024-03-17', description: 'Water Bill', amount: 350, category: 'Utilities', type: 'expense' },
  { id: '38', date: '2024-03-19', description: 'Ola Auto', amount: 180, category: 'Transport', type: 'expense' },
  { id: '39', date: '2024-03-21', description: 'Coursera Subscription', amount: 1800, category: 'Education', type: 'expense' },
  { id: '40', date: '2024-03-23', description: 'Hotel Booking', amount: 9500, category: 'Travel', type: 'expense' },
];

function ensureDataDir() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function seedData(): Transaction[] {
  const now = new Date().toISOString();
  return SEED_TRANSACTIONS.map(t => ({ ...t, createdAt: now, updatedAt: now }));
}

class Database {
  private transactions: Transaction[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      ensureDataDir();
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.transactions = parsed.transactions || [];
        console.log(`[DB] Loaded ${this.transactions.length} transactions from disk`);
      } else {
        this.transactions = seedData();
        this.persist();
        console.log(`[DB] Seeded ${this.transactions.length} transactions`);
      }
    } catch (err) {
      console.error('[DB] Load error, using seed data:', err);
      this.transactions = seedData();
    }
  }

  private persist() {
    try {
      ensureDataDir();
      fs.writeFileSync(DB_FILE, JSON.stringify({ transactions: this.transactions }, null, 2));
    } catch (err) {
      console.error('[DB] Persist error:', err);
    }
  }

  getAll(filters?: {
    type?: string;
    category?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    pageSize?: number;
    dateFrom?: string;
    dateTo?: string;
  }) {
    let result = [...this.transactions];

    if (filters?.type && filters.type !== 'all') {
      result = result.filter(t => t.type === filters.type);
    }
    if (filters?.category && filters.category !== 'all') {
      result = result.filter(t => t.category === filters.category);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(t =>
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    if (filters?.dateFrom) {
      result = result.filter(t => t.date >= filters.dateFrom!);
    }
    if (filters?.dateTo) {
      result = result.filter(t => t.date <= filters.dateTo!);
    }

    const sortBy = filters?.sortBy || 'date';
    const sortOrder = filters?.sortOrder === 'asc' ? 1 : -1;
    result.sort((a, b) => {
      if (sortBy === 'amount') return sortOrder * (a.amount - b.amount);
      if (sortBy === 'description') return sortOrder * a.description.localeCompare(b.description);
      return sortOrder * (new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    const total = result.length;
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;
    const start = (page - 1) * pageSize;
    const paginated = result.slice(start, start + pageSize);

    return {
      data: paginated,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  getById(id: string): Transaction | null {
    return this.transactions.find(t => t.id === id) || null;
  }

  create(data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction {
    const now = new Date().toISOString();
    const tx: Transaction = { ...data, id: this.newId(), createdAt: now, updatedAt: now };
    this.transactions.unshift(tx);
    this.persist();
    return tx;
  }

  update(id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>): Transaction | null {
    const idx = this.transactions.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.transactions[idx] = { ...this.transactions[idx], ...data, updatedAt: new Date().toISOString() };
    this.persist();
    return this.transactions[idx];
  }

  delete(id: string): boolean {
    const len = this.transactions.length;
    this.transactions = this.transactions.filter(t => t.id !== id);
    if (this.transactions.length !== len) { this.persist(); return true; }
    return false;
  }

  getSummary() {
    const all = this.transactions;
    const income = all.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = all.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return {
      totalBalance: income - expenses,
      totalIncome: income,
      totalExpenses: expenses,
      savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
      transactionCount: all.length,
      incomeCount: all.filter(t => t.type === 'income').length,
      expenseCount: all.filter(t => t.type === 'expense').length,
    };
  }

  getCategoryBreakdown() {
    const expenses = this.transactions.filter(t => t.type === 'expense');
    const total = expenses.reduce((s, t) => s + t.amount, 0);
    const map: Record<string, { total: number; count: number }> = {};
    expenses.forEach(t => {
      if (!map[t.category]) map[t.category] = { total: 0, count: 0 };
      map[t.category].total += t.amount;
      map[t.category].count++;
    });
    return Object.entries(map)
      .map(([category, { total: catTotal, count }]) => ({
        category, total: catTotal, count,
        percentage: total > 0 ? (catTotal / total) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }

  getMonthlyTrend() {
    const map: Record<string, { income: number; expenses: number; count: number }> = {};
    this.transactions.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map[key]) map[key] = { income: 0, expenses: 0, count: 0 };
      if (t.type === 'income') map[key].income += t.amount;
      else map[key].expenses += t.amount;
      map[key].count++;
    });
    return Object.entries(map)
      .map(([month, data]) => ({ month, ...data, balance: data.income - data.expenses }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private newId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
}

export const db = new Database();
