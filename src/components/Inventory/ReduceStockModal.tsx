import React, { useState, useEffect } from 'react';
import { X, MinusCircle, AlertTriangle, PackageCheck, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InventoryItem, StockMovementType } from '../../types';

interface DeductionOption {
  id: string;
  label: string;
  defaultReason: string;
  type: StockMovementType;
  isCustom?: boolean;
}

const DEFAULT_DEDUCTION_OPTIONS: DeductionOption[] = [
  { id: 'deduction', label: 'خصم يدوي / سحب من المخزن', defaultReason: 'خصم يدوي من المخزن', type: 'deduction' },
  { id: 'adjustment', label: 'تسوية جردية (عجز جرد أو مطابقة)', defaultReason: 'تسوية جردية ومطابقة رصيد', type: 'adjustment' },
  { id: 'waste', label: 'تالف أو عبوة مسربة / منتهية', defaultReason: 'تالف أو عبوة مسربة / كسر', type: 'waste' },
  { id: 'service_usage', label: 'استهلاك داخلي في المغسلة', defaultReason: 'استهلاك داخلي في تشغيل المغسلة', type: 'service_usage' },
  { id: 'sale', label: 'بيع خارجي مباشر', defaultReason: 'بيع مباشر نقدي للعميل', type: 'sale' },
];

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
  const [movementType, setMovementType] = useState<string>('deduction');
  const [reason, setReason] = useState<string>('خصم يدوي من المخزن');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom deduction options loaded from localStorage
  const [customOptions, setCustomOptions] = useState<DeductionOption[]>(() => {
    try {
      const saved = localStorage.getItem('trio_custom_deduction_types');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error loading custom deduction types:', e);
    }
    return [];
  });

  const [isAddingCustomType, setIsAddingCustomType] = useState(false);
  const [newCustomTypeInput, setNewCustomTypeInput] = useState('');

  const allDeductionOptions = [...DEFAULT_DEDUCTION_OPTIONS, ...customOptions];

  // Synchronize selected item and fields whenever modal opens or preselectedItem changes
  useEffect(() => {
    if (isOpen) {
      if (preselectedItem) {
        setSelectedItemId(preselectedItem.id);
      } else if (inventory.length > 0 && (!selectedItemId || !inventory.some((i) => i.id === selectedItemId))) {
        setSelectedItemId(inventory[0].id);
      }
      setQuantity(1);
      setMovementType('deduction');
      setReason('خصم يدوي من المخزن');
      setIsAddingCustomType(false);
      setNewCustomTypeInput('');
    }
  }, [isOpen, preselectedItem, inventory]);

  const selectedItem = inventory.find((i) => i.id === selectedItemId) || preselectedItem || inventory[0];

  const handleAddNewDeductionType = () => {
    const clean = newCustomTypeInput.trim();
    if (!clean) return;

    const exists = allDeductionOptions.some(
      (o) => o.label.toLowerCase() === clean.toLowerCase()
    );
    if (exists) {
      alert('نوع حركة الخصم هذا موجود بالفعل في القائمة.');
      return;
    }

    const newOpt: DeductionOption = {
      id: 'custom_' + Date.now(),
      label: clean,
      defaultReason: clean,
      type: 'deduction',
      isCustom: true,
    };

    const updated = [...customOptions, newOpt];
    setCustomOptions(updated);
    localStorage.setItem('trio_custom_deduction_types', JSON.stringify(updated));

    setMovementType(newOpt.id);
    setReason(clean);
    setNewCustomTypeInput('');
    setIsAddingCustomType(false);
  };

  const handleDeleteCustomOption = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customOptions.filter((o) => o.id !== id);
    setCustomOptions(updated);
    localStorage.setItem('trio_custom_deduction_types', JSON.stringify(updated));
    if (movementType === id) {
      setMovementType('deduction');
      setReason('خصم يدوي من المخزن');
    }
  };

  const handleMovementTypeChange = (val: string) => {
    setMovementType(val);
    const target = allDeductionOptions.find((o) => o.id === val);
    if (target) {
      setReason(target.defaultReason);
    }
  };

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

    const selectedOpt = allDeductionOptions.find((o) => o.id === movementType);
    const resolvedType = (selectedOpt?.type || (movementType.startsWith('custom_') ? 'deduction' : movementType)) as StockMovementType;

    setIsSubmitting(true);
    try {
      await reduceStock(selectedItemId, quantity, reason, resolvedType);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
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
          {preselectedItem && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-rose-600 block">الصنف المحدد للخصم:</span>
                <span className="text-sm font-black text-rose-950 block">{selectedItem?.name}</span>
              </div>
              <span className="px-2.5 py-1 bg-white border border-rose-200 rounded-lg text-rose-800 font-bold text-xs">
                الرصيد: {selectedItem?.stockQuantity} {selectedItem?.unit}
              </span>
            </div>
          )}

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700">نوع حركة الخصم:</label>
                <button
                  type="button"
                  onClick={() => setIsAddingCustomType(!isAddingCustomType)}
                  className="text-rose-600 hover:text-rose-700 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer hover:underline"
                >
                  <Plus className="w-3 h-3" />
                  <span>{isAddingCustomType ? 'إلغاء' : '+ إضافة نوع'}</span>
                </button>
              </div>

              {isAddingCustomType ? (
                <div className="flex items-center gap-1.5 p-1 bg-rose-50 rounded-xl border border-rose-300 animate-in fade-in">
                  <input
                    type="text"
                    autoFocus
                    placeholder="اكتب نوع الحركة الجديد..."
                    value={newCustomTypeInput}
                    onChange={(e) => setNewCustomTypeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNewDeductionType();
                      }
                    }}
                    className="flex-1 bg-white border border-rose-300 rounded-lg px-2.5 py-1 text-slate-800 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewDeductionType}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    حفظ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCustomType(false);
                      setNewCustomTypeInput('');
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <select
                    value={movementType}
                    onChange={(e) => handleMovementTypeChange(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    <optgroup label="أنواع حركات الخصم الأساسية">
                      {DEFAULT_DEDUCTION_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </optgroup>
                    {customOptions.length > 0 && (
                      <optgroup label="أنواع مخصصة مضافة">
                        {customOptions.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            ⭐ {opt.label}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsAddingCustomType(true)}
                    className="p-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl transition-colors cursor-pointer shrink-0"
                    title="إضافة نوع حركة خصم جديد للقائمة"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
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
