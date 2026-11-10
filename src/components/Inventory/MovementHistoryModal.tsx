import React, { useState } from 'react';
import {
  X,
  History,
  ArrowDownRight,
  ArrowUpRight,
  Search,
  AlertTriangle,
  Scale,
  MinusCircle,
  PlusCircle,
  ShoppingCart,
  Wrench,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StockMovementType } from '../../types';

interface MovementHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MovementHistoryModal: React.FC<MovementHistoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { stockMovements } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  if (!isOpen) return null;

  const filteredMovements = stockMovements.filter((mov) => {
    const itemName = mov.itemName || '';
    const reason = mov.reason || '';
    const createdBy = mov.createdBy || '';
    const movType = mov.type || '';

    const matchesSearch =
      itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      createdBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      typeFilter === 'all' ||
      movType === typeFilter ||
      (typeFilter === 'adjustment' && (movType === 'adjustment' || movType === 'deduction')) ||
      (typeFilter === 'deduction' && (movType === 'deduction' || movType === 'adjustment'));

    return matchesSearch && matchesType;
  });

  const renderMovementBadge = (type: StockMovementType | string | undefined, qtyChange: number) => {
    switch (type) {
      case 'deduction':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-orange-900 border border-orange-200 font-bold text-[11px]">
            <ArrowDownRight className="w-3.5 h-3.5 text-orange-600" />
            <span>خصم يدوي</span>
          </span>
        );
      case 'adjustment':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px]">
            <Scale className="w-3.5 h-3.5 text-amber-600" />
            <span>تسوية جردية</span>
          </span>
        );
      case 'restock':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px]">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            <span>توريد بضاعة</span>
          </span>
        );
      case 'service_usage':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-300 font-bold text-[11px]">
            <Wrench className="w-3.5 h-3.5 text-sky-600" />
            <span>صيانة وغسيل</span>
          </span>
        );
      case 'waste':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 font-bold text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>تالف وهالك</span>
          </span>
        );
      case 'sale':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-300 font-bold text-[11px]">
            <ShoppingCart className="w-3.5 h-3.5 text-purple-600" />
            <span>بيع مباشر</span>
          </span>
        );
      default:
        // Graceful fallback for any missing or custom type
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] border ${
              qtyChange < 0
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}
          >
            {qtyChange < 0 ? (
              <>
                <ArrowDownRight className="w-3.5 h-3.5 text-amber-600" />
                <span>خصم / تسوية</span>
              </>
            ) : (
              <>
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                <span>توريد وإضافة</span>
              </>
            )}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">سجل حركات المخزن (توريد • خصم • تسوية • صيانة)</h3>
              <p className="text-xs text-slate-400">
                متابعة دقيقة لكل عملية إضافة أو سحب أو استهلاك للزيوت والفلاتر مع التوقيت والمسؤول
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="بحث باسم الصنف أو السبب أو المسؤول..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl pr-9 pl-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            {[
              { id: 'all', label: 'جميع الحركات' },
              { id: 'restock', label: '➕ توريدات' },
              { id: 'deduction', label: '🔻 خصم يدوي' },
              { id: 'adjustment', label: '⚖️ تسويات جردية' },
              { id: 'service_usage', label: '🚗 صيانة وغسيل' },
              { id: 'waste', label: '⚠️ توالف' },
              { id: 'sale', label: '🛒 مبيعات' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTypeFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  typeFilter === f.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Movements Table */}
        <div className="max-h-[60vh] overflow-y-auto p-4 text-xs">
          {filteredMovements.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-sm text-slate-600">لا توجد حركات مخزن مسجلة مطابقة للبحث</p>
              <p className="text-xs text-slate-400 mt-0.5">يمكنك إضافة حركة خصم أو تسوية أو توريد من صفحة المخزن</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-3">التاريخ والوقت</th>
                    <th className="py-3 px-3">اسم الصنف</th>
                    <th className="py-3 px-3 text-center">نوع الحركة</th>
                    <th className="py-3 px-3 text-center">الكمية والتغيير</th>
                    <th className="py-3 px-3 text-center">الرصيد بعد الحركة</th>
                    <th className="py-3 px-3">البيان / سبب الحركة</th>
                    <th className="py-3 px-3">المسؤول</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMovements.map((mov) => {
                    const isPositive = mov.quantityChange > 0;
                    return (
                      <tr key={mov.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                          {new Date(mov.createdAt).toLocaleDateString('ar-EG', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">{mov.itemName}</td>
                        <td className="py-3 px-3 text-center">
                          {renderMovementBadge(mov.type, mov.quantityChange)}
                        </td>
                        <td
                          className={`py-3 px-3 text-center font-mono font-black text-sm ${
                            isPositive ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isPositive ? `+${mov.quantityChange}` : mov.quantityChange}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                          {mov.newStock}
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          <div className="font-medium">{mov.reason || 'بدون بيان'}</div>
                          {mov.supplier && (
                            <div className="text-[10px] text-slate-400 mt-0.5">المورد: {mov.supplier}</div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-medium">
                          {mov.createdBy || 'النظام'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            إجمالي الحركات المسجلة: <strong>{filteredMovements.length}</strong> حركة
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
