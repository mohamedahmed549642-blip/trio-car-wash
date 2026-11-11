import React, { useState, useEffect } from 'react';
import { X, PlusCircle, PackageCheck, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InventoryItem } from '../../types';

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedItem?: InventoryItem | null;
}

export const RestockModal: React.FC<RestockModalProps> = ({
  isOpen,
  onClose,
  preselectedItem,
}) => {
  const { inventory, addStock } = useApp();

  const [selectedItemId, setSelectedItemId] = useState<string>(
    preselectedItem?.id || (inventory[0]?.id || '')
  );
  const [quantity, setQuantity] = useState<number>(10);
  const [unitCost, setUnitCost] = useState<number>(
    preselectedItem?.costPrice || (inventory[0]?.costPrice || 0)
  );
  const [supplier, setSupplier] = useState<string>('شركة التوزيع المعتمدة');
  const [reason, setReason] = useState<string>('فاتورة توريد مشتريات جديدة');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize selected item and fields whenever modal opens or preselectedItem changes
  useEffect(() => {
    if (isOpen) {
      if (preselectedItem) {
        setSelectedItemId(preselectedItem.id);
        setUnitCost(preselectedItem.costPrice);
      } else if (inventory.length > 0 && (!selectedItemId || !inventory.some((i) => i.id === selectedItemId))) {
        setSelectedItemId(inventory[0].id);
        setUnitCost(inventory[0].costPrice);
      }
      setQuantity(10);
      setSupplier('شركة التوزيع المعتمدة');
      setReason('فاتورة توريد مشتريات جديدة');
    }
  }, [isOpen, preselectedItem, inventory]);

  // Update unitCost when selected item changes
  const handleItemSelect = (id: string) => {
    setSelectedItemId(id);
    const item = inventory.find((i) => i.id === id);
    if (item) {
      setUnitCost(item.costPrice);
    }
  };

  const selectedItem = inventory.find((i) => i.id === selectedItemId) || preselectedItem || inventory[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || quantity <= 0) {
      alert('يرجى تحديد الصنف وإدخال كمية صحيحة أكبر من الصفر.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addStock(selectedItemId, quantity, unitCost, supplier, reason);
      alert(`تمت إضافة ${quantity} ${selectedItem?.unit || 'وحدة'} بنجاح إلى رصيد المخزن!`);
      onClose();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء إضافة الرصيد.');
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
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">إضافة وتوريد رصيد جديد للمخزن (Restock)</h3>
              <p className="text-xs text-slate-400">زيادة كمية الزيوت أو الفلاتر مع تسجيل التكلفة والمورد</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {preselectedItem && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-600 block">الصنف المحدد للتوريد:</span>
                <span className="text-sm font-black text-emerald-950 block">{selectedItem?.name}</span>
              </div>
              <span className="px-2.5 py-1 bg-white border border-emerald-200 rounded-lg text-emerald-800 font-bold text-xs">
                الرصيد: {selectedItem?.stockQuantity} {selectedItem?.unit}
              </span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">اختر الصنف المراد توريده:</label>
            <select
              value={selectedItemId}
              onChange={(e) => handleItemSelect(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {inventory.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} (الرصيد الحالي: {item.stockQuantity} {item.unit})
                </option>
              ))}
            </select>
          </div>

          {selectedItem && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-slate-600 block">الرصيد الحالي بالمخزن:</span>
                <span className="text-sm font-black text-emerald-800">
                  {selectedItem.stockQuantity} {selectedItem.unit}
                </span>
              </div>
              <div className="text-left">
                <span className="text-slate-600 block">الرصيد بعد التوريد:</span>
                <span className="text-sm font-black text-emerald-950 font-mono">
                  {selectedItem.stockQuantity + (quantity || 0)} {selectedItem.unit}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                الكمية المضافة (بالوحدات/اللتر) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                سعر شراء الوحدة / التكلفة (ج.م)
              </label>
              <input
                type="number"
                min="0"
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم المورد / الشركة</label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="مثال: شركة توتال مصر، تاجر جملة"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">سبب التوريد / رقم الفاتورة</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="مثال: فاتورة توريد رقم 458"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div className="font-bold text-slate-700">
              إجمالي قيمة التوريد:{' '}
              <span className="text-emerald-700 font-mono text-sm">
                {(quantity * unitCost).toLocaleString('ar-EG')} ج.م
              </span>
            </div>

            <div className="flex gap-2">
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
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <PackageCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'جاري الإضافة...' : 'تأكيد إضافة الرصيد 📦'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
