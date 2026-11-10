import React from 'react';
import {
  Car,
  Package,
  Layers,
  FileText,
  BarChart3,
  Settings,
  AlertTriangle,
  User,
  Cloud,
  CloudOff,
  CircleDollarSign,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export type TabType = 'pos' | 'inventory' | 'shifts' | 'orders' | 'reports' | 'settings';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenNewOrder: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenNewOrder }) => {
  const {
    settings,
    lowStockItems,
    currentShift,
    activeUser,
    users,
    switchUser,
    isAdmin,
    isCloudConnected,
  } = useApp();

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-xl border-b border-slate-800">
      {/* Top micro bar for status & user switcher */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/80 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {/* Cloud Status */}
          <div className="flex items-center gap-1.5 font-medium">
            {isCloudConnected ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Cloud className="w-3.5 h-3.5" />
                <span>سحابي متصل (Firebase)</span>
              </span>
            ) : (
              <button
                onClick={() => setActiveTab('settings')}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
                title="اضغط هنا لربط Firebase ومزامنة البيانات عبر الإنترنت"
              >
                <CloudOff className="w-3.5 h-3.5" />
                <span>وضع محلي (اضغط للربط السحابي ☁️)</span>
              </button>
            )}
          </div>

          {/* Shift status indicator */}
          <div className="hidden sm:flex items-center gap-1.5">
            {currentShift ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>{currentShift.shiftNumber} مفتوحة (الكاشير: {currentShift.cashierName})</span>
              </span>
            ) : (
              <button
                onClick={() => setActiveTab('shifts')}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
              >
                <span>⚠️ لا توجد وردية مفتوحة (اضغط لبدء وردية)</span>
              </button>
            )}
          </div>
        </div>

        {/* User Role Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
            <User className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-400">المستخدم:</span>
            <select
              value={activeUser.id}
              onChange={(e) => switchUser(e.target.value)}
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                  {u.name} ({u.role === 'admin' ? 'مدير' : 'كاشير'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('pos')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-black text-xl">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl tracking-tight text-white">
                  تريو كار ووش
                </span>
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  Trio POS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                مغسلة وغيار زيوت سيارات • إدارة المخزون السحابي
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('pos')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'pos'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>أمر تشغيل وكاشير</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all relative ${
                activeTab === 'inventory'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>المخزن والزيوت</span>
              {lowStockItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {lowStockItems.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('shifts')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'shifts'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CircleDollarSign className="w-4 h-4" />
              <span>الوردية والخزينة</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>الفواتير والعملاء</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('reports')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'reports'
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>الأرباح والتقارير</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'settings'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>الإعدادات</span>
            </button>
          </nav>

          {/* Quick Action Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNewOrder}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">أمر غسيل وزيت جديد</span>
              <span className="sm:hidden">أمر جديد</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-between py-2 border-t border-slate-800 overflow-x-auto gap-1 text-xs">
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg whitespace-nowrap ${
              activeTab === 'pos' ? 'text-sky-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>كاشير</span>
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg whitespace-nowrap relative ${
              activeTab === 'inventory' ? 'text-sky-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>المخزن</span>
            {lowStockItems.length > 0 && (
              <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('shifts')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg whitespace-nowrap ${
              activeTab === 'shifts' ? 'text-sky-400 font-bold' : 'text-slate-400'
            }`}
          >
            <CircleDollarSign className="w-4 h-4" />
            <span>الوردية</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg whitespace-nowrap ${
              activeTab === 'orders' ? 'text-sky-400 font-bold' : 'text-slate-400'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>الفواتير</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg whitespace-nowrap ${
                activeTab === 'reports' ? 'text-sky-400 font-bold' : 'text-slate-400'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>التقارير</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg whitespace-nowrap ${
              activeTab === 'settings' ? 'text-sky-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>الإعدادات</span>
          </button>
        </div>
      </div>
    </header>
  );
};
