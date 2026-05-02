import React, { useState } from 'react';
import {
  User, Palette, Tag, CreditCard, Database,
  Plus, Edit2, Trash2, X, Check, Download, AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { useFinance, Category, Account } from '../context/FinanceContext';

const CURRENCIES = [
  { code: 'IDR', symbol: 'Rp', locale: 'id-ID', name: 'Rupiah Indonesia' },
  { code: 'USD', symbol: '$', locale: 'en-US', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', locale: 'de-DE', name: 'Euro' },
  { code: 'SGD', symbol: 'S$', locale: 'en-SG', name: 'Singapore Dollar' },
  { code: 'MYR', symbol: 'RM', locale: 'ms-MY', name: 'Ringgit Malaysia' },
  { code: 'JPY', symbol: '¥', locale: 'ja-JP', name: 'Japanese Yen' },
  { code: 'GBP', symbol: '£', locale: 'en-GB', name: 'British Pound' },
  { code: 'AUD', symbol: 'A$', locale: 'en-AU', name: 'Australian Dollar' },
];

const PRIMARY_COLORS = [
  { color: '#10b981', name: 'Emerald' },
  { color: '#3b82f6', name: 'Blue' },
  { color: '#8b5cf6', name: 'Purple' },
  { color: '#f59e0b', name: 'Amber' },
  { color: '#ef4444', name: 'Red' },
  { color: '#ec4899', name: 'Pink' },
  { color: '#06b6d4', name: 'Cyan' },
  { color: '#84cc16', name: 'Lime' },
  { color: '#f97316', name: 'Orange' },
  { color: '#6366f1', name: 'Indigo' },
];

const CATEGORY_ICONS = ['🍽️', '🚗', '🛍️', '🏥', '📄', '🎮', '📚', '🏦', '📦', '💼', '💻', '📈', '🎁', '🏠', '✈️', '🎓', '💪', '🐾', '🎨', '🔧', '💊', '🛒', '☕', '🎵', '🎯'];
const ACCOUNT_ICONS = ['👛', '🏦', '💳', '📱', '💰', '💚', '💜', '💙', '🟡', '⚡'];
const ACCOUNT_TYPES = ['cash', 'bank', 'ewallet', 'investment'] as const;

type Section = 'profile' | 'appearance' | 'categories' | 'accounts' | 'data';

interface CategoryModalProps {
  cat?: Category;
  onClose: () => void;
  onSave: (c: Omit<Category, 'id'>) => void;
}

function CategoryModal({ cat, onClose, onSave }: CategoryModalProps) {
  const [name, setName] = useState(cat?.name || '');
  const [type, setType] = useState<'income' | 'expense' | 'both'>(cat?.type || 'expense');
  const [icon, setIcon] = useState(cat?.icon || '📦');
  const [color, setColor] = useState(cat?.color || '#6b7280');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900">{cat ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nama</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nama kategori" className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tipe</label>
            <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
              {[{ v: 'expense', l: 'Pengeluaran' }, { v: 'income', l: 'Pemasukan' }, { v: 'both', l: 'Keduanya' }].map(opt => (
                <button key={opt.v} type="button" onClick={() => setType(opt.v as any)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${type === opt.v ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Icon</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_ICONS.map(ic => (
                <button key={ic} type="button" onClick={() => setIcon(ic)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${icon === ic ? 'ring-2 ring-emerald-500 bg-emerald-50' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Warna</label>
            <div className="flex gap-2 flex-wrap">
              {PRIMARY_COLORS.map(c => (
                <button key={c.color} type="button" onClick={() => setColor(c.color)}
                  className={`w-8 h-8 rounded-full transition-all ${color === c.color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                  style={{ backgroundColor: c.color }} />
              ))}
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-8 h-8 rounded-full border-0 cursor-pointer" />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">Batal</button>
            <button
              onClick={() => { if (name.trim()) { onSave({ name: name.trim(), type, icon, color }); onClose(); } }}
              disabled={!name.trim()}
              className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold disabled:opacity-50"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AccountModalProps {
  acc?: Account;
  onClose: () => void;
  onSave: (a: Omit<Account, 'id'>) => void;
}

function AccountModal({ acc, onClose, onSave }: AccountModalProps) {
  const [name, setName] = useState(acc?.name || '');
  const [type, setType] = useState<Account['type']>(acc?.type || 'bank');
  const [balance, setBalance] = useState(acc ? String(acc.balance) : '');
  const [color, setColor] = useState(acc?.color || '#3b82f6');
  const [icon, setIcon] = useState(acc?.icon || '🏦');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900">{acc ? 'Edit Akun' : 'Tambah Akun'}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"><X className="w-4 h-4 text-gray-600" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nama Akun</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: BCA, GoPay..." className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tipe Akun</label>
            <div className="grid grid-cols-2 gap-2">
              {ACCOUNT_TYPES.map(t => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`py-2 px-3 rounded-xl border-2 text-sm font-medium capitalize transition-all ${type === t ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Saldo Awal</label>
            <input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="0" className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {ACCOUNT_ICONS.map(ic => (
                <button key={ic} type="button" onClick={() => setIcon(ic)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${icon === ic ? 'ring-2 ring-emerald-500 bg-emerald-50' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Warna</label>
            <div className="flex gap-2 flex-wrap">
              {PRIMARY_COLORS.map(c => (
                <button key={c.color} type="button" onClick={() => setColor(c.color)}
                  className={`w-8 h-8 rounded-full transition-all ${color === c.color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                  style={{ backgroundColor: c.color }} />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">Batal</button>
            <button
              onClick={() => { if (name.trim()) { onSave({ name, type, balance: Number(balance) || 0, color, icon }); onClose(); } }}
              disabled={!name.trim()}
              className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold disabled:opacity-50"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Settings() {
  const { settings, updateSettings, categories, addCategory, updateCategory, deleteCategory, accounts, addAccount, updateAccount, deleteAccount, exportToCSV, clearAllData } = useFinance();
  const [activeSection, setActiveSection] = useState<Section>('profile');
  const [editingCategory, setEditingCategory] = useState<Category | null | 'new'>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null | 'new'>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  const primaryColor = settings.primaryColor || '#10b981';

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sections = [
    { id: 'profile', icon: User, label: 'Profil' },
    { id: 'appearance', icon: Palette, label: 'Tampilan' },
    { id: 'categories', icon: Tag, label: 'Kategori' },
    { id: 'accounts', icon: CreditCard, label: 'Akun' },
    { id: 'data', icon: Database, label: 'Data' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Pengaturan</h2>
        <p className="text-sm text-gray-500 mt-0.5">Kustomisasi aplikasi sesuai kebutuhan Anda</p>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Sidebar Navigation */}
        <div className="lg:w-48 flex lg:flex-col gap-2 flex-wrap">
          {sections.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id as Section)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeSection === id ? 'text-white shadow-md' : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'
              }`}
              style={activeSection === id ? { backgroundColor: primaryColor } : {}}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          {activeSection === 'profile' && (
            <>
              <h3 className="font-bold text-gray-800">Informasi Profil</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nama Anda</label>
                  <input
                    value={settings.userName}
                    onChange={e => updateSettings({ userName: e.target.value })}
                    placeholder="Masukkan nama Anda"
                    className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nama Aplikasi</label>
                  <input
                    value={settings.appName}
                    onChange={e => updateSettings({ appName: e.target.value })}
                    placeholder="Contoh: FinanceKu"
                    className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Mata Uang</label>
                  <div className="relative">
                    <select
                      value={settings.currency}
                      onChange={e => {
                        const cur = CURRENCIES.find(c => c.code === e.target.value);
                        if (cur) updateSettings({ currency: cur.code, currencySymbol: cur.symbol, currencyLocale: cur.locale });
                      }}
                      className="w-full appearance-none py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none bg-white"
                    >
                      {CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>{c.symbol} - {c.name} ({c.code})</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold"
                style={{ backgroundColor: primaryColor }}
              >
                {saved ? <><Check className="w-4 h-4" /> Tersimpan!</> : 'Simpan Perubahan'}
              </button>
            </>
          )}

          {activeSection === 'appearance' && (
            <>
              <h3 className="font-bold text-gray-800">Tampilan Aplikasi</h3>
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Warna Tema Utama</label>
                  <div className="flex flex-wrap gap-3">
                    {PRIMARY_COLORS.map(c => (
                      <button
                        key={c.color}
                        onClick={() => updateSettings({ primaryColor: c.color })}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <div
                          className={`w-10 h-10 rounded-xl shadow-sm transition-all ${settings.primaryColor === c.color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`}
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="text-xs text-gray-500">{c.name}</span>
                      </button>
                    ))}
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="relative">
                        <input
                          type="color"
                          value={settings.primaryColor}
                          onChange={e => updateSettings({ primaryColor: e.target.value })}
                          className="w-10 h-10 rounded-xl border-0 cursor-pointer opacity-0 absolute inset-0"
                        />
                        <div className="w-10 h-10 rounded-xl shadow-sm flex items-center justify-center bg-gray-100 text-gray-500 text-xs">
                          +
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">Custom</span>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Preview</label>
                  <div className="rounded-xl overflow-hidden border border-gray-200 p-4" style={{ background: `linear-gradient(135deg, ${settings.primaryColor}22, ${settings.primaryColor}11)` }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: settings.primaryColor }}>
                        <span className="text-white text-sm">💰</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-800">{settings.appName}</p>
                        <p className="text-xs text-gray-500">{settings.userName}</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: settings.primaryColor }}>
                      Tambah Transaksi
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeSection === 'categories' && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800">Kelola Kategori</h3>
                <button
                  onClick={() => setEditingCategory('new')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Plus className="w-4 h-4" />
                  Tambah
                </button>
              </div>

              {/* Income Categories */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Pemasukan</p>
                <div className="space-y-2">
                  {categories.filter(c => c.type === 'income' || c.type === 'both').map(cat => (
                    <div key={cat.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: cat.color + '20' }}>
                        <span className="text-lg">{cat.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{cat.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{cat.type}</p>
                      </div>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <div className="flex gap-1">
                        <button onClick={() => setEditingCategory(cat)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {!cat.isDefault && (
                          <button onClick={() => deleteCategory(cat.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expense Categories */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Pengeluaran</p>
                <div className="space-y-2">
                  {categories.filter(c => c.type === 'expense').map(cat => (
                    <div key={cat.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: cat.color + '20' }}>
                        <span className="text-lg">{cat.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{cat.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{cat.type}</p>
                      </div>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <div className="flex gap-1">
                        <button onClick={() => setEditingCategory(cat)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {!cat.isDefault && (
                          <button onClick={() => deleteCategory(cat.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeSection === 'accounts' && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800">Kelola Akun & Dompet</h3>
                <button
                  onClick={() => setEditingAccount('new')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Plus className="w-4 h-4" />
                  Tambah
                </button>
              </div>
              <div className="space-y-3">
                {accounts.map(acc => (
                  <div key={acc.id} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: acc.color + '20' }}>
                      {acc.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{acc.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{acc.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800 text-sm">{new Intl.NumberFormat(settings.currencyLocale, { style: 'currency', currency: settings.currency, maximumFractionDigits: 0 }).format(acc.balance)}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setEditingAccount(acc)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {!acc.isDefault && (
                        <button onClick={() => deleteAccount(acc.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeSection === 'data' && (
            <>
              <h3 className="font-bold text-gray-800">Manajemen Data</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <Download className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-blue-800">Export Data CSV</p>
                      <p className="text-sm text-blue-600 mt-0.5">Unduh semua transaksi dalam format CSV yang bisa dibuka di Excel atau Google Sheets</p>
                      <button
                        onClick={exportToCSV}
                        className="mt-3 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Export CSV
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-red-800">Hapus Semua Data</p>
                      <p className="text-sm text-red-600 mt-0.5">Hapus semua transaksi dan anggaran. Kategori dan akun akan direset ke default. Tindakan ini tidak dapat dibatalkan!</p>
                      <button
                        onClick={() => setShowClearConfirm(true)}
                        className="mt-3 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                      >
                        Hapus Semua Data
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <p className="font-semibold text-gray-800 mb-1">Tentang Aplikasi</p>
                  <p className="text-sm text-gray-500">Data disimpan secara lokal di browser Anda. Menghapus cache browser akan menghapus data.</p>
                  <p className="text-sm text-gray-500 mt-1">Versi: 1.0.0 • {settings.appName}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Category Modal */}
      {editingCategory && (
        <CategoryModal
          cat={editingCategory === 'new' ? undefined : editingCategory}
          onClose={() => setEditingCategory(null)}
          onSave={(c) => {
            if (editingCategory === 'new') addCategory(c);
            else updateCategory({ ...(editingCategory as Category), ...c });
          }}
        />
      )}

      {/* Account Modal */}
      {editingAccount && (
        <AccountModal
          acc={editingAccount === 'new' ? undefined : editingAccount}
          onClose={() => setEditingAccount(null)}
          onSave={(a) => {
            if (editingAccount === 'new') addAccount(a);
            else updateAccount({ ...(editingAccount as Account), ...a });
          }}
        />
      )}

      {/* Clear Confirm Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowClearConfirm(false)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h3 className="font-bold text-gray-900 text-center mb-2">Hapus Semua Data?</h3>
            <p className="text-gray-500 text-sm text-center mb-5">Semua transaksi dan anggaran akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium">Batal</button>
              <button onClick={() => { clearAllData(); setShowClearConfirm(false); }} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
