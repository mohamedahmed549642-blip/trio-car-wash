import { ServiceOrder, ShopSettings } from '../types';

export const normalizeArabicNumerals = (str: string): string => {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return str.replace(/[٠-٩]/g, (w) => String(arabicDigits.indexOf(w)));
};

export const formatEgyptianPhoneNumber = (phone: string): string => {
  // 1. Convert Arabic-Indic numerals to standard ASCII digits
  let cleaned = normalizeArabicNumerals(phone.trim());

  // 2. Strip all non-digit characters
  cleaned = cleaned.replace(/\D/g, '');

  // 3. Handle international prefixes: +20, 0020, 20
  if (cleaned.startsWith('0020')) {
    cleaned = cleaned.slice(2); // starts with 20
  }

  // 4. If Egyptian local format starting with 01 (e.g. 010, 011, 012, 015)
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    return '2' + cleaned; // e.g. 201012345678
  }

  // 5. If Egyptian format starting with 1 without leading 0 (e.g. 1012345678)
  if (cleaned.startsWith('1') && cleaned.length === 10) {
    return '20' + cleaned;
  }

  // 6. If already starts with 201 (e.g. 201012345678)
  if (cleaned.startsWith('201') && cleaned.length === 12) {
    return cleaned;
  }

  return cleaned;
};

export const generateWhatsAppInvoiceMessage = (
  order: ServiceOrder,
  settings: ShopSettings
): string => {
  const serviceSummary = order.services
    .map((s) => `• ${s.serviceName}: ${s.price} ج.م`)
    .join('\n');

  const productsSummary = order.products
    .map((p) => `• ${p.itemName} (عدد ${p.quantity}): ${p.totalPrice} ج.م`)
    .join('\n');

  let itemsText = '';
  if (serviceSummary) itemsText += `\n*🛠️ الخدمات المنجزة:*\n${serviceSummary}\n`;
  if (productsSummary) itemsText += `\n*🛢️ الزيوت والمستلزمات:*\n${productsSummary}\n`;

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

  let discountText = '';
  if (order.discount && order.discount > 0) {
    discountText = `\n🎁 *الخصم الممنوح:* ${order.discount.toLocaleString('ar-EG')} ج.م`;
  }

  const paymentMethodLabel = {
    cash: 'كاش 💵',
    instapay: 'إنستاباي InstaPay ⚡',
    vodafone_cash: 'فودافون كاش 📱',
    visa: 'فيزا / بطاقة بنكية 💳',
  }[order.paymentMethod] || 'نقدي';

  const vehicleTypeLabel =
    order.vehicleSize === 'motorcycle' ? 'موتوسيكل / دراجة نارية 🏍️' : 'سيارة 🚗';

  const message = `السلام عليكم أ/ *${order.customerName || 'عميلنا العزيز'}* ✨
نشكرك لاختيارك *${settings.shopName}*.

📄 *فاتورة أمر تشغيل رقم:* #${order.orderNumber}
📅 التاريخ: ${new Date(order.createdAt).toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}
🚘 نوع المركبة: *${vehicleTypeLabel}*
🚗 الموديل: *${order.carModel || 'سيارة'}*
🔢 رقم اللوحة: *${order.plateNumber}*
${itemsText}${discountText}
━━━━━━━━━━━━━━━
💰 *الإجمالي النهائي:* *${order.total.toLocaleString('ar-EG')} جنيه مصري*
💳 طريقة الدفع: ${paymentMethodLabel}
${oilReminderText}
━━━━━━━━━━━━━━━
📍 *العنوان:* ${settings.address}
📞 *خدمة العملاء:* ${settings.phone}
${settings.receiptFooterMessage ? `\n${settings.receiptFooterMessage}` : ''}`;

  return message;
};

export const getWhatsAppDirectUrl = (phone: string, message: string): string => {
  const formattedPhone = formatEgyptianPhoneNumber(phone);
  const encodedText = encodeURIComponent(message);
  // Universal WhatsApp API link that opens seamlessly on both mobile app and desktop
  return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedText}`;
};

export const getWhatsAppWebUrl = (phone: string, message: string): string => {
  const formattedPhone = formatEgyptianPhoneNumber(phone);
  const encodedText = encodeURIComponent(message);
  return `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodedText}`;
};

export const generateOilDueReminderMessage = (
  order: ServiceOrder,
  settings: ShopSettings
): string => {
  return `السلام عليكم أ/ *${order.customerName || 'عميلنا العزيز'}* 🚗
نود تذكيركم بموعد غيار الزيت الدوري لسيارتكم *${order.carModel}* (لوحة: *${order.plateNumber}*).

🔹 آخر فحص كان عند عداد: ${order.currentOdometer?.toLocaleString('ar-EG') || '---'} كم
🔹 موعد الغيار الموصى به: ${order.nextOilChangeOdometer?.toLocaleString('ar-EG') || '---'} كم
${order.nextOilChangeDate ? `🔹 التاريخ المقترح: ${order.nextOilChangeDate}\n` : ''}
يسعدنا استقبالكم في أي وقت لتقديم الفحص وتغيير الزيت الأصلي والفلاتر مع غسيل متميز! ✨

📍 *${settings.shopName}*
📞 للحجز والاستفسار: ${settings.phone}`;
};
