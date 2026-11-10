import React, { useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  BarChart2,
  PieChart,
  Car,
  Fuel,
  Receipt,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReportsDashboard: React.FC = () => {
  const { orders, expenses, inventory, isAdmin } = useApp();

  // Financial calculations
  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  const totalCostOfGoodsSold = useMemo(() => {
    return orders.reduce((sum, o) => {
      const orderProductsCost = o.products.reduce((pSum, p) => pSum + (p.costPrice || 0) * p.quantity, 0);
      return sum + orderProductsCost;
    }, 0);
  }, [orders]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const netProfit = totalRevenue - totalCostOfGoodsSold - totalExpenses;

  // Payment methods breakdown
  const paymentBreakdown = useMemo(() => {
    const stats = { cash: 0, instapay: 0, vodafone_cash: 0, visa: 0 };
    orders.forEach((o) => {
      if (stats[o.paymentMethod] !== undefined) {
        stats[o.paymentMethod] += o.total;
      }
    });
    return stats;
  }, [orders]);

  // Vehicle size distribution
  const vehicleStats = useMemo(() => {
    const stats: Record<string, number> = { sedan: 0, suv: 0, van: 0, motorcycle: 0 };
    orders.forEach((o) => {
      stats[o.vehicleSize] = (stats[o.vehicleSize] || 0) + 1;
    });
    return stats;
  }, [orders]);

  // Top selling products
  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; count: number; revenue: number }> = {};
    orders.forEach((o) => {
      o.products.forEach((p) => {
        if (!map[p.itemId]) {
          map[p.itemId] = { name: p.itemName, count: 0, revenue: 0 };
        }
        map[p.itemId].count += p.quantity;
        map[p.itemId].revenue += p.totalPrice;
      });
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [orders]);

  // Top requested wash services
  const topServices = useMemo(() => {
    const map: Record<string, { name: string; count: number }> = {};
    orders.forEach((o) => {
      o.services.forEach((s) => {
        if (!map[s.serviceId]) {
          map[s.serviceId] = { name: s.serviceName, count: 0 };
        }
        map[s.serviceId].count += 1;
      });
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [orders]);

  if (!isAdmin) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center text-xs">
        <p className="font-bold text-slate-700 text-base mb-1">عذراً، هذه الصفحة خاصة بمدير المركز فقط.</p>
        <p className="text-slate-400">يمكنك التبديل إلى حساب المدير من القائمة العلوية.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 to-sky-950 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <h1 className="text-xl font-black mb-1">لوحة الأرباح والتقارير المالية المتقدمة</h1>
        <p className="text-xs text-slate-400">
          تحليل شامل لإيرادات المغسلة وتغيير الزيوت، تكلفة البضاعة المباعة، وصافي الأرباح
        </p>
      </div>

      {/* Main Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Revenue */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <span className="text-xs font-bold text-slate-500 block mb-1">إجمالي الإيرادات (المبيعات)</span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {totalRevenue.toLocaleString('ar-EG')} ج.م
          </div>
          <p className="text-[11px] text-slate-400 mt-1">من إجمالي {orders.length} أمر تشغيل</p>
        </div>

        {/* KPI 2: COGS */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <span className="text-xs font-bold text-slate-500 block mb-1">تكلفة الزيوت والمستلزمات المباعة</span>
          <div className="text-2xl font-black text-amber-700 font-mono">
            {totalCostOfGoodsSold.toLocaleString('ar-EG')} ج.م
          </div>
          <p className="text-[11px] text-slate-400 mt-1">سعر شراء البضاعة المستهلكة</p>
        </div>

        {/* KPI 3: Total Expenses */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <span className="text-xs font-bold text-slate-500 block mb-1">المصروفات النثرية والتشغيلية</span>
          <div className="text-2xl font-black text-rose-600 font-mono">
            {totalExpenses.toLocaleString('ar-EG')} ج.م
          </div>
          <p className="text-[11px] text-slate-400 mt-1">شاي وعمالة وصيانة ومستلزمات</p>
        </div>

        {/* KPI 4: Net Profit */}
        <div className="bg-gradient-to-tr from-emerald-600 to-teal-600 text-white p-5 rounded-2xl shadow-lg shadow-emerald-600/20">
          <span className="text-xs font-bold text-emerald-100 block mb-1">صافي الأرباح المحققة ✨</span>
          <div className="text-2xl font-black font-mono">
            {netProfit.toLocaleString('ar-EG')} ج.م
          </div>
          <p className="text-[11px] text-emerald-200 mt-1">بعد خصم التكلفة والمصروفات</p>
        </div>
      </div>

      {/* Middle Grid: Payment Methods & Vehicle Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Payment Methods */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-extrabold text-sm text-slate-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>توزيع طرق الدفع</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <span className="font-bold text-slate-800">💵 كاش ونقدي:</span>
              <span className="font-mono font-black text-slate-900">
                {paymentBreakdown.cash.toLocaleString('ar-EG')} ج.م
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-sky-50">
              <span className="font-bold text-sky-900">⚡ تحويلات إنستاباي InstaPay:</span>
              <span className="font-mono font-black text-sky-950">
                {paymentBreakdown.instapay.toLocaleString('ar-EG')} ج.م
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50">
              <span className="font-bold text-rose-900">📱 فودافون كاش:</span>
              <span className="font-mono font-black text-rose-950">
                {paymentBreakdown.vodafone_cash.toLocaleString('ar-EG')} ج.م
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50">
              <span className="font-bold text-indigo-900">💳 فيزا وبطاقات بنكية:</span>
              <span className="font-mono font-black text-indigo-950">
                {paymentBreakdown.visa.toLocaleString('ar-EG')} ج.م
              </span>
            </div>
          </div>
        </div>

        {/* Vehicle Distribution */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-extrabold text-sm text-slate-900 mb-4 flex items-center gap-2">
            <Car className="w-4 h-4 text-sky-600" />
            <span>توزيع أنواع وأحجام السيارات</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <span className="font-bold text-slate-800">🚗 سيارات سيدان وهاتشباك:</span>
              <span className="font-mono font-bold text-slate-900">{vehicleStats.sedan} سيارة</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <span className="font-bold text-slate-800">🚙 دفع رباعي وSUV وكروس أوفر:</span>
              <span className="font-mono font-bold text-slate-900">{vehicleStats.suv} سيارة</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <span className="font-bold text-slate-800">🚐 فان وميكروباص ونقل:</span>
              <span className="font-mono font-bold text-slate-900">{vehicleStats.van} سيارة</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <span className="font-bold text-slate-800">🏍️ دراجات نارية وموتوسيكل:</span>
              <span className="font-mono font-bold text-slate-900">{vehicleStats.motorcycle}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Top Selling Oils and Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Top Oils */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-extrabold text-sm text-slate-900 mb-3 flex items-center gap-2">
            <Fuel className="w-4 h-4 text-amber-600" />
            <span>أكثر الزيوت والمستلزمات مبيعاً</span>
          </h3>

          {topProducts.length === 0 ? (
            <p className="text-slate-400 py-4 text-center">لا توجد بيانات مبيعات كافية حتى الآن.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {topProducts.map((p, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="font-bold text-slate-800 truncate max-w-[220px]">{p.name}</div>
                  <div className="text-left font-mono">
                    <span className="font-black text-emerald-700">{p.count} عبوة</span>
                    <span className="text-[11px] text-slate-400 block">
                      ({p.revenue.toLocaleString('ar-EG')} ج.م)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Services */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-extrabold text-sm text-slate-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-600" />
            <span>أكثر باقات الغسيل والخدمات طلباً</span>
          </h3>

          {topServices.length === 0 ? (
            <p className="text-slate-400 py-4 text-center">لا توجد بيانات خدمات مسجلة حتى الآن.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {topServices.map((s, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="font-bold text-slate-800">{s.name}</div>
                  <span className="font-mono font-black text-sky-700">{s.count} مرة</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
