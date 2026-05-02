import React, { useState, useMemo } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, Edit2, X } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { id } from 'date-fns/locale';
import { useFinance } from '../context/FinanceContext';

export function Budget() {
  const { transactions, categories, budgets, setBudget, deleteBudget, formatCurrency, settings } = useFinance();
  const primaryColor = settings.primaryColor || '#10b981';

  const [currentDate, setCurrentDate] = useState(new Date());
  const currentMonth = format(currentDate, 'yyyy-MM');
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<null | { categoryId: string; amount: number; id?: string }>(null);

  const expenseCategories = categories.filter(c => c.type === 'expense' || c.type === 'both');

  const budgetData = useMemo(() => {
    return budgets
      .filter(b => b.month === currentMonth)
      .map(b => {
        const spent = transactions
          .filter(t => t.type === 'expense' && t.categoryId === b.categoryId && t.date.startsWith(currentMonth))
          .reduce((s, t) => s + t.amount, 0);
        const cat = categories.find(c => c.id === b.categoryId);
        const pct = b.amount > 0 ? Math.min((spent / b.amount) * 100, 100) : 0;
        const remaining = b.amount - spent;
        return { ...b, spent, cat, pct, remaining };
      })
      .sort((a, b) => b.pct - a.pct);
  }, [budgets, transactions, currentMonth, categories]);

  const totalBudgeted = budgetData.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgetData.reduce((s, b) => s + b.spent, 0);
  const totalPct = totalBudgeted > 0 ? Math.min((totalSpent / totalBudgeted) * 100, 100) : 0;

  // Categories without budget this month
  const categoriesWithBudget = new Set(budgetData.map(b => b.categoryId));
  const categoriesWithoutBudget = expenseCategories.filter(c => !categoriesWithBudget.has(c.id));

  const handleOpenAdd = (categoryId?: string) => {
    const existing = budgetData.find(b => b.categoryId === categoryId);
    setEditingBudget(categoryId ? { categoryId, amount: existing?.amount || 0, id: existing?.id } : { categoryId: categoriesWithoutBudget[0]?.id || '', amount: 0 });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingBudget && editingBudget.categoryId && editingBudget.amount > 0) {
      setBudget({ categoryId: editingBudget.categoryId, amount: editingBudget.amount, month: currentMonth });
      setShowModal(false);
      setEditingBudget(null);
    }
  };

  const getBarColor = (pct: number) => {
    if (pct >= 100) return '#ef4444';
    if (pct >= 80) return '#f59e0b';
    return primaryColor;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Anggaran</h2>
          <p className="text-sm text-gray-500 mt-0.5">Kelola anggaran bulanan Anda</p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2 shadow-sm">
          <button onClick={() => setCurrentDate(d => subMonths(d, 1))} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="font-semibold text-gray-800 min-w-[110px] text-center text-sm">
            {format(currentDate, 'MMMM yyyy', { locale: id })}
          </span>
          <button onClick={() => setCurrentDate(d => addMonths(d, 1))} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Overall Summary */}
      {budgetData.length > 0 && (
        <div
          className="rounded-2xl p-5 text-white shadow-lg"
          style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}99)` }}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-white/80 text-sm">Total Anggaran</p>
              <p className="text-2xl font-bold">{formatCurrency(totalBudgeted)}</p>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">Terpakai</p>
              <p className="font-bold">{formatCurrency(totalSpent)}</p>
            </div>
          </div>
          <div className="bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${totalPct}%`, backgroundColor: totalPct >= 100 ? '#ef4444' : 'white' }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-white/70 text-xs">{Math.round(totalPct)}% terpakai</span>
            <span className="text-white/70 text-xs">Sisa: {formatCurrency(Math.max(totalBudgeted - totalSpent, 0))}</span>
          </div>
        </div>
      )}

      {/* Budget List */}
      <div className="space-y-3">
        {budgetData.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center text-gray-400">
            <span className="text-5xl mb-3">🎯</span>
            <p className="font-medium text-gray-600">Belum ada anggaran bulan ini</p>
            <p className="text-sm mt-1">Tambah anggaran untuk melacak pengeluaran</p>
            <button
              onClick={() => handleOpenAdd()}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus className="w-4 h-4" />
              Tambah Anggaran
            </button>
          </div>
        ) : (
          <>
            {budgetData.map(b => (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: (b.cat?.color || '#6b7280') + '20' }}
                  >
                    <span className="text-xl">{b.cat?.icon || '📦'}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-800">{b.cat?.name || 'Kategori'}</p>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleOpenAdd(b.categoryId)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteBudget(b.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-0.5">
                      <span>{formatCurrency(b.spent)} dari {formatCurrency(b.amount)}</span>
                      <span
                        className="font-semibold"
                        style={{ color: b.pct >= 100 ? '#ef4444' : b.pct >= 80 ? '#f59e0b' : '#6b7280' }}
                      >
                        {b.pct >= 100 ? '🔴 Melebihi batas!' : b.pct >= 80 ? '⚠️ Hampir habis' : `Sisa ${formatCurrency(b.remaining)}`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${b.pct}%`, backgroundColor: getBarColor(b.pct) }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs text-gray-400">{Math.round(b.pct)}% terpakai</span>
                  <span className="text-xs" style={{ color: getBarColor(b.pct) }}>
                    {Math.round(b.pct)}%
                  </span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Add Budget for remaining categories */}
      {categoriesWithoutBudget.length > 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-600 mb-3">Kategori tanpa anggaran:</p>
          <div className="flex flex-wrap gap-2">
            {categoriesWithoutBudget.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setEditingBudget({ categoryId: cat.id, amount: 0 });
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span>{cat.icon}</span>
                <span className="text-sm text-gray-600">{cat.name}</span>
                <Plus className="w-3 h-3 text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {budgetData.length > 0 && (
        <button
          onClick={() => handleOpenAdd()}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition-all"
          style={{ backgroundColor: primaryColor }}
        >
          <Plus className="w-4 h-4" />
          Tambah Anggaran Baru
        </button>
      )}

      {/* Modal */}
      {showModal && editingBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900">Atur Anggaran</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Kategori</label>
                <select
                  value={editingBudget.categoryId}
                  onChange={e => setEditingBudget(prev => prev ? { ...prev, categoryId: e.target.value } : null)}
                  className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 outline-none bg-white text-sm"
                >
                  {expenseCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Batas Anggaran ({settings.currencySymbol})</label>
                <input
                  type="number"
                  value={editingBudget.amount || ''}
                  onChange={e => setEditingBudget(prev => prev ? { ...prev, amount: Number(e.target.value) } : null)}
                  placeholder="Contoh: 1500000"
                  className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={!editingBudget.categoryId || !editingBudget.amount}
                  className="flex-1 py-3 rounded-xl text-white font-semibold transition-colors disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
