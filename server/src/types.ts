export type TransactionType = 'income' | 'expense';

export type Category =
  | 'Salary'
  | 'Freelance'
  | 'Investment'
  | 'Food & Dining'
  | 'Transport'
  | 'Shopping'
  | 'Entertainment'
  | 'Healthcare'
  | 'Utilities'
  | 'Rent'
  | 'Education'
  | 'Travel'
  | 'Other';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: Category;
  type: TransactionType;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Summary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  balance: number;
  count: number;
}

export interface InsightData {
  summary: Summary;
  categoryBreakdown: CategoryBreakdown[];
  monthlyTrend: MonthlyTrend[];
  topSpendingCategory: CategoryBreakdown | null;
  monthlyComparison: {
    current: MonthlyTrend;
    previous: MonthlyTrend;
    expenseChange: number;
    incomeChange: number;
  } | null;
}
