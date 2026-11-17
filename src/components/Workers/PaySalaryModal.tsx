import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Building,
  User,
  AlertCircle,
  FileText,
  Printer,
  Trash2,
  History,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserProfile, SalaryPayment, SalaryPaymentMethod } from '../../types';

interface PaySalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: UserProfile | null;
}

export const PaySalaryModal: React.FC<PaySalaryModalProps> = ({ isOpen, onClose, worker }) => {
  const { currentShift, salaryPayments, payWorkerSalary, deleteSalaryPayment, settings } = useApp();

  // Generate recent & upcoming months options (e.g. "نوفمبر 2026")
  const monthOptions = useMemo(() => {
    const list: string[] = [];
    const date = new Date();
    // 2 months back to 1 month ahead
    for (let i = -3; i <= 1; i++) {
      const d = new Date(date.getFullYear(), date.getMonth() + i, 1);
      const mStr = d.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
      list.push(mStr);
    }
    // Return unique with current month first
    const currentM = new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
    const set = new Set([currentM, ...list.reverse()]);
    return Array.from(set);
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
  });

  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<SalaryPaymentMethod>('cash_drawer');
  const [deductFromDrawer, setDeductFromDrawer] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<SalaryPayment | null>(null);

  // When modal opens or worker changes, set reasonable default amount
  useEffect(() => {
    if (worker) {
      if (worker.monthlySalary && worker.monthlySalary > 0) {
        setAmount(worker.monthlySalary);
      } else if (worker.dailyWage && worker.dailyWage > 0) {
        setAmount(worker.dailyWage * 30);
      } else {
        setAmount(3000);
      }
      setNotes('');
      setPaymentMethod('cash_drawer');
      setDeductFromDrawer(true);
      setShowHistory(false);
      setSelectedVoucher(null);
    }
  }, [worker, isOpen]);

  // Handle method change to smartly toggle drawer deduction
  const handleMethodChange = (m: SalaryPaymentMethod) => {
    setPaymentMethod(m);
    if (m === 'cash_drawer') {
      setDeductFromDrawer(true);
    } else {
      setDeductFromDrawer(false);
    }
  };

  // Filter payments for this specific worker
  const workerPayments = useMemo(() => {
    if (!worker) return [];
    return salaryPayments.filter((p) => p.workerId === worker.id);
  }, [salaryPayments, worker]);

  // Already paid this selected month
  const paidThisMonth = useMemo(() => {
    return workerPayments
      .filter((p) => p.month === selectedMonth)
      .reduce((sum, p) => sum + p.amount, 0);
  }, [workerPayments, selectedMonth]);

  // Total paid to this worker all time
  const totalPaidAllTime = useMemo(() => {
    return workerPayments.reduce((sum, p) => sum + p.amount, 0);
  }, [workerPayments]);

  if (!isOpen || !worker) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('يرجى إدخال مبلغ صحيح للصرف.');
      return;
    }

    if (deductFromDrawer && !currentShift) {
      const proceed = confirm(
        'تنبيه: لا توجد وردية مفتوحة حالياً في الدرج!\nهل تريد المتابعة وسيتم تسجيل المصروف كحركة عادية دون خصمه من درج حالي؟'
      );
      if (!proceed) return;
    }

    setIsSubmitting(true);
    try {
      const newPay = await payWorkerSalary({
        workerId: worker.id,
        workerName: worker.name,
        amount,
        month: selectedMonth,
        paymentMethod,
        deductFromDrawer,
        notes: notes.trim(),
      });
      setSelectedVoucher(newPay);
      setShowHistory(true);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء تسجيل صرف الراتب.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (paymentId: string) => {
    if (confirm('هل أنت متأكد من حذف حركة صرف هذا الراتب من السجل؟')) {
      await deleteSalaryPayment(paymentId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg">صرف الراتب الشهري للعامل</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  سند صرف نقدي
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                تحديد المستحقات وصرف الراتب مع إمكانية الخصم من درج الكاش
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Worker Info Card */}
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                {worker.name.slice(0, 1)}
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm sm:text-base">{worker.name}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {worker.jobTitle || 'فني غسيل وتغيير زيوت'}
                  </span>
                  <span>•</span>
                  <span className="font-mono">{worker.phone || 'بدون هاتف'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
              {worker.monthlySalary && worker.monthlySalary > 0 ? (
                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-bold text-slate-400 block">الراتب الشهري المتفق عليه</span>
                  <span className="text-sm font-black text-slate-800 font-mono">
                    {worker.monthlySalary.toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
              ) : worker.dailyWage && worker.dailyWage > 0 ? (
                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-bold text-slate-400 block">اليومية المقدرة</span>
                  <span className="text-sm font-black text-slate-800 font-mono">
                    {worker.dailyWage} ج.م / يوم (~{(worker.dailyWage * 30).toLocaleString('ar-EG')} شهرياً)
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Monthly Payment Summary Alert */}
          {paidThisMonth > 0 && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  تم صرف دفعات سابقة لهذا العامل عن شهر (<strong>{selectedMonth}</strong>) بإجمالي:{' '}
                  <strong>{paidThisMonth.toLocaleString('ar-EG')} ج.م</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="text-amber-700 font-bold underline hover:text-amber-800 cursor-pointer shrink-0 mr-2 text-[11px]"
              >
                {showHistory ? 'إخفاء السجل' : 'عرض السجل'}
              </button>
            </div>
          )}
        </div>

        {/* Tab Toggle: Form or History */}
        <div className="flex items-center border-b border-slate-200 bg-white px-6">
          <button
            type="button"
            onClick={() => setShowHistory(false)}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              !showHistory
                ? 'border-emerald-600 text-emerald-700 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>تسجيل صرف راتب جديد</span>
          </button>
          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              showHistory
                ? 'border-emerald-600 text-emerald-700 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <History className="w-4 h-4" />
            <span>سجل الرواتب السابقة ({workerPayments.length})</span>
          </button>
        </div>

        {/* Main Content */}
        {!showHistory ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {/* Amount Input */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-black text-slate-800 text-sm">
                  المبلغ المراد صرفه للعامل (ج.م) <span className="text-rose-500">*</span>:
                </label>
                {worker.monthlySalary && worker.monthlySalary > 0 && (
                  <button
                    type="button"
                    onClick={() => setAmount(worker.monthlySalary!)}
                    className="text-emerald-700 hover:text-emerald-800 font-extrabold text-[11px] underline cursor-pointer"
                  >
                    استرجاع الراتب الكامل ({worker.monthlySalary.toLocaleString('ar-EG')} ج.م)
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  required
                  autoFocus
                  placeholder="أدخل المبلغ بالجنيه المصري..."
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-white border border-emerald-300 rounded-xl px-4 py-3 text-slate-900 font-mono font-black text-xl text-center focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-inner"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-emerald-700 text-sm">
                  ج.م
                </span>
              </div>

              {/* Quick Amount presets */}
              <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1">
                {[1000, 2000, 3000, 4000, 5000, 6000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer shrink-0 ${
                      amount === val
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white hover:bg-emerald-100 text-slate-700 border border-emerald-200'
                    }`}
                  >
                    {val.toLocaleString('ar-EG')} ج.م
                  </button>
                ))}
              </div>
            </div>

            {/* Month & Method Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">عن شهر (فترة الاستحقاق):</label>
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {monthOptions.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">طريقة صرف الراتب:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => handleMethodChange(e.target.value as SalaryPaymentMethod)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="cash_drawer">💵 خصم مباشر من درج الكاش (الوردية)</option>
                  <option value="instapay">⚡ تحويل انستاباي (InstaPay)</option>
                  <option value="vodafone_cash">📱 فودافون كاش / محفظة إلكترونية</option>
                  <option value="external">🤝 دفع كاش خارجي (من المالك مباشرة)</option>
                </select>
              </div>
            </div>

            {/* Drawer deduction alert & toggle */}
            <div
              className={`p-3 rounded-xl border transition-all ${
                deductFromDrawer
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <label className="flex items-center gap-2 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={deductFromDrawer}
                  onChange={(e) => setDeductFromDrawer(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span>خصم هذا المبلغ تلقائياً من رصيد درج النقدية الحالي بالوردية</span>
              </label>
              <p className="text-[11px] mt-1 mr-6 text-slate-500">
                {deductFromDrawer
                  ? '✓ سيتم إدراج هذا المبلغ كمصروف عمالة (Labor) في الوردية ويخصم من كاش الدرج المتوقع تسليمه.'
                  : 'لن يتم خصم هذا المبلغ من درج الكاش (مناسب إذا قمت بالدفع من جيبك الخاص أو عبر تحويل بنكي).'}
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                البيان / ملاحظات الصرف (اختياري):
              </label>
              <input
                type="text"
                placeholder="مثال: راتب كامل، سلفة، مكافأة أداء متميز، متبقي راتب..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting || amount <= 0}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-black text-sm shadow-lg shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'جاري الصرف...'
                    : `تأكيد صرف ${amount > 0 ? amount.toLocaleString('ar-EG') + ' ج.م' : 'الراتب'} 💵`}
                </span>
              </button>
            </div>
          </form>
        ) : (
          /* History View */
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-slate-800 text-sm">سجل الرواتب المصروفة للعامل</h4>
                <p className="text-xs text-slate-500">
                  إجمالي المصروف لهذا العامل حتى الآن:{' '}
                  <strong className="text-emerald-700 font-mono">
                    {totalPaidAllTime.toLocaleString('ar-EG')} ج.م
                  </strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                + صرف دفعة جديدة
              </button>
            </div>

            {workerPayments.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold">لم يتم تسجيل أي عمليات صرف رواتب سابقة لهذا العامل حتى الآن.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {workerPayments.map((p) => {
                  const dateFormatted = new Date(p.paidAt).toLocaleDateString('ar-EG', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={p.id}
                      className="p-3.5 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 transition-all flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-sm font-mono">
                            {p.amount.toLocaleString('ar-EG')} ج.م
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            عن {p.month}
                          </span>
                          {p.deductFromDrawer && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                              خصم من الدرج
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-[11px] mt-1">
                          <span>{dateFormatted}</span>
                          <span>•</span>
                          <span>بواسطة: {p.paidBy}</span>
                          {p.notes && (
                            <>
                              <span>•</span>
                              <span className="text-slate-700 italic">"{p.notes}"</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedVoucher(p)}
                          className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg cursor-pointer"
                          title="عرض إيصال الصرف"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer"
                          title="حذف السجل"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Voucher Preview Modal / Print Sheet */}
        {selectedVoucher && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-300 text-slate-800">
              <div className="text-center pb-4 border-b border-slate-200">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-black text-slate-900">{settings.shopName}</h3>
                <p className="text-xs text-slate-500 font-bold">سند صرف راتب ومستحقات عامل</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono text-[10px]">
                  رقم السند: #{selectedVoucher.id.slice(-6)}
                </span>
              </div>

              <div className="py-4 space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">اسم العامل:</span>
                  <span className="font-black text-slate-900">{selectedVoucher.workerName}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">المبلغ المصروف:</span>
                  <span className="font-black text-emerald-700 text-base font-mono">
                    {selectedVoucher.amount.toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">عن شهر:</span>
                  <span className="font-bold text-slate-900">{selectedVoucher.month}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">طريقة الدفع:</span>
                  <span className="font-bold text-slate-900">
                    {selectedVoucher.paymentMethod === 'cash_drawer'
                      ? 'درج الكاش'
                      : selectedVoucher.paymentMethod === 'instapay'
                      ? 'انستاباي'
                      : selectedVoucher.paymentMethod === 'vodafone_cash'
                      ? 'فودافون كاش'
                      : 'دفع خارجي'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">تاريخ وساعة الصرف:</span>
                  <span className="font-mono text-slate-700">
                    {new Date(selectedVoucher.paidAt).toLocaleDateString('ar-EG', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">المسؤول عن الصرف:</span>
                  <span className="font-bold text-slate-900">{selectedVoucher.paidBy}</span>
                </div>
                {selectedVoucher.notes && (
                  <div className="py-1">
                    <span className="text-slate-500 block mb-0.5">ملاحظات:</span>
                    <p className="bg-slate-50 p-2 rounded-xl text-slate-700 italic border border-slate-200">
                      {selectedVoucher.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة السند</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedVoucher(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
