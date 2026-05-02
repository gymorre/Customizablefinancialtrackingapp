import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  description: string;
  date: string;
  note?: string;
  accountId: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType | 'both';
  icon: string;
  color: string;
  isDefault?: boolean;
}

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'ewallet' | 'investment';
  balance: number;
  color: string;
  icon: string;
  isDefault?: boolean;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  month: string;
}

export interface AppSettings {
  userName: string;
  currency: string;
  currencySymbol: string;
  currencyLocale: string;
  theme: 'light' | 'dark';
  primaryColor: string;
  appName: string;
}

const defaultCategories: Category[] = [
  { id: 'cat-1', name: 'Gaji', type: 'income', icon: '💼', color: '#22c55e', isDefault: true },
  { id: 'cat-2', name: 'Freelance', type: 'income', icon: '💻', color: '#3b82f6', isDefault: true },
  { id: 'cat-3', name: 'Investasi', type: 'income', icon: '📈', color: '#8b5cf6', isDefault: true },
  { id: 'cat-4', name: 'Bonus', type: 'income', icon: '🎁', color: '#f59e0b', isDefault: true },
  { id: 'cat-5', name: 'Makanan & Minuman', type: 'expense', icon: '🍽️', color: '#ef4444', isDefault: true },
  { id: 'cat-6', name: 'Transportasi', type: 'expense', icon: '🚗', color: '#f97316', isDefault: true },
  { id: 'cat-7', name: 'Belanja', type: 'expense', icon: '🛍️', color: '#ec4899', isDefault: true },
  { id: 'cat-8', name: 'Kesehatan', type: 'expense', icon: '🏥', color: '#14b8a6', isDefault: true },
  { id: 'cat-9', name: 'Tagihan & Utilitas', type: 'expense', icon: '📄', color: '#6366f1', isDefault: true },
  { id: 'cat-10', name: 'Hiburan', type: 'expense', icon: '🎮', color: '#f43f5e', isDefault: true },
  { id: 'cat-11', name: 'Pendidikan', type: 'expense', icon: '📚', color: '#0ea5e9', isDefault: true },
  { id: 'cat-12', name: 'Tabungan', type: 'expense', icon: '🏦', color: '#84cc16', isDefault: true },
  { id: 'cat-13', name: 'Lainnya', type: 'both', icon: '📦', color: '#6b7280', isDefault: true },
];

const defaultAccounts: Account[] = [
  { id: 'acc-1', name: 'Dompet Tunai', type: 'cash', balance: 500000, color: '#22c55e', icon: '👛', isDefault: true },
  { id: 'acc-2', name: 'BCA', type: 'bank', balance: 12500000, color: '#0ea5e9', icon: '🏦', isDefault: true },
  { id: 'acc-3', name: 'GoPay', type: 'ewallet', balance: 350000, color: '#00AED6', icon: '💚', isDefault: true },
  { id: 'acc-4', name: 'OVO', type: 'ewallet', balance: 200000, color: '#4C3494', icon: '💜', isDefault: true },
];

const now = new Date();
const y = now.getFullYear();
const m = String(now.getMonth() + 1).padStart(2, '0');
const pm = String(now.getMonth()).padStart(2, '0') || '12';
const py = now.getMonth() === 0 ? y - 1 : y;

const sampleTransactions: Transaction[] = [
  { id: 't-1', type: 'income', amount: 8500000, categoryId: 'cat-1', description: 'Gaji Bulan Ini', date: `${y}-${m}-01`, accountId: 'acc-2' },
  { id: 't-2', type: 'income', amount: 2000000, categoryId: 'cat-2', description: 'Proyek Website Klien', date: `${y}-${m}-03`, accountId: 'acc-2' },
  { id: 't-3', type: 'expense', amount: 150000, categoryId: 'cat-5', description: 'Makan Siang Kantor', date: `${y}-${m}-02`, accountId: 'acc-1' },
  { id: 't-4', type: 'expense', amount: 450000, categoryId: 'cat-6', description: 'Bensin & Parkir', date: `${y}-${m}-03`, accountId: 'acc-1' },
  { id: 't-5', type: 'expense', amount: 1200000, categoryId: 'cat-7', description: 'Belanja Bulanan', date: `${y}-${m}-04`, accountId: 'acc-2' },
  { id: 't-6', type: 'expense', amount: 350000, categoryId: 'cat-9', description: 'Tagihan Listrik', date: `${y}-${m}-05`, accountId: 'acc-2' },
  { id: 't-7', type: 'expense', amount: 180000, categoryId: 'cat-10', description: 'Nonton Bioskop', date: `${y}-${m}-06`, accountId: 'acc-3' },
  { id: 't-8', type: 'expense', amount: 250000, categoryId: 'cat-5', description: 'Makan Malam', date: `${y}-${m}-07`, accountId: 'acc-1' },
  { id: 't-9', type: 'income', amount: 500000, categoryId: 'cat-3', description: 'Dividen Saham', date: `${y}-${m}-08`, accountId: 'acc-2' },
  { id: 't-10', type: 'expense', amount: 800000, categoryId: 'cat-8', description: 'Obat & Dokter', date: `${y}-${m}-09`, accountId: 'acc-2' },
  { id: 't-11', type: 'expense', amount: 299000, categoryId: 'cat-9', description: 'Tagihan Internet', date: `${y}-${m}-10`, accountId: 'acc-2' },
  { id: 't-12', type: 'expense', amount: 500000, categoryId: 'cat-12', description: 'Tabungan Dana Darurat', date: `${y}-${m}-11`, accountId: 'acc-2' },
  { id: 't-13', type: 'expense', amount: 125000, categoryId: 'cat-5', description: 'Kopi & Snack', date: `${y}-${m}-12`, accountId: 'acc-3' },
  { id: 't-14', type: 'expense', amount: 350000, categoryId: 'cat-11', description: 'Kursus Online', date: `${y}-${m}-13`, accountId: 'acc-2' },
  { id: 't-15', type: 'income', amount: 750000, categoryId: 'cat-4', description: 'Bonus Kinerja', date: `${y}-${m}-14`, accountId: 'acc-2' },
  // Last month
  { id: 't-16', type: 'income', amount: 8500000, categoryId: 'cat-1', description: 'Gaji Bulan Lalu', date: `${py}-${pm}-01`, accountId: 'acc-2' },
  { id: 't-17', type: 'expense', amount: 1500000, categoryId: 'cat-7', description: 'Belanja Bulanan', date: `${py}-${pm}-05`, accountId: 'acc-2' },
  { id: 't-18', type: 'expense', amount: 600000, categoryId: 'cat-6', description: 'Bensin', date: `${py}-${pm}-10`, accountId: 'acc-1' },
  { id: 't-19', type: 'expense', amount: 400000, categoryId: 'cat-9', description: 'Tagihan Listrik', date: `${py}-${pm}-12`, accountId: 'acc-2' },
  { id: 't-20', type: 'income', amount: 1500000, categoryId: 'cat-2', description: 'Freelance Design', date: `${py}-${pm}-15`, accountId: 'acc-2' },
  { id: 't-21', type: 'expense', amount: 700000, categoryId: 'cat-5', description: 'Groceries', date: `${py}-${pm}-18`, accountId: 'acc-2' },
  { id: 't-22', type: 'expense', amount: 200000, categoryId: 'cat-10', description: 'Spotify & Netflix', date: `${py}-${pm}-20`, accountId: 'acc-3' },
];

const defaultBudgets: Budget[] = [
  { id: 'b-1', categoryId: 'cat-5', amount: 1500000, month: `${y}-${m}` },
  { id: 'b-2', categoryId: 'cat-6', amount: 700000, month: `${y}-${m}` },
  { id: 'b-3', categoryId: 'cat-7', amount: 1500000, month: `${y}-${m}` },
  { id: 'b-4', categoryId: 'cat-9', amount: 700000, month: `${y}-${m}` },
  { id: 'b-5', categoryId: 'cat-10', amount: 500000, month: `${y}-${m}` },
  { id: 'b-6', categoryId: 'cat-8', amount: 500000, month: `${y}-${m}` },
];

const defaultSettings: AppSettings = {
  userName: 'Pengguna',
  currency: 'IDR',
  currencySymbol: 'Rp',
  currencyLocale: 'id-ID',
  theme: 'light',
  primaryColor: '#10b981',
  appName: 'FinanceKu',
};

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  budgets: Budget[];
  settings: AppSettings;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (c: Omit<Category, 'id'>) => void;
  updateCategory: (c: Category) => void;
  deleteCategory: (id: string) => void;
  addAccount: (a: Omit<Account, 'id'>) => void;
  updateAccount: (a: Account) => void;
  deleteAccount: (id: string) => void;
  setBudget: (b: Omit<Budget, 'id'>) => void;
  deleteBudget: (id: string) => void;
  updateSettings: (s: Partial<AppSettings>) => void;
  formatCurrency: (amount: number) => string;
  getCategoryById: (id: string) => Category | undefined;
  getAccountById: (id: string) => Account | undefined;
  getTotalBalance: () => number;
  getMonthlyIncome: (month: string) => number;
  getMonthlyExpense: (month: string) => number;
  exportToCSV: () => void;
  clearAllData: () => void;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

const STORAGE_KEYS = {
  transactions: 'finance_transactions',
  categories: 'finance_categories',
  accounts: 'finance_accounts',
  budgets: 'finance_budgets',
  settings: 'finance_settings',
};

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadFromStorage(STORAGE_KEYS.transactions, sampleTransactions)
  );
  const [categories, setCategories] = useState<Category[]>(() =>
    loadFromStorage(STORAGE_KEYS.categories, defaultCategories)
  );
  const [accounts, setAccounts] = useState<Account[]>(() =>
    loadFromStorage(STORAGE_KEYS.accounts, defaultAccounts)
  );
  const [budgets, setBudgets] = useState<Budget[]>(() =>
    loadFromStorage(STORAGE_KEYS.budgets, defaultBudgets)
  );
  const [settings, setSettings] = useState<AppSettings>(() =>
    loadFromStorage(STORAGE_KEYS.settings, defaultSettings)
  );

  useEffect(() => { saveToStorage(STORAGE_KEYS.transactions, transactions); }, [transactions]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.categories, categories); }, [categories]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.accounts, accounts); }, [accounts]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.budgets, budgets); }, [budgets]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.settings, settings); }, [settings]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat(settings.currencyLocale, {
      style: 'currency',
      currency: settings.currency,
      maximumFractionDigits: 0,
    }).format(amount);
  }, [settings.currency, settings.currencyLocale]);

  const getCategoryById = useCallback((id: string) => categories.find(c => c.id === id), [categories]);
  const getAccountById = useCallback((id: string) => accounts.find(a => a.id === id), [accounts]);

  const getTotalBalance = useCallback(() => accounts.reduce((sum, a) => sum + a.balance, 0), [accounts]);

  const getMonthlyIncome = useCallback((month: string) =>
    transactions.filter(t => t.type === 'income' && t.date.startsWith(month)).reduce((s, t) => s + t.amount, 0),
  [transactions]);

  const getMonthlyExpense = useCallback((month: string) =>
    transactions.filter(t => t.type === 'expense' && t.date.startsWith(month)).reduce((s, t) => s + t.amount, 0),
  [transactions]);

  const addTransaction = useCallback((t: Omit<Transaction, 'id'>) => {
    const newT = { ...t, id: `t-${Date.now()}` };
    setTransactions(prev => [newT, ...prev]);
    setAccounts(prev => prev.map(a => {
      if (a.id === t.accountId) {
        return { ...a, balance: t.type === 'income' ? a.balance + t.amount : a.balance - t.amount };
      }
      return a;
    }));
  }, []);

  const updateTransaction = useCallback((updated: Transaction) => {
    setTransactions(prev => {
      const old = prev.find(t => t.id === updated.id);
      if (old) {
        setAccounts(accs => accs.map(a => {
          let balance = a.balance;
          if (a.id === old.accountId) {
            balance = old.type === 'income' ? balance - old.amount : balance + old.amount;
          }
          if (a.id === updated.accountId) {
            balance = updated.type === 'income' ? balance + updated.amount : balance - updated.amount;
          }
          return a.id === old.accountId || a.id === updated.accountId ? { ...a, balance } : a;
        }));
      }
      return prev.map(t => t.id === updated.id ? updated : t);
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => {
      const t = prev.find(t => t.id === id);
      if (t) {
        setAccounts(accs => accs.map(a => {
          if (a.id === t.accountId) {
            return { ...a, balance: t.type === 'income' ? a.balance - t.amount : a.balance + t.amount };
          }
          return a;
        }));
      }
      return prev.filter(t => t.id !== id);
    });
  }, []);

  const addCategory = useCallback((c: Omit<Category, 'id'>) => {
    setCategories(prev => [...prev, { ...c, id: `cat-${Date.now()}` }]);
  }, []);

  const updateCategory = useCallback((c: Category) => {
    setCategories(prev => prev.map(x => x.id === c.id ? c : x));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  const addAccount = useCallback((a: Omit<Account, 'id'>) => {
    setAccounts(prev => [...prev, { ...a, id: `acc-${Date.now()}` }]);
  }, []);

  const updateAccount = useCallback((a: Account) => {
    setAccounts(prev => prev.map(x => x.id === a.id ? a : x));
  }, []);

  const deleteAccount = useCallback((id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  }, []);

  const setBudget = useCallback((b: Omit<Budget, 'id'>) => {
    setBudgets(prev => {
      const existing = prev.find(x => x.categoryId === b.categoryId && x.month === b.month);
      if (existing) {
        return prev.map(x => x.id === existing.id ? { ...x, amount: b.amount } : x);
      }
      return [...prev, { ...b, id: `b-${Date.now()}` }];
    });
  }, []);

  const deleteBudget = useCallback((id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  }, []);

  const updateSettings = useCallback((s: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...s }));
  }, []);

  const exportToCSV = useCallback(() => {
    const header = ['Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Jumlah', 'Akun'];
    const rows = transactions.map(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      const acc = accounts.find(a => a.id === t.accountId);
      return [t.date, t.type === 'income' ? 'Pemasukan' : 'Pengeluaran', cat?.name || '', t.description, t.amount, acc?.name || ''];
    });
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${settings.appName}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transactions, categories, accounts, settings.appName]);

  const clearAllData = useCallback(() => {
    setTransactions([]);
    setBudgets([]);
    setAccounts(defaultAccounts);
    setCategories(defaultCategories);
  }, []);

  return (
    <FinanceContext.Provider value={{
      transactions, categories, accounts, budgets, settings,
      addTransaction, updateTransaction, deleteTransaction,
      addCategory, updateCategory, deleteCategory,
      addAccount, updateAccount, deleteAccount,
      setBudget, deleteBudget,
      updateSettings,
      formatCurrency, getCategoryById, getAccountById,
      getTotalBalance, getMonthlyIncome, getMonthlyExpense,
      exportToCSV, clearAllData,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}
