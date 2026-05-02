import React, { useState, useMemo } from 'react';
import {
  Search, Filter, Trash2, Edit2, ChevronDown,
  TrendingUp, TrendingDown, X, Download, Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useFinance, Transaction } from '../context/FinanceContext';
import { TransactionModal } from '../components/TransactionModal';

type FilterType = 'all' | 'income' | 'expense';

export function Transactions() {
  const { transactions, categories, accounts, formatCurrency, getCategoryById, getAccountById, deleteTransaction, exportToCSV, settings } = useFinance();
  const primaryColor = settings.primaryColor || '#10b981';

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');
  const [filterMonth, setFilterMonth] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  const filtered = useMemo(() => {
    let list = [...transactions];
    if (search) list = list.filter(t => t.description.toLowerCase().includes(search.toLowerCase()));
    if (filterType !== 'all') list = list.filter(t => t.type === filterType);
    if (filterCategory !== 'all') list = list.filter(t => t.categoryId === filterCategory);
    if (filterAccount !== 'all') list = list.filter(t => t.accountId === filterAccount);
    if (filterMonth) list = list.filter(t => t.date.startsWith(filterMonth));
    list.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date);
      } else {
        return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      }
    });
    return list;
  }, [transactions, search, filterType, filterCategory, filterAccount, filterMonth, sortBy, sortOrder]);

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const paginated = filtered.slice(0, page * PER_PAGE);
  const hasMore = filtered.length > page * PER_PAGE;

  const clearFilters = () => {
    setSearch(''); setFilterType('all'); setFilterCategory('all');
    setFilterAccount('all'); setFilterMonth(''); setPage(1);
  };

  const hasActiveFilters = search || filterType !== 'all' || filterCategory !== 'all' || filterAccount !== 'all' || filterMonth;

  // Group by date
  const grouped = useMemo(() => {
    const groups: { date: string; items: Transaction[] }[] = [];
    paginated.forEach(t => {
      const last = groups[groups.length - 1];
      if (last && last.date === t.date) {
        last.items.push(t);
      } else {
        groups.push({ date: t.date, items: [t] });
      }
    });
    return groups;
  }, [paginated]);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Transaksi</h2>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} transaksi ditemukan</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            style={{ backgroundColor: primaryColor }}
          >
            <Plus className="w-4 h-4" />
            Tambah
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Total Pemasukan</p>
          <p className="font-bold text-emerald-600 text-sm">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Total Pengeluaran</p>
          <p className="font-bold text-red-500 text-sm">{formatCurrency(totalExpense)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Selisih</p>
          <p className={`font-bold text-sm ${totalIncome - totalExpense >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {formatCurrency(Math.abs(totalIncome - totalExpense))}
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Cari transaksi..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              showFilters || hasActiveFilters ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filter
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
          </button>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {showFilters && (
          <div className="border-t border-gray-100 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Type */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tipe</label>
              <select
                value={filterType}
                onChange={e => { setFilterType(e.target.value as FilterType); setPage(1); }}
                className="w-full py-2 px-3 rounded-lg border border-gray-200 text-sm outline-none bg-white"
              >
                <option value="all">Semua</option>
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>
            </div>
            {/* Category */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Kategori</label>
              <select
                value={filterCategory}
                onChange={e => { setFilterCategory(e.target.value); setPage(1); }}
                className="w-full py-2 px-3 rounded-lg border border-gray-200 text-sm outline-none bg-white"
              >
                <option value="all">Semua</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            {/* Account */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Akun</label>
              <select
                value={filterAccount}
                onChange={e => { setFilterAccount(e.target.value); setPage(1); }}
                className="w-full py-2 px-3 rounded-lg border border-gray-200 text-sm outline-none bg-white"
              >
                <option value="all">Semua</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
                ))}
              </select>
            </div>
            {/* Month */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Bulan</label>
              <input
                type="month"
                value={filterMonth}
                onChange={e => { setFilterMonth(e.target.value); setPage(1); }}
                className="w-full py-2 px-3 rounded-lg border border-gray-200 text-sm outline-none bg-white"
              />
            </div>
            {/* Sort */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Urutkan</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'date' | 'amount')}
                className="w-full py-2 px-3 rounded-lg border border-gray-200 text-sm outline-none bg-white"
              >
                <option value="date">Tanggal</option>
                <option value="amount">Jumlah</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Urutan</label>
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value as 'desc' | 'asc')}
                className="w-full py-2 px-3 rounded-lg border border-gray-200 text-sm outline-none bg-white"
              >
                <option value="desc">Terbaru / Terbesar</option>
                <option value="asc">Terlama / Terkecil</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Transaction List */}
      {grouped.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center text-gray-400">
          <span className="text-5xl mb-3">🔍</span>
          <p className="font-medium">Tidak ada transaksi ditemukan</p>
          <p className="text-sm mt-1">Coba ubah filter atau tambah transaksi baru</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(group => (
            <div key={group.date} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600">
                  {format(new Date(group.date + 'T00:00:00'), 'EEEE, d MMMM yyyy', { locale: id })}
                </span>
                <span className="text-xs text-gray-500">
                  {group.items.length} transaksi
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {group.items.map(t => {
                  const cat = getCategoryById(t.categoryId);
                  const acc = getAccountById(t.accountId);
                  return (
                    <div key={t.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors group">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: (cat?.color || '#6b7280') + '20' }}
                      >
                        <span className="text-lg">{cat?.icon || '📦'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{t.description}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-gray-400">{cat?.name}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-400">{acc?.icon} {acc?.name}</span>
                          {t.note && <><span className="text-gray-300">•</span><span className="text-xs text-gray-400 truncate">{t.note}</span></>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                          <button
                            onClick={() => setEditingTransaction(t)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(t.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {hasMore && (
            <button
              onClick={() => setPage(p => p + 1)}
              className="w-full py-3 rounded-2xl bg-white border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Tampilkan lebih banyak ({filtered.length - page * PER_PAGE} lagi)
            </button>
          )}
        </div>
      )}

      {/* Delete Confirm */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeletingId(null)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-gray-900 mb-2">Hapus Transaksi?</h3>
            <p className="text-gray-500 text-sm mb-5">Transaksi yang dihapus tidak dapat dikembalikan. Saldo akun akan disesuaikan secara otomatis.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => { deleteTransaction(deletingId); setDeletingId(null); }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {editingTransaction && (
        <TransactionModal mode="edit" transaction={editingTransaction} onClose={() => setEditingTransaction(null)} />
      )}
      {showAddModal && (
        <TransactionModal mode="add" onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
