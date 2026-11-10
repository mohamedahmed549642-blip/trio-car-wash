import React, { useState, useEffect, useRef } from 'react';
import {
  Car,
  Shield,
  User,
  KeyRound,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  Delete,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LoginPage: React.FC = () => {
  const { users, loginUser, settings } = useApp();

  const [loginMode, setLoginMode] = useState<'owner' | 'cashier'>('owner');

  const ownerUsers = users.filter((u) => u.role === 'admin');
  const workerUsers = users.filter((u) => u.role === 'cashier');

  const [selectedOwnerId, setSelectedOwnerId] = useState<string>(ownerUsers[0]?.id || '');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(workerUsers[0]?.id || '');

  // PIN state (written via keyboard or clicked on numpad)
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const pinInputRef = useRef<HTMLInputElement>(null);

  // Active user ID based on tab
  const activeTargetId = loginMode === 'owner' ? selectedOwnerId : selectedWorkerId;

  // Auto-focus input when mode changes
  useEffect(() => {
    setPin('');
    setErrorMessage('');
    if (pinInputRef.current) {
      pinInputRef.current.focus();
    }
  }, [loginMode]);

  // Handle PIN submission
  const handleLoginSubmit = (pinToSubmit?: string) => {
    const finalPin = pinToSubmit !== undefined ? pinToSubmit : pin;
    if (!finalPin.trim()) {
      setErrorMessage('يرجى كتابة رمز الـ PIN المكون من 4 أرقام.');
      return;
    }

    setErrorMessage('');
    const res = loginUser(activeTargetId, finalPin);
    if (!res.success) {
      setErrorMessage(res.message || 'رمز الـ PIN غير صحيح! يرجى إعادة المحاولة.');
      setPin('');
      if (pinInputRef.current) pinInputRef.current.focus();
    }
  };

  // Keyboard typing handler
  const handlePinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPin(val);
    setErrorMessage('');

    // If 4 digits typed, try auto-login
    if (val.length === 4) {
      setTimeout(() => {
        handleLoginSubmit(val);
      }, 100);
    }
  };

  // On-screen Numpad handler
  const handleNumpadPress = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMessage('');

      if (nextPin.length === 4) {
        setTimeout(() => {
          handleLoginSubmit(nextPin);
        }, 100);
      }
    }
  };

  const handleNumpadBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
    if (pinInputRef.current) pinInputRef.current.focus();
  };

  const handleNumpadClear = () => {
    setPin('');
    setErrorMessage('');
    if (pinInputRef.current) pinInputRef.current.focus();
  };

  // Quick Demo Auto-fill helpers
  const handleQuickDemoOwner = () => {
    if (ownerUsers[0]) {
      setSelectedOwnerId(ownerUsers[0].id);
      setPin(ownerUsers[0].pinCode);
      loginUser(ownerUsers[0].id, ownerUsers[0].pinCode);
    }
  };

  const handleQuickDemoWorker = () => {
    if (workerUsers[0]) {
      setSelectedWorkerId(workerUsers[0].id);
      setPin(workerUsers[0].pinCode);
      loginUser(workerUsers[0].id, workerUsers[0].pinCode);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 font-sans antialiased relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-5 space-y-1.5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 text-white shadow-xl shadow-sky-500/25 mb-1">
            <Car className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            {settings.shopName}
          </h1>
          <p className="text-xs text-slate-400">
            تسجيل الدخول برمز الـ PIN السريع • مغسلة وتغيير زيوت
          </p>
        </div>

        {/* Mode Selector Tabs (Owner vs Cashier) */}
        <div className="bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-xl mb-4 grid grid-cols-2 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setLoginMode('owner')}
            className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              loginMode === 'owner'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>دخول المالك (PIN) 👑</span>
          </button>

          <button
            type="button"
            onClick={() => setLoginMode('cashier')}
            className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              loginMode === 'cashier'
                ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <User className="w-4 h-4" />
            <span>دخول الكاشير (PIN) 👷</span>
          </button>
        </div>

        {/* Main Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 p-6 sm:p-7">
          {/* Header Title */}
          <div className="text-right mb-4">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider block mb-0.5 ${
                loginMode === 'owner' ? 'text-purple-700' : 'text-sky-700'
              }`}
            >
              {loginMode === 'owner' ? 'صلاحيات المالك الكاملة والأرباح' : 'صلاحيات الكاشير والورديات'}
            </span>
            <h2 className="text-lg font-black text-slate-900">
              {loginMode === 'owner' ? 'دخول صاحب المغسلة (المالك)' : 'دخول الكاشير / فني الوردية'}
            </h2>
            <p className="text-slate-500 text-[11px] mt-0.5">
              اكتب رمز الـ PIN الخاص بك من لوحة المفاتيح أو استخدم الأرقام بالأسفل:
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 text-right">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLoginSubmit();
            }}
            autoComplete="off"
            className="space-y-4 text-xs"
          >
            {/* User Select Box */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {loginMode === 'owner' ? 'اختر حساب المالك:' : 'اختر العامل / الكاشير:'}
              </label>
              <select
                value={loginMode === 'owner' ? selectedOwnerId : selectedWorkerId}
                onChange={(e) => {
                  if (loginMode === 'owner') setSelectedOwnerId(e.target.value);
                  else setSelectedWorkerId(e.target.value);
                  setPin('');
                  setErrorMessage('');
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                {(loginMode === 'owner' ? ownerUsers : workerUsers).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.jobTitle || (u.role === 'admin' ? 'المالك' : 'فني')})
                  </option>
                ))}
              </select>
            </div>

            {/* Written PIN Input Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">
                  اكتب رمز الـ PIN هنا <span className="text-rose-500">*</span>:
                </label>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPin ? 'إخفاء الأرقام' : 'إظهار الـ PIN'}</span>
                </button>
              </div>

              <div className="relative">
                <input
                  ref={pinInputRef}
                  type={showPin ? 'text' : 'password'}
                  name="user_pin_code"
                  autoComplete="off"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoFocus
                  required
                  placeholder="••••"
                  value={pin}
                  onChange={handlePinInputChange}
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl py-3 px-4 text-center font-mono font-black text-2xl tracking-[0.5em] text-slate-900 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Visual PIN Dots Indicator */}
            <div className="flex items-center justify-center gap-3 py-0.5">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                    pin.length > idx
                      ? loginMode === 'owner'
                        ? 'bg-purple-600 border-purple-700 scale-110 shadow-sm'
                        : 'bg-sky-500 border-sky-600 scale-110 shadow-sm'
                      : 'bg-white border-slate-300'
                  }`}
                />
              ))}
            </div>

            {/* On-screen Touch Numpad */}
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

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-3.5 text-white rounded-xl font-black text-sm shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 ${
                loginMode === 'owner'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-600/25'
                  : 'bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 shadow-sky-500/25'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>
                {loginMode === 'owner' ? 'دخول لوحة تحكم المالك 👑' : 'دخول الكاشير وبدء الوردية 👷'}
              </span>
            </button>

            {/* PIN Hint */}
            <div className="pt-1 text-center text-[11px] text-slate-400">
              {loginMode === 'owner' ? (
                <span>
                  رمز PIN الافتراضي للمالك:{' '}
                  <code className="font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                    1234
                  </code>
                </span>
              ) : (
                <span>
                  رمز PIN الافتراضي للكاشير:{' '}
                  <code className="font-mono font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                    0000
                  </code>
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Quick Testing Pills */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px]">تجربة سريعة:</span>
          <button
            type="button"
            onClick={handleQuickDemoOwner}
            className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-full font-bold text-[11px] transition-colors cursor-pointer"
          >
            👑 دخول المالك (1234)
          </button>
          <button
            type="button"
            onClick={handleQuickDemoWorker}
            className="px-3 py-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded-full font-bold text-[11px] transition-colors cursor-pointer"
          >
            👷 دخول الكاشير (0000)
          </button>
        </div>
      </div>
    </div>
  );
};
