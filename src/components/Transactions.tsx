import React, { useState } from 'react';
import {
  Search, SlidersHorizontal, ArrowUpDown, Pencil, Trash2,
  Plus, X, Check, Loader2, ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency, formatDate, generateId } from '../utils';
import { Transaction, Category, TransactionType } from '../types';
import { CATEGORIES } from '../data/mockData';
import { transactionsApi } from '../services/api';

// ─── Modal ────────────────────────────────────────────────────────────────────
function TxModal({ tx, onClose, onSaved }: { tx?: Transaction; onClose: () => void; onSaved: () => void }) {
  const { dispatch, isOnline } = useAppContext();
  const [form, setForm] = useState({
    date: tx?.date ?? new Date().toISOString().split('T')[0],
    description: tx?.description ?? '',
    amount: tx?.amount ?? ('' as any),
    category: tx?.category ?? ('Food & Dining' as Category),
    type: tx?.type ?? ('expense' as TransactionType),
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.description.trim()) { setErr('Description is required'); return; }
    if (!form.amount || +form.amount <= 0) { setErr('Amount must be positive'); return; }
    setErr(''); setSaving(true);
    try {
      const payload = { ...form, amount: +form.amount };
      if (isOnline) {
        if (tx) {
          const updated = await transactionsApi.update(tx.id, payload);
          dispatch({ type: 'UPDATE_TRANSACTION', payload: updated });
        } else {
          const created = await transactionsApi.create(payload);
          dispatch({ type: 'ADD_TRANSACTION', payload: created });
        }
      } else {
        const now = new Date().toISOString();
        if (tx) dispatch({ type: 'UPDATE_TRANSACTION', payload: { ...payload, id: tx.id, createdAt: tx.createdAt ?? now, updatedAt: now } });
        else dispatch({ type: 'ADD_TRANSACTION', payload: { ...payload, id: generateId(), createdAt: now, updatedAt: now } });
      }
      onSaved(); onClose();
    } catch (e: any) { setErr(e.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{tx ? 'Edit Transaction' : 'Add Transaction'}</h3>
          <button className="icon-btn" onClick={onClose}><X size={17} strokeWidth={1.8} /></button>
        </div>
        <div className="modal-body">
          {err && <div className="field-err">{err}</div>}
          <label className="field-label">Description</label>
          <input className="field" value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. Swiggy Order" autoFocus />
          <div className="field-row-2">
            <div>
              <label className="field-label">Amount (INR)</label>
              <input className="field" type="number" min={1} value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="field-label">Date</label>
              <input className="field" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
          </div>
          <label className="field-label">Type</label>
          <div className="type-seg">
            {(['income', 'expense'] as TransactionType[]).map(t => (
              <button key={t} className={`type-seg-btn ${form.type === t ? 'active' : ''}`} onClick={() => set('type', t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <label className="field-label">Category</label>
          <select className="field" value={form.category} onChange={e => set('category', e.target.value as Category)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="modal-foot">
          <button className="btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={saving}>
            {saving ? <Loader2 size={14} className="spin" /> : <Check size={14} strokeWidth={2} />}
            {tx ? 'Update' : 'Add Transaction'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Category tag ─────────────────────────────────────────────────────────────
function CatTag({ cat }: { cat: string }) {
  return <span className="cat-tag">{cat}</span>;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function Transactions() {
  const { state, dispatch, isOnline, isLoading, error, refetch } = useAppContext();
  const { transactions, role, filterType, filterCategory, searchQuery, sortBy, sortOrder, total, page } = state as any;
  const [showFilters, setShowFilters] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | undefined>();
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isAdmin = role === 'admin';
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil((total ?? transactions.length) / pageSize));

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this transaction?')) return;
    setDeletingId(id);
    try {
      if (isOnline) await transactionsApi.delete(id);
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
      refetch();
    } catch (e: any) { alert(e.message || 'Delete failed'); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="tx-section">
      {/* Toolbar */}
      <div className="tx-toolbar">
        <div className="tx-toolbar-left">
          <p className="tx-count">
            {isLoading ? 'Loading...' : `${total ?? transactions.length} records`}
          </p>
        </div>
        <div className="tx-toolbar-right">
          <button className="icon-btn" onClick={refetch} disabled={isLoading} title="Refresh">
            <RefreshCw size={15} className={isLoading ? 'spin' : ''} strokeWidth={1.8} />
          </button>
          {isAdmin && (
            <button className="btn-primary" onClick={() => { setEditTx(undefined); setShowModal(true); }}>
              <Plus size={14} strokeWidth={2} />
              <span>Add</span>
            </button>
          )}
          <button className={`icon-btn ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(f => !f)}>
            <SlidersHorizontal size={15} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {error && <div className="err-bar">{error} — showing cached data</div>}

      {/* Search */}
      <div className="search-wrap">
        <Search size={14} className="search-ico" strokeWidth={1.8} />
        <input
          className="search-input"
          placeholder="Search by description or category..."
          value={searchQuery}
          onChange={e => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
        />
        {searchQuery && (
          <button className="search-clear" onClick={() => dispatch({ type: 'SET_SEARCH', payload: '' })}>
            <X size={12} />
          </button>
        )}
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-group">
            <span className="filter-label">Type</span>
            <div className="pills">
              {(['all', 'income', 'expense'] as const).map(t => (
                <button key={t} className={`pill ${filterType === t ? 'active' : ''}`}
                  onClick={() => dispatch({ type: 'SET_FILTER_TYPE', payload: t })}>
                  {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <span className="filter-label">Category</span>
            <select className="field-sm" value={filterCategory}
              onChange={e => dispatch({ type: 'SET_FILTER_CATEGORY', payload: e.target.value as any })}>
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <span className="filter-label">Sort</span>
            <div className="pills">
              {(['date', 'amount'] as const).map(s => (
                <button key={s} className={`pill ${sortBy === s ? 'active' : ''}`}
                  onClick={() => dispatch({ type: 'SET_SORT_BY', payload: s })}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
              <button className="pill" onClick={() => dispatch({ type: 'SET_SORT_ORDER', payload: sortOrder === 'asc' ? 'desc' : 'asc' })}>
                <ArrowUpDown size={11} /> {sortOrder === 'asc' ? 'Asc' : 'Desc'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table — desktop */}
      <div className="tx-table-wrap">
        {isLoading ? (
          <div className="state-box"><Loader2 size={20} className="spin" /><span>Loading...</span></div>
        ) : transactions.length === 0 ? (
          <div className="state-box">
            <p>No transactions match your filters.</p>
            <button className="btn-ghost sm" onClick={() => {
              dispatch({ type: 'SET_FILTER_TYPE', payload: 'all' });
              dispatch({ type: 'SET_FILTER_CATEGORY', payload: 'all' });
              dispatch({ type: 'SET_SEARCH', payload: '' });
            }}>Clear filters</button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th className="col-right">Amount</th>
                  {isAdmin && <th className="col-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx: Transaction, i: number) => (
                  <tr key={tx.id} className="tx-row" style={{ animationDelay: `${Math.min(i * 18, 300)}ms` }}>
                    <td className="tx-date">{formatDate(tx.date)}</td>
                    <td className="tx-desc">{tx.description}</td>
                    <td><CatTag cat={tx.category} /></td>
                    <td><span className={`type-badge ${tx.type}`}>{tx.type}</span></td>
                    <td className={`tx-amt col-right ${tx.type}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    {isAdmin && (
                      <td className="col-right">
                        <div className="row-actions">
                          <button className="icon-btn-xs" onClick={() => { setEditTx(tx); setShowModal(true); }}>
                            <Pencil size={12} strokeWidth={1.8} />
                          </button>
                          <button className="icon-btn-xs danger" onClick={() => handleDelete(tx.id)} disabled={deletingId === tx.id}>
                            {deletingId === tx.id ? <Loader2 size={12} className="spin" /> : <Trash2 size={12} strokeWidth={1.8} />}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="tx-cards">
              {transactions.map((tx: Transaction, i: number) => (
                <div key={tx.id} className="tx-card" style={{ animationDelay: `${Math.min(i * 18, 300)}ms` }}>
                  <div className="tx-card-row">
                    <span className={`type-dot ${tx.type}`} />
                    <span className="tx-card-desc">{tx.description}</span>
                    <span className={`tx-card-amt ${tx.type}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                  <div className="tx-card-meta">
                    <CatTag cat={tx.category} />
                    <span className="tx-card-date">{formatDate(tx.date)}</span>
                    {isAdmin && (
                      <div className="row-actions" style={{ marginLeft: 'auto' }}>
                        <button className="icon-btn-xs" onClick={() => { setEditTx(tx); setShowModal(true); }}>
                          <Pencil size={12} strokeWidth={1.8} />
                        </button>
                        <button className="icon-btn-xs danger" onClick={() => handleDelete(tx.id)} disabled={deletingId === tx.id}>
                          {deletingId === tx.id ? <Loader2 size={12} className="spin" /> : <Trash2 size={12} strokeWidth={1.8} />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="icon-btn" disabled={(page ?? 1) <= 1}
            onClick={() => dispatch({ type: 'SET_PAGE', payload: (page ?? 1) - 1 })}>
            <ChevronLeft size={15} />
          </button>
          <span className="page-info">Page {page ?? 1} of {totalPages}</span>
          <button className="icon-btn" disabled={(page ?? 1) >= totalPages}
            onClick={() => dispatch({ type: 'SET_PAGE', payload: (page ?? 1) + 1 })}>
            <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* Modal */}
      {(showModal) && (
        <TxModal tx={editTx} onClose={() => { setShowModal(false); setEditTx(undefined); }} onSaved={refetch} />
      )}
    </div>
  );
}
