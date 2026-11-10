import React, { useState } from 'react';
import {
  Cloud,
  CloudCheck,
  CheckCircle2,
  RefreshCw,
  Download,
  Upload,
  RotateCcw,
  Store,
  Phone,
  MessageSquare,
  Shield,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { initFirebase, getSavedFirebaseConfig } from '../../services/firebase';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, isCloudConnected, reconnectCloud } = useApp();

  // Shop Settings Form
  const [shopName, setShopName] = useState(settings.shopName);
  const [slogan, setSlogan] = useState(settings.slogan);
  const [phone, setPhone] = useState(settings.phone);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [address, setAddress] = useState(settings.address);
  const [receiptFooterMessage, setReceiptFooterMessage] = useState(settings.receiptFooterMessage);

  // Firebase Config Form
  const savedFb = getSavedFirebaseConfig();
  const [apiKey, setApiKey] = useState(savedFb?.apiKey || '');
  const [projectId, setProjectId] = useState(savedFb?.projectId || '');
  const [authDomain, setAuthDomain] = useState(savedFb?.authDomain || '');
  const [storageBucket, setStorageBucket] = useState(savedFb?.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(savedFb?.messagingSenderId || '');
  const [appId, setAppId] = useState(savedFb?.appId || '');

  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Save Shop Info
  const handleSaveShopInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings({
        ...settings,
        shopName,
        slogan,
        phone,
        whatsappNumber,
        address,
        receiptFooterMessage,
      });
      alert('تم حفظ إعدادات المحل والفواتير بنجاح!');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحفظ.');
    } finally {
      setIsSaving(false);
    }
  };

  // Connect Firebase
  const handleConnectFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !projectId.trim()) {
      alert('يرجى إدخال apiKey و projectId على الأقل من لوحة Firebase.');
      return;
    }

    const cfg = {
      apiKey: apiKey.trim(),
      projectId: projectId.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      messagingSenderId: messagingSenderId.trim() || '123456789',
      appId: appId.trim() || '1:123456789:web:abcdef',
    };

    const res = initFirebase(cfg);
    if (res.isConnected) {
      reconnectCloud();
      alert('🎉 تم الاتصال بقاعدة بيانات Firebase السحابية بنجاح! تطبيقك الآن مربوط بالسحابة ويمكنك فتحه من أي جهاز.');
    } else {
      alert('تعذر الاتصال بـ Firebase، يرجى مراجعة صحة المفاتيح المدخلة.');
    }
  };

  // Sync from cloud
  const handleSyncCloud = async () => {
    setIsSyncing(true);
    try {
      const res = await storage.syncFromFirebase();
      alert(res.message);
      if (res.success) {
        window.location.reload();
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const data = storage.exportBackup();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trio_car_wash_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        if (confirm('هل أنت متأكد من استعادة هذه النسخة الاحتياطية؟ سيتم تحديث كافة البيانات المخزنة.')) {
          const success = storage.importBackup(content);
          if (success) {
            alert('تمت استعادة النسخة الاحتياطية بنجاح!');
            window.location.reload();
          } else {
            alert('الملف غير صالح أو حدث خطأ أثناء الاستيراد.');
          }
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Cloud Connection Card (Firebase) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${isCloudConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}>
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">الربط السحابي (Google Firebase)</h2>
                {isCloudConnected ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                    متصل سحابياً 🟢
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
                    وضع العمل المحلي (Offline-Ready)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                يمكنك ربط التطبيق بحساب Firebase المجاني لمزامنة المخزون والورديات والفواتير عبر الإنترنت والوصول لها من أي هاتف أو كمبيوتر في أي وقت.
              </p>
            </div>
          </div>

          {isCloudConnected && (
            <button
              onClick={handleSyncCloud}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة السحابة الآن'}</span>
            </button>
          )}
        </div>

        {/* Firebase Config Form */}
        <form onSubmit={handleConnectFirebase} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
          <div className="flex items-center justify-between text-slate-700 font-bold">
            <span>مفاتيح مشروع Firebase (Firebase Web App Config):</span>
            <a
              href="https://console.firebase.google.com/"
              target="_blank"
              rel="noreferrer"
              className="text-sky-600 hover:underline flex items-center gap-1 font-medium text-[11px]"
            >
              <span>فتح لوحة تحكم Firebase مجاناً</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 mb-1 font-semibold">apiKey</label>
              <input
                type="text"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-semibold">projectId</label>
              <input
                type="text"
                placeholder="trio-car-wash"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-semibold">authDomain (اختياري)</label>
              <input
                type="text"
                placeholder="trio-car-wash.firebaseapp.com"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-semibold">appId (اختياري)</label>
              <input
                type="text"
                placeholder="1:123456789:web:abcdef"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              * التطبيق يعمل بكفاءة تامة محلياً بدون إنترنت، ويفعل المزامنة السحابية تلقائياً بمجرد إدخال المفاتيح.
            </span>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-black text-xs shadow-md shadow-sky-600/20 active:scale-95 transition-all cursor-pointer"
            >
              حفظ والاتصال بـ Firebase 🚀
            </button>
          </div>
        </form>
      </div>

      {/* 2. Shop Profile & Receipts */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">بيانات المغسلة والفاتورة والواتساب</h2>
            <p className="text-xs text-slate-500">
              هذه البيانات تظهر في ترويسة الفاتورة الحرارية ورسائل الواتساب المرسلة للعملاء
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveShopInfo} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم المركز / المحل:</label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">شعار المحل (السلوجان):</label>
              <input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">رقم هاتف المحل:</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">عنوان المركز بالتفصيل:</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              رسالة الشكر في أسفل الفاتورة (Receipt Footer):
            </label>
            <input
              type="text"
              value={receiptFooterMessage}
              onChange={(e) => setReceiptFooterMessage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="text-left pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
            >
              {isSaving ? 'جاري الحفظ...' : 'حفظ تعديلات المحل'}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Data Backup and Restore */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">النسخ الاحتياطي والأمان (Backup & Restore)</h2>
            <p className="text-xs text-slate-500">
              احفظ نسخة من كافة بيانات المخزن والزيوت والفواتير والورديات على جهازك في أي وقت
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
          <button
            onClick={handleExportBackup}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تحميل نسخة احتياطية (JSON) 📥</span>
          </button>

          <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition-all cursor-pointer border border-slate-300">
            <Upload className="w-4 h-4" />
            <span>استيراد واستعادة نسخة احتياطية 📤</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
