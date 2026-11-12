import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Edit3,
  Trash2,
  RotateCcw,
  Search,
  Car,
  Check,
  X,
  Droplets,
  Wrench,
  Flame,
  Layers,
  HelpCircle,
  Tag,
  Save,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ServiceItem, VehicleSize } from '../../types';

type CategoryFilter = 'all' | ServiceItem['category'];

export const ServicesManager: React.FC = () => {
  const { services, addService, updateService, deleteService, resetServicesToDefault, isAdmin } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ServiceItem['category']>('wash');
  const [description, setDescription] = useState('');
  const [prices, setPrices] = useState<Record<VehicleSize, number>>({
    sedan: 100,
    suv: 130,
    van: 160,
    motorcycle: 60,
  });

  // Quick Inline Price Editing
  const [quickEditingId, setQuickEditingId] = useState<string | null>(null);
  const [quickPrices, setQuickPrices] = useState<Record<VehicleSize, number>>({
    sedan: 0,
    suv: 0,
    van: 0,
    motorcycle: 0,
  });

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      const matchSearch =
        srv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (srv.description && srv.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchCat = selectedCategory === 'all' || srv.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [services, searchTerm, selectedCategory]);

  const handleOpenAdd = () => {
    setEditingService(null);
    setName('');
    setCategory('wash');
    setDescription('');
    setPrices({
      sedan: 100,
      suv: 130,
      van: 160,
      motorcycle: 60,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (srv: ServiceItem) => {
    setEditingService(srv);
    setName(srv.name);
    setCategory(srv.category);
    setDescription(srv.description || '');
    setPrices({
      sedan: srv.basePrices.sedan || 0,
      suv: srv.basePrices.suv || 0,
      van: srv.basePrices.van || 0,
      motorcycle: srv.basePrices.motorcycle || 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('يرجى إدخال اسم الخدمة');
      return;
    }

    const payload = {
      name: name.trim(),
      category,
      description: description.trim() || undefined,
      basePrices: {
        sedan: Math.max(0, Number(prices.sedan) || 0),
        suv: Math.max(0, Number(prices.suv) || 0),
        van: Math.max(0, Number(prices.van) || 0),
        motorcycle: Math.max(0, Number(prices.motorcycle) || 0),
      },
    };

    if (editingService) {
      await updateService({
        ...payload,
        id: editingService.id,
      });
    } else {
      await addService(payload);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (srv: ServiceItem) => {
    if (confirm(`هل أنت متأكد من رغبتك في حذف خدمة "${srv.name}" تماماً؟`)) {
      await deleteService(srv.id);
    }
  };

  const handleReset = async () => {
    if (
      confirm(
        '⚠️ تحذير: هل أنت متأكد من استعادة الخدمات والأسعار إلى الإعدادات الافتراضية الأولى للمركز؟ أي خدمات إضافية تم إنشاؤها قد تُحذف.'
      )
    ) {
      await resetServicesToDefault();
    }
  };

  const startQuickEdit = (srv: ServiceItem) => {
    setQuickEditingId(srv.id);
    setQuickPrices({
      sedan: srv.basePrices.sedan || 0,
      suv: srv.basePrices.suv || 0,
      van: srv.basePrices.van || 0,
      motorcycle: srv.basePrices.motorcycle || 0,
    });
  };

  const saveQuickEdit = async (srv: ServiceItem) => {
    await updateService({
      ...srv,
      basePrices: {
        sedan: Math.max(0, Number(quickPrices.sedan) || 0),
        suv: Math.max(0, Number(quickPrices.suv) || 0),
        van: Math.max(0, Number(quickPrices.van) || 0),
        motorcycle: Math.max(0, Number(quickPrices.motorcycle) || 0),
      },
    });
    setQuickEditingId(null);
  };

  const getCategoryDetails = (cat: ServiceItem['category']) => {
    switch (cat) {
      case 'wash':
        return {
          label: 'غسيل ونظافة',
          icon: <Droplets className="w-4 h-4" />,
          badgeClass: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
        };
      case 'oil_service':
        return {
          label: 'غيار زيوت وفلاتر',
          icon: <Flame className="w-4 h-4" />,
          badgeClass: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
        };
      case 'detailing':
        return {
          label: 'تلميع وعناية ديتيلنج',
          icon: <Sparkles className="w-4 h-4" />,
          badgeClass: 'bg-purple-500/15 text-purple-700 border-purple-500/30',
        };
      case 'maintenance':
        return {
          label: 'تربيط وصيانة دورية',
          icon: <Wrench className="w-4 h-4" />,
          badgeClass: 'bg-sky-500/15 text-sky-700 border-sky-500/30',
        };
      default:
        return {
          label: 'خدمة عامة',
          icon: <Layers className="w-4 h-4" />,
          badgeClass: 'bg-slate-500/15 text-slate-700 border-slate-500/30',
        };
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-lg mx-auto my-12">
        <HelpCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-black text-slate-800 mb-1">غير مسموح بالوصول</h2>
        <p className="text-sm text-slate-500">
          تعديل الخدمات وتغيير الأسعار مخصص فقط للمالك (المدير العام) لحماية تسعير المركز.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold mb-3">
              <Tag className="w-3.5 h-3.5" />
              <span>صلاحيات المالك والمدير العام 👑</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>إدارة الخدمات وتعديل الأسعار</span>
              <Sparkles className="w-6 h-6 text-sky-400" />
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              يمكنك إضافة خدمات جديدة، تعديل مسميات الخدمات، وتحديد أسعار خاصة بكل حجم سيارة (سيدان، SUV، فان،
              موتوسيكل). تنعكس التعديلات فوراً على شاشة الكاشير وأوامر التشغيل.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold px-5 py-3 rounded-2xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة خدمة جديدة</span>
            </button>

            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white px-3.5 py-3 rounded-2xl border border-slate-700 text-xs font-bold transition-all cursor-pointer"
              title="استعادة الخدمات والأسعار الافتراضية الأولى"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">الافتراضيات</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث بالاسم أو وصف الخدمة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-800"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-bold">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الكل ({services.length})
          </button>
          <button
            onClick={() => setSelectedCategory('wash')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
              selectedCategory === 'wash'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            غسيل
          </button>
          <button
            onClick={() => setSelectedCategory('oil_service')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
              selectedCategory === 'oil_service'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            زيوت وصيانة
          </button>
          <button
            onClick={() => setSelectedCategory('detailing')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
              selectedCategory === 'detailing'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            ديتيلنج وتلميع
          </button>
          <button
            onClick={() => setSelectedCategory('maintenance')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
              selectedCategory === 'maintenance'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
            }`}
          >
            تربيط وعفشة
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredServices.map((srv) => {
          const cat = getCategoryDetails(srv.category);
          const isQuick = quickEditingId === srv.id;

          return (
            <div
              key={srv.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between gap-4 relative overflow-hidden group"
            >
              {/* Header: Category & Actions */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${cat.badgeClass}`}
                  >
                    {cat.icon}
                    <span>{cat.label}</span>
                  </span>

                  <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                    <button
                      onClick={() => handleOpenEdit(srv)}
                      className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                      title="تعديل تفاصيل الخدمة والأسعار"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(srv)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="حذف الخدمة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-black text-base text-slate-900 group-hover:text-sky-600 transition-colors">
                  {srv.name}
                </h3>
                {srv.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {srv.description}
                  </p>
                )}
              </div>

              {/* Price Grid Box */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2.5 pb-1.5 border-b border-slate-200/70">
                  <span className="flex items-center gap-1 text-slate-700">
                    <Car className="w-3.5 h-3.5 text-sky-500" />
                    <span>الأسعار حسب حجم المركبة:</span>
                  </span>

                  {!isQuick ? (
                    <button
                      onClick={() => startQuickEdit(srv)}
                      className="text-[11px] text-sky-600 hover:text-sky-700 hover:underline font-bold cursor-pointer"
                      title="تعديل الأسعار الأربعة مباشرة"
                    >
                      تعديل سريع ⚡
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => saveQuickEdit(srv)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[11px] font-bold hover:bg-emerald-600 cursor-pointer shadow-sm"
                      >
                        <Check className="w-3 h-3" />
                        <span>حفظ</span>
                      </button>
                      <button
                        onClick={() => setQuickEditingId(null)}
                        className="text-[11px] text-slate-400 hover:text-slate-600 font-bold"
                      >
                        إلغاء
                      </button>
                    </div>
                  )}
                </div>

                {isQuick ? (
                  // Quick Inline Editing Inputs
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-1.5 rounded-xl border border-sky-300">
                      <label className="block text-[10px] text-slate-500 font-medium">سيدان</label>
                      <input
                        type="number"
                        min="0"
                        value={quickPrices.sedan}
                        onChange={(e) =>
                          setQuickPrices((prev) => ({ ...prev, sedan: Number(e.target.value) }))
                        }
                        className="w-full font-black text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div className="bg-white p-1.5 rounded-xl border border-sky-300">
                      <label className="block text-[10px] text-slate-500 font-medium">SUV / جيب</label>
                      <input
                        type="number"
                        min="0"
                        value={quickPrices.suv}
                        onChange={(e) =>
                          setQuickPrices((prev) => ({ ...prev, suv: Number(e.target.value) }))
                        }
                        className="w-full font-black text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div className="bg-white p-1.5 rounded-xl border border-sky-300">
                      <label className="block text-[10px] text-slate-500 font-medium">فان / نقل</label>
                      <input
                        type="number"
                        min="0"
                        value={quickPrices.van}
                        onChange={(e) =>
                          setQuickPrices((prev) => ({ ...prev, van: Number(e.target.value) }))
                        }
                        className="w-full font-black text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div className="bg-white p-1.5 rounded-xl border border-sky-300">
                      <label className="block text-[10px] text-slate-500 font-medium">موتوسيكل</label>
                      <input
                        type="number"
                        min="0"
                        value={quickPrices.motorcycle}
                        onChange={(e) =>
                          setQuickPrices((prev) => ({ ...prev, motorcycle: Number(e.target.value) }))
                        }
                        className="w-full font-black text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  // Normal Price Badges
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-slate-100">
                      <span className="text-slate-500">سيدان:</span>
                      <span className="font-black text-slate-900">{srv.basePrices.sedan || 0} ج.م</span>
                    </div>
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-slate-100">
                      <span className="text-slate-500">SUV:</span>
                      <span className="font-black text-slate-900">{srv.basePrices.suv || 0} ج.م</span>
                    </div>
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-slate-100">
                      <span className="text-slate-500">فان/نقل:</span>
                      <span className="font-black text-slate-900">{srv.basePrices.van || 0} ج.م</span>
                    </div>
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-slate-100">
                      <span className="text-slate-500">موتوسيكل:</span>
                      <span className="font-black text-slate-900">{srv.basePrices.motorcycle || 0} ج.م</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-black text-slate-700 text-lg">لم يتم العثور على خدمات مطابقة</h3>
          <p className="text-sm text-slate-400 mt-1">جرب تغيير كلمات البحث أو اختر تصنيفاً آخر.</p>
        </div>
      )}

      {/* Add / Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">
                    {editingService ? 'تعديل الخدمة والأسعار' : 'إضافة خدمة جديدة للمركز'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingService
                      ? 'قم بتعديل المسمى أو الأسعار المخصصة لكل حجم سيارة'
                      : 'سجل خدمة جديدة وأسعارها حسب فئات السيارات'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الخدمة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: غسيل رغوة واكس وحماية نانو"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تصنيف الخدمة *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ServiceItem['category'])}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                >
                  <option value="wash">غسيل ونظافة (wash)</option>
                  <option value="oil_service">غيار زيوت وفلاتر (oil_service)</option>
                  <option value="detailing">ديتيلنج وتلميع وصالون (detailing)</option>
                  <option value="maintenance">تربيط وصيانة دورية (maintenance)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">وصف الخدمة ومميزاتها</label>
                <textarea
                  rows={2}
                  placeholder="مثال: شامبو مركز، شفط أتربة، تنظيف زجاج وعزل وتسويد كاوتش..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              {/* Vehicle Size Pricing Box */}
              <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-sky-800 text-xs font-black">
                  <Car className="w-4 h-4 text-sky-600" />
                  <span>تحديد الأسعار حسب حجم المركبة (بالجنيه المصري):</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-2.5 rounded-xl border border-sky-200 shadow-sm">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      🚗 سيارة سيدان صغيرة/وسط
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        required
                        value={prices.sedan}
                        onChange={(e) =>
                          setPrices((prev) => ({ ...prev, sedan: Number(e.target.value) }))
                        }
                        className="w-full font-black text-slate-900 text-sm pl-8 pr-2 py-1 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                        ج.م
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-sky-200 shadow-sm">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      🚙 SUV / جيب / كروس أوفر
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        required
                        value={prices.suv}
                        onChange={(e) =>
                          setPrices((prev) => ({ ...prev, suv: Number(e.target.value) }))
                        }
                        className="w-full font-black text-slate-900 text-sm pl-8 pr-2 py-1 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                        ج.م
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-sky-200 shadow-sm">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      🚐 فان / نقل / ميني باص
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        required
                        value={prices.van}
                        onChange={(e) =>
                          setPrices((prev) => ({ ...prev, van: Number(e.target.value) }))
                        }
                        className="w-full font-black text-slate-900 text-sm pl-8 pr-2 py-1 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                        ج.م
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-sky-200 shadow-sm">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      🏍️ موتوسيكل / بيتش باجي
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        required
                        value={prices.motorcycle}
                        onChange={(e) =>
                          setPrices((prev) => ({ ...prev, motorcycle: Number(e.target.value) }))
                        }
                        className="w-full font-black text-slate-900 text-sm pl-8 pr-2 py-1 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                        ج.م
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-extrabold text-xs shadow-md shadow-sky-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingService ? 'حفظ التعديلات' : 'إضافة الخدمة'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
