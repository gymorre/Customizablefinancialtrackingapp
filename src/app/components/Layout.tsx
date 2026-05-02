import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import {
  LayoutDashboard, ArrowLeftRight, PiggyBank, BarChart3,
  Settings, Menu, X, Plus, Wallet, Bell
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { TransactionModal } from './TransactionModal';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/transactions', icon: ArrowLeftRight, label: 'Transaksi' },
  { path: '/budget', icon: PiggyBank, label: 'Anggaran' },
  { path: '/reports', icon: BarChart3, label: 'Laporan' },
  { path: '/settings', icon: Settings, label: 'Pengaturan' },
];

export function Layout() {
  const { settings, getTotalBalance, formatCurrency } = useFinance();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  const primaryColor = settings.primaryColor || '#10b981';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative z-40 h-full w-64 flex flex-col transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shadow-xl lg:shadow-none`}
        style={{ background: `linear-gradient(160deg, ${primaryColor}ee, ${primaryColor}cc)` }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/20">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold">{settings.appName}</h1>
            <p className="text-white/60 text-xs">{settings.userName}</p>
          </div>
          <button
            className="ml-auto lg:hidden text-white/80 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance card in sidebar */}
        <div className="mx-4 mt-4 p-4 rounded-2xl bg-white/15 backdrop-blur-sm">
          <p className="text-white/70 text-xs mb-1">Total Saldo</p>
          <p className="text-white font-bold text-lg">{formatCurrency(getTotalBalance())}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-gray-800 shadow-md'
                    : 'text-white/80 hover:bg-white/20 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Add Transaction Button */}
        <div className="p-4">
          <button
            onClick={() => { setShowAddModal(true); setSidebarOpen(false); }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-gray-800 font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
          >
            <Plus className="w-5 h-5" style={{ color: primaryColor }} />
            Tambah Transaksi
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 px-4 lg:px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex-1 hidden lg:block">
            <p className="text-sm text-gray-500">Selamat datang kembali,</p>
            <p className="font-semibold text-gray-800">{settings.userName} 👋</p>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
              style={{ background: primaryColor }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden bg-white border-t border-gray-100 flex items-center justify-around py-2 flex-shrink-0">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                  isActive ? 'text-emerald-600' : 'text-gray-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-5 h-5" style={isActive ? { color: primaryColor } : {}} />
                  <span className="text-[10px] font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {showAddModal && (
        <TransactionModal
          onClose={() => setShowAddModal(false)}
          mode="add"
        />
      )}
    </div>
  );
}
