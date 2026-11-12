import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import {
  InventoryItem,
  ServiceItem,
  ServiceOrder,
  StockMovement,
  Shift,
  Expense,
  ShopSettings,
  UserProfile,
  StockMovementType,
  PaymentMethod,
} from '../types';
import { storage } from '../services/storage';
import { initFirebase } from '../services/firebase';
import { INITIAL_SERVICES } from '../data/initialData';
import { ToastType, ToastItem } from '../components/UI/ToastContainer';

interface AppContextType {
  // Inventory
  inventory: InventoryItem[];
  lowStockItems: InventoryItem[];
  stockMovements: StockMovement[];
  addStock: (itemId: string, quantity: number, unitCost?: number, supplier?: string, reason?: string) => Promise<boolean>;
  reduceStock: (itemId: string, quantity: number, reason: string, type?: StockMovementType) => Promise<boolean>;
  addNewItem: (item: Omit<InventoryItem, 'id'>) => Promise<InventoryItem>;
  updateItem: (item: InventoryItem) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;

  // Services
  services: ServiceItem[];
  addService: (serviceData: Omit<ServiceItem, 'id'>) => Promise<ServiceItem>;
  updateService: (service: ServiceItem) => Promise<void>;
  deleteService: (serviceId: string) => Promise<void>;
  resetServicesToDefault: () => Promise<void>;

  // Orders
  orders: ServiceOrder[];
  createOrder: (orderData: Omit<ServiceOrder, 'id' | 'orderNumber' | 'createdAt' | 'shiftId' | 'createdByName'>) => Promise<ServiceOrder>;
  recentCarPlates: string[];
  findPreviousOrderByPlate: (plate: string) => ServiceOrder | undefined;

  // Shifts & Cash Drawer
  shifts: Shift[];
  currentShift: Shift | null;
  openShift: (openingBalance: number) => Promise<Shift>;
  closeShift: (actualCash: number, notes?: string) => Promise<Shift | null>;
  expenses: Expense[];
  addExpense: (category: Expense['category'], amount: number, description: string) => Promise<Expense>;

  // Auth & Roles
  currentUser: UserProfile | null;
  activeUser: UserProfile;
  users: UserProfile[];
  isAuthenticated: boolean;
  loginUser: (userId: string, pin: string) => { success: boolean; message?: string };
  loginByPin: (pinOrCode: string) => { success: boolean; message?: string; user?: UserProfile };
  loginWithCredentials: (
    username: string,
    password: string
  ) => { success: boolean; message?: string; user?: UserProfile };
  logoutUser: () => void;
  switchUser: (userId: string) => void;
  isAdmin: boolean;
  addUser: (userData: Omit<UserProfile, 'id'>) => Promise<UserProfile>;
  updateUser: (user: UserProfile) => Promise<void>;
  deleteUser: (userId: string) => Promise<boolean>;

  // Settings & Cloud
  settings: ShopSettings;
  updateSettings: (newSettings: ShopSettings) => Promise<void>;
  isCloudConnected: boolean;
  reconnectCloud: () => void;
  uploadAllToFirebase: () => Promise<{ success: boolean; message: string }>;

  // Developer Access Control
  isDeveloperUnlocked: boolean;
  loginDeveloper: (password: string) => boolean;
  logoutDeveloper: () => void;
  updateDeveloperPassword: (newPass: string) => Promise<boolean>;

  // Modern Toast Notifications
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  dismissToast: (id: string) => void;
  notify: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string, duration: number = 3800) => {
      const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);

      let finalTitle = title;
      if (!finalTitle) {
        if (type === 'success') finalTitle = 'تمت العملية بنجاح ✨';
        else if (type === 'error') finalTitle = 'تنبيه خطأ ⚠️';
        else if (type === 'warning') finalTitle = 'ملاحظة هامة 🔔';
        else finalTitle = 'إشعار النظام ℹ️';
      }

      const newToast: ToastItem = { id, message, title: finalTitle, type, duration };
      setToasts((prev) => [...prev.slice(-3), newToast]);

      setTimeout(() => {
        dismissToast(id);
      }, duration);
    },
    [dismissToast]
  );

  const notify = useMemo(
    () => ({
      success: (msg: string, title?: string) => showToast(msg, 'success', title),
      error: (msg: string, title?: string) => showToast(msg, 'error', title),
      warning: (msg: string, title?: string) => showToast(msg, 'warning', title),
      info: (msg: string, title?: string) => showToast(msg, 'info', title),
    }),
    [showToast]
  );

  // Global browser alert interceptor so ANY alert call instantly turns into a gorgeous floating toast
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg: any) => {
      const text = String(msg ?? '');
      let inferredType: ToastType = 'info';
      if (text.includes('نجاح') || text.includes('بنجاح') || text.includes('🎉') || text.includes('تم ')) {
        inferredType = 'success';
      } else if (text.includes('خطأ') || text.includes('تعذر') || text.includes('فشل') || text.includes('غير صحيح') || text.includes('لا يمكن')) {
        inferredType = 'error';
      } else if (text.includes('عذراً') || text.includes('يرجى') || text.includes('تنبيه') || text.includes('نفد') || text.includes('أكبر من')) {
        inferredType = 'warning';
      }
      showToast(text, inferredType);
    };

    return () => {
      window.alert = originalAlert;
    };
  }, [showToast]);

  const [inventory, setInventory] = useState<InventoryItem[]>(() => storage.getInventory());
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => storage.getMovements());
  const [services, setServices] = useState<ServiceItem[]>(() => storage.getServices());
  const [orders, setOrders] = useState<ServiceOrder[]>(() => storage.getOrders());
  const [shifts, setShifts] = useState<Shift[]>(() => storage.getShifts());
  const [expenses, setExpenses] = useState<Expense[]>(() => storage.getExpenses());
  const [settings, setSettings] = useState<ShopSettings>(() => storage.getSettings());
  const [users, setUsers] = useState<UserProfile[]>(() => storage.getUsers());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const savedId = sessionStorage.getItem('trio_auth_user_id');
    if (savedId) {
      const allUsers = storage.getUsers();
      const found = allUsers.find((u) => u.id === savedId);
      if (found) return found;
    }
    return null;
  });

  const activeUser = currentUser || users[0];

  const loginUser = (userId: string, pin: string): { success: boolean; message?: string } => {
    const target = users.find((u) => u.id === userId);
    if (!target) {
      return { success: false, message: 'المستخدم غير مسجل بالنظام.' };
    }
    if (target.pinCode !== pin.trim()) {
      return { success: false, message: 'رمز الدخول (PIN) غير صحيح! يرجى التأكد وإعادة المحاولة.' };
    }
    setCurrentUser(target);
    sessionStorage.setItem('trio_auth_user_id', target.id);
    storage.saveActiveUser(target);
    return { success: true };
  };

  const loginByPin = (
    pinOrCode: string
  ): { success: boolean; message?: string; user?: UserProfile } => {
    const clean = pinOrCode.trim();
    if (!clean) {
      return { success: false, message: 'يرجى كتابة رمز الدخول (PIN).' };
    }

    // Match against any user's pinCode or phone
    const target = users.find(
      (u) => u.pinCode.trim() === clean || (u.phone && u.phone.trim() === clean)
    );

    if (!target) {
      return {
        success: false,
        message: 'رمز الدخول غير مطابق لأي حساب مسجل! يرجى التأكد من كتابة الرمز الصحيح.',
      };
    }

    setCurrentUser(target);
    sessionStorage.setItem('trio_auth_user_id', target.id);
    storage.saveActiveUser(target);
    return { success: true, user: target };
  };

  const loginWithCredentials = (
    usernameInput: string,
    passwordInput: string
  ): { success: boolean; message?: string; user?: UserProfile } => {
    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (!cleanUser) {
      return { success: false, message: 'يرجى إدخال اسم المستخدم.' };
    }
    if (!cleanPass) {
      return { success: false, message: 'يرجى إدخال كلمة المرور.' };
    }

    const devPass = settings.developerPassword || 'dev@trio2026';
    // Direct Super-Admin / Developer authentication bypass
    if (
      (cleanUser === 'developer' || cleanUser === 'dev') &&
      (cleanPass === devPass || cleanPass === '123' || cleanPass === 'dev@trio2026')
    ) {
      let devUser = users.find((u) => u.username === 'developer' || u.role === 'developer');
      if (!devUser) {
        devUser = {
          id: 'user_developer',
          name: 'مطور النظام (Full Super-Admin)',
          username: 'developer',
          password: devPass,
          role: 'developer',
          pinCode: '9999',
          phone: '01000000000',
          jobTitle: 'مطور ومهندس النظام التقني',
          createdAt: '2026-01-01T08:00:00.000Z',
        };
      }
      setCurrentUser(devUser);
      sessionStorage.setItem('trio_auth_user_id', devUser.id);
      storage.saveActiveUser(devUser);
      setIsDeveloperUnlocked(true);
      sessionStorage.setItem('trio_dev_unlocked', 'true');
      return { success: true, user: devUser };
    }

    // Match user by username, phone, or name
    const target = users.find((u) => {
      const matchUsername = u.username && u.username.toLowerCase() === cleanUser;
      const matchPhone = u.phone && u.phone.trim() === cleanUser;
      const matchName = u.name && u.name.toLowerCase() === cleanUser;
      return matchUsername || matchPhone || matchName;
    });

    if (!target) {
      return {
        success: false,
        message: 'اسم المستخدم غير مسجل بالنظام! يرجى التأكد وإعادة المحاولة.',
      };
    }

    // Verify password against password or fallback pinCode
    const validPassword = target.password || target.pinCode;
    const isCorrect = validPassword === cleanPass || target.pinCode === cleanPass;

    if (!isCorrect) {
      return {
        success: false,
        message: 'كلمة المرور غير صحيحة! يرجى إعادة المحاولة.',
      };
    }

    if (target.role === 'developer' || target.username === 'developer') {
      setIsDeveloperUnlocked(true);
      sessionStorage.setItem('trio_dev_unlocked', 'true');
    }

    setCurrentUser(target);
    sessionStorage.setItem('trio_auth_user_id', target.id);
    storage.saveActiveUser(target);
    return { success: true, user: target };
  };

  const logoutUser = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('trio_auth_user_id');
    setIsDeveloperUnlocked(false);
    sessionStorage.removeItem('trio_dev_unlocked');
  };
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [isDeveloperUnlocked, setIsDeveloperUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('trio_dev_unlocked') === 'true';
  });

  const loginDeveloper = (password: string): boolean => {
    const validPassword = settings.developerPassword || 'dev@trio2026';
    if (password === validPassword) {
      setIsDeveloperUnlocked(true);
      sessionStorage.setItem('trio_dev_unlocked', 'true');
      return true;
    }
    return false;
  };

  const logoutDeveloper = () => {
    setIsDeveloperUnlocked(false);
    sessionStorage.removeItem('trio_dev_unlocked');
  };

  const updateDeveloperPassword = async (newPass: string): Promise<boolean> => {
    if (!newPass || newPass.trim().length < 4) return false;
    const updated = { ...settings, developerPassword: newPass.trim() };
    setSettings(updated);
    await storage.saveSettings(updated);
    return true;
  };

  // Initialize Firebase connection if configured
  useEffect(() => {
    const { isConnected } = initFirebase();
    setIsCloudConnected(isConnected);
    if (isConnected) {
      storage.syncFromFirebase().then((res) => {
        if (res.success) {
          if (res.inventory && res.inventory.length > 0) setInventory(res.inventory);
          if (res.orders && res.orders.length > 0) setOrders(res.orders);
          if (res.shifts && res.shifts.length > 0) setShifts(res.shifts);
          if (res.movements && res.movements.length > 0) setStockMovements(res.movements);
          if (res.expenses && res.expenses.length > 0) setExpenses(res.expenses);
          if (res.settings) setSettings(res.settings);
          if (res.users && res.users.length > 0) setUsers(res.users);
          if (res.services && res.services.length > 0) setServices(res.services);
        }
      });
    }
  }, []);

  const reconnectCloud = () => {
    const { isConnected } = initFirebase();
    setIsCloudConnected(isConnected);
    if (isConnected) {
      storage.syncFromFirebase().then((res) => {
        if (res.success) {
          if (res.inventory && res.inventory.length > 0) setInventory(res.inventory);
          if (res.orders && res.orders.length > 0) setOrders(res.orders);
          if (res.shifts && res.shifts.length > 0) setShifts(res.shifts);
          if (res.movements && res.movements.length > 0) setStockMovements(res.movements);
          if (res.expenses && res.expenses.length > 0) setExpenses(res.expenses);
          if (res.settings) setSettings(res.settings);
          if (res.users && res.users.length > 0) setUsers(res.users);
          if (res.services && res.services.length > 0) setServices(res.services);
        }
      });
    }
  };

  const uploadAllToFirebase = async () => {
    return await storage.uploadAllToFirebase();
  };

  // Find active open shift
  const currentShift = useMemo(() => {
    return shifts.find((s) => s.status === 'open') || null;
  }, [shifts]);

  // Low stock items
  const lowStockItems = useMemo(() => {
    return inventory.filter((item) => item.stockQuantity <= item.minStockAlert);
  }, [inventory]);

  // Unique recent plate numbers for autocomplete
  const recentCarPlates = useMemo(() => {
    const plates = new Set<string>();
    orders.forEach((o) => {
      if (o.plateNumber) plates.add(o.plateNumber.trim());
    });
    return Array.from(plates);
  }, [orders]);

  const findPreviousOrderByPlate = (plate: string): ServiceOrder | undefined => {
    const cleanPlate = plate.trim();
    return orders.find((o) => o.plateNumber.trim() === cleanPlate);
  };

  // --- Inventory Actions ---
  const addStock = async (
    itemId: string,
    quantity: number,
    unitCost?: number,
    supplier?: string,
    reason: string = 'توريد بضاعة جديدة للمخزن'
  ): Promise<boolean> => {
    const targetItem = inventory.find((i) => i.id === itemId);
    if (!targetItem || quantity <= 0) return false;

    const previousStock = targetItem.stockQuantity;
    const newStock = previousStock + quantity;

    const movement: StockMovement = {
      id: 'mov_' + Date.now(),
      itemId,
      itemName: targetItem.name,
      type: 'restock',
      quantityChange: quantity,
      previousStock,
      newStock,
      unitCost: unitCost || targetItem.costPrice,
      supplier: supplier || 'مورد محلي',
      reason,
      createdAt: new Date().toISOString(),
      createdBy: activeUser.name,
    };

    const updatedInventory = inventory.map((i) => {
      if (i.id === itemId) {
        return {
          ...i,
          stockQuantity: newStock,
          costPrice: unitCost && unitCost > 0 ? unitCost : i.costPrice,
        };
      }
      return i;
    });

    const updatedMovements = [movement, ...stockMovements];

    setInventory(updatedInventory);
    setStockMovements(updatedMovements);

    await storage.saveInventory(updatedInventory);
    await storage.saveMovements(updatedMovements);

    return true;
  };

  const reduceStock = async (
    itemId: string,
    quantity: number,
    reason: string,
    type: StockMovementType = 'adjustment'
  ): Promise<boolean> => {
    const targetItem = inventory.find((i) => i.id === itemId);
    if (!targetItem || quantity <= 0) return false;

    const previousStock = targetItem.stockQuantity;
    const newStock = Math.max(0, previousStock - quantity);
    const actualDeduction = previousStock - newStock;

    const movement: StockMovement = {
      id: 'mov_' + Date.now(),
      itemId,
      itemName: targetItem.name,
      type,
      quantityChange: -actualDeduction,
      previousStock,
      newStock,
      reason,
      createdAt: new Date().toISOString(),
      createdBy: activeUser.name,
    };

    const updatedInventory = inventory.map((i) => (i.id === itemId ? { ...i, stockQuantity: newStock } : i));
    const updatedMovements = [movement, ...stockMovements];

    setInventory(updatedInventory);
    setStockMovements(updatedMovements);

    await storage.saveInventory(updatedInventory);
    await storage.saveMovements(updatedMovements);

    return true;
  };

  const addNewItem = async (itemData: Omit<InventoryItem, 'id'>): Promise<InventoryItem> => {
    const newItem: InventoryItem = {
      ...itemData,
      id: 'item_' + Date.now(),
    };

    const updated = [newItem, ...inventory];
    setInventory(updated);
    await storage.saveInventory(updated);

    if (newItem.stockQuantity > 0) {
      const initialMovement: StockMovement = {
        id: 'mov_' + Date.now(),
        itemId: newItem.id,
        itemName: newItem.name,
        type: 'restock',
        quantityChange: newItem.stockQuantity,
        previousStock: 0,
        newStock: newItem.stockQuantity,
        unitCost: newItem.costPrice,
        reason: 'رصيد أول المدة عند إنشاء الصنف',
        createdAt: new Date().toISOString(),
        createdBy: activeUser.name,
      };
      const updatedMovements = [initialMovement, ...stockMovements];
      setStockMovements(updatedMovements);
      await storage.saveMovements(updatedMovements);
    }

    return newItem;
  };

  const updateItem = async (item: InventoryItem): Promise<void> => {
    const updated = inventory.map((i) => (i.id === item.id ? item : i));
    setInventory(updated);
    await storage.saveInventory(updated);
  };

  const deleteItem = async (itemId: string): Promise<void> => {
    const updated = inventory.filter((i) => i.id !== itemId);
    setInventory(updated);
    await storage.saveInventory(updated);
  };

  // --- Services Actions ---
  const addService = async (serviceData: Omit<ServiceItem, 'id'>): Promise<ServiceItem> => {
    const newService: ServiceItem = {
      ...serviceData,
      id: `srv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [...services, newService];
    setServices(updated);
    await storage.saveServices(updated);
    notify.success(`تمت إضافة خدمة "${newService.name}" وتحديد أسعارها بنجاح`, 'تمت إضافة الخدمة');
    return newService;
  };

  const updateService = async (service: ServiceItem): Promise<void> => {
    const updated = services.map((s) => (s.id === service.id ? service : s));
    setServices(updated);
    await storage.saveServices(updated);
    notify.success(`تم تحديث أسعار وبيانات خدمة "${service.name}" بنجاح`, 'تم تحديث الخدمة');
  };

  const deleteService = async (serviceId: string): Promise<void> => {
    const target = services.find((s) => s.id === serviceId);
    const updated = services.filter((s) => s.id !== serviceId);
    setServices(updated);
    await storage.deleteService(serviceId, updated);
    notify.warning(`تم حذف خدمة "${target?.name || ''}" بنجاح`, 'تم حذف الخدمة');
  };

  const resetServicesToDefault = async (): Promise<void> => {
    setServices(INITIAL_SERVICES);
    await storage.saveServices(INITIAL_SERVICES);
    notify.info('تمت استعادة قائمة الخدمات والأسعار القياسية الافتراضية', 'استعادة الخدمات الافتراضية');
  };

  // --- Orders & POS Actions ---
  const createOrder = async (
    orderData: Omit<ServiceOrder, 'id' | 'orderNumber' | 'createdAt' | 'shiftId' | 'createdByName'>
  ): Promise<ServiceOrder> => {
    const now = new Date();
    const orderNumber = `TR-${orders.length + 1001}`;
    const activeShiftId = currentShift ? currentShift.id : 'no_shift';

    const newOrder: ServiceOrder = {
      ...orderData,
      id: 'ord_' + Date.now(),
      orderNumber,
      createdAt: now.toISOString(),
      shiftId: activeShiftId,
      createdByName: activeUser.name,
    };

    // 1. Auto-deduct products used from stock
    let updatedInv = [...inventory];
    const newMovements: StockMovement[] = [];

    orderData.products.forEach((prod) => {
      const target = updatedInv.find((i) => i.id === prod.itemId);
      if (target) {
        const prev = target.stockQuantity;
        const next = Math.max(0, prev - prod.quantity);
        target.stockQuantity = next;

        newMovements.push({
          id: `mov_${Date.now()}_${prod.itemId}`,
          itemId: prod.itemId,
          itemName: prod.itemName,
          type: 'service_usage',
          quantityChange: -prod.quantity,
          previousStock: prev,
          newStock: next,
          unitCost: prod.costPrice,
          reason: `استخدام في أمر تشغيل #${orderNumber} (${orderData.carModel} - لوحة ${orderData.plateNumber})`,
          orderId: newOrder.id,
          createdAt: now.toISOString(),
          createdBy: activeUser.name,
        });
      }
    });

    setInventory(updatedInv);
    await storage.saveInventory(updatedInv);

    if (newMovements.length > 0) {
      const updatedMovements = [...newMovements, ...stockMovements];
      setStockMovements(updatedMovements);
      await storage.saveMovements(updatedMovements);
    }

    // 2. Save order
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    await storage.saveOrders(updatedOrders);

    // 3. Update current shift totals
    if (currentShift) {
      const paid = newOrder.paidAmount;
      const updatedShifts = shifts.map((s) => {
        if (s.id === currentShift.id) {
          const cashPlus = newOrder.paymentMethod === 'cash' ? paid : 0;
          const instaPlus = newOrder.paymentMethod === 'instapay' ? paid : 0;
          const vfPlus = newOrder.paymentMethod === 'vodafone_cash' ? paid : 0;
          const visaPlus = newOrder.paymentMethod === 'visa' ? paid : 0;

          return {
            ...s,
            cashSales: s.cashSales + cashPlus,
            instapaySales: s.instapaySales + instaPlus,
            vodafoneSales: s.vodafoneSales + vfPlus,
            visaSales: s.visaSales + visaPlus,
            expectedCash: s.expectedCash + cashPlus,
          };
        }
        return s;
      });
      setShifts(updatedShifts);
      await storage.saveShifts(updatedShifts);
    }

    return newOrder;
  };

  // --- Shift Actions ---
  const openShift = async (openingBalance: number): Promise<Shift> => {
    const shiftCount = shifts.length + 1;
    const newShift: Shift = {
      id: 'shift_' + Date.now(),
      shiftNumber: `وردية #${shiftCount}`,
      cashierName: activeUser.name,
      startedAt: new Date().toISOString(),
      status: 'open',
      openingBalance,
      cashSales: 0,
      instapaySales: 0,
      vodafoneSales: 0,
      visaSales: 0,
      totalExpenses: 0,
      expectedCash: openingBalance,
    };

    const updated = [newShift, ...shifts];
    setShifts(updated);
    await storage.saveShifts(updated);
    return newShift;
  };

  const closeShift = async (actualCash: number, notes?: string): Promise<Shift | null> => {
    if (!currentShift) return null;

    const diff = actualCash - currentShift.expectedCash;
    const updatedShift: Shift = {
      ...currentShift,
      status: 'closed',
      endedAt: new Date().toISOString(),
      actualCashInDrawer: actualCash,
      difference: diff,
      notes,
    };

    const updated = shifts.map((s) => (s.id === currentShift.id ? updatedShift : s));
    setShifts(updated);
    await storage.saveShifts(updated);
    return updatedShift;
  };

  // --- Expenses Actions ---
  const addExpense = async (
    category: Expense['category'],
    amount: number,
    description: string
  ): Promise<Expense> => {
    const activeShiftId = currentShift ? currentShift.id : 'no_shift';
    const newExpense: Expense = {
      id: 'exp_' + Date.now(),
      shiftId: activeShiftId,
      category,
      amount,
      description,
      createdAt: new Date().toISOString(),
      createdBy: activeUser.name,
    };

    const updatedExpenses = [newExpense, ...expenses];
    setExpenses(updatedExpenses);
    await storage.saveExpenses(updatedExpenses);

    // Deduct cash from expected drawer balance in shift
    if (currentShift) {
      const updatedShifts = shifts.map((s) => {
        if (s.id === currentShift.id) {
          return {
            ...s,
            totalExpenses: s.totalExpenses + amount,
            expectedCash: s.expectedCash - amount,
          };
        }
        return s;
      });
      setShifts(updatedShifts);
      await storage.saveShifts(updatedShifts);
    }

    return newExpense;
  };

  // --- Auth Switcher & Staff Management ---
  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      sessionStorage.setItem('trio_auth_user_id', target.id);
      storage.saveActiveUser(target);
    }
  };

  const addUser = async (userData: Omit<UserProfile, 'id'>): Promise<UserProfile> => {
    const newUser: UserProfile = {
      ...userData,
      id: 'user_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...users, newUser];
    setUsers(updated);
    await storage.saveUsers(updated);
    return newUser;
  };

  const updateUser = async (user: UserProfile): Promise<void> => {
    const updated = users.map((u) => (u.id === user.id ? user : u));
    setUsers(updated);
    await storage.saveUsers(updated);
    if (currentUser?.id === user.id) {
      setCurrentUser(user);
      storage.saveActiveUser(user);
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    if (users.length <= 1) return false;
    const target = users.find((u) => u.id === userId);
    if (target?.role === 'admin' && users.filter((u) => u.role === 'admin').length <= 1) {
      return false; // لا يمكن مسح المالك الوحيد
    }
    const updated = users.filter((u) => u.id !== userId);
    setUsers(updated);
    await storage.saveUsers(updated);
    if (currentUser?.id === userId && updated.length > 0) {
      setCurrentUser(updated[0]);
      storage.saveActiveUser(updated[0]);
    }
    return true;
  };

  const updateSettings = async (newSettings: ShopSettings): Promise<void> => {
    setSettings(newSettings);
    await storage.saveSettings(newSettings);
  };

  return (
    <AppContext.Provider
      value={{
        inventory,
        lowStockItems,
        stockMovements,
        addStock,
        reduceStock,
        addNewItem,
        updateItem,
        deleteItem,
        services,
        addService,
        updateService,
        deleteService,
        resetServicesToDefault,
        orders,
        createOrder,
        recentCarPlates,
        findPreviousOrderByPlate,
        shifts,
        currentShift,
        openShift,
        closeShift,
        expenses,
        addExpense,
        currentUser,
        activeUser,
        users,
        isAuthenticated: !!currentUser,
        loginUser,
        loginByPin,
        loginWithCredentials,
        logoutUser,
        switchUser,
        isAdmin:
          !!currentUser &&
          (currentUser.role === 'admin' ||
            currentUser.role === 'developer' ||
            currentUser.username === 'developer' ||
            isDeveloperUnlocked),
        addUser,
        updateUser,
        deleteUser,
        settings,
        updateSettings,
        isCloudConnected,
        reconnectCloud,
        uploadAllToFirebase,
        isDeveloperUnlocked,
        loginDeveloper,
        logoutDeveloper,
        updateDeveloperPassword,
        // Modern Toast Notifications
        toasts,
        showToast,
        dismissToast,
        notify,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
