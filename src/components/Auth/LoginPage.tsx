import React, { useState } from 'react';
import {
  Car,
  Shield,
  User,
  KeyRound,
  Lock,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Delete,
  Check,
  Fuel,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LoginPage: React.FC = () => {
  const { users, loginUser, settings } = useApp();

  const [loginMode, setLoginMode] = useState<'owner' | 'cashier'>('owner');

  // Owner form state
  const ownerUsers = users.filter((u) => u.role === 'admin');
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>(ownerUsers[0]?.id || '');
  const [ownerPin, setOwnerPin] = useState('');
  const [showOwnerPin, setShowOwnerPin] = useState(false);

  // Cashier form state
  const workerUsers = users.filter((u) => u.role === 'cashier');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(workerUsers[0]?.id || '');
  const [workerPin, setWorkerPin] = useState('');

  // Error message
  const [errorMessage, setErrorMessage] = useState('');

  // Handle Owner Login
  const handleOwnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = loginUser(selectedOwnerId, ownerPin);
    if (!res.success) {
      setErrorMessage(res.message || 'رمز الدخول غير صحيح.');
    }
  };

  // Handle Cashier/Worker Login
  const handleWorkerSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    const res = loginUser(selectedWorkerId, workerPin);
    if (!res.success) {
      setErrorMessage(res.message || 'رمز PIN غير صحيح.');
    }
  };

  // Numpad input helper for Worker/Cashier
  const handleNumpadPress = (num: string) => {
    if (workerPin.length < 6) {
      const nextPin = workerPin + num;
      setWorkerPin(nextPin);
      if (nextPin.length === 4) {
        // Auto attempt login on 4-digit entry
        setTimeout(() => {
          const res = loginUser(selectedWorkerId, nextPin);
          if (!res.success) {
            setErrorMessage(res.message || 'رمز PIN غير صحيح.');
          }
        }, 150);
      }
    }
  };

  const handleNumpadClear = () => {
    setWorkerPin('');
    setErrorMessage('');
  };

  const handleNumpadBackspace = () => {
    setWorkerPin((prev) => prev.slice(0, -1));
  };

  // Quick Demo Auto-fill buttons
  const handleQuickDemoOwner = () => {
    if (ownerUsers[0]) {
      setSelectedOwnerId(ownerUsers[0].id);
      setOwnerPin(ownerUsers[0].pinCode);
      loginUser(ownerUsers[0].id, ownerUsers[0].pinCode);
    }
  };

  const handleQuickDemoWorker = () => {
    if (workerUsers[0]) {
      setSelectedWorkerId(workerUsers[0].id);
      setWorkerPin(workerUsers[0].pinCode);
      loginUser(workerUsers[0].id, workerUsers[0].pinCode);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 font-sans antialiased relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-lg">
        {/* Brand Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 text-white shadow-xl shadow-sky-500/25 mb-1">
            <Car className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {settings.shopName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            نظام تسجيل الدخول ونقاط البيع • مغسلة وتغيير زيوت سيارات
          </p>
        </div>

        {/* Mode Selector Tabs (Owner vs Cashier) */}
        <div className="bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-xl mb-4 grid grid-cols-2 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setLoginMode('owner');
              setErrorMessage('');
            }}
            className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              loginMode === 'owner'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>دخول المالك / المدير 👑</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMode('cashier');
              setErrorMessage('');
            }}
            className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              loginMode === 'cashier'
                ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <User className="w-4 h-4" />
            <span>دخول الكاشير / العامل 👷</span>
          </button>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 p-6 sm:p-8">
          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 text-right">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. OWNER LOGIN FORM */}
          {loginMode === 'owner' && (
            <form onSubmit={handleOwnerSubmit} className="space-y-4 text-xs">
              <div className="text-right">
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block mb-1">
                  صلاحيات كاملة للمالك
                </span>
                <h2 className="text-lg font-black text-slate-900">تسجيل دخول صاحب المغسلة</h2>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  يتيح لك إدارة الأرباح، المخزون، العمال، والتقارير المالية.
                </p>
              </div>

              {/* Owner Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">اختر حساب المالك:</label>
                <select
                  value={selectedOwnerId}
                  onChange={(e) => setSelectedOwnerId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  {ownerUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.jobTitle || 'المالك'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Owner PIN / Password */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  رمز المرور / الـ PIN السري:
                </label>
                <div className="relative">
                  <input
                    type={showOwnerPin ? 'text' : 'password'}
                    required
                    autoFocus
                    placeholder="أدخل رمز الـ PIN (الافتراضي: 1234)..."
                    value={ownerPin}
                    onChange={(e) => setOwnerPin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pr-3 pl-10 py-3 text-slate-900 font-mono font-bold text-base focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOwnerPin(!showOwnerPin)}
                    className="absolute left-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showOwnerPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-black text-sm shadow-lg shadow-purple-600/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>دخول لوحة تحكم المالك 🚀</span>
              </button>

              <div className="pt-2 text-center text-[11px] text-slate-400">
                رمز PIN الافتراضي لحساب المالك: <code className="font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">1234</code>
              </div>
            </form>
          )}

          {/* 2. CASHIER / WORKER LOGIN FORM */}
          {loginMode === 'cashier' && (
            <div className="space-y-4 text-xs">
              <div className="text-right">
                <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block mb-1">
                  صلاحيات تشغيلية ونقاط البيع
                </span>
                <h2 className="text-lg font-black text-slate-900">تسجيل دخول الكاشير / الفني</h2>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  اختر اسمك واضغط رمز الـ PIN الخاص بك لبدء الوردية والعمل.
                </p>
              </div>

              {/* Worker Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">اختر العامل / الكاشير:</label>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => {
                    setSelectedWorkerId(e.target.value);
                    setWorkerPin('');
                    setErrorMessage('');
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  {workerUsers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.jobTitle || 'فني وردية'})
                    </option>
                  ))}
                </select>
              </div>

              {/* PIN Code Visual Dots Display */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-2">
                <span className="text-slate-500 text-[11px] block">أدخل رمز الـ PIN المكون من 4 أرقام:</span>
                <div className="flex items-center justify-center gap-3 py-1">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`w-4 h-4 rounded-full border-2 transition-all ${
                        workerPin.length > idx
                          ? 'bg-sky-500 border-sky-600 scale-110 shadow-sm'
                          : 'bg-white border-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Interactive Touch Numpad */}
              <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleNumpadPress(digit)}
                    className="py-3 bg-slate-100 hover:bg-slate-200 active:bg-sky-100 active:scale-95 text-slate-900 rounded-xl font-black text-lg transition-all cursor-pointer shadow-sm border border-slate-200"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleNumpadClear}
                  className="py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 active:scale-95 rounded-xl font-bold text-xs transition-all cursor-pointer border border-rose-200"
                >
                  مسح
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress('0')}
                  className="py-3 bg-slate-100 hover:bg-slate-200 active:bg-sky-100 active:scale-95 text-slate-900 rounded-xl font-black text-lg transition-all cursor-pointer shadow-sm border border-slate-200"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleNumpadBackspace}
                  className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 rounded-xl font-bold flex items-center justify-center transition-all cursor-pointer border border-slate-200"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleWorkerSubmit()}
                className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white rounded-xl font-black text-sm shadow-lg shadow-sky-500/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>دخول وبدء الوردية</span>
              </button>

              <div className="pt-1 text-center text-[11px] text-slate-400">
                رمز PIN الافتراضي للكاشير: <code className="font-mono font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">0000</code>
              </div>
            </div>
          )}
        </div>

        {/* Quick Testing Pills (One-Click demo logins) */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px]">تجربة سريعة:</span>
          <button
            type="button"
            onClick={handleQuickDemoOwner}
            className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-full font-bold text-[11px] transition-colors cursor-pointer"
          >
            👑 دخول فوري كالمالك (1234)
          </button>
          <button
            type="button"
            onClick={handleQuickDemoWorker}
            className="px-3 py-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded-full font-bold text-[11px] transition-colors cursor-pointer"
          >
            👷 دخول فوري كالعامل (0000)
          </button>
        </div>
      </div>
    </div>
  );
};
