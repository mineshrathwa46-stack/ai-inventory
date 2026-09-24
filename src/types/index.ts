export type Role = 'owner' | 'manager' | 'cashier';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  storeName: string;
  storeCategory: string;
  avatar?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  sellingPrice: number;
  purchasePrice: number;
  currentStock: number;
  minStockLevel: number;
  supplierId: string;
  supplierName: string;
  image?: string;
  unitsSold: number;
  shelfLocation?: string;
  batchNumber?: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
  costPrice: number;
}

export interface SaleTransaction {
  id: string;
  invoiceNo: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Credit';
  cashierName: string;
  customerName?: string;
  customerPhone?: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
}

export interface RestockItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  purchasePrice: number;
  totalCost: number;
}

export interface PurchaseRecord {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  items: RestockItem[];
  totalCost: number;
  paymentTerms: string;
  status: 'Received' | 'Pending' | 'Ordered';
  date: string;
  timestamp: number;
  invoiceRef?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  gstNumber: string;
  paymentTerms: string;
  rating: number; // 1 to 5
  leadTimeDays: number;
  categories: string[];
  totalPurchasesCount: number;
  totalSpent: number;
}

export type AlertType =
  | 'low_stock'
  | 'predicted_stockout'
  | 'out_of_stock'
  | 'unusual_sales_drop'
  | 'unusual_sales_increase'
  | 'slow_moving'
  | 'dead_stock';

export interface SmartAlert {
  id: string;
  type: AlertType;
  severity: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  productId?: string;
  productName?: string;
  sku?: string;
  currentStock?: number;
  metricValue?: string;
  actionRequired?: string;
  recommendedAction?: 'reorder' | 'discount' | 'check' | 'investigate';
  recommendedReorderQty?: number;
  resolved: boolean;
  createdAt: string;
}

export interface DemandPrediction {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  currentStock: number;
  minStockLevel: number;
  avgDailySales: number;
  salesTrendPercentage: number; // e.g. +18% or -12%
  trendDirection: 'increasing' | 'stable' | 'decreasing';
  daysUntilStockout: number; // e.g. 2.4 days
  predicted7DayDemand: number;
  predicted14DayDemand: number;
  predicted30DayDemand: number;
  recommendedReorderQty: number;
  leadTimeDays: number;
  safetyStock: number;
  explanation: {
    formula: string;
    velocitySummary: string;
    bufferReasoning: string;
    riskLevel: 'Urgent Stockout' | 'Moderate Risk' | 'Healthy' | 'Overstocked';
  };
}

export interface DashboardMetrics {
  totalProducts: number;
  totalInventoryUnits: number;
  totalInventoryValueCost: number;
  totalInventoryValueSelling: number;
  potentialProfit: number;
  todaySalesAmount: number;
  todaySalesCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  fastMovingCount: number;
  slowMovingCount: number;
  deadStockCount: number;
  inventoryHealthScore: number; // 0-100
  inventoryTurnoverRatio: number; // e.g. 4.2x
  deadStockCapitalLocked: number;
}

export interface AIInsightItem {
  id: string;
  category: 'growth' | 'risk' | 'dead_stock' | 'reorder' | 'pricing';
  type: 'urgent' | 'opportunity' | 'optimization' | 'caution';
  title: string;
  description: string;
  actionLabel: string;
  actionType: string;
  targetProductId?: string;
  dataEvidence: string;
}

export type SubscriptionPlan = 'free' | 'pro' | 'business';

export interface SubscriptionInfo {
  currentPlan: SubscriptionPlan;
  status: 'active' | 'trial';
  maxProducts: number;
  features: string[];
  renewalDate: string;
}
