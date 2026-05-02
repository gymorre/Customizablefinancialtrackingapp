import React, { useState, useEffect } from 'react';
import { X, Calendar, ChevronDown } from 'lucide-react';
import { useFinance, Transaction } from '../context/FinanceContext';

interface Props {
  onClose: () => void;
  mode: 'add' | 'edit';
  transaction?: Transaction;
}

export function TransactionModal({ onClose, mode, transaction }: Props) {
  const { categories, accounts, addTransaction, updateTransaction, settings } = useFinance();

  const [type, setType] = useState<'income' | 'expense'>(transaction?.type || 'expense');
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : '');
  const [categoryId, setCategoryId] = useState(transaction?.categoryId || '');
  const [description, setDescription] = useState(transaction?.description || '');
  const [date, setDate] = useState(transaction?.date || new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState(transaction?.accountId || accounts[0]?.id || '');
  const [note, setNote] = useState(transaction?.note || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredCategories = categories.filter(c => c.type === type || c.type === 'both');

  useEffect(() => {
    if (filteredCategories.length > 0 && !filteredCategories.find(c => c.id === categoryId)) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [type]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) e.amount = 'Masukkan jumlah yang valid';
    if (!categoryId) e.categoryId = 'Pilih kategori';
    if (!description.trim()) e.description = 'Masukkan deskripsi';
    if (!date) e.date = 'Pilih tanggal';
    if (!accountId) e.accountId = 'Pilih akun';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const data = {
      type,
      amount: Number(amount),
      categoryId,
      description: description.trim(),
      date,
      accountId,
      note: note.trim(),
    };
    if (mode === 'edit' && transaction) {
      updateTransaction({ ...data, id: transaction.id });
    } else {
      addTransaction(data);
    }
    onClose();
  };

  const primaryColor = settings.primaryColor || '#10b981';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between z-10">
          <div>
            <h2 className="font-bold text-gray-900">{mode === 'add' ? 'Tambah Transaksi' : 'Edit Transaksi'}</h2>
            <p className="text-xs text-gray-500 mt-0.5">Isi detail transaksi di bawah</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type Toggle */}
          <div className="flex rounded-xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                type === 'expense' ? 'bg-red-500 text-white shadow-md' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                type === 'income' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Pemasukan
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Jumlah</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                {settings.currencySymbol}
              </span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-colors outline-none ${
                  errors.amount ? 'border-red-400' : 'border-gray-200 focus:border-emerald-500'
                }`}
              />
            </div>
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Contoh: Makan siang, Tagihan listrik..."
              className={`w-full px-4 py-3 rounded-xl border-2 transition-colors outline-none ${
                errors.description ? 'border-red-400' : 'border-gray-200 focus:border-emerald-500'
              }`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {filteredCategories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                    categoryId === cat.id ? 'border-current bg-opacity-10' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={categoryId === cat.id ? { borderColor: cat.color, backgroundColor: cat.color + '20', color: cat.color } : {}}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-xs font-medium truncate w-full text-center text-gray-700">{cat.name}</span>
                </button>
              ))}
            </div>
            {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-colors outline-none ${
                  errors.date ? 'border-red-400' : 'border-gray-200 focus:border-emerald-500'
                }`}
              />
            </div>
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>

          {/* Account */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Akun / Dompet</label>
            <div className="relative">
              <select
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                className={`w-full appearance-none px-4 py-3 rounded-xl border-2 transition-colors outline-none bg-white ${
                  errors.accountId ? 'border-red-400' : 'border-gray-200 focus:border-emerald-500'
                }`}
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.accountId && <p className="text-red-500 text-xs mt-1">{errors.accountId}</p>}
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan (opsional)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Tambahkan catatan tambahan..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 transition-colors outline-none resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-4 rounded-xl text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all"
            style={{ backgroundColor: primaryColor }}
          >
            {mode === 'add' ? 'Simpan Transaksi' : 'Perbarui Transaksi'}
          </button>
        </form>
      </div>
    </div>
  );
}
