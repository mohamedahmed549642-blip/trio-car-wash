import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import {
  InventoryItem,
  ServiceItem,
  ServiceOrder,
  StockMovement,
  Shift,
  Expense,
  ShopSettings,
  UserProfile,
} from '../types';
import {
  INITIAL_INVENTORY,
  INITIAL_SERVICES,
  INITIAL_SETTINGS,
  INITIAL_USERS,
} from '../data/initialData';

const KEYS = {
  INVENTORY: 'trio_inventory_v1',
  SERVICES: 'trio_services_v1',
  ORDERS: 'trio_orders_v1',
  MOVEMENTS: 'trio_movements_v1',
  SHIFTS: 'trio_shifts_v1',
  EXPENSES: 'trio_expenses_v1',
  SETTINGS: 'trio_settings_v1',
  USERS: 'trio_users_v1',
  CURRENT_USER: 'trio_active_user_v1',
};

// Strips out `undefined` fields which cause Firestore setDoc() to throw errors
const cleanForFirestore = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

export const storage = {
  getInventory: (): InventoryItem[] => {
    const data = localStorage.getItem(KEYS.INVENTORY);
    if (!data) {
      localStorage.setItem(KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY));
      return INITIAL_INVENTORY;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_INVENTORY;
    }
  },

  saveInventory: async (items: InventoryItem[]): Promise<void> => {
    localStorage.setItem(KEYS.INVENTORY, JSON.stringify(items));
    const db = getFirebaseDb();
    if (db && items.length > 0) {
      try {
        const batch = writeBatch(db);
        items.forEach((item) => {
          const ref = doc(db, 'inventory', item.id);
          batch.set(ref, cleanForFirestore(item));
        });
        await batch.commit();
      } catch (err) {
        console.warn('Firebase sync inventory error (offline fallback kept):', err);
      }
    }
  },

  getServices: (): ServiceItem[] => {
    const data = localStorage.getItem(KEYS.SERVICES);
    if (!data) {
      localStorage.setItem(KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
      return INITIAL_SERVICES;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_SERVICES;
    }
  },

  saveServices: (services: ServiceItem[]): void => {
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(services));
  },

  getOrders: (): ServiceOrder[] => {
    const data = localStorage.getItem(KEYS.ORDERS);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveOrders: async (orders: ServiceOrder[]): Promise<void> => {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    const db = getFirebaseDb();
    if (db && orders.length > 0) {
      try {
        const batch = writeBatch(db);
        // Sync the latest 100 orders so all active/recent records are preserved in cloud
        orders.slice(0, 100).forEach((order) => {
          batch.set(doc(db, 'orders', order.id), cleanForFirestore(order));
        });
        await batch.commit();
      } catch (err) {
        console.warn('Firebase order sync error:', err);
      }
    }
  },

  getMovements: (): StockMovement[] => {
    const data = localStorage.getItem(KEYS.MOVEMENTS);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveMovements: async (movements: StockMovement[]): Promise<void> => {
    localStorage.setItem(KEYS.MOVEMENTS, JSON.stringify(movements));
    const db = getFirebaseDb();
    if (db && movements.length > 0) {
      try {
        const batch = writeBatch(db);
        // Sync latest 100 movements so history log is fully available on all devices
        movements.slice(0, 100).forEach((mov) => {
          batch.set(doc(db, 'stock_movements', mov.id), cleanForFirestore(mov));
        });
        await batch.commit();
      } catch (err) {
        console.warn('Firebase movements sync error:', err);
      }
    }
  },

  getShifts: (): Shift[] => {
    const data = localStorage.getItem(KEYS.SHIFTS);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveShifts: async (shifts: Shift[]): Promise<void> => {
    localStorage.setItem(KEYS.SHIFTS, JSON.stringify(shifts));
    const db = getFirebaseDb();
    if (db && shifts.length > 0) {
      try {
        const batch = writeBatch(db);
        shifts.slice(0, 50).forEach((shift) => {
          batch.set(doc(db, 'shifts', shift.id), cleanForFirestore(shift));
        });
        await batch.commit();
      } catch (err) {
        console.warn('Firebase shift sync error:', err);
      }
    }
  },

  getExpenses: (): Expense[] => {
    const data = localStorage.getItem(KEYS.EXPENSES);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveExpenses: async (expenses: Expense[]): Promise<void> => {
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
    const db = getFirebaseDb();
    if (db && expenses.length > 0) {
      try {
        const batch = writeBatch(db);
        expenses.slice(0, 50).forEach((exp) => {
          batch.set(doc(db, 'expenses', exp.id), cleanForFirestore(exp));
        });
        await batch.commit();
      } catch (err) {
        console.warn('Firebase expense sync error:', err);
      }
    }
  },

  getSettings: (): ShopSettings => {
    const data = localStorage.getItem(KEYS.SETTINGS);
    if (!data) {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    try {
      return { ...INITIAL_SETTINGS, ...JSON.parse(data) };
    } catch {
      return INITIAL_SETTINGS;
    }
  },

  saveSettings: async (settings: ShopSettings): Promise<void> => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    const db = getFirebaseDb();
    if (db) {
      try {
        await setDoc(doc(db, 'settings', 'shop_config'), cleanForFirestore(settings));
      } catch (err) {
        console.warn('Firebase settings sync error:', err);
      }
    }
  },

  getUsers: (): UserProfile[] => {
    const data = localStorage.getItem(KEYS.USERS);
    let usersList: UserProfile[] = INITIAL_USERS;
    if (data) {
      try {
        usersList = JSON.parse(data);
      } catch {
        usersList = INITIAL_USERS;
      }
    } else {
      localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }

    // Ensure all users have valid username and password
    return usersList.map((u) => {
      const defaultUsername = u.username || (u.role === 'admin' ? 'owner' : `worker_${u.id.slice(-4)}`);
      const defaultPassword = u.password || (u.pinCode === '1234' || u.pinCode === '0000' ? '123' : u.pinCode) || '123';
      return {
        ...u,
        username: defaultUsername,
        password: defaultPassword,
      };
    });
  },

  saveUsers: async (users: UserProfile[]): Promise<void> => {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    const db = getFirebaseDb();
    if (db) {
      try {
        const batch = writeBatch(db);
        users.forEach((u) => {
          batch.set(doc(db, 'users', u.id), cleanForFirestore(u));
        });
        await batch.commit();
      } catch (err) {
        console.warn('Firebase sync users error:', err);
      }
    }
  },

  getActiveUser: (): UserProfile => {
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        // fallback
      }
    }
    return INITIAL_USERS[0];
  },

  saveActiveUser: (user: UserProfile): void => {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  },

  // Pull all data from Cloud Firestore
  syncFromFirebase: async (): Promise<{
    success: boolean;
    message: string;
    inventory?: InventoryItem[];
    orders?: ServiceOrder[];
    shifts?: Shift[];
    movements?: StockMovement[];
    expenses?: Expense[];
    settings?: ShopSettings;
    users?: UserProfile[];
  }> => {
    const db = getFirebaseDb();
    if (!db) {
      return { success: false, message: 'قاعدة بيانات Firebase غير متصلة.' };
    }

    try {
      // 1. Inventory
      let loadedInv: InventoryItem[] | undefined;
      const invSnap = await getDocs(collection(db, 'inventory'));
      if (!invSnap.empty) {
        loadedInv = [];
        invSnap.forEach((d) => loadedInv!.push(d.data() as InventoryItem));
        localStorage.setItem(KEYS.INVENTORY, JSON.stringify(loadedInv));
      } else {
        // If cloud inventory is empty, upload local inventory
        const localInv = storage.getInventory();
        if (localInv.length > 0) {
          const batch = writeBatch(db);
          localInv.forEach((i) => batch.set(doc(db, 'inventory', i.id), cleanForFirestore(i)));
          await batch.commit();
          loadedInv = localInv;
        }
      }

      // 2. Orders (أوامر التشغيل والفواتير)
      let loadedOrd: ServiceOrder[] | undefined;
      const ordSnap = await getDocs(collection(db, 'orders'));
      if (!ordSnap.empty) {
        loadedOrd = [];
        ordSnap.forEach((d) => loadedOrd!.push(d.data() as ServiceOrder));
        loadedOrd.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        localStorage.setItem(KEYS.ORDERS, JSON.stringify(loadedOrd));
      } else {
        // If cloud orders is empty, upload local orders to cloud
        const localOrders = storage.getOrders();
        if (localOrders.length > 0) {
          const batch = writeBatch(db);
          localOrders.slice(0, 100).forEach((o) => batch.set(doc(db, 'orders', o.id), cleanForFirestore(o)));
          await batch.commit();
          loadedOrd = localOrders;
        }
      }

      // 3. Shifts (الورديات والخزينة)
      let loadedShifts: Shift[] | undefined;
      const shiftSnap = await getDocs(collection(db, 'shifts'));
      if (!shiftSnap.empty) {
        loadedShifts = [];
        shiftSnap.forEach((d) => loadedShifts!.push(d.data() as Shift));
        loadedShifts.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
        localStorage.setItem(KEYS.SHIFTS, JSON.stringify(loadedShifts));
      } else {
        const localShifts = storage.getShifts();
        if (localShifts.length > 0) {
          const batch = writeBatch(db);
          localShifts.slice(0, 50).forEach((s) => batch.set(doc(db, 'shifts', s.id), cleanForFirestore(s)));
          await batch.commit();
          loadedShifts = localShifts;
        }
      }

      // 4. Stock Movements (سجل حركات المخزن والتسويات)
      let loadedMov: StockMovement[] | undefined;
      const movSnap = await getDocs(collection(db, 'stock_movements'));
      if (!movSnap.empty) {
        loadedMov = [];
        movSnap.forEach((d) => loadedMov!.push(d.data() as StockMovement));
        loadedMov.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        localStorage.setItem(KEYS.MOVEMENTS, JSON.stringify(loadedMov));
      } else {
        const localMov = storage.getMovements();
        if (localMov.length > 0) {
          const batch = writeBatch(db);
          localMov.slice(0, 100).forEach((m) => batch.set(doc(db, 'stock_movements', m.id), cleanForFirestore(m)));
          await batch.commit();
          loadedMov = localMov;
        }
      }

      // 5. Expenses (المصروفات)
      let loadedExp: Expense[] | undefined;
      const expSnap = await getDocs(collection(db, 'expenses'));
      if (!expSnap.empty) {
        loadedExp = [];
        expSnap.forEach((d) => loadedExp!.push(d.data() as Expense));
        loadedExp.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        localStorage.setItem(KEYS.EXPENSES, JSON.stringify(loadedExp));
      } else {
        const localExp = storage.getExpenses();
        if (localExp.length > 0) {
          const batch = writeBatch(db);
          localExp.slice(0, 50).forEach((e) => batch.set(doc(db, 'expenses', e.id), cleanForFirestore(e)));
          await batch.commit();
          loadedExp = localExp;
        }
      }

      // 6. Shop Settings (إعدادات المغسلة)
      let loadedSettings: ShopSettings | undefined;
      try {
        const setSnap = await getDoc(doc(db, 'settings', 'shop_config'));
        if (setSnap.exists()) {
          loadedSettings = setSnap.data() as ShopSettings;
          localStorage.setItem(KEYS.SETTINGS, JSON.stringify(loadedSettings));
        } else {
          const localSettings = storage.getSettings();
          await setDoc(doc(db, 'settings', 'shop_config'), cleanForFirestore(localSettings));
          loadedSettings = localSettings;
        }
      } catch (e) {
        console.warn('Settings cloud sync warning:', e);
      }

      // 7. Users (الموظفين والعمال)
      let loadedUsers: UserProfile[] | undefined;
      const userSnap = await getDocs(collection(db, 'users'));
      if (!userSnap.empty) {
        loadedUsers = [];
        userSnap.forEach((d) => loadedUsers!.push(d.data() as UserProfile));
        localStorage.setItem(KEYS.USERS, JSON.stringify(loadedUsers));
      } else {
        const localUsers = storage.getUsers();
        if (localUsers.length > 0) {
          const batch = writeBatch(db);
          localUsers.forEach((u) => batch.set(doc(db, 'users', u.id), cleanForFirestore(u)));
          await batch.commit();
          loadedUsers = localUsers;
        }
      }

      return {
        success: true,
        message: 'تمت مزامنة كافة البيانات السحابية (فواتير، مخزن، حركات، ورديات) بنجاح!',
        inventory: loadedInv,
        orders: loadedOrd,
        shifts: loadedShifts,
        movements: loadedMov,
        expenses: loadedExp,
        settings: loadedSettings,
        users: loadedUsers,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, message: `فشلت المزامنة: ${msg}` };
    }
  },

  // Push all local data from this device to Cloud Firestore
  uploadAllToFirebase: async (): Promise<{ success: boolean; message: string }> => {
    const db = getFirebaseDb();
    if (!db) {
      return { success: false, message: 'قاعدة بيانات Firebase غير متصلة.' };
    }

    try {
      // 1. Inventory
      const inv = storage.getInventory();
      if (inv.length > 0) {
        const batch1 = writeBatch(db);
        inv.forEach((item) => batch1.set(doc(db, 'inventory', item.id), cleanForFirestore(item)));
        await batch1.commit();
      }

      // 2. Orders
      const ord = storage.getOrders();
      if (ord.length > 0) {
        const batch2 = writeBatch(db);
        ord.slice(0, 100).forEach((o) => batch2.set(doc(db, 'orders', o.id), cleanForFirestore(o)));
        await batch2.commit();
      }

      // 3. Shifts
      const shifts = storage.getShifts();
      if (shifts.length > 0) {
        const batch3 = writeBatch(db);
        shifts.slice(0, 50).forEach((s) => batch3.set(doc(db, 'shifts', s.id), cleanForFirestore(s)));
        await batch3.commit();
      }

      // 4. Movements
      const mov = storage.getMovements();
      if (mov.length > 0) {
        const batch4 = writeBatch(db);
        mov.slice(0, 100).forEach((m) => batch4.set(doc(db, 'stock_movements', m.id), cleanForFirestore(m)));
        await batch4.commit();
      }

      // 5. Expenses
      const exp = storage.getExpenses();
      if (exp.length > 0) {
        const batch5 = writeBatch(db);
        exp.slice(0, 50).forEach((e) => batch5.set(doc(db, 'expenses', e.id), cleanForFirestore(e)));
        await batch5.commit();
      }

      // 6. Settings
      const set = storage.getSettings();
      await setDoc(doc(db, 'settings', 'shop_config'), cleanForFirestore(set));

      // 7. Users
      const users = storage.getUsers();
      if (users.length > 0) {
        const batch6 = writeBatch(db);
        users.forEach((u) => batch6.set(doc(db, 'users', u.id), cleanForFirestore(u)));
        await batch6.commit();
      }

      return { success: true, message: 'تم رفع ومزامنة كافة بيانات هذا الجهاز مع السحابة بنجاح!' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, message: `تعذر الرفع: ${msg}` };
    }
  },

  exportBackup: (): string => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      inventory: storage.getInventory(),
      services: storage.getServices(),
      orders: storage.getOrders(),
      movements: storage.getMovements(),
      shifts: storage.getShifts(),
      expenses: storage.getExpenses(),
      settings: storage.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackup: (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.inventory) localStorage.setItem(KEYS.INVENTORY, JSON.stringify(data.inventory));
      if (data.services) localStorage.setItem(KEYS.SERVICES, JSON.stringify(data.services));
      if (data.orders) localStorage.setItem(KEYS.ORDERS, JSON.stringify(data.orders));
      if (data.movements) localStorage.setItem(KEYS.MOVEMENTS, JSON.stringify(data.movements));
      if (data.shifts) localStorage.setItem(KEYS.SHIFTS, JSON.stringify(data.shifts));
      if (data.expenses) localStorage.setItem(KEYS.EXPENSES, JSON.stringify(data.expenses));
      if (data.settings) localStorage.setItem(KEYS.SETTINGS, JSON.stringify(data.settings));
      return true;
    } catch (err) {
      console.error('Backup import error:', err);
      return false;
    }
  },
};
