import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  TrendingUp, TrendingDown, Wallet, ArrowRight,
  PiggyBank, AlertTriangle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { id } from 'date-fns/locale';

export function Dashboard() {
  const { transactions, categories, accounts, budgets, formatCurrency, getCategoryById, settings } = useFinance();
  const primaryColor = settings.primaryColor || '#10b981';

  const now = new Date();
  const currentMonth = format(now, 'yyyy-MM');
  const previousMonth = format(subMonths(now, 1), 'yyyy-MM');

  const currentIncome = useMemo(() =>
    transactions.filter(t => t.type === 'income' && t.date.startsWith(currentMonth)).reduce((s, t) => s + t.amount, 0),
    [transactions, currentMonth]);

  const currentExpense = useMemo(() =>
    transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonth)).reduce((s, t) => s + t.amount, 0),
    [transactions, currentMonth]);

  const prevIncome = useMemo(() =>
    transactions.filter(t => t.type === 'income' && t.date.startsWith(previousMonth)).reduce((s, t) => s + t.amount, 0),
    [transactions, previousMonth]);

  const prevExpense = useMemo(() =>
    transactions.filter(t => t.type === 'expense' && t.date.startsWith(previousMonth)).reduce((s, t) => s + t.amount, 0),
    [transactions, previousMonth]);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const savingsRate = currentIncome > 0 ? Math.round(((currentIncome - currentExpense) / currentIncome) * 100) : 0;

  // Monthly trend (last 6 months)
  const monthlyData = useMemo(() => {
    const months = eachMonthOfInterval({ start: subMonths(now, 5), end: now });
    return months.map(m => {
      const key = format(m, 'yyyy-MM');
      const income = transactions.filter(t => t.type === 'income' && t.date.startsWith(key)).reduce((s, t) => s + t.amount, 0);
      const expense = transactions.filter(t => t.type === 'expense' && t.date.startsWith(key)).reduce((s, t) => s + t.amount, 0);
      return { month: format(m, 'MMM', { locale: id }), income, expense };
    });
  }, [transactions]);

  // Category breakdown this month
  const categoryData = useMemo(() => {
    const expenseThisMonth = transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonth));
    const grouped: Record<string, number> = {};
    expenseThisMonth.forEach(t => {
      grouped[t.categoryId] = (grouped[t.categoryId] || 0) + t.amount;
    });
    return Object.entries(grouped)
      .map(([catId, amount]) => {
        const cat = getCategoryById(catId);
        return { name: cat?.name || 'Lainnya', value: amount, color: cat?.color || '#6b7280', icon: cat?.icon || '📦' };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [transactions, currentMonth, getCategoryById]);

  // Recent transactions
  const recentTransactions = useMemo(() =>
    [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [transactions]);

  // Budget alerts
  const budgetAlerts = useMemo(() => {
    return budgets.filter(b => b.month === currentMonth).map(b => {
      const spent = transactions.filter(t => t.type === 'expense' && t.categoryId === b.categoryId && t.date.startsWith(currentMonth))
        .reduce((s, t) => s + t.amount, 0);
      const cat = getCategoryById(b.categoryId);
      const pct = Math.min((spent / b.amount) * 100, 100);
      return { ...b, spent, cat, pct };
    }).filter(b => b.pct >= 80).slice(0, 3);
  }, [budgets, transactions, currentMonth, getCategoryById]);

  const incomeChange = prevIncome > 0 ? ((currentIncome - prevIncome) / prevIncome * 100).toFixed(1) : '0';
  const expenseChange = prevExpense > 0 ? ((currentExpense - prevExpense) / prevExpense * 100).toFixed(1) : '0';

  const navigate = useNavigate();

  const formatShort = (val: number) => {
    if (val >= 1000000) return `${(val/1000000).toFixed(1)}jt`;
    if (val >= 1000) return `${(val/1000).toFixed(0)}rb`;
    return String(val);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <div
          className="col-span-2 lg:col-span-1 rounded-2xl p-5 text-white shadow-lg"
          style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}99)` }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/80 text-sm font-medium">Total Saldo</span>
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
          <p className="text-white/70 text-xs mt-1">{accounts.length} akun terhubung</p>
        </div>

        {/* Income */}
        <div className="rounded-2xl p-5 bg-white shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm font-medium">Pemasukan</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <p className="font-bold text-gray-800">{formatCurrency(currentIncome)}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className={`text-xs font-medium ${Number(incomeChange) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {Number(incomeChange) >= 0 ? '↑' : '↓'} {Math.abs(Number(incomeChange))}%
            </span>
            <span className="text-gray-400 text-xs">vs bulan lalu</span>
          </div>
        </div>

        {/* Expense */}
        <div className="rounded-2xl p-5 bg-white shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm font-medium">Pengeluaran</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <p className="font-bold text-gray-800">{formatCurrency(currentExpense)}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className={`text-xs font-medium ${Number(expenseChange) <= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {Number(expenseChange) >= 0 ? '↑' : '↓'} {Math.abs(Number(expenseChange))}%
            </span>
            <span className="text-gray-400 text-xs">vs bulan lalu</span>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="rounded-2xl p-5 bg-white shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm font-medium">Tabungan</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <PiggyBank className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="font-bold text-gray-800">{formatCurrency(Math.max(currentIncome - currentExpense, 0))}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className={`text-xs font-medium ${savingsRate >= 20 ? 'text-emerald-600' : savingsRate >= 10 ? 'text-yellow-600' : 'text-red-500'}`}>
              {savingsRate}% dari pemasukan
            </span>
          </div>
        </div>
      </div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="font-semibold text-amber-800 text-sm">Peringatan Anggaran</span>
          </div>
          <div className="space-y-2">
            {budgetAlerts.map(b => (
              <div key={b.id} className="flex items-center gap-3">
                <span>{b.cat?.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-amber-800 font-medium">{b.cat?.name}</span>
                    <span className="text-amber-700">{formatCurrency(b.spent)} / {formatCurrency(b.amount)}</span>
                  </div>
                  <div className="h-1.5 bg-amber-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${b.pct}%`, backgroundColor: b.pct >= 100 ? '#ef4444' : '#f59e0b' }}
                    />
                  </div>
                </div>
                <span className={`text-xs font-bold ${b.pct >= 100 ? 'text-red-600' : 'text-amber-700'}`}>{Math.round(b.pct)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-800">Tren 6 Bulan</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={formatShort} width={40} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} labelStyle={{ fontWeight: 'bold' }} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="income" stroke={primaryColor} fill="url(#incomeGrad)" strokeWidth={2} name="Pemasukan" />
              <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#expenseGrad)" strokeWidth={2} name="Pengeluaran" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Pengeluaran per Kategori</h3>
          {categoryData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <span className="text-4xl mb-2">📊</span>
              <p className="text-sm">Belum ada data bulan ini</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {categoryData.map((cat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs text-gray-600 flex-1 truncate">{cat.icon} {cat.name}</span>
                    <span className="text-xs font-semibold text-gray-800">{formatCurrency(cat.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Transaksi Terbaru</h3>
            <button
              onClick={() => navigate('/transactions')}
              className="flex items-center gap-1 text-sm font-medium hover:underline"
              style={{ color: primaryColor }}
            >
              Lihat semua <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {recentTransactions.map(t => {
              const cat = getCategoryById(t.categoryId);
              return (
                <div key={t.id} className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: (cat?.color || '#6b7280') + '20' }}
                  >
                    <span className="text-lg">{cat?.icon || '📦'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{t.description}</p>
                    <p className="text-xs text-gray-400">{cat?.name} • {format(new Date(t.date + 'T00:00:00'), 'd MMM yyyy', { locale: id })}</p>
                  </div>
                  <span className={`font-semibold text-sm flex-shrink-0 ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Accounts */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Akun & Dompet</h3>
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-1 text-sm font-medium hover:underline"
              style={{ color: primaryColor }}
            >
              Kelola <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {accounts.map(acc => (
              <div key={acc.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: acc.color + '20' }}
                >
                  {acc.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{acc.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{acc.type}</p>
                </div>
                <span className="font-semibold text-gray-800 text-sm">{formatCurrency(acc.balance)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
