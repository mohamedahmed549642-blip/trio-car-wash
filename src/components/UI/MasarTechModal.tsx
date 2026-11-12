import React from 'react';
import { X, Globe, Smartphone, Database, Palette, CheckCircle2, MessageCircle, ExternalLink, Sparkles } from 'lucide-react';

interface MasarTechModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MasarTechModal: React.FC<MasarTechModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8"
        dir="rtl"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-32 bg-sky-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="relative mb-3 group">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 opacity-30 blur group-hover:opacity-60 transition duration-300"></div>
            <div className="relative w-20 h-20 rounded-2xl bg-slate-950 p-2.5 border border-slate-800 flex items-center justify-center shadow-inner">
              <img 
                src="/masar-tech-logo.svg" 
                alt="Masar Tech Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>شركة برمجيات وتطبيقات مصرية</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>MASAR TECH</span>
            <span className="text-sky-400 font-bold text-xl sm:text-2xl">• مسـار تـك</span>
          </h2>
          <p className="text-sm text-slate-300 mt-1 font-medium">
            شريكك البرمجي لبناء المواقع السحابية، المتاجر وتطبيقات الهاتف الذكي
          </p>
        </div>

        {/* About Section */}
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/60 mb-6 text-xs sm:text-sm text-slate-300 leading-relaxed text-right">
          <p>
            نحن في <strong className="text-sky-400">مسار تك (Masar Tech)</strong> نبتكر حلولاً رقمية سريعة، مستقرة، وسهلة الاستخدام للشركات والأنشطة التجارية في مصر والخليج العربي. تم تصميم وتطوير نظام <strong>تريو كار ووش</strong> بواسطة فريقنا لتقديم تجربة تشغيلية سحابية متكاملة.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6 text-right">
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">تطوير مواقع الويب</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">مواقع سريعة للشركات والخدمات</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">تطبيقات الموبايل</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">تطبيقات Android و iOS حديثة</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">أنظمة إدارة ومخازن</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">أنظمة POS وسحابية مخصصة</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">تصميم UI / UX</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">واجهات مستخدم احترافية</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <a
            href="https://wa.me/201000000000?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D9%85%D8%B3%D8%A7%D8%B1%20%D8%AA%D9%83%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20%D8%AA%D8%B7%D9%88%D9%8A%D8%B1%20%D9%85%D9%88%D9%82%D8%B9%20%D8%A3%D9%88%20%D8%AA%D8%B7%D8%A8%D9%8A%D9%82"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>طلب مشروع جديد عبر واتساب</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer border border-slate-700"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};