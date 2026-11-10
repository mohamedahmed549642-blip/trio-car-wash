export type UserRole = 'admin' | 'cashier';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  pinCode: string;
}

export type VehicleSize = 'sedan' | 'suv' | 'van' | 'motorcycle';

export type ProductCategory = 'oil' | 'filter' | 'fluid' | 'wash_supply' | 'accessory';

export interface InventoryItem {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  viscosity?: string; // e.g. 5W-40, 5W-30, 10W-40, 20W-50
  oilKmType?: number; // 3000, 5000, 10000 km
  packageType: 'can_1L' | 'can_4L' | 'can_5L' | 'drum_liter' | 'piece';
  stockQuantity: number;
  minStockAlert: number;
  costPrice: number; // سعر التكلفة بالجنيه
  sellingPrice: number; // سعر البيع بالجنيه
  unit: string; // لتر، عبوة، جركن، قطعة
  barcode?: string;
  compatibleModels?: string[]; // e.g. فلاتر هيونداي / كيا / تويوتا
}

export type StockMovementType = 'restock' | 'sale' | 'service_usage' | 'adjustment' | 'waste';

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: StockMovementType;
  quantityChange: number; // positive for restock, negative for deduction
  previousStock: number;
  newStock: number;
  unitCost?: number;
  supplier?: string;
  reason: string;
  orderId?: string;
  createdAt: string;
  createdBy: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: 'wash' | 'oil_service' | 'detailing' | 'maintenance';
  basePrices: Record<VehicleSize, number>;
  description?: string;
}

export type PaymentMethod = 'cash' | 'instapay' | 'vodafone_cash' | 'visa';

export interface OrderProduct {
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  costPrice: number;
}

export interface OrderService {
  serviceId: string;
  serviceName: string;
  price: number;
}

export interface ServiceOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  plateNumber: string;
  carModel: string;
  vehicleSize: VehicleSize;
  currentOdometer?: number;
  nextOilChangeOdometer?: number;
  nextOilChangeDate?: string;
  services: OrderService[];
  products: OrderProduct[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  paidAmount: number;
  notes?: string;
  status: 'completed' | 'in_progress' | 'cancelled';
  createdAt: string;
  shiftId: string;
  createdByName: string;
}

export interface Shift {
  id: string;
  shiftNumber: string;
  cashierName: string;
  startedAt: string;
  endedAt?: string;
  status: 'open' | 'closed';
  openingBalance: number; // رصيد بداية الوردية (الفكة)
  cashSales: number;
  instapaySales: number;
  vodafoneSales: number;
  visaSales: number;
  totalExpenses: number;
  expectedCash: number;
  actualCashInDrawer?: number;
  difference?: number;
  notes?: string;
}

export interface Expense {
  id: string;
  shiftId: string;
  category: 'supplies' | 'labor' | 'utilities' | 'hospitality' | 'maintenance' | 'other';
  amount: number;
  description: string;
  createdAt: string;
  createdBy: string;
}

export interface ShopSettings {
  shopName: string;
  slogan: string;
  phone: string;
  whatsappNumber: string;
  address: string;
  currency: string;
  receiptFooterMessage: string;
  whatsappMessageTemplate: string;
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  cloudSyncEnabled: boolean;
}
