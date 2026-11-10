import React, { useState } from 'react';
import { X, History, ArrowDownRight, ArrowUpRight, Filter, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';

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
    const matchesSearch =
      mov.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mov.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mov.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || mov.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">سجل حركات المخزن والتوريدات والخصم</h3>
              <p className="text-xs text-slate-400">
                متابعة دقيقة لكل عملية إضافة أو سحب أو استهلاك للزيوت والفلاتر
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
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

          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
            {[
              { id: 'all', label: 'جميع الحركات' },
              { id: 'restock', label: '➕ توريدات جديدة' },
              { id: 'service_usage', label: '🚗 استخدام صيانة' },
              { id: 'adjustment', label: '⚖️ تسويات' },
              { id: 'waste', label: '⚠️ توالف' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTypeFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  typeFilter === f.id
                    ? 'bg-slate-900 text-white'
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
            <div className="text-center py-12 text-slate-500">
              <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold">لا توجد حركات مخزن مسجلة مطابقة للبحث</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">التاريخ والوقت</th>
                    <th className="py-2.5 px-3">الصنف</th>
                    <th className="py-2.5 px-3 text-center">نوع الحركة</th>
                    <th className="py-2.5 px-3 text-center">التغيير</th>
                    <th className="py-2.5 px-3 text-center">الرصيد بعد الحركة</th>
                    <th className="py-2.5 px-3">البيان والسبب</th>
                    <th className="py-2.5 px-3">المسؤول</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMovements.map((mov) => {
                    const isPositive = mov.quantityChange > 0;
                    return (
                      <tr key={mov.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 text-slate-500 font-mono">
                          {new Date(mov.createdAt).toLocaleDateString('ar-EG', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{mov.itemName}</td>
                        <td className="py-2.5 px-3 text-center">
                          {mov.type === 'restock' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                              <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                              توريد
                            </span>
                          )}
                          {mov.type === 'service_usage' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-[11px]">
                              <ArrowDownRight className="w-3 h-3 text-sky-600" />
                              صيانة
                            </span>
                          )}
                          {mov.type === 'adjustment' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                              تسوية
                            </span>
                          )}
                          {mov.type === 'waste' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px]">
                              تالف
                            </span>
                          )}
                        </td>
                        <td
                          className={`py-2.5 px-3 text-center font-mono font-black text-sm ${
                            isPositive ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isPositive ? `+${mov.quantityChange}` : mov.quantityChange}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">
                          {mov.newStock}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <div>{mov.reason}</div>
                          {mov.supplier && (
                            <div className="text-[10px] text-slate-400">المورد: {mov.supplier}</div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 font-medium">{mov.createdBy}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 text-left">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
