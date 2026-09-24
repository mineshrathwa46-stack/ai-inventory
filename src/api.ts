import {
  Product,
  SaleTransaction,
  PurchaseRecord,
  Supplier,
  SmartAlert,
  DemandPrediction,
  DashboardMetrics,
  AIInsightItem,
  User,
  SubscriptionInfo
} from './types/index.ts';

const API_BASE = '/api';

export const api = {
  // Auth & User
  async getMe(): Promise<{ user: User | null; users: User[] }> {
    const res = await fetch(`${API_BASE}/auth/me`);
    return res.json();
  },

  async switchRole(role: 'owner' | 'manager' | 'cashier'): Promise<{ user: User | null }> {
    const res = await fetch(`${API_BASE}/auth/switch-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    return res.json();
  },

  // Store
  async getStoreInfo(): Promise<{ id: string; name: string; category: string; currency: string; currencySymbol: string }> {
    const res = await fetch(`${API_BASE}/store/info`);
    return res.json();
  },

  // Products
  async getProducts(params?: { search?: string; category?: string; status?: string; sortBy?: string }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category) query.append('category', params.category);
    if (params?.status) query.append('status', params.status);
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    return res.json();
  },

  async getProductBySku(sku: string): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/sku/${encodeURIComponent(sku)}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create product');
    }
    return res.json();
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update product');
    }
    return res.json();
  },

  async deleteProduct(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  // Sales
  async getSales(): Promise<SaleTransaction[]> {
    const res = await fetch(`${API_BASE}/sales`);
    return res.json();
  },

  async recordSale(payload: {
    items: { productId: string; quantity: number; unitPrice?: number }[];
    discount?: number;
    paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Credit';
    customerName?: string;
    customerPhone?: string;
  }): Promise<{ sale: SaleTransaction; updatedProducts: Product[] }> {
    const res = await fetch(`${API_BASE}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to record sale');
    }
    return res.json();
  },

  // Purchases
  async getPurchases(): Promise<PurchaseRecord[]> {
    const res = await fetch(`${API_BASE}/purchases`);
    return res.json();
  },

  async recordRestock(payload: {
    supplierId: string;
    items: { productId: string; quantity: number; purchasePrice?: number }[];
    paymentTerms?: string;
    invoiceRef?: string;
  }): Promise<{ purchase: PurchaseRecord; updatedProducts: Product[] }> {
    const res = await fetch(`${API_BASE}/purchases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to record restock');
    }
    return res.json();
  },

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    const res = await fetch(`${API_BASE}/suppliers`);
    return res.json();
  },

  async createSupplier(data: Partial<Supplier>): Promise<Supplier> {
    const res = await fetch(`${API_BASE}/suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Demand Forecast
  async getDemandForecast(): Promise<DemandPrediction[]> {
    const res = await fetch(`${API_BASE}/demand/forecast`);
    return res.json();
  },

  // Alerts
  async getAlerts(): Promise<SmartAlert[]> {
    const res = await fetch(`${API_BASE}/alerts`);
    return res.json();
  },

  // Dashboard & Analytics
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const res = await fetch(`${API_BASE}/analytics/dashboard`);
    return res.json();
  },

  async getAnalyticsBreakdowns(): Promise<any> {
    const res = await fetch(`${API_BASE}/analytics/breakdowns`);
    return res.json();
  },

  // AI Insights & Chat
  async getAIInsights(): Promise<{ insights: AIInsightItem[]; isAI: boolean }> {
    const res = await fetch(`${API_BASE}/ai/insights`);
    return res.json();
  },

  async askAI(question: string): Promise<{ answer: string }> {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    return res.json();
  },

  // Subscription
  async getSubscription(): Promise<SubscriptionInfo> {
    const res = await fetch(`${API_BASE}/subscription`);
    return res.json();
  },

  async updateSubscription(plan: 'free' | 'pro' | 'business'): Promise<{ success: boolean; subscription: SubscriptionInfo }> {
    const res = await fetch(`${API_BASE}/subscription/upgrade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan })
    });
    return res.json();
  },

  // Reports
  async getReport(type: 'daily_sales' | 'inventory_valuation' | 'low_stock' | 'ai_demand'): Promise<any> {
    const res = await fetch(`${API_BASE}/reports/${type}`);
    return res.json();
  }
};
