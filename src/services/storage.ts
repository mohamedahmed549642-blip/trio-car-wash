import {
  collection,
  doc,
  setDoc,
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
    if (db) {
      try {
        const batch = writeBatch(db);
        items.forEach((item) => {
          const ref = doc(db, 'inventory', item.id);
          batch.set(ref, item);
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
        const latest = orders[0];
        if (latest) {
          await setDoc(doc(db, 'orders', latest.id), latest);
        }
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
        const latest = movements[0];
        if (latest) {
          await setDoc(doc(db, 'stock_movements', latest.id), latest);
        }
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
        const latest = shifts[0];
        if (latest) {
          await setDoc(doc(db, 'shifts', latest.id), latest);
        }
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
        const latest = expenses[0];
        if (latest) {
          await setDoc(doc(db, 'expenses', latest.id), latest);
        }
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
        await setDoc(doc(db, 'settings', 'shop_config'), settings);
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
          batch.set(doc(db, 'users', u.id), u);
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
  syncFromFirebase: async (): Promise<{ success: boolean; message: string }> => {
    const db = getFirebaseDb();
    if (!db) {
      return { success: false, message: 'قاعدة بيانات Firebase غير متصلة.' };
    }

    try {
      const invSnap = await getDocs(collection(db, 'inventory'));
      if (!invSnap.empty) {
        const loadedInv: InventoryItem[] = [];
        invSnap.forEach((d) => loadedInv.push(d.data() as InventoryItem));
        localStorage.setItem(KEYS.INVENTORY, JSON.stringify(loadedInv));
      }

      const ordSnap = await getDocs(collection(db, 'orders'));
      if (!ordSnap.empty) {
        const loadedOrd: ServiceOrder[] = [];
        ordSnap.forEach((d) => loadedOrd.push(d.data() as ServiceOrder));
        localStorage.setItem(KEYS.ORDERS, JSON.stringify(loadedOrd));
      }

      return { success: true, message: 'تمت مزامنة البيانات السحابية بنجاح!' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, message: `فشلت المزامنة: ${msg}` };
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
