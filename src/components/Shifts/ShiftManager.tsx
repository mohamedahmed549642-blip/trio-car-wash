import React, { useState } from 'react';
import {
  CircleDollarSign,
  Play,
  Lock,
  PlusCircle,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  History,
  TrendingUp,
  Clock,
  User,
  ShieldCheck,
  X,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ExpenseModal } from './ExpenseModal';

export const ShiftManager: React.FC = () => {
  const { currentShift, openShift, closeShift, deleteShift, shifts, expenses, activeUser } = useApp();

  const [openingBalance, setOpeningBalance] = useState<number>(200); // 200 EGP standard change
  const [actualCash, setActualCash] = useState<number>(0);
  const [closeNotes, setCloseNotes] = useState('');
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Open Shift
  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await openShift(openingBalance);
      alert('تم فتح الوردية بنجاح! يمكنك الآن استقبال طلبات الكاشير.');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء فتح الوردية.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Close Shift
  const handleConfirmCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await closeShift(actualCash, closeNotes);
      setIsCloseModalOpen(false);
      alert('تم تقفيل الوردية وترحيل الحسابات بنجاح!');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء تقفيل الوردية.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Active Shift
  const handleDeleteCurrentShift = async () => {
    if (!currentShift) return;
    if (
      window.confirm(
        `هل أنت متأكد من رغبتك في حذف ${currentShift.shiftNumber} المفتوحة حالياً؟\nسيتم إلغاء الوردية بالكامل وإعادة حالة الخزينة للوضع الابتدائي.`
      )
    ) {
      setIsSubmitting(true);
      try {
        await deleteShift(currentShift.id);
        alert('تم حذف الوردية بنجاح!');
      } catch (err) {
        console.error(err);
        alert('حدث خطأ أثناء حذف الوردية.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Handle Delete Historical Shift from Archive
  const handleDeleteClosedShift = async (shiftId: string, shiftNumber: string) => {
    if (window.confirm(`هل أنت متأكد من حذف سجل ${shiftNumber} نهائياً من الأرشيف؟`)) {
      try {
        await deleteShift(shiftId);
        alert('تم حذف سجل الوردية بنجاح!');
      } catch (err) {
        console.error(err);
        alert('حدث خطأ أثناء حذف الوردية.');
      }
    }
  };

  // Filter expenses for current shift
  const currentShiftExpenses = expenses.filter(
    (exp) => currentShift && exp.shiftId === currentShift.id
  );

  return (
    <div className="space-y-6">
      {/* 1. If NO shift is currently open */}
      {!currentShift ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-xl mx-auto my-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">لا توجد وردية نشطة حالياً</h2>
          <p className="text-xs text-slate-500 mb-6">
            لبدء استقبال السيارات وإصدار الفواتير، يرجى فتح الوردية وتحديد رصيد عهدة بداية اليوم (الفكة في الدرج).
          </p>

          <form onSubmit={handleOpenShift} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 text-xs">
            <div className="text-right">
              <label className="block font-bold text-slate-700 mb-1">
                رصيد عهدة الافتتاح / الفكة في الدرج (بالجنيه):
              </label>
              <input
                type="number"
                min="0"
                required
                value={openingBalance}
                onChange={(e) => setOpeningBalance(Number(e.target.value))}
                placeholder="200 ج.م"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-bold font-mono text-base focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                المبلغ الموجود في الدرج كفكة في بداية الشيفت قبل بدء أي عمليات.
              </span>
            </div>

            <div className="pt-2 text-right">
              <span className="text-slate-600 font-medium">الكاشير المسؤول: </span>
              <strong className="text-slate-900 font-bold">{activeUser.name}</strong>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white rounded-xl font-black text-sm shadow-lg shadow-sky-600/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isSubmitting ? 'جاري فتح الوردية...' : 'بدء وفتح الوردية الآن 🚀'}</span>
            </button>
          </form>
        </div>
      ) : (
        /* 2. Active Open Shift Live Dashboard */
        <div className="space-y-6">
          {/* Active Shift Header Card */}
          <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="font-mono text-xs text-sky-400 font-bold uppercase tracking-wider">
                  وردية نشطة ومفتوحة
                </span>
              </div>
              <h1 className="text-2xl font-black">{currentShift.shiftNumber}</h1>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-1 font-medium">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  الكاشير: <strong className="text-white">{currentShift.cashierName}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  بدأت: {new Date(currentShift.startedAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(true)}
                className="inline-flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer"
              >
                <Receipt className="w-4 h-4" />
                <span>تسجيل مصروف نثري من الدرج 💸</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActualCash(currentShift.expectedCash);
                  setIsCloseModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs py-2.5 px-5 rounded-xl shadow-lg shadow-rose-600/30 active:scale-95 transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>تقفيل الوردية ومطابقة الخزينة 🔒</span>
              </button>

              <button
                type="button"
                onClick={handleDeleteCurrentShift}
                className="inline-flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold text-xs py-2.5 px-3.5 rounded-xl transition-all cursor-pointer"
                title="حذف أو إلغاء الوردية المفتوحة حالياً"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>حذف الوردية 🗑️</span>
              </button>
            </div>
          </div>

          {/* Shift Financial Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Expected Cash in Drawer */}
            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200">
              <span className="text-xs font-bold text-emerald-800 block mb-1">
                المبلغ المتوقع في درج الكاش 💵
              </span>
              <div className="text-2xl font-black text-emerald-950 font-mono">
                {currentShift.expectedCash.toLocaleString('ar-EG')} ج.م
              </div>
              <div className="text-[11px] text-emerald-700 mt-2 space-y-0.5">
                <div>• فكة البداية: {currentShift.openingBalance} ج.م</div>
                <div>• + مبيعات كاش: {currentShift.cashSales} ج.م</div>
                <div>• - مصروفات نثرية: {currentShift.totalExpenses} ج.م</div>
              </div>
            </div>

            {/* Metric 2: InstaPay Sales */}
            <div className="bg-sky-50 p-5 rounded-2xl border border-sky-200">
              <span className="text-xs font-bold text-sky-800 block mb-1">
                تحويلات إنستاباي InstaPay ⚡
              </span>
              <div className="text-2xl font-black text-sky-950 font-mono">
                {currentShift.instapaySales.toLocaleString('ar-EG')} ج.م
              </div>
              <p className="text-[11px] text-sky-700 mt-2">
                محولة لحساب المحل البنكي مباشرة
              </p>
            </div>

            {/* Metric 3: Vodafone Cash & Visa */}
            <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-200">
              <span className="text-xs font-bold text-indigo-800 block mb-1">
                فودافون كاش & فيزا 💳
              </span>
              <div className="text-2xl font-black text-indigo-950 font-mono">
                {(currentShift.vodafoneSales + currentShift.visaSales).toLocaleString('ar-EG')} ج.م
              </div>
              <div className="text-[11px] text-indigo-700 mt-2 space-y-0.5">
                <div>• فودافون كاش: {currentShift.vodafoneSales} ج.م</div>
                <div>• فيزا وماكينة البنك: {currentShift.visaSales} ج.م</div>
              </div>
            </div>

            {/* Metric 4: Total Shift Revenue */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold text-slate-400 block mb-1">
                إجمالي إيراد الوردية (الكل)
              </span>
              <div className="text-2xl font-black text-cyan-400 font-mono">
                {(
                  currentShift.cashSales +
                  currentShift.instapaySales +
                  currentShift.vodafoneSales +
                  currentShift.visaSales
                ).toLocaleString('ar-EG')}{' '}
                ج.م
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                يشمل كافة طرق الدفع النقدية والإلكترونية
              </p>
            </div>
          </div>

          {/* Shift Expenses Section */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-600" />
                <span>المصروفات النثرية خلال هذه الوردية ({currentShiftExpenses.length})</span>
              </h3>
              <span className="text-xs font-bold text-amber-800 font-mono">
                الإجمالي: {currentShift.totalExpenses} ج.م
              </span>
            </div>

            {currentShiftExpenses.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                لم يتم تسجيل أي مصروفات حتى الآن خلال هذه الوردية.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {currentShiftExpenses.map((exp) => (
                  <div key={exp.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">{exp.description}</div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(exp.createdAt).toLocaleTimeString('ar-EG', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        • بواسطة: {exp.createdBy}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-rose-600 text-sm">
                      -{exp.amount} ج.م
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Shift Reconciliation / Close Modal */}
      {isCloseModalOpen && currentShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">تقفيل الوردية ومطابقة النقدية</h3>
                  <p className="text-xs text-slate-400">{currentShift.shiftNumber} - الكاشير: {currentShift.cashierName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsCloseModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCloseShift} className="p-6 space-y-4 text-xs">
              {/* Expected vs Actual Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 font-bold">المبلغ المتوقع في الدرج سيستمياً:</span>
                  <span className="font-mono font-black text-slate-900 text-base">
                    {currentShift.expectedCash.toLocaleString('ar-EG')} ج.م
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    أدخل المبلغ الفعلي بعد عد كاش الدرج <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={actualCash}
                    onChange={(e) => setActualCash(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-bold font-mono text-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                {/* Diff Calculation */}
                {actualCash > 0 && (
                  <div
                    className={`p-3 rounded-xl border text-center font-bold text-xs ${
                      actualCash === currentShift.expectedCash
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : actualCash > currentShift.expectedCash
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    {actualCash === currentShift.expectedCash ? (
                      <span>الدرج مطابق تماماً 100% بدون أي عجز أو زيادة! ✨</span>
                    ) : actualCash > currentShift.expectedCash ? (
                      <span>
                        يوجد زيادة في الدرج بمقدار +
                        {(actualCash - currentShift.expectedCash).toLocaleString('ar-EG')} ج.م
                      </span>
                    ) : (
                      <span>
                        يوجد عجز في الدرج بمقدار -
                        {(currentShift.expectedCash - actualCash).toLocaleString('ar-EG')} ج.م ⚠️
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات تقفيل الشيفت:</label>
                <textarea
                  rows={2}
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  placeholder="أي ملاحظات حول الوردية أو تسليم الشيفت التالي..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCloseModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black shadow-md shadow-rose-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  {isSubmitting ? 'جاري التقفيل...' : 'تأكيد تقفيل الوردية'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />

      {/* 4. Previous Closed Shifts Archive */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-extrabold text-sm text-slate-900 mb-4 flex items-center gap-2">
          <History className="w-4 h-4 text-slate-500" />
          <span>أرشيف الورديات السابقة ({shifts.filter((s) => s.status === 'closed').length})</span>
        </h3>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3">رقم الوردية</th>
                <th className="py-2.5 px-3">الكاشير</th>
                <th className="py-2.5 px-3">تاريخ البدء والانتهاء</th>
                <th className="py-2.5 px-3 text-left">مبيعات الكاش</th>
                <th className="py-2.5 px-3 text-left">إنستاباي / فيزا</th>
                <th className="py-2.5 px-3 text-left">المصروفات</th>
                <th className="py-2.5 px-3 text-left">الكاش الفعلي بالدرج</th>
                <th className="py-2.5 px-3 text-center">مطابقة الدرج</th>
                <th className="py-2.5 px-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shifts
                .filter((s) => s.status === 'closed')
                .map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{s.shiftNumber}</td>
                    <td className="py-2.5 px-3 text-slate-700">{s.cashierName}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">
                      {new Date(s.startedAt).toLocaleDateString('ar-EG', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2.5 px-3 text-left font-mono font-bold text-emerald-700">
                      {s.cashSales.toLocaleString('ar-EG')} ج.م
                    </td>
                    <td className="py-2.5 px-3 text-left font-mono text-slate-700">
                      {(s.instapaySales + s.vodafoneSales + s.visaSales).toLocaleString('ar-EG')} ج.م
                    </td>
                    <td className="py-2.5 px-3 text-left font-mono text-rose-600">
                      -{s.totalExpenses.toLocaleString('ar-EG')} ج.م
                    </td>
                    <td className="py-2.5 px-3 text-left font-mono font-black text-slate-900">
                      {s.actualCashInDrawer?.toLocaleString('ar-EG')} ج.م
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {s.difference === 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          مطابق 100%
                        </span>
                      ) : (s.difference || 0) > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                          زيادة +{s.difference} ج.م
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                          عجز {s.difference} ج.م
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteClosedShift(s.id, s.shiftNumber)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="حذف هذا السجل من الأرشيف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
