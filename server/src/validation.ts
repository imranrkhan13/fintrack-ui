import { z } from 'zod';

export const CATEGORIES = [
  'Salary', 'Freelance', 'Investment',
  'Food & Dining', 'Transport', 'Shopping',
  'Entertainment', 'Healthcare', 'Utilities',
  'Rent', 'Education', 'Travel', 'Other',
] as const;

export const transactionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  description: z.string().min(1, 'Description required').max(200),
  amount: z.number().positive('Amount must be positive'),
  category: z.enum(CATEGORIES),
  type: z.enum(['income', 'expense']),
});

export const updateSchema = transactionSchema.partial();

export const querySchema = z.object({
  type: z.enum(['all', 'income', 'expense']).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['date', 'amount', 'description']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});
