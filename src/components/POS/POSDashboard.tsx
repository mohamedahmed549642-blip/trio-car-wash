import React, { useState } from 'react';
import {
  Car,
  Sparkles,
  Search,
  Plus,
  Clock,
  Printer,
  Share2,
  CheckCircle2,
  Fuel,
  Receipt,
  AlertTriangle,
  ChevronLeft,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ServiceOrder } from '../../types';
import { ReceiptModal } from './ReceiptModal';
import {
  generateWhatsAppInvoiceMessage,
  getWhatsAppDirectUrl,
} from '../../services/whatsapp';

interface POSDashboardProps {
  onOpenNewOrder: () => void;
}

export const POSDashboard: React.FC<POSDashboardProps> = ({ onOpenNewOrder }) => {
  const { orders, currentShift, lowStockItems, settings } = useApp();

  const [searchPlate, setSearchPlate] = useState('');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<ServiceOrder | null>(null);

  // Filter today's orders
  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayStr));

  // Orders matching quick plate search
  const displayedOrders = searchPlate.trim()
    ? orders.filter(
      (o) =>
        o.plateNumber.toLowerCase().includes(searchPlate.toLowerCase()) ||
        o.carModel.toLowerCase().includes(searchPlate.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchPlate.toLowerCase())
    )
    : todayOrders.length > 0
      ? todayOrders
      : orders.slice(0, 10);

  const handleSendWhatsApp = (order: ServiceOrder) => {
    if (!order.customerPhone) {
      alert('لا يوجد رقم هاتف مسجل لهذا العميل.');
      return;
    }
    const message = generateWhatsAppInvoiceMessage(order, settings);
    const url = getWhatsAppDirectUrl(order.customerPhone, message);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Shift Mandatory Warning Banner */}
      {!currentShift && (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-amber-950 shadow-sm animate-pulse">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-amber-500 text-white rounded-2xl shrink-0 mt-0.5 shadow-md shadow-amber-500/30">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 font-black text-[10px]">
                  مطلوب أولاً
                </span>
                <strong className="text-sm font-black text-amber-900">
                  الوردية مغلقة حالياً — يجب فتح وردية وتحديد عهدة الخزينة قبل بدء أي عمل!
                </strong>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                وفقاً لقواعد الكاشير المحاسبية، لا يسمح النظام بتسجيل غسيل سيارات أو صرف زيوت إلا بوجود وردية نشطة.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenNewOrder}
            className="px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black text-xs shadow-lg shadow-amber-600/25 active:scale-95 transition-all cursor-pointer shrink-0 flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>فتح الوردية الآن 🔓</span>
          </button>
        </div>
      )}

      {/* Top Banner / Call to Action */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>نظام نقاط البيع والكاشير الميداني السريع</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              أوامر غسيل السيارات وتغيير الزيوت
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              سجل بيانات السيارة واللوحة، اختر باقة الغسيل والزيوت الأصلية، واحسب الفاتورة مع الخصم التلقائي من المخزن.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onOpenNewOrder}
              className={`py-4 px-6 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 ${currentShift
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-emerald-500/30'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/30 ring-2 ring-amber-300'
                }`}
            >
              {currentShift ? (
                <>
                  <Plus className="w-5 h-5 stroke-[3]" />
                  <span>أمر تشغيل سيارة جديد (كاشير) 🚀</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>فتح الوردية وبدء أمر جديد 🔓</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Counters strip */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">أوامر اليوم:</span>
            <span className="text-xl font-black text-white font-mono">{todayOrders.length}</span>
            <span className="text-[11px] text-slate-400 mr-1">سيارة</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">إيراد اليوم:</span>
            <span className="text-xl font-black text-emerald-400 font-mono">
              {todayOrders.reduce((sum, o) => sum + o.total, 0).toLocaleString('ar-EG')}
            </span>
            <span className="text-[11px] text-emerald-300 mr-1">ج.م</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">درج كاش الوردية:</span>
            <span className="text-xl font-black text-sky-400 font-mono">
              {currentShift ? `${currentShift.expectedCash.toLocaleString('ar-EG')} ج.م` : 'مغلقة'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">نواقص المخزن:</span>
            <span className={`text-xl font-black font-mono ${lowStockItems.length > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {lowStockItems.length}
            </span>
            <span className="text-[11px] text-slate-400 mr-1">صنف يحتاج توريد</span>
          </div>
        </div>
      </div>

      {/* Quick Search and Returning Customer Lookup */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="بحث سريع برقم اللوحة أو الموديل (مثال: ق ج د 1234 أو كيا)..."
              value={searchPlate}
              onChange={(e) => setSearchPlate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pr-9 pl-3 py-2 text-slate-800 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="text-slate-500 text-[11px]">
          {searchPlate ? (
            <span>نتائج البحث عن "{searchPlate}": {displayedOrders.length} أمر</span>
          ) : (
            <span>عرض آخر الأوامر والسيارات المسجلة</span>
          )}
        </div>
      </div>

      {/* Orders Grid / Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-black text-slate-900 flex items-center justify-between">
          <span>السيارات وأوامر الصيانة الأخيرة ({displayedOrders.length})</span>
          {todayOrders.length > 0 && !searchPlate && (
            <span className="text-xs font-bold text-sky-700 font-mono">اليوم فقط</span>
          )}
        </h2>

        {displayedOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center text-xs text-slate-400">
            <Car className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-sm text-slate-700 mb-1">لا توجد أوامر مطابقة حتى الآن</p>
            <p className="text-slate-400 mb-4">
              اضغط على زر "أمر تشغيل سيارة جديد" لبدء تسجيل أول سيارة!
            </p>
            <button
              onClick={onOpenNewOrder}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs active:scale-95 transition-all cursor-pointer"
            >
              تسجيل أول أمر تشغيل الآن 🚀
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between text-xs hover:shadow-md transition-all space-y-4"
              >
                <div>
                  {/* Top line: Plate + order number */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-1 bg-slate-900 text-white rounded-lg font-mono font-bold tracking-wider text-xs shadow-sm">
                      {ord.plateNumber}
                    </span>
                    <span className="font-mono text-slate-400 font-bold text-[11px]">
                      #{ord.orderNumber}
                    </span>
                  </div>

                  <h3 className="font-black text-sm text-slate-900 mb-1">{ord.carModel}</h3>
                  <div className="text-slate-500 text-[11px] flex items-center justify-between mb-3">
                    <span>العميل: <strong className="text-slate-700">{ord.customerName || 'عميل نقدي'}</strong></span>
                    <span className="font-mono text-slate-400">
                      {new Date(ord.createdAt).toLocaleTimeString('ar-EG', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Services & Oil used preview */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-slate-700">
                    {ord.services.map((s, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px]">
                        <span className="font-medium text-slate-800 truncate">• {s.serviceName}</span>
                        <span className="font-mono font-bold text-slate-900">{s.price} ج.م</span>
                      </div>
                    ))}
                    {ord.products.map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px] text-amber-900">
                        <span className="font-bold truncate">🛢️ {p.itemName} ({p.quantity})</span>
                        <span className="font-mono font-bold">{p.totalPrice} ج.م</span>
                      </div>
                    ))}
                  </div>

                  {/* Oil odometer notice if applicable */}
                  {ord.nextOilChangeOdometer && (
                    <div className="mt-2 text-[10px] text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 flex items-center justify-between font-medium">
                      <span>تغيير الزيت القادم عند:</span>
                      <strong className="font-mono font-bold">{ord.nextOilChangeOdometer.toLocaleString('ar-EG')} كم</strong>
                    </div>
                  )}
                </div>

                {/* Bottom line: Total & Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">الإجمالي المدفوع:</span>
                    <span className="text-base font-black text-slate-900 font-mono">
                      {ord.total.toLocaleString('ar-EG')} ج.م
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedReceiptOrder(ord)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                      title="عرض وطباعة الفاتورة"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {/* WhatsApp sending temporarily commented per user request */}
                    {/* 
                    <button
                      onClick={() => handleSendWhatsApp(ord)}
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors cursor-pointer"
                      title="مشاركة الفاتورة على واتساب"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        order={selectedReceiptOrder}
        isOpen={!!selectedReceiptOrder}
        onClose={() => setSelectedReceiptOrder(null)}
      />
    </div>
  );
};
