import React, { useState, useRef, useEffect } from 'react';
import {
  Car,
  KeyRound,
  Shield,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LoginPage: React.FC = () => {
  const { users, loginByPin, settings } = useApp();

  const [enteredCode, setEnteredCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredCode.trim()) {
      setErrorMessage('يرجى كتابة رمز الدخول (PIN / الكود).');
      if (inputRef.current) inputRef.current.focus();
      return;
    }

    setErrorMessage('');
    const res = loginByPin(enteredCode);
    if (!res.success) {
      setErrorMessage(res.message || 'رمز الدخول غير مطابق لأي حساب مسجل.');
      setEnteredCode('');
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const handleQuickFill = (code: string) => {
    setEnteredCode(code);
    setErrorMessage('');
    loginByPin(code);
  };

  const ownerUser = users.find((u) => u.role === 'admin');
  const workerUser = users.find((u) => u.role === 'cashier');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 font-sans antialiased relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 text-white shadow-xl shadow-sky-500/25 mb-1 ring-4 ring-white/10">
            <Car className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {settings.shopName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            نظام إدارة المغسلة وتغيير الزيوت والمخزن
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 p-6 sm:p-8">
          {/* Header Title */}
          <div className="text-right mb-6 border-b border-slate-100 pb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-black mb-2">
              <KeyRound className="w-3.5 h-3.5" />
              <span>تسجيل الدخول المباشر برمز الـ PIN</span>
            </div>
            <h2 className="text-xl font-black text-slate-900">
              أهلاً بك، يرجى كتابة رمز الدخول
            </h2>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              اكتب رمز الـ PIN أو الكود الخاص بك (مثال: <span className="font-mono font-bold text-slate-700">857487487</span> أو <span className="font-mono font-bold text-slate-700">1234</span>)، وسيقوم النظام بالتحقق منه ومطابقته بحسابك فوراً.
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5 text-right">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Written PIN Form */}
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-black text-slate-800 text-xs flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-sky-600" />
                  <span>رمز الدخول المكتوب (PIN):</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-[11px] font-bold cursor-pointer transition-colors"
                >
                  {showCode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showCode ? 'إخفاء الرمز' : 'إظهار الرمز'}</span>
                </button>
              </div>

              <div className="relative">
                <input
                  ref={inputRef}
                  type={showCode ? 'text' : 'password'}
                  name="auth_user_pin"
                  autoComplete="off"
                  autoFocus
                  required
                  placeholder="اكتب رمزك هنا (مثال: 857487487)"
                  value={enteredCode}
                  onChange={(e) => {
                    setEnteredCode(e.target.value);
                    setErrorMessage('');
                  }}
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl py-3.5 px-4 text-center font-mono font-black text-xl text-slate-900 tracking-wider focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 focus:outline-none transition-all placeholder:text-slate-400 placeholder:text-sm placeholder:font-normal placeholder:tracking-normal"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-black text-sm shadow-xl shadow-sky-600/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>تسجيل الدخول والمطابقة</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Helpers */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-xs">
            <span className="text-[11px] font-bold text-slate-400 block mb-2.5 text-center">
              أكواد تجريبية جاهزة للمعاينة السريعة:
            </span>
            <div className="grid grid-cols-2 gap-2 font-mono">
              {ownerUser && (
                <button
                  type="button"
                  onClick={() => handleQuickFill(ownerUser.pinCode)}
                  className="p-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5"
                >
                  <span className="text-[10px] font-bold font-sans text-purple-700 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-purple-600" />
                    <span>المالك 👑</span>
                  </span>
                  <span className="font-bold text-sm text-purple-950 tracking-wider">
                    {ownerUser.pinCode}
                  </span>
                </button>
              )}

              {workerUser && (
                <button
                  type="button"
                  onClick={() => handleQuickFill(workerUser.pinCode)}
                  className="p-2.5 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-900 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5"
                >
                  <span className="text-[10px] font-bold font-sans text-sky-700 flex items-center gap-1">
                    <User className="w-3 h-3 text-sky-600" />
                    <span>الكاشير 👷</span>
                  </span>
                  <span className="font-bold text-sm text-sky-950 tracking-wider">
                    {workerUser.pinCode}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Security Note */}
        <div className="text-center mt-5 text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-slate-500" />
          <span>تحديد الصلاحيات تلقائياً حسب الرمز المطابق</span>
        </div>
      </div>
    </div>
  );
};
