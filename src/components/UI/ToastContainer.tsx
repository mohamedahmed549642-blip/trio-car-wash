import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  X,
  Sparkles,
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  title?: string;
  type: ToastType;
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2.5 w-[92%] sm:w-[420px] max-w-md pointer-events-none"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto relative overflow-hidden bg-slate-900/95 backdrop-blur-xl text-white rounded-2xl shadow-2xl border p-4 animate-toast-in transition-all ${
              isSuccess
                ? 'border-emerald-500/40 shadow-emerald-500/10'
                : isError
                ? 'border-rose-500/40 shadow-rose-500/10'
                : isWarning
                ? 'border-amber-500/40 shadow-amber-500/10'
                : 'border-sky-500/40 shadow-sky-500/10'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Type Icon Pill */}
              <div
                className={`p-2 rounded-xl shrink-0 mt-0.5 border ${
                  isSuccess
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : isError
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    : isWarning
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                }`}
              >
                {isSuccess && <CheckCircle2 className="w-5 h-5" />}
                {isError && <XCircle className="w-5 h-5" />}
                {isWarning && <AlertTriangle className="w-5 h-5" />}
                {isInfo && <Info className="w-5 h-5" />}
              </div>

              {/* Text content */}
              <div className="flex-1 text-right min-w-0 pr-1">
                {toast.title && (
                  <h4 className="font-black text-sm text-slate-100 mb-0.5 flex items-center gap-1.5">
                    <span>{toast.title}</span>
                    {isSuccess && <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
                  </h4>
                )}
                <p className="text-xs text-slate-300 leading-relaxed font-medium break-words">
                  {toast.message}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => onDismiss(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                title="إغلاق الإشعار"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Countdown Progress Bar */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-1 animate-toast-progress ${
                isSuccess
                  ? 'bg-emerald-500'
                  : isError
                  ? 'bg-rose-500'
                  : isWarning
                  ? 'bg-amber-500'
                  : 'bg-sky-500'
              }`}
              style={{
                animationDuration: `${toast.duration || 3500}ms`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
