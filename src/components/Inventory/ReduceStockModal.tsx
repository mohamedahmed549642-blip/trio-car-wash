import React, { useState } from 'react';
import { X, MinusCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InventoryItem, StockMovementType } from '../../types';

interface ReduceStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedItem?: InventoryItem | null;
}

export const ReduceStockModal: React.FC<ReduceStockModalProps> = ({
  isOpen,
  onClose,
  preselectedItem,
}) => {
  const { inventory, reduceStock } = useApp();

  const [selectedItemId, setSelectedItemId] = useState<string>(
    preselectedItem?.id || (inventory[0]?.id || '')
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [movementType, setMovementType] = useState<StockMovementType>('deduction');
  const [reason, setReason] = useState<string>('خصم يدوي من المخزن');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedItem = inventory.find((i) => i.id === selectedItemId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || quantity <= 0) {
      alert('يرجى تحديد الصنف وإدخال كمية صحيحة.');
      return;
    }

    if (selectedItem && quantity > selectedItem.stockQuantity) {
      alert(`عذراً، الكمية المراد خصمها (${quantity}) أكبر من الرصيد المتوفر بالمخزن (${selectedItem.stockQuantity})!`);
      return;
    }

    setIsSubmitting(true);
    try {
      await reduceStock(selectedItemId, quantity, reason, movementType);
      alert(`تم خصم ${quantity} ${selectedItem?.unit || 'وحدة'} بنجاح من رصيد المخزن.`);
      onClose();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء خصم الرصيد.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl">
              <MinusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">خصم أو تسوية رصيد من المخزن (Reduce Stock)</h3>
              <p className="text-xs text-slate-400">تسجيل توالف أو عجز جرد أو استهلاك داخلي للمغسلة</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">اختر الصنف المراد خصمه:</label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              {inventory.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} (الرصيد المتاح: {item.stockQuantity} {item.unit})
                </option>
              ))}
            </select>
          </div>

          {selectedItem && (
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between">
              <div>
                <span className="text-slate-600 block">الرصيد الحالي بالمخزن:</span>
                <span className="text-sm font-black text-rose-800">
                  {selectedItem.stockQuantity} {selectedItem.unit}
                </span>
              </div>
              <div className="text-left">
                <span className="text-slate-600 block">الرصيد المتبقي بعد الخصم:</span>
                <span className="text-sm font-black text-rose-950 font-mono">
                  {Math.max(0, selectedItem.stockQuantity - (quantity || 0))} {selectedItem.unit}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                الكمية المراد خصمها <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max={selectedItem?.stockQuantity || 1}
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold font-mono focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">نوع حركة الخصم:</label>
              <select
                value={movementType}
                onChange={(e) => {
                  const val = e.target.value as StockMovementType;
                  setMovementType(val);
                  if (val === 'deduction' && reason === 'تسوية عجز جردي') setReason('خصم يدوي من المخزن');
                  if (val === 'adjustment') setReason('تسوية جردية ومطابقة رصيد');
                  if (val === 'waste') setReason('تالف أو عبوة مسربة / كسر');
                  if (val === 'service_usage') setReason('استهلاك داخلي في تشغيل المغسلة');
                  if (val === 'sale') setReason('بيع مباشر نقدي للعميل');
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                <option value="deduction">خصم يدوي / سحب من المخزن</option>
                <option value="adjustment">تسوية جردية (عجز جرد أو مطابقة)</option>
                <option value="waste">تالف أو عبوة مسربة / منتهية</option>
                <option value="service_usage">استهلاك داخلي في المغسلة</option>
                <option value="sale">بيع خارجي مباشر</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">سبب أو تفاصيل الخصم:</label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثال: شرخ في العبوة أثناء النقل، استهلاك شامبو غسيل..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
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
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-600/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <MinusCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'جاري الخصم...' : 'تأكيد الخصم من المخزن'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
