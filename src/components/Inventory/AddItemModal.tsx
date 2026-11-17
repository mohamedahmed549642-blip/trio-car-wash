import React, { useState, useMemo, useEffect } from 'react';
import { X, PackagePlus, Fuel, Plus, Edit2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductCategory, InventoryItem } from '../../types';

interface CategoryOption {
  id: string;
  label: string;
  defaultUnit: string;
  isCustom?: boolean;
}

const DEFAULT_CATEGORIES: CategoryOption[] = [
  { id: 'oil', label: '🛢️ زيت محرك', defaultUnit: 'جركن 4 لتر' },
  { id: 'filter', label: '⚙️ فلتر سيارة', defaultUnit: 'قطعة' },
  { id: 'fluid', label: '💧 سائل ردياتير / فرامل / باور', defaultUnit: 'جركن 4 لتر' },
  { id: 'wash_supply', label: '🧼 مستلزمات غسيل وصابون', defaultUnit: 'قطعة' },
  { id: 'accessory', label: '🌲 معطرات واكسسوارات', defaultUnit: 'قطعة' },
];

const DEFAULT_BRANDS: string[] = [
  'Shell',
  'Mobil',
  'TotalEnergies',
  'Castrol',
  'Motul',
  'Valvoline',
  'Liqui Moly',
  'Mannol',
  'Petronas',
  'Toyota OEM',
  'Hyundai / Kia OEM',
  'Areon',
  'Flamingo',
  'Abro',
  'K2',
  'Sonax',
  '3M',
  'Bosch',
  'Denso',
  'Ravenol',
  'Aisin',
];

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: InventoryItem | null;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, itemToEdit }) => {
  const { addNewItem, updateItem, inventory } = useApp();

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

  // Sync form state when editing an existing item or creating a new one
  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setBrand(itemToEdit.brand);
      setCategory(itemToEdit.category);
      setViscosity(itemToEdit.viscosity || '5W-40');
      setOilKmType(itemToEdit.oilKmType || 10000);
      setPackageType(itemToEdit.packageType || 'can_4L');
      setStockQuantity(itemToEdit.stockQuantity || 0);
      setMinStockAlert(itemToEdit.minStockAlert || 5);
      setCostPrice(itemToEdit.costPrice || 0);
      setSellingPrice(itemToEdit.sellingPrice || 0);
      setUnit(itemToEdit.unit || 'قطعة');
      setBarcode(itemToEdit.barcode || '');
    } else {
      setName('');
      setBrand('Shell');
      setCategory('oil');
      setViscosity('5W-40');
      setOilKmType(10000);
      setPackageType('can_4L');
      setStockQuantity(10);
      setMinStockAlert(5);
      setCostPrice(1500);
      setSellingPrice(1900);
      setUnit('جركن 4 لتر');
      setBarcode('');
    }
    setIsAddingCategory(false);
    setIsAddingBrand(false);
  }, [itemToEdit, isOpen]);

  // Custom Categories
  const [customCategories, setCustomCategories] = useState<CategoryOption[]>(() => {
    try {
      const saved = localStorage.getItem('trio_custom_categories');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Custom Brands
  const [customBrands, setCustomBrands] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('trio_custom_brands');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');

  // Merge default, inventory, and custom brands
  const allBrands = useMemo(() => {
    const fromInv = inventory.map((i) => i.brand?.trim()).filter(Boolean);
    const set = new Set<string>([...DEFAULT_BRANDS, ...fromInv, ...customBrands]);
    return Array.from(set);
  }, [inventory, customBrands]);

  // Merge default and custom categories
  const allCategories = useMemo(() => {
    return [...DEFAULT_CATEGORIES, ...customCategories];
  }, [customCategories]);

  const handleAddNewBrand = () => {
    const clean = newBrandName.trim();
    if (!clean) return;

    if (!allBrands.includes(clean)) {
      const updated = [...customBrands, clean];
      setCustomBrands(updated);
      localStorage.setItem('trio_custom_brands', JSON.stringify(updated));
    }
    setBrand(clean);
    setNewBrandName('');
    setIsAddingBrand(false);
  };

  const handleAddNewCategory = () => {
    const clean = newCategoryName.trim();
    if (!clean) return;

    const exists = allCategories.some(
      (c) => c.label.toLowerCase().includes(clean.toLowerCase())
    );
    if (exists) {
      alert('هذا التصنيف موجود بالفعل.');
      return;
    }

    const newCat: CategoryOption = {
      id: 'cat_' + Date.now(),
      label: '🏷️ ' + clean,
      defaultUnit: 'قطعة',
      isCustom: true,
    };

    const updated = [...customCategories, newCat];
    setCustomCategories(updated);
    localStorage.setItem('trio_custom_categories', JSON.stringify(updated));

    setCategory(newCat.id);
    setUnit(newCat.defaultUnit);
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('يرجى إدخال اسم الصنف.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (itemToEdit) {
        await updateItem({
          ...itemToEdit,
          name: name.trim(),
          brand: brand.trim(),
          category,
          viscosity: category === 'oil' ? viscosity : undefined,
          oilKmType: category === 'oil' ? oilKmType : undefined,
          packageType,
          stockQuantity: Number(stockQuantity) || 0,
          minStockAlert: Number(minStockAlert) || 0,
          costPrice: Number(costPrice) || 0,
          sellingPrice: Number(sellingPrice) || 0,
          unit,
          barcode: barcode.trim() || undefined,
        });
        alert('تم تعديل بيانات ورصيد الصنف بالمخزن مباشرة بنجاح!');
      } else {
        await addNewItem({
          name: name.trim(),
          brand: brand.trim(),
          category,
          viscosity: category === 'oil' ? viscosity : undefined,
          oilKmType: category === 'oil' ? oilKmType : undefined,
          packageType,
          stockQuantity: Number(stockQuantity) || 0,
          minStockAlert: Number(minStockAlert) || 0,
          costPrice: Number(costPrice) || 0,
          sellingPrice: Number(sellingPrice) || 0,
          unit,
          barcode: barcode.trim() || undefined,
        });
        alert('تمت إضافة الصنف الجديد إلى المخزن بنجاح!');
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء حفظ الصنف.');
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
              {itemToEdit ? <Edit2 className="w-5 h-5" /> : <PackagePlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-base">
                {itemToEdit ? 'تعديل بيانات ورصيد الصنف بالمخزن' : 'إضافة صنف جديد إلى المخزن'}
              </h3>
              <p className="text-xs text-slate-400">
                {itemToEdit
                  ? 'تعديل مباشر للكمية والأسعار والمواصفات بدون تسوية أو خصم'
                  : 'تسجيل نوع زيت جديد، فلاتر، سوائل أو مستلزمات'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700">تصنيف الصنف:</label>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(!isAddingCategory)}
                  className="text-sky-600 hover:text-sky-700 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer hover:underline"
                >
                  <Plus className="w-3 h-3" />
                  <span>{isAddingCategory ? 'إلغاء' : '+ إضافة تصنيف'}</span>
                </button>
              </div>

              {isAddingCategory ? (
                <div className="flex items-center gap-1.5 p-1 bg-sky-50 rounded-xl border border-sky-300 animate-in fade-in">
                  <input
                    type="text"
                    autoFocus
                    placeholder="اسم التصنيف الجديد (مثال: شحوم، أدوات تلميع)..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNewCategory();
                      }
                    }}
                    className="flex-1 bg-white border border-sky-300 rounded-lg px-2.5 py-1 text-slate-800 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewCategory}
                    className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    حفظ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCategory(false);
                      setNewCategoryName('');
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <select
                    value={category}
                    onChange={(e) => {
                      const selectedVal = e.target.value;
                      setCategory(selectedVal);
                      const found = allCategories.find((c) => c.id === selectedVal);
                      if (found) {
                        setUnit(found.defaultUnit);
                      } else if (selectedVal === 'oil') setUnit('جركن 4 لتر');
                      else setUnit('قطعة');
                    }}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <optgroup label="التصنيفات الأساسية">
                      {DEFAULT_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </optgroup>
                    {customCategories.length > 0 && (
                      <optgroup label="تصنيفات مخصصة مضافة">
                        {customCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.label}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(true)}
                    className="p-2 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-xl transition-colors cursor-pointer shrink-0"
                    title="إضافة تصنيف جديد"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Brand / Company Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700">الشركة / الماركة:</label>
                <button
                  type="button"
                  onClick={() => setIsAddingBrand(!isAddingBrand)}
                  className="text-sky-600 hover:text-sky-700 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer hover:underline"
                >
                  <Plus className="w-3 h-3" />
                  <span>{isAddingBrand ? 'إلغاء' : '+ إضافة شركة'}</span>
                </button>
              </div>

              {isAddingBrand ? (
                <div className="flex items-center gap-1.5 p-1 bg-sky-50 rounded-xl border border-sky-300 animate-in fade-in">
                  <input
                    type="text"
                    autoFocus
                    placeholder="اسم الشركة الجديدة (مثال: Ravenol, Bosch)..."
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNewBrand();
                      }
                    }}
                    className="flex-1 bg-white border border-sky-300 rounded-lg px-2.5 py-1 text-slate-800 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewBrand}
                    className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    حفظ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingBrand(false);
                      setNewBrandName('');
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    {allBrands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsAddingBrand(true)}
                    className="p-2 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-xl transition-colors cursor-pointer shrink-0"
                    title="إضافة شركة / ماركة جديدة للقائمة"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
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
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-md shadow-sky-600/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting
                  ? 'جاري الحفظ...'
                  : itemToEdit
                  ? 'حفظ التعديلات المباشرة 💾'
                  : 'حفظ الصنف في المخزن'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
