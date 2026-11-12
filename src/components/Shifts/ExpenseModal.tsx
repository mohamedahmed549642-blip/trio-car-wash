import React, { useState } from 'react';
import { X, DollarSign, Receipt } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Expense } from '../../types';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose }) => {
  const { addExpense, currentShift } = useApp();

  const [amount, setAmount] = useState<number>(50);
  const [category, setCategory] = useState<Expense['category']>('hospitality');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !description.trim()) {
      alert('يرجى إدخال مبلغ صحيح ووصف واضح للمصروف.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addExpense(category, amount, description.trim());
      alert(`تم تسجيل المصروف بقيمة ${amount} ج.م وخصمه من رصيد درج النقدية.`);
      onClose();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء تسجيل المصروف.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">تسجيل مصروف  من الدرج</h3>
              <p className="text-xs text-slate-400">شاي، فطار، صابون، صيانة طارئة أو نثريات</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              المبلغ المصروف (ج.م) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold font-mono text-base focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">بند المصروف:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="hospitality">☕ بوفيه وضيافة وفطار عمال</option>
              <option value="supplies">🧼 شراء مستلزمات وفوط وصابون طارئ</option>
              <option value="labor">👷 يوميات ومكافآت عمالة</option>
              <option value="utilities">⚡ كهرباء ومياه ونظافة</option>
              <option value="maintenance">🔧 صيانة كومبريسور أو ماكينة غسيل</option>
              <option value="other">📝 مصاريف أخرى عامة</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              البيان / تفاصيل المصروف <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="مثال: شراء شاي وسكر للعمال، تصليح مسدس مياه..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md shadow-amber-600/20 active:scale-95 transition-all cursor-pointer"
            >
              {isSubmitting ? 'جاري التسجيل...' : 'تأكيد خصم المصروف 💸'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
