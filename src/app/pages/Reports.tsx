import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { format, eachMonthOfInterval, subMonths, startOfYear } from 'date-fns';
import { id } from 'date-fns/locale';
import { useFinance } from '../context/FinanceContext';
import { TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';

type ViewMode = '6months' | '12months' | 'ytd';
type ChartTab = 'trend' | 'category' | 'daily';

export function Reports() {
  const { transactions, categories, formatCurrency, getCategoryById, settings } = useFinance();
  const primaryColor = settings.primaryColor || '#10b981';
  const [viewMode, setViewMode] = useState<ViewMode>('6months');
  const [chartTab, setChartTab] = useState<ChartTab>('trend');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const now = new Date();

  const months = useMemo(() => {
    if (viewMode === '6months') return eachMonthOfInterval({ start: subMonths(now, 5), end: now });
    if (viewMode === '12months') return eachMonthOfInterval({ start: subMonths(now, 11), end: now });
    return eachMonthOfInterval({ start: startOfYear(now), end: now });
  }, [viewMode]);

  const monthlyData = useMemo(() => {
    return months.map(m => {
      const key = format(m, 'yyyy-MM');
      const income = transactions.filter(t => t.type === 'income' && t.date.startsWith(key)).reduce((s, t) => s + t.amount, 0);
      const expense = transactions.filter(t => t.type === 'expense' && t.date.startsWith(key)).reduce((s, t) => s + t.amount, 0);
      const savings = income - expense;
      return {
        month: format(m, viewMode === '6months' ? 'MMM' : "MMM 'yy", { locale: id }),
        fullMonth: key,
        income,
        expense,
        savings,
      };
    });
  }, [months, transactions, viewMode]);

  // Category data for selected month
  const categoryData = useMemo(() => {
    const expList = transactions.filter(t => t.type === 'expense' && t.date.startsWith(selectedMonth));
    const incList = transactions.filter(t => t.type === 'income' && t.date.startsWith(selectedMonth));
    const grouped: Record<string, { amount: number; count: number }> = {};
    expList.forEach(t => {
      if (!grouped[t.categoryId]) grouped[t.categoryId] = { amount: 0, count: 0 };
      grouped[t.categoryId].amount += t.amount;
      grouped[t.categoryId].count++;
    });
    return Object.entries(grouped).map(([catId, data]) => {
      const cat = getCategoryById(catId);
      return { name: cat?.name || 'Lainnya', value: data.amount, count: data.count, color: cat?.color || '#6b7280', icon: cat?.icon || '📦' };
    }).sort((a, b) => b.value - a.value);
  }, [transactions, selectedMonth, getCategoryById]);

  // Daily data for selected month
  const dailyData = useMemo(() => {
    const daysInMonth = new Date(Number(selectedMonth.split('-')[0]), Number(selectedMonth.split('-')[1]), 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = String(i + 1).padStart(2, '0');
      const date = `${selectedMonth}-${day}`;
      const income = transactions.filter(t => t.type === 'income' && t.date === date).reduce((s, t) => s + t.amount, 0);
      const expense = transactions.filter(t => t.type === 'expense' && t.date === date).reduce((s, t) => s + t.amount, 0);
      return { day: String(i + 1), income, expense };
    });
  }, [transactions, selectedMonth]);

  const totalIncome = monthlyData.reduce((s, m) => s + m.income, 0);
  const totalExpense = monthlyData.reduce((s, m) => s + m.expense, 0);
  const totalSavings = totalIncome - totalExpense;
  const avgMonthlyExpense = monthlyData.length > 0 ? totalExpense / monthlyData.length : 0;

  const formatShort = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}jt`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}rb`;
    return String(val);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 text-sm">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color }}>
              {p.name}: {formatCurrency(p.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Laporan Keuangan</h2>
          <p className="text-sm text-gray-500 mt-0.5">Analisis mendalam pengeluaran dan pemasukan</p>
        </div>
        <div className="flex bg-white rounded-xl border border-gray-200 p-1">
          {[{ v: '6months', l: '6 Bulan' }, { v: '12months', l: '12 Bulan' }, { v: 'ytd', l: 'Tahun Ini' }].map(opt => (
            <button
              key={opt.v}
              onClick={() => setViewMode(opt.v as ViewMode)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                viewMode === opt.v ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
              style={viewMode === opt.v ? { backgroundColor: primaryColor } : {}}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-gray-500">Total Pemasukan</span>
          </div>
          <p className="font-bold text-gray-800">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-500" />
            <span className="text-xs text-gray-500">Total Pengeluaran</span>
          </div>
          <p className="font-bold text-gray-800">{formatCurrency(totalExpense)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-500">Total Tabungan</span>
          </div>
          <p className={`font-bold ${totalSavings >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{formatCurrency(Math.abs(totalSavings))}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-gray-500">Rata-rata Bulanan</span>
          </div>
          <p className="font-bold text-gray-800">{formatCurrency(avgMonthlyExpense)}</p>
        </div>
      </div>

      {/* Chart Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {[
            { k: 'trend', l: 'Tren Bulanan' },
            { k: 'category', l: 'Kategori' },
            { k: 'daily', l: 'Harian' },
          ].map(tab => (
            <button
              key={tab.k}
              onClick={() => setChartTab(tab.k as ChartTab)}
              className={`flex-1 py-4 text-sm font-medium transition-all border-b-2 ${
                chartTab === tab.k ? 'border-current text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              style={chartTab === tab.k ? { color: primaryColor, borderColor: primaryColor } : {}}
            >
              {tab.l}
            </button>
          ))}
        </div>

        <div className="p-5">
          {chartTab === 'trend' && (
            <div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={formatShort} width={45} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="income" fill={primaryColor} name="Pemasukan" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#ef4444" name="Pengeluaran" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              {/* Savings line */}
              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Tabungan per Bulan</p>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={formatShort} width={45} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="savings" stroke="#8b5cf6" strokeWidth={2.5} name="Tabungan" dot={{ fill: '#8b5cf6', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {chartTab === 'category' && (
            <div>
              <div className="flex justify-end mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Bulan:</span>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                    className="py-1.5 px-3 rounded-lg border border-gray-200 text-sm outline-none"
                  />
                </div>
              </div>
              {categoryData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                  <span className="text-4xl mb-2">📊</span>
                  <p className="text-sm">Tidak ada data pengeluaran</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} dataKey="value" paddingAngle={3} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {categoryData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {categoryData.map((cat, i) => {
                      const total = categoryData.reduce((s, c) => s + c.value, 0);
                      const pct = total > 0 ? (cat.value / total * 100) : 0;
                      return (
                        <div key={i}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base">{cat.icon}</span>
                            <span className="text-sm font-medium text-gray-700 flex-1">{cat.name}</span>
                            <span className="text-sm font-bold text-gray-800">{formatCurrency(cat.value)}</span>
                            <span className="text-xs text-gray-400 w-10 text-right">{pct.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {chartTab === 'daily' && (
            <div>
              <div className="flex justify-end mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Bulan:</span>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                    className="py-1.5 px-3 rounded-lg border border-gray-200 text-sm outline-none"
                  />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={dailyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={formatShort} width={45} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="income" fill={primaryColor} name="Pemasukan" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="expense" fill="#ef4444" name="Pengeluaran" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Top Spending Categories */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-4">Kategori Pengeluaran Terbesar</h3>
        {categoryData.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">Tidak ada data untuk bulan ini</p>
        ) : (
          <div className="space-y-3">
            {categoryData.slice(0, 5).map((cat, i) => {
              const total = categoryData.reduce((s, c) => s + c.value, 0);
              const pct = total > 0 ? (cat.value / total * 100) : 0;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg w-8 text-center">{i + 1}</span>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: cat.color + '20' }}>
                    <span>{cat.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                      <span className="text-sm font-bold text-gray-800">{formatCurrency(cat.value)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 w-10 text-right">{pct.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
