import { ServiceOrder, ShopSettings } from '../types';

export const formatEgyptianPhoneNumber = (phone: string): string => {
  // Strip all non-digits
  const cleaned = phone.replace(/\D/g, '');

  // If starts with 01 (e.g. 01012345678), replace leading 0 with 20
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    return '2' + cleaned; // 201012345678
  }

  // If already starts with 201
  if (cleaned.startsWith('201') && cleaned.length === 12) {
    return cleaned;
  }

  // If starts with 1 (e.g. 1012345678), prepend 20
  if (cleaned.startsWith('1') && cleaned.length === 10) {
    return '20' + cleaned;
  }

  return cleaned;
};

export const generateWhatsAppInvoiceMessage = (
  order: ServiceOrder,
  settings: ShopSettings
): string => {
  const serviceSummary = order.services.map((s) => `• ${s.serviceName}: ${s.price} ج.م`).join('\n');
  const productsSummary = order.products
    .map((p) => `• ${p.itemName} (عدد ${p.quantity}): ${p.totalPrice} ج.م`)
    .join('\n');

  let itemsText = '';
  if (serviceSummary) itemsText += `\n*الخدمات المنجزة:*\n${serviceSummary}\n`;
  if (productsSummary) itemsText += `\n*الزيوت والمستلزمات:*\n${productsSummary}\n`;

  let oilReminderText = '';
  if (order.nextOilChangeOdometer || order.nextOilChangeDate) {
    oilReminderText = `\n━━━━━━━━━━━━━━━\n*تذكير غيار الزيت القادم:*\n`;
    if (order.currentOdometer) {
      oilReminderText += `🔹 العداد الحالي: ${order.currentOdometer.toLocaleString('ar-EG')} كم\n`;
    }
    if (order.nextOilChangeOdometer) {
      oilReminderText += `🔹 موعد التغيير عند: ${order.nextOilChangeOdometer.toLocaleString('ar-EG')} كم\n`;
    }
    if (order.nextOilChangeDate) {
      oilReminderText += `🔹 التاريخ المقترح: ${order.nextOilChangeDate}\n`;
    }
  }

  const paymentMethodLabel = {
    cash: 'كاش 💵',
    instapay: 'إنستاباي InstaPay ⚡',
    vodafone_cash: 'فودافون كاش 📱',
    visa: 'فيزا / بطاقة بنكية 💳',
  }[order.paymentMethod];

  const message = `السلام عليكم أ/ *${order.customerName || 'عميلنا العزيز'}* 🚗✨
نشكرك لاختيارك *${settings.shopName}*.

📄 *فاتورة أمر تشغيل رقم:* #${order.orderNumber}
📅 التاريخ: ${new Date(order.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'medium' })}
🚘 السيارة: *${order.carModel || 'سيارة'}*
🔢 رقم اللوحة: *${order.plateNumber}*
${itemsText}
💰 *الإجمالي النهائي:* *${order.total.toLocaleString('ar-EG')} جنيه مصري*
طريقة الدفع: ${paymentMethodLabel}
${oilReminderText}
━━━━━━━━━━━━━━━
📍 ${settings.address}
📞 هاتف المحل: ${settings.phone}
${settings.receiptFooterMessage}`;

  return message;
};

export const getWhatsAppDirectUrl = (phone: string, message: string): string => {
  const formattedPhone = formatEgyptianPhoneNumber(phone);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedText}`;
};

export const generateOilDueReminderMessage = (
  order: ServiceOrder,
  settings: ShopSettings
): string => {
  return `السلام عليكم أ/ *${order.customerName || 'عميلنا العزيز'}* 🚗
نحيطكم علماً بأنه اقترب موعد غيار الزيت الدوري لسيارتكم *${order.carModel}* (لوحة: *${order.plateNumber}*).

🔹 آخر صيانة كانت عند عداد: ${order.currentOdometer?.toLocaleString('ar-EG') || '---'} كم
🔹 موعد الغيار القادم: ${order.nextOilChangeOdometer?.toLocaleString('ar-EG') || '---'} كم

يسعدنا استقبالكم في أي وقت لتقديم الفحص وتغيير الزيت الأصلي والفلاتر مع غسيل متميز! ✨

📍 *${settings.shopName}*
📞 للحجز والاستفسار: ${settings.phone}`;
};
