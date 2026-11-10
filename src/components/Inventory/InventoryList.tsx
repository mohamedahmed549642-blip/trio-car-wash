import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Minus,
  AlertTriangle,
  History,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Tag,
  CheckCircle2,
  PackagePlus,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InventoryItem, ProductCategory } from '../../types';
import { RestockModal } from './RestockModal';
import { ReduceStockModal } from './ReduceStockModal';
import { AddItemModal } from './AddItemModal';
import { MovementHistoryModal } from './MovementHistoryModal';

export const InventoryList: React.FC = () => {
  const { inventory, lowStockItems, isAdmin } = useApp();

  // Modals state
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isReduceOpen, setIsReduceOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [targetItem, setTargetItem] = useState<InventoryItem | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [showCostPrices, setShowCostPrices] = useState(isAdmin);

  // Quick action triggers
  const handleOpenRestock = (item?: InventoryItem) => {
    setTargetItem(item || null);
    setIsRestockOpen(true);
  };

  const handleOpenReduce = (item?: InventoryItem) => {
    setTargetItem(item || null);
    setIsReduceOpen(true);
  };

  // Inventory valuation stats
  const totalCostValue = useMemo(() => {
    return inventory.reduce((sum, item) => sum + item.costPrice * item.stockQuantity, 0);
  }, [inventory]);

  const totalRetailValue = useMemo(() => {
    return inventory.reduce((sum, item) => sum + item.sellingPrice * item.stockQuantity, 0);
  }, [inventory]);

  const expectedProfit = totalRetailValue - totalCostValue;

  // Filter items
  const filteredItems = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.viscosity && item.viscosity.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesLowStock = !onlyLowStock || item.stockQuantity <= item.minStockAlert;

      return matchesSearch && matchesCat && matchesLowStock;
    });
  }, [inventory, searchTerm, selectedCategory, onlyLowStock]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Items */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">إجمالي الأصناف بالمخزن</span>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {inventory.length}{' '}
              <span className="text-xs font-bold text-slate-400">صنف مسجل</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Low Stock Alert Card */}
        <div
          onClick={() => setOnlyLowStock(!onlyLowStock)}
          className={`p-5 rounded-2xl shadow-sm border cursor-pointer transition-all ${
            lowStockItems.length > 0
              ? 'bg-rose-50 border-rose-200 hover:bg-rose-100/80 ring-1 ring-rose-300'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-rose-700 block mb-1">
                تنبيه النواقص والحد الأدنى
              </span>
              <div className="text-2xl font-black text-rose-900 font-mono flex items-center gap-2">
                <span>{lowStockItems.length}</span>
                <span className="text-xs font-bold text-rose-600">
                  {lowStockItems.length > 0 ? 'أصناف أوشكت على النفاذ ⚠️' : 'كل الأصناف متوفرة ✨'}
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 3: Total Cost Value (Admin only or protected) */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-bold text-slate-500">قيمة المخزون (سعر التكلفة)</span>
              {isAdmin && (
                <button
                  onClick={() => setShowCostPrices(!showCostPrices)}
                  className="text-slate-400 hover:text-slate-600"
                  title="إظهار / إخفاء التكلفة"
                >
                  {showCostPrices ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {isAdmin && showCostPrices ? (
                `${totalCostValue.toLocaleString('ar-EG')} ج.م`
              ) : (
                <span className="text-slate-400 text-lg">•••••• (خاص بالإدارة)</span>
              )}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Expected Retail Value */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">
              القيمة الإجمالية بسعر البيع
            </span>
            <div className="text-2xl font-black text-emerald-700 font-mono">
              {totalRetailValue.toLocaleString('ar-EG')} ج.م
            </div>
            {isAdmin && showCostPrices && (
              <span className="text-[11px] font-bold text-emerald-600 block mt-0.5 font-mono">
                صافي الربح المتوقع: +{expectedProfit.toLocaleString('ar-EG')} ج.م
              </span>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Actions & Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900">إدارة المخزون والزيوت والمشتريات</h2>
            <p className="text-xs text-slate-500">
              أضف توريدات جديدة، قم بخصم استهلاك أو توالف، وراقب أرصدة الزيوت لحظياً
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleOpenRestock()}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة وتوريد رصيد (Restock)</span>
            </button>

            <button
              onClick={() => handleOpenReduce()}
              className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-md shadow-rose-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <Minus className="w-4 h-4" />
              <span>خصم أو تسوية يدوية (Reduce)</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setIsAddItemOpen(true)}
                className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-md shadow-sky-600/20 active:scale-95 transition-all cursor-pointer"
              >
                <PackagePlus className="w-4 h-4" />
                <span>إضافة صنف جديد</span>
              </button>
            )}

            <button
              onClick={() => setIsHistoryOpen(true)}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <History className="w-4 h-4" />
              <span>سجل الحركات 📜</span>
            </button>
          </div>
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="ابحث بالاسم، الماركة (Shell، Mobil، Total)، أو درجة اللزوجة (5W-40)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'oil', label: '🛢️ زيوت' },
              { id: 'filter', label: '⚙️ فلاتر' },
              { id: 'fluid', label: '💧 سوائل' },
              { id: 'wash_supply', label: '🧼 صابون ومغسلة' },
              { id: 'accessory', label: '🌲 معطرات' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Quick toggle for low stock */}
          <button
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              onlyLowStock
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>نواقص المخزن فقط ({lowStockItems.length})</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-3 px-4">الصنف والماركة</th>
                <th className="py-3 px-4 text-center">القسم واللزوجة</th>
                <th className="py-3 px-4 text-center">الرصيد المتاح</th>
                <th className="py-3 px-4 text-center">حد الأمان</th>
                {isAdmin && showCostPrices && (
                  <th className="py-3 px-4 text-left">سعر التكلفة</th>
                )}
                <th className="py-3 px-4 text-left">سعر البيع</th>
                <th className="py-3 px-4 text-center">حالة المخزون</th>
                <th className="py-3 px-4 text-center">إجراءات سريعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold">لا توجد أصناف مطابقة لمعايير البحث</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isOutOfStock = item.stockQuantity <= 0;
                  const isLowStock = !isOutOfStock && item.stockQuantity <= item.minStockAlert;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isLowStock ? 'bg-amber-50/50' : isOutOfStock ? 'bg-rose-50/50' : ''
                      }`}
                    >
                      {/* Name & Brand */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-semibold text-sky-700">{item.brand}</span>
                          <span>•</span>
                          <span>{item.unit}</span>
                          {item.barcode && <span className="font-mono text-slate-400">#{item.barcode}</span>}
                        </div>
                      </td>

                      {/* Category & Viscosity */}
                      <td className="py-3 px-4 text-center">
                        <div className="space-y-1">
                          {item.viscosity && (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 font-mono font-bold text-slate-800 text-[11px]">
                              {item.viscosity}
                            </span>
                          )}
                          {item.oilKmType && (
                            <div className="text-[10px] text-slate-500 font-mono">
                              {item.oilKmType.toLocaleString('ar-EG')} كم
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-3 px-4 text-center">
                        <div className="text-base font-black font-mono text-slate-900">
                          {item.stockQuantity}
                        </div>
                        <span className="text-[10px] text-slate-400">{item.unit}</span>
                      </td>

                      {/* Min Stock Alert */}
                      <td className="py-3 px-4 text-center font-mono text-slate-500">
                        {item.minStockAlert} {item.unit}
                      </td>

                      {/* Cost Price */}
                      {isAdmin && showCostPrices && (
                        <td className="py-3 px-4 text-left font-mono font-medium text-slate-600">
                          {item.costPrice.toLocaleString('ar-EG')} ج.م
                        </td>
                      )}

                      {/* Selling Price */}
                      <td className="py-3 px-4 text-left font-mono font-bold text-slate-900 text-sm">
                        {item.sellingPrice.toLocaleString('ar-EG')} ج.م
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4 text-center">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px]">
                            نفد الرصيد ⚠️
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-[11px] animate-pulse">
                            نواقص (طلب توريد)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                            متوفر بوفيرة ✨
                          </span>
                        )}
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenRestock(item)}
                            title="إضافة وتوريد رصيد"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer flex items-center gap-1 font-bold text-[11px]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>توريد</span>
                          </button>

                          <button
                            onClick={() => handleOpenReduce(item)}
                            title="خصم أو تسوية يدوية"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer flex items-center gap-1 font-bold text-[11px]"
                          >
                            <Minus className="w-3.5 h-3.5" />
                            <span>خصم</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <RestockModal
        isOpen={isRestockOpen}
        onClose={() => setIsRestockOpen(false)}
        preselectedItem={targetItem}
      />
      <ReduceStockModal
        isOpen={isReduceOpen}
        onClose={() => setIsReduceOpen(false)}
        preselectedItem={targetItem}
      />
      <AddItemModal isOpen={isAddItemOpen} onClose={() => setIsAddItemOpen(false)} />
      <MovementHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
    </div>
  );
};
