import axios from 'axios';

const BASE = 'http://localhost:3001/api';

const api = axios.create({ baseURL: BASE, timeout: 8000 });

// Request interceptor — log
api.interceptors.request.use(config => {
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Response interceptor — unwrap
api.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.error || err.message || 'Network error';
    return Promise.reject(new Error(msg));
  }
);

export interface TransactionFilters {
  type?: 'all' | 'income' | 'expense';
  category?: string;
  search?: string;
  sortBy?: 'date' | 'amount' | 'description';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface TransactionPayload {
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
}

export const transactionsApi = {
  getAll: async (filters?: TransactionFilters) => {
    const res = await api.get('/transactions', { params: filters });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/transactions/${id}`);
    return res.data.data;
  },
  getSummary: async () => {
    const res = await api.get('/transactions/summary');
    return res.data.data;
  },
  getInsights: async () => {
    const res = await api.get('/transactions/insights');
    return res.data.data;
  },
  create: async (payload: TransactionPayload) => {
    const res = await api.post('/transactions', payload);
    return res.data.data;
  },
  update: async (id: string, payload: Partial<TransactionPayload>) => {
    const res = await api.patch(`/transactions/${id}`, payload);
    return res.data.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/transactions/${id}`);
    return res.data;
  },
};

export async function checkHealth(): Promise<boolean> {
  try {
    await api.get('/health');
    return true;
  } catch {
    return false;
  }
}
