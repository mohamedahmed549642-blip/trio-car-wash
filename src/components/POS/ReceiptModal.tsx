import React, { useState, useEffect } from 'react';
import {
  Printer,
  Share2,
  X,
  CheckCircle2,
  Phone,
  MapPin,
  Calendar,
  Gauge,
  Car,
  Copy,
  Check,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { ServiceOrder } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  generateWhatsAppInvoiceMessage,
  getWhatsAppDirectUrl,
  getWhatsAppWebUrl,
} from '../../services/whatsapp';

interface ReceiptModalProps {
  order: ServiceOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, isOpen, onClose }) => {
  const { settings } = useApp();
  const [copied, setCopied] = useState(false);
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (order?.customerPhone) {
      setPhone(order.customerPhone);
    } else {
      setPhone('');
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = (useWeb: boolean = false) => {
    const targetPhone = phone.trim() || order.customerPhone?.trim() || '';
    if (!targetPhone) {
      alert('يرجى إدخال أو التأكد من رقم هاتف العميل لإرسال الرسالة.');
      return;
    }
    const message = generateWhatsAppInvoiceMessage(order, settings);
    const url = useWeb
      ? getWhatsAppWebUrl(targetPhone, message)
      : getWhatsAppDirectUrl(targetPhone, message);
    window.open(url, '_blank');
  };

  const handleCopyMessage = () => {
    const message = generateWhatsAppInvoiceMessage(order, settings);
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const paymentMethodLabel: Record<string, string> = {
    cash: 'كاش 💵',
    instapay: 'إنستاباي InstaPay ⚡',
    vodafone_cash: 'فودافون كاش 📱',
    visa: 'فيزا / بطاقة بنكية 💳',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 print:shadow-none print:border-none print:w-full print:max-w-none">
        {/* Top actions (hidden in print) */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-base">تم حفظ أمر التشغيل بنجاح</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons & WhatsApp Controls (hidden in print) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3 print:hidden">
          {/* Customer Phone Input & Quick Status */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700">
                رقم هاتف العميل (واتساب):
              </label>
              {order.customerName && (
                <span className="text-[10px] text-slate-500 font-medium">
                  {order.customerName}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-slate-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-sm">
              <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
              <input
                type="tel"
                dir="ltr"
                placeholder="01012345678 (يدعم الأرقام الإنجليزية والعربية)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs sm:text-sm text-slate-800 font-mono font-bold outline-none bg-transparent"
              />
              {phone && (
                <button
                  type="button"
                  onClick={() => setPhone('')}
                  className="text-slate-400 hover:text-slate-600 text-xs px-1"
                  title="مسح الرقم"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSendWhatsApp(false)}
              className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
              title="إرسال عبر تطبيق واتساب المباشر (للهواتف والكمبيوتر)"
            >
              <Share2 className="w-4 h-4" />
              <span>إرسال واتساب 📱</span>
            </button>

            <button
              onClick={() => handleSendWhatsApp(true)}
              className="inline-flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs sm:text-sm shadow-md shadow-teal-600/20 active:scale-95 transition-all cursor-pointer"
              title="فتح واتساب ويب في المتصفح مباشرة"
            >
              <ExternalLink className="w-4 h-4" />
              <span>واتساب ويب 🌐</span>
            </button>

            <button
              onClick={handleCopyMessage}
              className="inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-3 rounded-xl text-xs sm:text-sm border border-slate-300 active:scale-95 transition-all cursor-pointer"
              title="نسخ نص الفاتورة بالكامل للصقه يدوياً في أي محادثة"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
              <span>{copied ? 'تم النسخ! ✨' : 'نسخ النص 📋'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-3 rounded-xl text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer"
              title="طباعة إيصال حراري"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة 🖨️</span>
            </button>
          </div>

          {/* Quick Helpful Tip */}
          <div className="text-[11px] text-slate-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200 leading-relaxed text-right flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-950 block text-xs">
                💡 طرق الإرسال المتاحة:
              </span>
              <span className="text-amber-900 block">
                • <strong>إرسال واتساب:</strong> يفتح محادثة العميل فوراً بتطبيق واتساب أو الرابط المباشر.
              </span>
              <span className="text-amber-900 block">
                • <strong>واتساب ويب:</strong> مخصص لمن يعمل من متصفح الكمبيوتر بفتح WhatsApp Web فوراً.
              </span>
              <span className="text-amber-900 block">
                • <strong>نسخ النص:</strong> لنسخ الفاتورة منسقة وجاهزة ولصقها بأي شات.
              </span>
            </div>
          </div>
        </div>

        {/* Thermal Receipt Content */}
        <div id="receipt-print-area" className="p-6 text-slate-800 font-sans text-sm">
          {/* Header */}
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <img
              src="/logo.png"
              alt="Trio Car Wash"
              className="w-24 h-auto mx-auto mb-2 object-contain"
            />
            <h1 className="text-xl font-black tracking-tight text-slate-900">
              {settings.shopName}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">{settings.slogan}</p>
            <div className="mt-2 text-xs text-slate-600 space-y-0.5">
              <p className="flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{settings.address}</span>
              </p>
              <p className="flex items-center justify-center gap-1 font-mono">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{settings.phone}</span>
              </p>
            </div>
          </div>

          {/* Order Details */}
          <div className="py-3 border-b border-dashed border-slate-300 text-xs space-y-1.5">
            <div className="flex justify-between items-center font-bold">
              <span>رقم الفاتورة: #{order.orderNumber}</span>
              <span className="flex items-center gap-1 text-slate-500 font-normal">
                <Calendar className="w-3 h-3" />
                {new Date(order.createdAt).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600">العميل:</span>
              <span className="font-bold">{order.customerName || 'عميل نقدي'}</span>
            </div>

            {order.customerPhone && (
              <div className="flex justify-between items-center">
                <span className="text-slate-600">الهاتف:</span>
                <span className="font-mono font-medium">{order.customerPhone}</span>
              </div>
            )}

            <div className="flex justify-between items-center bg-slate-100 p-2 rounded-lg font-bold">
              <span className="flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-sky-600" />
                <span>{order.carModel || 'سيارة'}</span>
              </span>
              <span className="px-2 py-0.5 bg-white border border-slate-300 rounded text-slate-900 font-mono tracking-wider">
                {order.plateNumber}
              </span>
            </div>
          </div>

          {/* Items & Services Table */}
          <div className="py-3 border-b border-dashed border-slate-300">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-200 pb-1">
                  <th className="text-right py-1">البيان / الصنف</th>
                  <th className="text-center py-1">العدد</th>
                  <th className="text-left py-1">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.services.map((s, idx) => (
                  <tr key={`srv-${idx}`} className="py-1.5">
                    <td className="py-1 text-right font-medium text-slate-800">
                      🔧 {s.serviceName}
                    </td>
                    <td className="py-1 text-center font-mono">1</td>
                    <td className="py-1 text-left font-bold font-mono">
                      {s.price.toLocaleString('ar-EG')} ج.م
                    </td>
                  </tr>
                ))}
                {order.products.map((p, idx) => (
                  <tr key={`prd-${idx}`} className="py-1.5">
                    <td className="py-1 text-right font-medium text-slate-800">
                      🛢️ {p.itemName}
                    </td>
                    <td className="py-1 text-center font-mono">{p.quantity}</td>
                    <td className="py-1 text-left font-bold font-mono">
                      {p.totalPrice.toLocaleString('ar-EG')} ج.م
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="py-3 border-b border-dashed border-slate-300 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-600">المجموع الفرعي:</span>
              <span className="font-mono">{order.subtotal.toLocaleString('ar-EG')} ج.م</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-rose-600 font-medium">
                <span>الخصم:</span>
                <span className="font-mono">-{order.discount.toLocaleString('ar-EG')} ج.م</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-200">
              <span>المبلغ الإجمالي:</span>
              <span className="font-mono text-sky-700">{order.total.toLocaleString('ar-EG')} ج.م</span>
            </div>
            <div className="flex justify-between text-slate-600 pt-1">
              <span>طريقة الدفع:</span>
              <span className="font-bold text-slate-800">
                {paymentMethodLabel[order.paymentMethod] || order.paymentMethod}
              </span>
            </div>
          </div>

          {/* Oil Change Reminder Badge */}
          {(order.nextOilChangeOdometer || order.nextOilChangeDate) && (
            <div className="my-3 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs">
              <div className="flex items-center gap-1.5 text-amber-900 font-black mb-1">
                <Gauge className="w-3.5 h-3.5 text-amber-600" />
                <span>ميعاد غيار الزيت القادم</span>
              </div>
              <div className="space-y-0.5 text-amber-950">
                {order.currentOdometer && (
                  <p>العداد الحالي: <strong className="font-mono">{order.currentOdometer.toLocaleString('ar-EG')} كم</strong></p>
                )}
                {order.nextOilChangeOdometer && (
                  <p>العداد القادم: <strong className="font-mono text-amber-800">{order.nextOilChangeOdometer.toLocaleString('ar-EG')} كم</strong></p>
                )}
                {order.nextOilChangeDate && (
                  <p>التاريخ المقترح: <strong>{order.nextOilChangeDate}</strong></p>
                )}
              </div>
            </div>
          )}

          {/* Footer Note */}
          <div className="text-center pt-2 text-[11px] text-slate-500">
            <p>{settings.receiptFooterMessage}</p>
            <p className="mt-1 font-mono text-[10px] text-slate-400">
              كاشير: {order.createdByName} • شكراً لثقتكم
            </p>
          </div>
        </div>

        {/* Bottom Close */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center print:hidden">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-sm transition-colors cursor-pointer"
          >
            إغلاق ومتابعة العمل
          </button>
        </div>
      </div>
    </div>
  );
};
