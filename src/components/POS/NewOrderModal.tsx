import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Car,
  Fuel,
  Sparkles,
  Check,
  Plus,
  Minus,
  Trash2,
  Calendar,
  Gauge,
  Phone,
  User,
  AlertCircle,
  HelpCircle,
  Lock,
  Play,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  VehicleSize,
  PaymentMethod,
  InventoryItem,
  ServiceItem,
  OrderProduct,
  OrderService,
  ServiceOrder,
} from '../../types';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: ServiceOrder) => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  onOrderCreated,
}) => {
  const {
    services,
    inventory,
    createOrder,
    findPreviousOrderByPlate,
    recentCarPlates,
    currentShift,
    openShift,
    activeUser,
  } = useApp();

  // Shift opening state if modal opened while shift is closed
  const [quickOpeningBalance, setQuickOpeningBalance] = useState<number>(200);
  const [isOpeningShift, setIsOpeningShift] = useState(false);

  const handleQuickOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpeningShift(true);
    try {
      await openShift(quickOpeningBalance);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء فتح الوردية.');
    } finally {
      setIsOpeningShift(false);
    }
  };

  // Form State
  const [plateNumber, setPlateNumber] = useState('');
  const [carModel, setCarModel] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [vehicleSize, setVehicleSize] = useState<VehicleSize>('sedan');
  const [currentOdometer, setCurrentOdometer] = useState<string>('');
  const [nextOilChangeOdometer, setNextOilChangeOdometer] = useState<string>('');
  const [nextOilChangeDate, setNextOilChangeDate] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Selected Services
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([
    'srv_wash_standard', // Default wash selected
  ]);

  // Selected Products (Oils, Filters, Accessories)
  const [selectedProducts, setSelectedProducts] = useState<
    Array<{ item: InventoryItem; quantity: number }>
  >([]);

  // Financials
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter categories for inventory picker
  const [productCategoryFilter, setProductCategoryFilter] = useState<'all' | 'oil' | 'filter' | 'fluid' | 'accessory'>('oil');
  const [productSearch, setProductSearch] = useState('');

  // Auto-fill from previous order if plate matched
  const handlePlateChange = (val: string) => {
    setPlateNumber(val);
    if (val.trim().length >= 3) {
      const prev = findPreviousOrderByPlate(val);
      if (prev) {
        if (!customerName) setCustomerName(prev.customerName);
        if (!customerPhone) setCustomerPhone(prev.customerPhone);
        if (!carModel) setCarModel(prev.carModel);
        setVehicleSize(prev.vehicleSize);
      }
    }
  };

  // Toggle Service
  const toggleService = (serviceId: string) => {
    if (selectedServiceIds.includes(serviceId)) {
      setSelectedServiceIds(selectedServiceIds.filter((id) => id !== serviceId));
    } else {
      setSelectedServiceIds([...selectedServiceIds, serviceId]);
    }
  };

  // Add Product to Cart
  const handleAddProduct = (item: InventoryItem) => {
    const existing = selectedProducts.find((p) => p.item.id === item.id);
    if (existing) {
      if (existing.quantity >= item.stockQuantity) {
        alert(`عذراً، الرصيد المتاح في المخزن لهذا الصنف هو ${item.stockQuantity} فقط!`);
        return;
      }
      setSelectedProducts(
        selectedProducts.map((p) =>
          p.item.id === item.id ? { ...p, quantity: p.quantity + 1 } : p
        )
      );
    } else {
      if (item.stockQuantity < 1) {
        alert('عذراً، هذا الصنف نفد من المخزن (رصيده 0)! يرجى توريد كميات أولاً.');
        return;
      }
      setSelectedProducts([...selectedProducts, { item, quantity: 1 }]);
    }

    // If adding an engine oil, auto-calculate next odometer if current odometer is provided!
    if (item.category === 'oil' && item.oilKmType && currentOdometer) {
      const currentKm = parseInt(currentOdometer, 10);
      if (!isNaN(currentKm)) {
        setNextOilChangeOdometer(String(currentKm + item.oilKmType));
        // Default next date + 6 months
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() + 6);
        setNextOilChangeDate(targetDate.toISOString().split('T')[0]);
      }
    }
  };

  // Update product quantity
  const handleUpdateProductQuantity = (itemId: string, delta: number) => {
    setSelectedProducts(
      selectedProducts
        .map((p) => {
          if (p.item.id === itemId) {
            const nextQty = p.quantity + delta;
            if (nextQty > p.item.stockQuantity) {
              alert(`أقصى كمية متاحة في المخزن هي ${p.item.stockQuantity}`);
              return p;
            }
            return { ...p, quantity: nextQty };
          }
          return p;
        })
        .filter((p) => p.quantity > 0)
    );
  };

  const handleRemoveProduct = (itemId: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.item.id !== itemId));
  };

  // Auto-calc odometer when current odometer changes
  useEffect(() => {
    const oilProduct = selectedProducts.find((p) => p.item.category === 'oil' && p.item.oilKmType);
    if (oilProduct && currentOdometer) {
      const currentKm = parseInt(currentOdometer, 10);
      if (!isNaN(currentKm) && oilProduct.item.oilKmType) {
        setNextOilChangeOdometer(String(currentKm + oilProduct.item.oilKmType));
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() + 6);
        setNextOilChangeDate(targetDate.toISOString().split('T')[0]);
      }
    }
  }, [currentOdometer, selectedProducts]);

  // Price calculations
  const servicesTotal = useMemo(() => {
    return selectedServiceIds.reduce((sum, sId) => {
      const s = services.find((item) => item.id === sId);
      if (!s) return sum;
      return sum + (s.basePrices[vehicleSize] || 0);
    }, 0);
  }, [selectedServiceIds, services, vehicleSize]);

  const productsTotal = useMemo(() => {
    return selectedProducts.reduce((sum, p) => sum + p.item.sellingPrice * p.quantity, 0);
  }, [selectedProducts]);

  const subtotal = servicesTotal + productsTotal;
  const grandTotal = Math.max(0, subtotal - (discount || 0));

  // Filtered available products
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesCat = productCategoryFilter === 'all' || item.category === productCategoryFilter;
      const matchesSearch =
        item.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        item.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
        (item.viscosity && item.viscosity.toLowerCase().includes(productSearch.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [inventory, productCategoryFilter, productSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentShift) {
      alert('لا يمكن إنشاء أو حفظ أمر التشغيل بدون فتح وردية أولاً!');
      return;
    }

    if (!plateNumber.trim()) {
      alert('يرجى إدخال رقم لوحة السيارة (مثال: أ ب ج 1 2 3 أو أرقام)');
      return;
    }

    if (selectedServiceIds.length === 0 && selectedProducts.length === 0) {
      alert('يرجى اختيار خدمة غسيل أو صنف زيت / فلتر على الأقل!');
      return;
    }

    // Verify stock availability
    for (const p of selectedProducts) {
      if (p.quantity > p.item.stockQuantity) {
        alert(`الصنف ${p.item.name} غير متوفر منه كمية كافية في المخزن (المتاح: ${p.item.stockQuantity})`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const orderServices: OrderService[] = selectedServiceIds.map((sId) => {
        const s = services.find((item) => item.id === sId)!;
        return {
          serviceId: s.id,
          serviceName: s.name,
          price: s.basePrices[vehicleSize] || 0,
        };
      });

      const orderProducts: OrderProduct[] = selectedProducts.map((p) => ({
        itemId: p.item.id,
        itemName: p.item.name,
        quantity: p.quantity,
        unitPrice: p.item.sellingPrice,
        totalPrice: p.item.sellingPrice * p.quantity,
        costPrice: p.item.costPrice,
      }));

      const newOrder = await createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        plateNumber: plateNumber.trim(),
        carModel: carModel.trim() || 'سيارة عامة',
        vehicleSize,
        currentOdometer: currentOdometer ? parseInt(currentOdometer, 10) : undefined,
        nextOilChangeOdometer: nextOilChangeOdometer
          ? parseInt(nextOilChangeOdometer, 10)
          : undefined,
        nextOilChangeDate: nextOilChangeDate || undefined,
        services: orderServices,
        products: orderProducts,
        subtotal,
        discount: discount || 0,
        total: grandTotal,
        paymentMethod,
        paymentStatus: 'paid',
        paidAmount: grandTotal,
        notes: notes.trim(),
        status: 'completed',
      });

      onOrderCreated(newOrder);
      onClose();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء حفظ أمر التشغيل. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-lg">أمر تشغيل وكاشير جديد</h2>
              <p className="text-xs text-slate-400">
                تسجيل غسيل وتغيير زيوت مع الخصم التلقائي من المخزن
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mandatory Shift Check */}
        {!currentShift ? (
          <div className="p-6 sm:p-10 text-center max-w-lg mx-auto space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black mb-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>الوردية مغلقة حالياً</span>
              </span>
              <h3 className="text-xl font-black text-slate-900">
                يجب فتح الوردية أولاً قبل استقبال السيارات
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                وفقاً لتعليمات المحاسبة وإدارة نقاط البيع، لا يمكن تسجيل أي أوامر تشغيل أو بيع زيوت بدون فتح وردية لتسجيل الإيرادات وعهدة الخزينة بدقة.
              </p>
            </div>

            <form
              onSubmit={handleQuickOpenShift}
              className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-right space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  رصيد عهدة بداية الوردية (الفكة في الدرج بالجنيه) <span className="text-rose-500">*</span>:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    required
                    value={quickOpeningBalance}
                    onChange={(e) => setQuickOpeningBalance(Number(e.target.value))}
                    placeholder="200 ج.م"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 font-bold font-mono text-slate-900 text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="absolute left-3 top-3 text-xs font-bold text-slate-400">
                    ج.م
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  المبلغ الموجود في الدرج كفكة لبداية الشيفت.
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                <span className="text-slate-500 font-medium">الكاشير المستلم:</span>
                <span className="font-bold text-slate-800">
                  {activeUser.name} ({activeUser.role === 'admin' ? 'المالك 👑' : 'كاشير 👷'})
                </span>
              </div>

              <button
                type="submit"
                disabled={isOpeningShift}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs sm:text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>
                  {isOpeningShift ? 'جاري فتح الوردية...' : 'فتح الوردية وبدء تسجيل أمر التشغيل 🚀'}
                </span>
              </button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleSubmit} autoComplete="off" className="p-4 sm:p-6 space-y-6 max-h-[85vh] overflow-y-auto">
          {/* 1. Vehicle and Customer Section */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
              <Car className="w-4 h-4 text-sky-600" />
              <span>بيانات السيارة والعميل</span>
            </h3>

            {/* Vehicle Size Selection */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                حجم ونوع السيارة (يحدد تسعيرة الغسيل آلياً):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'sedan', label: '🚗 سيدان / هاتشباك', desc: 'كورولا، إلنترا، صني' },
                  { id: 'suv', label: '🚙 دفع رباعي / SUV', desc: 'توسان، سبورتاج، تيجو' },
                  { id: 'van', label: '🚐 فان / ميكروباص / نقل', desc: 'هاي اس، كاري، جامبو' },
                  { id: 'motorcycle', label: '🏍️ دراجة نارية / بيتش باجي', desc: 'موتوسيكل' },
                ].map((sz) => (
                  <button
                    key={sz.id}
                    type="button"
                    onClick={() => setVehicleSize(sz.id as VehicleSize)}
                    className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                      vehicleSize === sz.id
                        ? 'bg-sky-50 border-sky-500 text-sky-950 font-black shadow-sm ring-2 ring-sky-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{sz.label}</div>
                    <div className="text-[10px] text-slate-500 truncate">{sz.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  رقم اللوحة <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    name="order_vehicle_plate"
                    autoComplete="off"
                    placeholder="مثال: ق ج د 1 2 3 4"
                    value={plateNumber}
                    onChange={(e) => handlePlateChange(e.target.value)}
                    list="recent-plates-list"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  <datalist id="recent-plates-list">
                    {recentCarPlates.map((p) => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">موديل وماركة السيارة</label>
                <input
                  type="text"
                  name="order_car_model"
                  autoComplete="off"
                  placeholder="مثال: كيا سيراتو 2022"
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم العميل</label>
                <input
                  type="text"
                  name="order_customer_name"
                  autoComplete="off"
                  placeholder="مثال: أ/ أحمد محمود"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  موبايل العميل (لإرسال الفاتورة بالواتساب)
                </label>
                <input
                  type="tel"
                  name="order_customer_phone_pos"
                  autoComplete="off"
                  placeholder="01012345678"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Wash & Detailing Services Selection */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-600" />
                <span>خدمات الغسيل والعناية (الأسعار بحسب حجم {vehicleSize === 'sedan' ? 'السيدان' : vehicleSize === 'suv' ? 'الدفع الرباعي' : vehicleSize === 'van' ? 'الفان' : 'الدراجة'})</span>
              </h3>
              <span className="text-xs font-bold text-sky-700 font-mono">
                إجمالي الخدمات: {servicesTotal} ج.م
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {services.map((srv) => {
                const isSelected = selectedServiceIds.includes(srv.id);
                const price = srv.basePrices[vehicleSize] || 0;

                return (
                  <div
                    key={srv.id}
                    onClick={() => toggleService(srv.id)}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-sky-500 text-white border-sky-600 shadow-md shadow-sky-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between font-bold text-xs mb-1">
                        <span>{srv.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <p
                        className={`text-[11px] line-clamp-2 ${
                          isSelected ? 'text-sky-100' : 'text-slate-500'
                        }`}
                      >
                        {srv.description}
                      </p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200/40 flex justify-between items-center text-xs font-black">
                      <span className={isSelected ? 'text-sky-100' : 'text-slate-500'}>السعر:</span>
                      <span className="text-sm font-mono">{price} ج.م</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Oil, Filters & Products Selection from Stock */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Fuel className="w-4 h-4 text-amber-600" />
                <span>الزيوت والفلاتر والمستلزمات (تخصم فورياً من المخزن 📦)</span>
              </h3>
              <span className="text-xs font-bold text-amber-700 font-mono">
                إجمالي المنتجات: {productsTotal} ج.م
              </span>
            </div>

            {/* Product Category Filters and Search */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 gap-1">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'oil', label: '🛢️ زيوت محركات' },
                  { id: 'filter', label: '⚙️ فلاتر' },
                  { id: 'fluid', label: '💧 سوائل وردياتير' },
                  { id: 'accessory', label: '🌲 معطرات واكسسوار' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setProductCategoryFilter(c.id as any)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                      productCategoryFilter === c.id
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="بحث في المخزن (مثال: Shell, 5W-40, فلتر كيا)..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Product Cards Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
              {filteredInventory.map((item) => {
                const inCart = selectedProducts.find((p) => p.item.id === item.id);
                const isOutOfStock = item.stockQuantity <= 0;

                return (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between text-right text-xs transition-all ${
                      inCart
                        ? 'bg-amber-50 border-amber-400 ring-1 ring-amber-400'
                        : isOutOfStock
                        ? 'bg-slate-100 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between font-bold mb-1">
                        <span className="truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-2">
                        {item.viscosity && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono font-bold text-slate-700">
                            {item.viscosity}
                          </span>
                        )}
                        <span
                          className={`font-bold ${
                            item.stockQuantity <= item.minStockAlert
                              ? 'text-rose-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          المتاح: {item.stockQuantity} {item.unit}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="font-black text-slate-900 font-mono">
                        {item.sellingPrice} ج.م
                      </span>
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => handleAddProduct(item)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer ${
                          isOutOfStock
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-sky-600 hover:bg-sky-700 text-white active:scale-95'
                        }`}
                      >
                        <Plus className="w-3 h-3" />
                        <span>إضافة</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Products in Basket */}
            {selectedProducts.length > 0 && (
              <div className="mt-3 bg-white p-3 rounded-xl border border-amber-200 space-y-2">
                <div className="text-xs font-black text-slate-800">الأصناف المختارة للسيارة:</div>
                <div className="space-y-1.5">
                  {selectedProducts.map((p) => (
                    <div
                      key={p.item.id}
                      className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg"
                    >
                      <div className="flex-1">
                        <span className="font-bold text-slate-800">{p.item.name}</span>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {p.item.sellingPrice} ج.م × {p.quantity} = {p.item.sellingPrice * p.quantity} ج.م
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                          <button
                            type="button"
                            onClick={() => handleUpdateProductQuantity(p.item.id, -1)}
                            className="p-1 hover:bg-slate-100 text-slate-600"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 font-mono font-bold text-slate-800">
                            {p.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateProductQuantity(p.item.id, 1)}
                            className="p-1 hover:bg-slate-100 text-slate-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(p.item.id)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Odometer & Next Oil Change Setup */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-sky-600" />
                  <span>عداد الكيلومتر الحالي</span>
                </label>
                <input
                  type="number"
                  placeholder="مثال: 75000"
                  value={currentOdometer}
                  onChange={(e) => setCurrentOdometer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-amber-600" />
                  <span>تغيير الزيت القادم عند عداد</span>
                </label>
                <input
                  type="number"
                  placeholder="مثال: 85000"
                  value={nextOilChangeOdometer}
                  onChange={(e) => setNextOilChangeOdometer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>تاريخ الموعد المقترح</span>
                </label>
                <input
                  type="date"
                  value={nextOilChangeDate}
                  onChange={(e) => setNextOilChangeDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* 4. Financials, Discount & Payment Method */}
          <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Payment Method Selector */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  طريقة الدفع:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'cash', label: 'كاش 💵' },
                    { id: 'instapay', label: 'إنستاباي ⚡' },
                    { id: 'vodafone_cash', label: 'فودافون كاش 📱' },
                    { id: 'visa', label: 'فيزا 💳' },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                      className={`py-2 px-3 rounded-xl font-bold border text-center transition-all cursor-pointer ${
                        paymentMethod === pm.id
                          ? 'bg-sky-500 border-sky-400 text-white shadow-lg shadow-sky-500/30'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  خصم إضافي (بالجنيه):
                </label>
                <input
                  type="number"
                  min="0"
                  max={subtotal}
                  value={discount || ''}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  placeholder="0 ج.م"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none text-xs"
                />
              </div>
            </div>

            {/* Total Display */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-slate-400 space-y-0.5">
                <div>المجموع الفرعي: {subtotal.toLocaleString('ar-EG')} ج.م</div>
                {discount > 0 && <div>الخصم المطبق: {discount.toLocaleString('ar-EG')} ج.م</div>}
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">المبلغ الإجمالي للدفع:</span>
                  <span className="text-2xl sm:text-3xl font-black text-sky-400 font-mono">
                    {grandTotal.toLocaleString('ar-EG')} ج.م
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black py-3 px-6 rounded-xl shadow-xl shadow-emerald-500/25 active:scale-95 transition-all text-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ وإصدار الفاتورة 🚀'}
                </button>
              </div>
            </div>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};
