import React, { useState, useRef, useEffect } from 'react';
import {
  Car,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  LogIn,
  Shield,
  Briefcase,
  Code2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MasarTechModal } from '../UI/MasarTechModal';

export const LoginPage: React.FC = () => {
  const { users, loginWithCredentials, settings } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isMasarModalOpen, setIsMasarModalOpen] = useState(false);

  const usernameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMessage('يرجى إدخال اسم المستخدم.');
      if (usernameInputRef.current) usernameInputRef.current.focus();
      return;
    }
    if (!password.trim()) {
      setErrorMessage('يرجى إدخال كلمة المرور.');
      return;
    }

    setErrorMessage('');
    const res = loginWithCredentials(username, password);
    if (!res.success) {
      setErrorMessage(res.message || 'بيانات الدخول غير صحيحة! يرجى إعادة المحاولة.');
    }
  };

  const handleQuickDemo = (demoUser: string, demoPass: string) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setErrorMessage('');
    loginWithCredentials(demoUser, demoPass);
  };

  const ownerUser = users.find((u) => u.role === 'admin');
  const workerUser = users.find((u) => u.role === 'cashier');

  const ownerUsername = ownerUser?.username || 'owner';
  const ownerPass = ownerUser?.password || ownerUser?.pinCode || '123';

  const workerUsername = workerUser?.username || 'cashier';
  const workerPass = workerUser?.password || workerUser?.pinCode || '123';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 font-sans antialiased relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center justify-center w-36 h-28 mx-auto drop-shadow-[0_10px_25px_rgba(56,189,248,0.25)] transition-transform hover:scale-105">
            <img
              src="/logo-white.png"
              alt="Trio Car Wash Logo"
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {settings.shopName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            تسجيل الدخول للنظام • مغسلة وتغيير زيوت
          </p>
        </div>

        {/* Main Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 p-6 sm:p-8">
          {/* Header Title */}
          <div className="text-right mb-6 border-b border-slate-100 pb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-black mb-2">
              <Lock className="w-3.5 h-3.5" />
              <span>اسم المستخدم وكلمة المرور (Username & Password)</span>
            </div>
            <h2 className="text-xl font-black text-slate-900">
              أهلاً بك، يرجى تسجيل الدخول
            </h2>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              أدخل اسم المستخدم وكلمة المرور الخاصة بك للمتابعة:
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5 text-right">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-sky-600" />
                <span>اسم المستخدم (Username):</span>
              </label>
              <div className="relative">
                <input
                  ref={usernameInputRef}
                  type="text"
                  required
                  autoFocus
                  name="auth_username"
                  autoComplete="off"
                  placeholder="مثال: owner أو cashier"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrorMessage('');
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-slate-900 font-bold text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-sky-600" />
                  <span>كلمة المرور (Password):</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-[11px] font-bold cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'إخفاء' : 'إظهار'}</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  name="auth_password"
                  autoComplete="off"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage('');
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-slate-900 font-bold text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-black text-sm shadow-xl shadow-sky-600/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول</span>
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-xs">
            <span className="text-[11px] font-bold text-slate-400 block mb-2 text-center">
              حسابات تجريبية للمعاينة بضغطة زر واحدة:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo(ownerUsername, ownerPass)}
                className="p-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-right transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center gap-1 text-purple-900 font-black text-xs mb-1">
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  <span>دخول المالك 👑</span>
                </div>
                <div className="text-[10px] text-purple-800 font-mono space-y-0.5">
                  <p>المستخدم: <strong>{ownerUsername}</strong></p>
                  <p>الباسورد: <strong>{ownerPass}</strong></p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo(workerUsername, workerPass)}
                className="p-2.5 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 text-right transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center gap-1 text-sky-900 font-black text-xs mb-1">
                  <Briefcase className="w-3.5 h-3.5 text-sky-600" />
                  <span>دخول الكاشير 👷</span>
                </div>
                <div className="text-[10px] text-sky-800 font-mono space-y-0.5">
                  <p>المستخدم: <strong>{workerUsername}</strong></p>
                  <p>الباسورد: <strong>{workerPass}</strong></p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('developer', settings.developerPassword || 'dev@trio2026')}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-right transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center gap-1 text-emerald-900 font-black text-xs mb-1">
                  <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>دخول المطور 💻</span>
                </div>
                <div className="text-[10px] text-emerald-800 font-mono space-y-0.5">
                  <p>المستخدم: <strong>developer</strong></p>
                  <p>الباسورد: <strong>{settings.developerPassword || 'dev@trio2026'}</strong></p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-5 text-xs text-slate-400 flex flex-col items-center justify-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            <span>المالك يتحكم بإضافة وحذف حسابات العمال وتعيين كلمات المرور</span>
          </div>

          {/* Masar Tech Developer Badge on Login */}
          <button
            type="button"
            onClick={() => setIsMasarModalOpen(true)}
            className="group inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-800 hover:border-sky-500/60 text-slate-300 transition-all cursor-pointer shadow-lg hover:shadow-sky-500/10 active:scale-95"
            title="تعرف على الشركة المطورة (Masar Tech)"
          >
            <span className="text-[11px] text-slate-400">تطوير وبرمجة:</span>
            <img src="/masar-tech-logo.svg" alt="Masar Tech" className="w-4 h-4 object-contain" />
            <span className="font-black text-xs text-white tracking-wider group-hover:text-sky-300 transition-colors">
              MASAR TECH
            </span>
            <span className="text-[10px] text-sky-400 font-bold bg-sky-950/80 px-2 py-0.5 rounded-full border border-sky-800/80">
              مسار تك
            </span>
          </button>
        </div>

        {/* Masar Tech Brand Modal */}
        <MasarTechModal
          isOpen={isMasarModalOpen}
          onClose={() => setIsMasarModalOpen(false)}
        />
      </div>
    </div>
  );
};
