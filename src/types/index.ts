export type TransactionType = 'income' | 'expense';

export type Category =
  | 'Salary' | 'Freelance' | 'Investment'
  | 'Food & Dining' | 'Transport' | 'Shopping'
  | 'Entertainment' | 'Healthcare' | 'Utilities'
  | 'Rent' | 'Education' | 'Travel' | 'Other';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: Category;
  type: TransactionType;
  createdAt?: string;
  updatedAt?: string;
}

export type Role = 'admin' | 'viewer';

export interface AppState {
  transactions: Transaction[];
  role: Role;
  filterType: 'all' | TransactionType;
  filterCategory: Category | 'all';
  searchQuery: string;
  sortBy: 'date' | 'amount';
  sortOrder: 'asc' | 'desc';
}
