import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react';
import { AppState, Transaction, Role, Category, TransactionType } from '../types';
import { mockTransactions } from '../data/mockData';
import { transactionsApi, checkHealth, TransactionFilters } from '../services/api';

type Action =
  | { type: 'SET_ROLE'; payload: Role }
  | { type: 'SET_FILTER_TYPE'; payload: 'all' | TransactionType }
  | { type: 'SET_FILTER_CATEGORY'; payload: Category | 'all' }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_SORT_BY'; payload: 'date' | 'amount' }
  | { type: 'SET_SORT_ORDER'; payload: 'asc' | 'desc' }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_TOTAL'; payload: number }
  | { type: 'SET_PAGE'; payload: number };

export interface ExtendedState extends AppState {
  total: number;
  page: number;
}

const initialState: ExtendedState = {
  transactions: [],
  role: 'admin',
  filterType: 'all',
  filterCategory: 'all',
  searchQuery: '',
  sortBy: 'date',
  sortOrder: 'desc',
  total: 0,
  page: 1,
};

function reducer(state: ExtendedState, action: Action): ExtendedState {
  switch (action.type) {
    case 'SET_ROLE': return { ...state, role: action.payload };
    case 'SET_FILTER_TYPE': return { ...state, filterType: action.payload, page: 1 };
    case 'SET_FILTER_CATEGORY': return { ...state, filterCategory: action.payload, page: 1 };
    case 'SET_SEARCH': return { ...state, searchQuery: action.payload, page: 1 };
    case 'SET_SORT_BY': return { ...state, sortBy: action.payload };
    case 'SET_SORT_ORDER': return { ...state, sortOrder: action.payload };
    case 'SET_TRANSACTIONS': return { ...state, transactions: action.payload };
    case 'SET_TOTAL': return { ...state, total: action.payload };
    case 'SET_PAGE': return { ...state, page: action.payload };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions], total: state.total + 1 };
    case 'UPDATE_TRANSACTION':
      return { ...state, transactions: state.transactions.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter(t => t.id !== action.payload), total: Math.max(0, state.total - 1) };
    default: return state;
  }
}

export interface ContextType {
  state: ExtendedState;
  dispatch: React.Dispatch<Action>;
  isOnline: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  insights: any;
  insightsLoading: boolean;
}

const AppContext = createContext<ContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const savedRole = (() => {
    try { return (localStorage.getItem('fintrack_role') as Role) || 'admin'; } catch { return 'admin' as Role; }
  })();

  const [state, dispatch] = useReducer(reducer, { ...initialState, role: savedRole });
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<any>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [txVersion, setTxVersion] = useState(0);

  useEffect(() => { localStorage.setItem('fintrack_role', state.role); }, [state.role]);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: TransactionFilters = {
        type: state.filterType === 'all' ? undefined : state.filterType,
        category: state.filterCategory === 'all' ? undefined : state.filterCategory,
        search: state.searchQuery || undefined,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        page: state.page,
        pageSize: 20,
      };
      const result = await transactionsApi.getAll(filters);
      dispatch({ type: 'SET_TRANSACTIONS', payload: result.data });
      dispatch({ type: 'SET_TOTAL', payload: result.total });
    } catch (err: any) {
      setError(err.message);
      dispatch({ type: 'SET_TRANSACTIONS', payload: mockTransactions });
      dispatch({ type: 'SET_TOTAL', payload: mockTransactions.length });
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.filterType, state.filterCategory, state.searchQuery, state.sortBy, state.sortOrder, state.page, txVersion]);

  const fetchInsights = useCallback(async () => {
    setInsightsLoading(true);
    try {
      const data = await transactionsApi.getInsights();
      setInsights(data);
    } catch {
      setInsights(null);
    } finally {
      setInsightsLoading(false);
    }
  }, [txVersion]);

  useEffect(() => {
    checkHealth().then(online => {
      setIsOnline(online);
      if (!online) {
        dispatch({ type: 'SET_TRANSACTIONS', payload: mockTransactions });
        dispatch({ type: 'SET_TOTAL', payload: mockTransactions.length });
        setIsLoading(false);
      }
    });
  }, []);

  useEffect(() => { if (isOnline) fetchTransactions(); }, [isOnline, fetchTransactions]);
  useEffect(() => { if (isOnline) fetchInsights(); }, [isOnline, fetchInsights]);

  const refetch = useCallback(() => setTxVersion(v => v + 1), []);

  return (
    <AppContext.Provider value={{ state, dispatch, isOnline, isLoading, error, refetch, insights, insightsLoading }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be inside AppProvider');
  return ctx;
}
