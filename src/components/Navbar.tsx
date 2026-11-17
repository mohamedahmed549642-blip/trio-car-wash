import React, { useState } from 'react';
import {
  Car,
  Package,
  FileText,
  BarChart3,
  Settings,
  User,
  Cloud,
  CloudOff,
  CircleDollarSign,
  Clock,
  Sparkles,
  Lock,
  Unlock,
  Users,
  LogOut,
  Tag,
  Menu,
  X,
  MoreHorizontal,
  ChevronLeft,
  Shield,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export type TabType = 'pos' | 'inventory' | 'shifts' | 'orders' | 'reports' | 'workers' | 'services' | 'settings';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenNewOrder: () => void;
  onOpenMasarTech?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenNewOrder, onOpenMasarTech }) => {
  const {
    lowStockItems,
    currentShift,
    activeUser,
    isAdmin,
    isCloudConnected,
    isDeveloperUnlocked,
    logoutDeveloper,
    logoutUser,
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isDev = isDeveloperUnlocked || activeUser.role === 'developer' || activeUser.username === 'developer';

  const isMoreTabActive = ['reports', 'workers', 'services', 'settings'].includes(activeTab);

  const handleMobileNav = (tab: TabType) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-xl border-b border-slate-800 safe-top">
        {/* Top micro bar for status & user switcher (Desktop & Tablet) */}
        <div className="bg-slate-950 px-3 sm:px-4 py-1 sm:py-1.5 border-b border-slate-800/80 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cloud Status (Visible to Developer Only) */}
            {isDev && (
              <div className="flex items-center gap-1.5 font-medium">
                {isCloudConnected ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] sm:text-xs">
                    <Cloud className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="hidden sm:inline">سحابي متصل (Firebase)</span>
                    <span className="sm:hidden">سحابي ☁️</span>
                  </span>
                ) : (
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors cursor-pointer text-[10px] sm:text-xs"
                    title="اضغط هنا لربط Firebase ومزامنة البيانات عبر الإنترنت"
                  >
                    <CloudOff className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="hidden sm:inline">وضع محلي (اضغط للربط السحابي ☁️)</span>
                    <span className="sm:hidden">محلي (اضغط للربط)</span>
                  </button>
                )}
              </div>
            )}

            {/* Shift status indicator */}
            <div className="flex items-center gap-1.5">
              {currentShift ? (
                <button
                  onClick={() => setActiveTab('shifts')}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30 transition-colors text-[10px] sm:text-xs font-bold"
                  title="اضغط لعرض تفاصيل الوردية الحالية"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="hidden sm:inline">{currentShift.shiftNumber} مفتوحة ({currentShift.cashierName})</span>
                  <span className="sm:hidden">{currentShift.shiftNumber} نشطة 🟢</span>
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('shifts')}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 text-[10px] sm:text-xs font-bold animate-pulse"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  <span className="hidden sm:inline">⚠️ لا توجد وردية مفتوحة (اضغط لبدء وردية)</span>
                  <span className="sm:hidden">وردية مغلقة ⚠️</span>
                </button>
              )}
            </div>
          </div>

          {/* User Role & Quick Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {isDeveloperUnlocked && (
              <div className="hidden sm:flex items-center gap-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 px-2 py-0.5 rounded-lg text-xs font-bold">
                <Unlock className="w-3 h-3 text-purple-400" />
                <span>مطور</span>
                <button
                  onClick={() => logoutDeveloper()}
                  className="text-purple-200 hover:text-white underline text-[10px] mr-1"
                  title="قفل وضع المطور"
                >
                  (قفل)
                </button>
              </div>
            )}

            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2 sm:px-2.5 py-0.5 sm:py-1">
              <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400" />
              <span className="font-bold text-white text-[11px] sm:text-xs max-w-[80px] sm:max-w-none truncate">
                {activeUser.name}
              </span>
              <span className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded font-bold bg-slate-800 text-slate-300 border border-slate-700 hidden xs:inline">
                {activeUser.username === 'developer' || activeUser.role === 'developer' || isDeveloperUnlocked
                  ? 'مطور 💻'
                  : isAdmin
                    ? 'المالك 👑'
                    : 'كاشير 👷'}
              </span>
            </div>

            <button
              onClick={() => logoutUser()}
              className="inline-flex items-center gap-1 p-1 sm:px-2.5 sm:py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95"
              title="تسجيل الخروج والعودة لشاشة الدخول"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>

        {/* Main Header Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
            {/* Logo & Brand Identity */}
            <div
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none"
              onClick={() => setActiveTab('pos')}
              title="الرئيسية - كاشير تريو كار ووش"
            >
              {/* Logo Badge */}
              <div className="h-9 w-12 sm:h-12 sm:w-16 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all drop-shadow-[0_4px_12px_rgba(56,189,248,0.25)]">
                <img
                  src="/logo-white.png"
                  alt="Trio Car Wash Logo"
                  className="w-full h-full object-contain filter drop-shadow-sm"
                />
              </div>

              {/* Modern Brand Text */}
              <div className="flex flex-col text-right">
                <span className="font-black text-sm sm:text-lg tracking-tight bg-gradient-to-r from-sky-400 via-cyan-200 to-white bg-clip-text text-transparent group-hover:from-sky-300 group-hover:to-cyan-100 transition-all">
                  تريو كار ووش
                </span>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden sm:block">
                  غسيل وتلميع سيارات • تغيير زيوت وفلاتر
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links (Hidden on mobile) */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('pos')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'pos'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
              >
                <Car className="w-4 h-4" />
                <span>أمر تشغيل وكاشير</span>
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all relative ${activeTab === 'inventory'
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
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'shifts'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
              >
                <CircleDollarSign className="w-4 h-4" />
                <span>الوردية والخزينة</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'orders'
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'reports'
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>الأرباح والتقارير</span>
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => setActiveTab('workers')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'workers'
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                >
                  <Users className="w-4 h-4" />
                  <span>العمال والفريق</span>
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => setActiveTab('services')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'services'
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                >
                  <Tag className="w-4 h-4 text-amber-400" />
                  <span>الخدمات والأسعار 🏷️</span>
                </button>
              )}

              {isDev && (
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'settings'
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                >
                  <Unlock className="w-4 h-4 text-emerald-400" />
                  <span>الإعدادات 🔓</span>
                </button>
              )}
            </nav>

            {/* Quick Action Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenNewOrder}
                className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">أمر غسيل وزيت جديد</span>
                <span className="sm:hidden font-bold">+ أمر جديد</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modern Mobile Bottom Navigation Bar (Fixed for phones) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 safe-bottom shadow-[0_-8px_30px_rgba(0,0,0,0.45)]">
        <div className="grid grid-cols-5 items-center justify-around px-1 py-1.5 text-[11px] text-center font-bold">
          {/* Tab 1: POS */}
          <button
            onClick={() => handleMobileNav('pos')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'pos'
                ? 'text-sky-400 font-black scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'pos' ? 'bg-sky-500/20' : ''}`}>
              <Car className="w-5 h-5" />
            </div>
            <span className="mt-0.5 leading-tight">كاشير</span>
          </button>

          {/* Tab 2: Inventory */}
          <button
            onClick={() => handleMobileNav('inventory')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer relative ${
              activeTab === 'inventory'
                ? 'text-sky-400 font-black scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'inventory' ? 'bg-sky-500/20' : ''}`}>
              <Package className="w-5 h-5" />
            </div>
            <span className="mt-0.5 leading-tight">المخزن</span>
            {lowStockItems.length > 0 && (
              <span className="absolute top-1 right-2.5 bg-rose-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center animate-pulse shadow-sm">
                {lowStockItems.length}
              </span>
            )}
          </button>

          {/* Tab 3: Shifts */}
          <button
            onClick={() => handleMobileNav('shifts')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer relative ${
              activeTab === 'shifts'
                ? 'text-sky-400 font-black scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'shifts' ? 'bg-sky-500/20' : ''}`}>
              <CircleDollarSign className="w-5 h-5" />
            </div>
            <span className="mt-0.5 leading-tight">الوردية</span>
            <span
              className={`absolute top-1.5 right-3 w-2 h-2 rounded-full ${
                currentShift ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'
              }`}
            />
          </button>

          {/* Tab 4: Orders */}
          <button
            onClick={() => handleMobileNav('orders')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'text-sky-400 font-black scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'orders' ? 'bg-sky-500/20' : ''}`}>
              <FileText className="w-5 h-5" />
            </div>
            <span className="mt-0.5 leading-tight">الفواتير</span>
          </button>

          {/* Tab 5: More (Drawer Menu) */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer relative ${
              isMoreTabActive || isMobileMenuOpen
                ? 'text-sky-400 font-black scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${isMoreTabActive ? 'bg-sky-500/20' : ''}`}>
              <MoreHorizontal className="w-5 h-5" />
            </div>
            <span className="mt-0.5 leading-tight">المزيد</span>
            {isMoreTabActive && (
              <span className="absolute top-1.5 right-3 w-2 h-2 rounded-full bg-sky-400" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer / Bottom Sheet */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Sheet Body */}
          <div className="relative z-10 bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto safe-bottom">
            {/* Sheet Handle & Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">{activeUser.name}</h3>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {activeUser.username === 'developer' || activeUser.role === 'developer' || isDeveloperUnlocked
                      ? 'مطور النظام 💻'
                      : isAdmin
                        ? 'مالك المغسلة 👑'
                        : 'كاشير وفني 👷'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Shift Status Strip */}
            <div
              onClick={() => handleMobileNav('shifts')}
              className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs cursor-pointer active:scale-98 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full ${currentShift ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'}`} />
                <div>
                  <div className="font-bold text-white">
                    {currentShift ? `الوردية ${currentShift.shiftNumber} مفتوحة` : 'لا توجد وردية مفتوحة'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {currentShift ? `الكاشير: ${currentShift.cashierName}` : 'اضغط هنا لبدء وردية عمل جديدة'}
                  </div>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-slate-500" />
            </div>

            {/* Admin Management Section */}
            {isAdmin && (
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold text-slate-400 px-1">إدارة المركز والتقارير:</h4>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => handleMobileNav('reports')}
                    className={`flex items-center justify-between p-3 rounded-xl border text-right transition-all cursor-pointer ${
                      activeTab === 'reports'
                        ? 'bg-sky-500/20 border-sky-500/40 text-sky-300 font-bold'
                        : 'bg-slate-800/80 border-slate-700/60 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BarChart3 className="w-4 h-4 text-sky-400" />
                      <div>
                        <div className="text-xs font-bold">الأرباح والتقارير المالية 📊</div>
                        <div className="text-[10px] text-slate-400">إجمالي المبيعات، الأرباح، وطرق الدفع</div>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    onClick={() => handleMobileNav('workers')}
                    className={`flex items-center justify-between p-3 rounded-xl border text-right transition-all cursor-pointer ${
                      activeTab === 'workers'
                        ? 'bg-sky-500/20 border-sky-500/40 text-sky-300 font-bold'
                        : 'bg-slate-800/80 border-slate-700/60 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="text-xs font-bold">العمال وفريق العمل 👥</div>
                        <div className="text-[10px] text-slate-400">إدارة الفنيين، حسابات PIN، وصرف الرواتب</div>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    onClick={() => handleMobileNav('services')}
                    className={`flex items-center justify-between p-3 rounded-xl border text-right transition-all cursor-pointer ${
                      activeTab === 'services'
                        ? 'bg-sky-500/20 border-sky-500/40 text-sky-300 font-bold'
                        : 'bg-slate-800/80 border-slate-700/60 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Tag className="w-4 h-4 text-amber-400" />
                      <div>
                        <div className="text-xs font-bold">الخدمات وباقات الأسعار 🏷️</div>
                        <div className="text-[10px] text-slate-400">تسعيرة الغسيل للسيارات والموتوسيكلات</div>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>
            )}

            {/* Developer Section */}
            {isDev && (
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold text-purple-400 px-1">أدوات المطور:</h4>
                <button
                  onClick={() => handleMobileNav('settings')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-right transition-all cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 font-bold'
                      : 'bg-slate-800/80 border-slate-700/60 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Unlock className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="text-xs font-bold">إعدادات النظام والربط السحابي 🔓</div>
                      <div className="text-[10px] text-slate-400">مزامنة Firebase، النسخ الاحتياطي، والإعدادات</div>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            )}

            {/* Masar Tech Developer Showcase Launcher (Mobile) */}
            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onOpenMasarTech) onOpenMasarTech();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 hover:border-sky-500/50 transition-all cursor-pointer group text-right"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-950 p-1.5 border border-slate-800 flex items-center justify-center shrink-0">
                    <img src="/masar-tech-logo.svg" alt="Masar Tech" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>MASAR TECH</span>
                      <span className="text-[10px] text-sky-400 font-bold">• مسار تك</span>
                    </div>
                    <div className="text-[10px] text-slate-400">تصميم وتطوير النظام وحلول البرمجيات</div>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
              </button>
            </div>

            {/* Logout button */}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logoutUser();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج والعودة لشاشة الدخول</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
