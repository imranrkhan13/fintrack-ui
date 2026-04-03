import { Router, Request, Response } from 'express';
import { db } from './db';
import { transactionSchema, updateSchema, querySchema } from './validation';

export const router = Router();

// GET /api/transactions
router.get('/', (req: Request, res: Response) => {
  try {
    const query = querySchema.safeParse(req.query);
    if (!query.success) {
      const msg = query.error.issues[0]?.message ?? 'Invalid query';
      return res.status(400).json({ success: false, error: msg });
    }
    const result = db.getAll(query.data);
    return res.json({ success: true, ...result });
  } catch {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/transactions/summary
router.get('/summary', (_req: Request, res: Response) => {
  try {
    return res.json({ success: true, data: db.getSummary() });
  } catch {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/transactions/insights
router.get('/insights', (_req: Request, res: Response) => {
  try {
    const summary = db.getSummary();
    const categoryBreakdown = db.getCategoryBreakdown();
    const monthlyTrend = db.getMonthlyTrend();
    const topSpendingCategory = categoryBreakdown[0] ?? null;

    let monthlyComparison = null;
    if (monthlyTrend.length >= 2) {
      const current = monthlyTrend[monthlyTrend.length - 1];
      const previous = monthlyTrend[monthlyTrend.length - 2];
      monthlyComparison = {
        current, previous,
        expenseChange: previous.expenses > 0 ? ((current.expenses - previous.expenses) / previous.expenses) * 100 : 0,
        incomeChange: previous.income > 0 ? ((current.income - previous.income) / previous.income) * 100 : 0,
      };
    }

    return res.json({ success: true, data: { summary, categoryBreakdown, monthlyTrend, topSpendingCategory, monthlyComparison } });
  } catch {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/transactions/:id
router.get('/:id', (req: Request<{ id: string }>, res: Response) => {
  const tx = db.getById(req.params.id);
  if (!tx) return res.status(404).json({ success: false, error: 'Transaction not found' });
  return res.json({ success: true, data: tx });
});

// POST /api/transactions
router.post('/', (req: Request, res: Response) => {
  const parsed = transactionSchema.safeParse(req.body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Validation error';
    return res.status(400).json({ success: false, error: msg });
  }
  const tx = db.create(parsed.data);
  return res.status(201).json({ success: true, data: tx, message: 'Transaction created' });
});

// PATCH /api/transactions/:id
router.patch('/:id', (req: Request<{ id: string }>, res: Response) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Validation error';
    return res.status(400).json({ success: false, error: msg });
  }
  const tx = db.update(req.params.id, parsed.data);
  if (!tx) return res.status(404).json({ success: false, error: 'Transaction not found' });
  return res.json({ success: true, data: tx, message: 'Transaction updated' });
});

// DELETE /api/transactions/:id
router.delete('/:id', (req: Request<{ id: string }>, res: Response) => {
  const deleted = db.delete(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, error: 'Transaction not found' });
  return res.json({ success: true, message: 'Transaction deleted' });
});
