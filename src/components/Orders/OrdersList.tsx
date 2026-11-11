import React, { useState } from 'react';
import {
  FileText,
  Search,
  Share2,
  Printer,
  Calendar,
  Gauge,
  Car,
  Phone,
  Bell,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ServiceOrder } from '../../types';
import { ReceiptModal } from '../POS/ReceiptModal';
import {
  generateWhatsAppInvoiceMessage,
  generateOilDueReminderMessage,
  getWhatsAppDirectUrl,
} from '../../services/whatsapp';

export const OrdersList: React.FC = () => {
  const { orders, settings } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<ServiceOrder | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'all_orders' | 'oil_reminders'>('all_orders');

  const filteredOrders = orders.filter((o) => {
    return (
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.carModel.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Filter orders that have oil change information for the reminder tab
  const oilOrders = orders.filter((o) => o.nextOilChangeOdometer || o.nextOilChangeDate);

  const handleSendOrderWhatsApp = (order: ServiceOrder) => {
    if (!order.customerPhone) {
      alert('لا يوجد رقم هاتف مسجل لهذا العميل.');
      return;
    }
    const message = generateWhatsAppInvoiceMessage(order, settings);
    const url = getWhatsAppDirectUrl(order.customerPhone, message);
    window.open(url, '_blank');
  };

  const handleSendReminderWhatsApp = (order: ServiceOrder) => {
    if (!order.customerPhone) {
      alert('لا يوجد رقم هاتف مسجل لهذا العميل.');
      return;
    }
    const message = generateOilDueReminderMessage(order, settings);
    const url = getWhatsAppDirectUrl(order.customerPhone, message);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Subtab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('all_orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeSubTab === 'all_orders'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>سجل الفواتير وأوامر التشغيل ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('oil_reminders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeSubTab === 'oil_reminders'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>مركز تذكيرات غيار الزيت الدوري ({oilOrders.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="بحث برقم اللوحة، الموديل، التليفون..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-slate-800 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 1. All Orders Tab */}
      {activeSubTab === 'all_orders' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p className="font-bold text-sm text-slate-600">لا توجد فواتير مسجلة حتى الآن</p>
              <p>قم بإنشاء أمر تشغيل جديد من زر "أمر غسيل وزيت جديد"</p>
            </div>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">رقم الفاتورة</th>
                    <th className="py-3 px-4">السيارة واللوحة</th>
                    <th className="py-3 px-4">العميل والهاتف</th>
                    <th className="py-3 px-4">الخدمات والزيوت المنجزة</th>
                    <th className="py-3 px-4 text-left">الإجمالي</th>
                    <th className="py-3 px-4 text-center">طريقة الدفع</th>
                    <th className="py-3 px-4 text-center">التاريخ</th>
                    <th className="py-3 px-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-sky-700">
                        #{ord.orderNumber}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{ord.carModel}</div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono font-bold text-[11px] text-slate-800">
                          {ord.plateNumber}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{ord.customerName || 'عميل نقدي'}</div>
                        {ord.customerPhone && (
                          <div className="font-mono text-slate-500 text-[11px]">{ord.customerPhone}</div>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="space-y-0.5">
                          {ord.services.map((s, idx) => (
                            <div key={idx} className="text-slate-700 font-medium truncate">
                              • {s.serviceName}
                            </div>
                          ))}
                          {ord.products.map((p, idx) => (
                            <div key={idx} className="text-amber-800 font-medium truncate text-[11px]">
                              • {p.itemName} ({p.quantity})
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-left font-mono font-black text-slate-900 text-sm">
                        {ord.total.toLocaleString('ar-EG')} ج.م
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                          {ord.paymentMethod === 'cash'
                            ? 'كاش 💵'
                            : ord.paymentMethod === 'instapay'
                            ? 'إنستاباي ⚡'
                            : ord.paymentMethod === 'vodafone_cash'
                            ? 'فودافون 📱'
                            : 'فيزا 💳'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center text-slate-500 font-mono text-[11px]">
                        {new Date(ord.createdAt).toLocaleDateString('ar-EG', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedOrderForReceipt(ord)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="عرض وطباعة الفاتورة"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* WhatsApp sending temporarily commented per user request */}
                          {/* 
                          <button
                            onClick={() => handleSendOrderWhatsApp(ord)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors cursor-pointer"
                            title="إرسال الفاتورة عبر واتساب"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. Oil Change Reminders Center */}
      {activeSubTab === 'oil_reminders' && (
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <strong className="block text-sm font-black">مركز تذكير العملاء بمواعيد غيار الزيت القادمة</strong>
                <span>
                  يمكنك بضغطة زر إرسال رسالة واتساب رسمية شيك للعميل لتذكيره بزيارة المركز لتغيير الزيت والفلاتر.
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {oilOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between text-xs space-y-4 hover:border-amber-400 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-mono font-bold text-slate-800">
                      {ord.plateNumber}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">#{ord.orderNumber}</span>
                  </div>

                  <h4 className="font-black text-sm text-slate-900 mb-1">{ord.carModel}</h4>
                  <p className="text-slate-600 font-bold mb-3">
                    العميل: {ord.customerName || 'عميل كريم'} {ord.customerPhone && `(${ord.customerPhone})`}
                  </p>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-slate-700">
                    {ord.currentOdometer && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">العداد عند آخر غيار:</span>
                        <span className="font-mono font-bold">{ord.currentOdometer.toLocaleString('ar-EG')} كم</span>
                      </div>
                    )}
                    {ord.nextOilChangeOdometer && (
                      <div className="flex justify-between text-amber-900 font-bold">
                        <span>موعد الغيار القادم:</span>
                        <span className="font-mono text-amber-700 font-black">
                          {ord.nextOilChangeOdometer.toLocaleString('ar-EG')} كم
                        </span>
                      </div>
                    )}
                    {ord.nextOilChangeDate && (
                      <div className="flex justify-between text-slate-600">
                        <span>التاريخ المقترح:</span>
                        <span className="font-medium">{ord.nextOilChangeDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* WhatsApp reminder button temporarily commented per user request */}
                {/* 
                <button
                  onClick={() => handleSendReminderWhatsApp(ord)}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>إرسال تذكير واتساب مباشر 📱</span>
                </button>
                */}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        order={selectedOrderForReceipt}
        isOpen={!!selectedOrderForReceipt}
        onClose={() => setSelectedOrderForReceipt(null)}
      />
    </div>
  );
};
