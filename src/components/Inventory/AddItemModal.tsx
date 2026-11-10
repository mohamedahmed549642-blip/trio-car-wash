import React, { useState } from 'react';
import { X, PackagePlus, Fuel } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductCategory } from '../../types';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose }) => {
  const { addNewItem } = useApp();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Shell');
  const [category, setCategory] = useState<ProductCategory>('oil');
  const [viscosity, setViscosity] = useState('5W-40');
  const [oilKmType, setOilKmType] = useState<number>(10000);
  const [packageType, setPackageType] = useState<'can_1L' | 'can_4L' | 'can_5L' | 'drum_liter' | 'piece'>('can_4L');
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [minStockAlert, setMinStockAlert] = useState<number>(5);
  const [costPrice, setCostPrice] = useState<number>(1500);
  const [sellingPrice, setSellingPrice] = useState<number>(1900);
  const [unit, setUnit] = useState('جركن 4 لتر');
  const [barcode, setBarcode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('يرجى إدخال اسم الصنف.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addNewItem({
        name: name.trim(),
        brand: brand.trim(),
        category,
        viscosity: category === 'oil' ? viscosity : undefined,
        oilKmType: category === 'oil' ? oilKmType : undefined,
        packageType,
        stockQuantity,
        minStockAlert,
        costPrice,
        sellingPrice,
        unit,
        barcode: barcode.trim() || undefined,
      });

      alert('تمت إضافة الصنف الجديد إلى المخزن بنجاح!');
      onClose();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء إضافة الصنف.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">إضافة صنف جديد إلى المخزن</h3>
              <p className="text-xs text-slate-400">تسجيل نوع زيت جديد، فلاتر، سوائل أو مستلزمات</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">تصنيف الصنف:</label>
              <select
                value={category}
                onChange={(e) => {
                  const cat = e.target.value as ProductCategory;
                  setCategory(cat);
                  if (cat === 'oil') setUnit('جركن 4 لتر');
                  else if (cat === 'filter') setUnit('قطعة');
                  else if (cat === 'fluid') setUnit('جركن 4 لتر');
                  else setUnit('قطعة');
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="oil">🛢️ زيت محرك</option>
                <option value="filter">⚙️ فلتر سيارة</option>
                <option value="fluid">💧 سائل ردياتير / فرامل / باور</option>
                <option value="wash_supply">🧼 مستلزمات غسيل وصابون</option>
                <option value="accessory">🌲 معطرات واكسسوارات</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">الشركة / الماركة:</label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Shell, Mobil, Total, Toyota OEM..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              اسم الصنف بالكامل <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: زيت شل هيليكس الترا 5W-40 (جركن 4 لتر)"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* If Oil, show viscosity and km rating */}
          {category === 'oil' && (
            <div className="grid grid-cols-2 gap-3 bg-amber-50 p-3 rounded-xl border border-amber-200">
              <div>
                <label className="block font-bold text-slate-700 mb-1">درجة اللزوجة (Viscosity):</label>
                <input
                  type="text"
                  value={viscosity}
                  onChange={(e) => setViscosity(e.target.value)}
                  placeholder="5W-40, 5W-30, 10W-40, 20W-50..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">عمر الزيت (كم):</label>
                <select
                  value={oilKmType}
                  onChange={(e) => setOilKmType(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value={10000}>10,000 كم (تخليقي كامل)</option>
                  <option value={5000}>5,000 كم (نصف تخليقي)</option>
                  <option value={3000}>3,000 كم (معدني)</option>
                  <option value={15000}>15,000 كم (ألماني ألترا)</option>
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">نوع العبوة:</label>
              <select
                value={packageType}
                onChange={(e) => setPackageType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="can_4L">جركن 4 لتر</option>
                <option value="can_1L">عبوة 1 لتر</option>
                <option value="can_5L">جركن 5 لتر</option>
                <option value="drum_liter">لتر من برميل</option>
                <option value="piece">قطعة</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">الوحدة النصية:</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="جركن، عبوة، قطعة"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">تنبيه النواقص عند:</label>
              <input
                type="number"
                min="1"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                الرصيد الأولي المتوفر <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">سعر الشراء / التكلفة (ج.م):</label>
              <input
                type="number"
                min="0"
                required
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">سعر البيع للجمهور (ج.م):</label>
              <input
                type="number"
                min="0"
                required
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div className="text-slate-600 font-medium">
              هامش الربح المتوقع في الوحدة:{' '}
              <strong className="text-emerald-700 font-mono text-sm">
                {(sellingPrice - costPrice).toLocaleString('ar-EG')} ج.م
              </strong>
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
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-md shadow-sky-600/20 active:scale-95 transition-all cursor-pointer"
              >
                {isSubmitting ? 'جاري الحفظ...' : 'حفظ الصنف في المخزن'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
