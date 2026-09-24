import {
  Product,
  Supplier,
  SaleTransaction,
  PurchaseRecord,
  SmartAlert,
  DemandPrediction,
  DashboardMetrics,
  User,
  SubscriptionInfo
} from '../src/types/index.ts';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createStore, StorePreset } from './data.ts';

interface StoredUser extends User {
  password: string;
}

const usersFile = path.join(path.dirname(fileURLToPath(import.meta.url)), 'users.json');

class InventoryStore {
  private currentStore: StorePreset;
  private users: StoredUser[] = this.loadUsers();
  private currentUser: User | null = null;
  private subscription: SubscriptionInfo = {
    currentPlan: 'pro',
    status: 'active',
    maxProducts: 1000,
    features: [
      'AI Demand Prediction',
      'Smart Stockout Alerts',
      'Advanced Turnover Analytics',
      'Supplier Lead Time Tracking',
      'CSV & PDF Export',
      'AI Strategic Insights'
    ],
    renewalDate: '2026-10-24'
  };

  constructor() {
    this.currentStore = createStore(this.users[0]);
  }

  private loadUsers(): StoredUser[] {
    if (!existsSync(usersFile)) return [];
    return JSON.parse(readFileSync(usersFile, 'utf8')) as StoredUser[];
  }

  private saveUsers(): void {
    writeFileSync(usersFile, `${JSON.stringify(this.users, null, 2)}\n`, 'utf8');
  }

  public registerUser(input: {
    name: string;
    email: string;
    password: string;
    storeName: string;
    storeCategory: string;
  }): User {
    const email = input.email.trim().toLowerCase();
    if (this.users.some((user) => user.email === email)) {
      throw new Error('An account with this email already exists');
    }
    const user: StoredUser = {
      id: `user-${Date.now()}`,
      name: input.name.trim(),
      email,
      password: input.password,
      role: 'owner',
      storeName: input.storeName.trim(),
      storeCategory: input.storeCategory.trim(),
    };
    this.users.push(user);
    this.saveUsers();
    this.currentUser = user;
    this.currentStore = createStore(user);
    return this.publicUser(user);
  }

  public loginUser(emailInput: string, password: string): User {
    const user = this.users.find((candidate) => candidate.email === emailInput.trim().toLowerCase());
    if (!user || user.password !== password) throw new Error('Invalid email or password');
    this.currentUser = user;
    this.currentStore = createStore(user);
    return this.publicUser(user);
  }

  private publicUser(user: StoredUser): User {
    const { password: _password, ...publicUser } = user;
    return publicUser;
  }

  public getStoreInfo() {
    return {
      id: this.currentStore.id,
      name: this.currentStore.name,
      category: this.currentStore.category,
      currency: this.currentStore.currency,
      currencySymbol: this.currentStore.currencySymbol
    };
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public setCurrentUser(role: 'owner' | 'manager' | 'cashier'): User | null {
    if (this.currentUser) this.currentUser = { ...this.currentUser, role };
    return this.currentUser;
  }

  public getUsers(): User[] {
    return this.users.map((user) => this.publicUser(user));
  }

  public getSubscription(): SubscriptionInfo {
    return this.subscription;
  }

  public updateSubscriptionPlan(plan: 'free' | 'pro' | 'business'): SubscriptionInfo {
    this.subscription.currentPlan = plan;
    if (plan === 'free') {
      this.subscription.maxProducts = 25;
      this.subscription.features = ['Basic Inventory', 'Manual Stock Tracking', 'Basic Sales Record'];
    } else if (plan === 'pro') {
      this.subscription.maxProducts = 1000;
      this.subscription.features = [
        'AI Demand Prediction',
        'Smart Stockout Alerts',
        'Advanced Turnover Analytics',
        'Supplier Lead Time Tracking',
        'CSV & PDF Export',
        'AI Strategic Insights'
      ];
    } else {
      this.subscription.maxProducts = 10000;
      this.subscription.features = [
        'Multi-Store Support',
        'Unlimited Staff Accounts',
        'Priority AI Insights',
        'Supplier Auto-PO EDI',
        'Dedicated Account Manager'
      ];
    }
    return this.subscription;
  }

  // PRODUCT CRUD
  public getProducts(): Product[] {
    return this.currentStore.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.currentStore.products.find((p) => p.id === id);
  }

  public getProductBySku(sku: string): Product | undefined {
    return this.currentStore.products.find(
      (p) => p.sku.toLowerCase() === sku.trim().toLowerCase()
    );
  }

  public createProduct(payload: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'unitsSold'>): Product {
    const newProduct: Product = {
      ...payload,
      id: `prod-${Date.now()}`,
      unitsSold: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    this.currentStore.products.unshift(newProduct);
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.currentStore.products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    const updated: Product = {
      ...this.currentStore.products[index],
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    this.currentStore.products[index] = updated;
    return updated;
  }

  public deleteProduct(id: string): boolean {
    const index = this.currentStore.products.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.currentStore.products.splice(index, 1);
    return true;
  }

  // SALES RECORDING
  public getSales(): SaleTransaction[] {
    return this.currentStore.sales;
  }

  public recordSale(saleData: {
    items: { productId: string; quantity: number; unitPrice?: number }[];
    discount?: number;
    paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Credit';
    customerName?: string;
    customerPhone?: string;
  }): { sale: SaleTransaction; updatedProducts: Product[] } {
    const now = Date.now();
    const dateStr = new Date(now).toISOString().split('T')[0];
    const updatedProducts: Product[] = [];

    const processedItems = saleData.items.map((item) => {
      const product = this.getProductById(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      if (product.currentStock < item.quantity) {
        throw new Error(
          `Insufficient stock for "${product.name}". Available: ${product.currentStock}, Requested: ${item.quantity}`
        );
      }

      // Decrement inventory & increment sold
      product.currentStock -= item.quantity;
      product.unitsSold += item.quantity;
      product.updatedAt = dateStr;
      updatedProducts.push(product);

      const price = item.unitPrice ?? product.sellingPrice;
      return {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unitPrice: price,
        total: price * item.quantity,
        costPrice: product.purchasePrice
      };
    });

    const subtotal = processedItems.reduce((acc, it) => acc + it.total, 0);
    const discount = saleData.discount || 0;
    const totalAmount = Math.max(0, subtotal - discount);

    const sale: SaleTransaction = {
      id: `sale-${now}`,
      invoiceNo: `INV-2609-${String(this.currentStore.sales.length + 1).padStart(4, '0')}`,
      items: processedItems,
      subtotal,
      discount,
      tax: 0,
      totalAmount,
      paymentMethod: saleData.paymentMethod,
      cashierName: this.currentUser?.name || 'Unauthenticated',
      customerName: saleData.customerName || 'Walk-in Customer',
      customerPhone: saleData.customerPhone,
      date: dateStr,
      timestamp: now
    };

    this.currentStore.sales.unshift(sale);
    return { sale, updatedProducts };
  }

  // PURCHASES & RESTOCKING
  public getPurchases(): PurchaseRecord[] {
    return this.currentStore.purchases;
  }

  public recordRestock(purchaseData: {
    supplierId: string;
    items: { productId: string; quantity: number; purchasePrice?: number }[];
    paymentTerms?: string;
    invoiceRef?: string;
  }): { purchase: PurchaseRecord; updatedProducts: Product[] } {
    const now = Date.now();
    const dateStr = new Date(now).toISOString().split('T')[0];
    const supplier = this.getSupplierById(purchaseData.supplierId);
    const supplierName = supplier ? supplier.name : 'Direct Supplier';
    const updatedProducts: Product[] = [];

    const processedItems = purchaseData.items.map((item) => {
      const product = this.getProductById(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      const pPrice = item.purchasePrice ?? product.purchasePrice;
      // Increment stock & update purchase price if changed
      product.currentStock += item.quantity;
      product.purchasePrice = pPrice;
      product.updatedAt = dateStr;
      updatedProducts.push(product);

      return {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: item.quantity,
        purchasePrice: pPrice,
        totalCost: pPrice * item.quantity
      };
    });

    const totalCost = processedItems.reduce((acc, it) => acc + it.totalCost, 0);

    const purchase: PurchaseRecord = {
      id: `po-${now}`,
      poNumber: `PO-2026-${String(this.currentStore.purchases.length + 100).padStart(3, '0')}`,
      supplierId: purchaseData.supplierId,
      supplierName,
      items: processedItems,
      totalCost,
      paymentTerms: purchaseData.paymentTerms || supplier?.paymentTerms || 'Net 15',
      status: 'Received',
      date: dateStr,
      timestamp: now,
      invoiceRef: purchaseData.invoiceRef
    };

    this.currentStore.purchases.unshift(purchase);

    // Update supplier stats
    if (supplier) {
      supplier.totalPurchasesCount += 1;
      supplier.totalSpent += totalCost;
    }

    return { purchase, updatedProducts };
  }

  // SUPPLIERS
  public getSuppliers(): Supplier[] {
    return this.currentStore.suppliers;
  }

  public getSupplierById(id: string): Supplier | undefined {
    return this.currentStore.suppliers.find((s) => s.id === id);
  }

  public createSupplier(payload: Omit<Supplier, 'id' | 'totalPurchasesCount' | 'totalSpent'>): Supplier {
    const newSup: Supplier = {
      ...payload,
      id: `sup-${Date.now()}`,
      totalPurchasesCount: 0,
      totalSpent: 0
    };
    this.currentStore.suppliers.push(newSup);
    return newSup;
  }

  public updateSupplier(id: string, updates: Partial<Supplier>): Supplier | null {
    const index = this.currentStore.suppliers.findIndex((s) => s.id === id);
    if (index === -1) return null;
    this.currentStore.suppliers[index] = { ...this.currentStore.suppliers[index], ...updates };
    return this.currentStore.suppliers[index];
  }

  // STATISTICAL DEMAND CALCULATION ENGINE
  public getDemandPredictions(): DemandPrediction[] {
    const sales = this.currentStore.sales;
    const now = Date.now();
    const dayMs = 86400000;
    const sevenDaysAgo = now - 7 * dayMs;
    const fourteenDaysAgo = now - 14 * dayMs;
    const thirtyDaysAgo = now - 30 * dayMs;

    return this.currentStore.products.map((product) => {
      // Find all sales for this product across time windows
      let unitsLast7 = 0;
      let unitsPrev7 = 0; // Days 8-14
      let unitsLast30 = 0;

      for (const sale of sales) {
        for (const item of sale.items) {
          if (item.productId === product.id) {
            if (sale.timestamp >= sevenDaysAgo) {
              unitsLast7 += item.quantity;
            } else if (sale.timestamp >= fourteenDaysAgo) {
              unitsPrev7 += item.quantity;
            }
            if (sale.timestamp >= thirtyDaysAgo) {
              unitsLast30 += item.quantity;
            }
          }
        }
      }

      // Daily velocity calculation:
      // Weight the last 7 days more heavily (70%) and last 30 days (30%)
      const velocity7 = unitsLast7 / 7;
      const velocity30 = unitsLast30 / 30;
      const rawAvgDaily = velocity7 > 0 ? (velocity7 * 0.7 + velocity30 * 0.3) : (velocity30 > 0 ? velocity30 : 0);
      const avgDailySales = Number(Math.max(0.05, rawAvgDaily).toFixed(1));

      // Sales trend %: comparing last 7 days vs previous 7 days
      let salesTrendPercentage = 0;
      let trendDirection: 'increasing' | 'stable' | 'decreasing' = 'stable';
      if (unitsPrev7 > 0) {
        salesTrendPercentage = Math.round(((unitsLast7 - unitsPrev7) / unitsPrev7) * 100);
      } else if (unitsLast7 > 0) {
        salesTrendPercentage = 50;
      }

      if (salesTrendPercentage > 10) trendDirection = 'increasing';
      else if (salesTrendPercentage < -10) trendDirection = 'decreasing';
      else trendDirection = 'stable';

      // Estimated days until stockout: Current Stock / Avg Daily Sales
      const daysUntilStockout =
        avgDailySales > 0 ? Number((product.currentStock / avgDailySales).toFixed(1)) : 999;

      // Supplier lead time
      const supplier = this.getSupplierById(product.supplierId);
      const leadTimeDays = supplier ? supplier.leadTimeDays : 2;

      // Safety stock formula:
      // Safety Stock = (Max Daily Sales * Max Lead Time) - (Avg Daily Sales * Avg Lead Time)
      // Approximated: Buffer = LeadTimeDays * avgDailySales * 1.5
      const safetyStock = Math.ceil(leadTimeDays * avgDailySales * 1.4);

      // Predicted demand (forecast horizon):
      // Trend multiplier adjustments
      const trendMultiplier = trendDirection === 'increasing' ? 1.15 : trendDirection === 'decreasing' ? 0.9 : 1.0;
      const predicted7DayDemand = Math.round(avgDailySales * 7 * trendMultiplier);
      const predicted14DayDemand = Math.round(avgDailySales * 14 * trendMultiplier);
      const predicted30DayDemand = Math.round(avgDailySales * 30 * trendMultiplier);

      // Recommended Reorder Quantity formula:
      // Reorder Qty = (Predicted 7-Day Demand + Safety Stock) - Current Stock
      // If result <= 0, recommendation is 0 (healthy stock)
      const targetStockLevel = predicted7DayDemand + safetyStock;
      const rawReorder = targetStockLevel - product.currentStock;
      const recommendedReorderQty = rawReorder > 0 ? Math.ceil(rawReorder / 5) * 5 : 0; // round to nearest 5

      // Risk classification
      let riskLevel: 'Urgent Stockout' | 'Moderate Risk' | 'Healthy' | 'Overstocked' = 'Healthy';
      if (product.currentStock === 0) {
        riskLevel = 'Urgent Stockout';
      } else if (daysUntilStockout <= 2.5) {
        riskLevel = 'Urgent Stockout';
      } else if (daysUntilStockout <= 6 || product.currentStock <= product.minStockLevel) {
        riskLevel = 'Moderate Risk';
      } else if (daysUntilStockout > 45 && unitsLast30 <= 2) {
        riskLevel = 'Overstocked';
      }

      // Step-by-step transparent explanation
      const formula = `Reorder Qty = (7-Day Forecast + Safety Stock) - Current Stock = (${predicted7DayDemand} + ${safetyStock}) - ${product.currentStock}`;
      const velocitySummary = `Selling at an average of ${avgDailySales} units/day (${unitsLast7} units past 7 days, trend ${salesTrendPercentage >= 0 ? '+' : ''}${salesTrendPercentage}%).`;
      const bufferReasoning = `With supplier "${product.supplierName}" requiring ${leadTimeDays} days lead time, a safety buffer of ${safetyStock} units prevents stockouts during transit.`;

      return {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        category: product.category,
        currentStock: product.currentStock,
        minStockLevel: product.minStockLevel,
        avgDailySales,
        salesTrendPercentage,
        trendDirection,
        daysUntilStockout,
        predicted7DayDemand,
        predicted14DayDemand,
        predicted30DayDemand,
        recommendedReorderQty,
        leadTimeDays,
        safetyStock,
        explanation: {
          formula,
          velocitySummary,
          bufferReasoning,
          riskLevel
        }
      };
    });
  }

  // SMART ALERTS ENGINE
  public getSmartAlerts(): SmartAlert[] {
    const predictions = this.getDemandPredictions();
    const alerts: SmartAlert[] = [];

    predictions.forEach((pred) => {
      const product = this.getProductById(pred.productId);
      if (!product) return;

      // 1. Out of stock
      if (pred.currentStock === 0) {
        alerts.push({
          id: `alert-oos-${product.id}`,
          type: 'out_of_stock',
          severity: 'critical',
          title: `Out of Stock: ${product.name}`,
          message: `Zero units on shelf. Estimated loss: ${pred.avgDailySales * product.sellingPrice} ${this.currentStore.currencySymbol}/day in missed revenue.`,
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          currentStock: 0,
          metricValue: '0 units remaining',
          actionRequired: `Order ${pred.recommendedReorderQty || 30} units immediately`,
          recommendedAction: 'reorder',
          recommendedReorderQty: pred.recommendedReorderQty || 30,
          resolved: false,
          createdAt: new Date().toISOString()
        });
      }
      // 2. Predicted stockout (within 3 days)
      else if (pred.daysUntilStockout <= 3) {
        alerts.push({
          id: `alert-so-${product.id}`,
          type: 'predicted_stockout',
          severity: 'critical',
          title: `Imminent Stockout Risk: ${product.name}`,
          message: `At current burn rate of ${pred.avgDailySales}/day, inventory will exhaust in ~${pred.daysUntilStockout} days (before normal supplier lead time of ${pred.leadTimeDays} days).`,
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          currentStock: pred.currentStock,
          metricValue: `~${pred.daysUntilStockout} days left`,
          actionRequired: `Reorder ${pred.recommendedReorderQty} units to restore healthy stock`,
          recommendedAction: 'reorder',
          recommendedReorderQty: pred.recommendedReorderQty,
          resolved: false,
          createdAt: new Date().toISOString()
        });
      }
      // 3. Low stock (below minimum threshold)
      else if (pred.currentStock <= pred.minStockLevel) {
        alerts.push({
          id: `alert-low-${product.id}`,
          type: 'low_stock',
          severity: 'warning',
          title: `Low Stock Threshold Reached: ${product.name}`,
          message: `Stock level (${pred.currentStock}) has dropped below your set safety minimum of ${pred.minStockLevel} units.`,
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          currentStock: pred.currentStock,
          metricValue: `${pred.currentStock} / ${pred.minStockLevel} min`,
          actionRequired: `Place restock order for ${pred.recommendedReorderQty} units`,
          recommendedAction: 'reorder',
          recommendedReorderQty: pred.recommendedReorderQty,
          resolved: false,
          createdAt: new Date().toISOString()
        });
      }

      // 4. Unusual sales surge
      if (pred.salesTrendPercentage >= 40 && pred.currentStock > 0) {
        alerts.push({
          id: `alert-surge-${product.id}`,
          type: 'unusual_sales_increase',
          severity: 'info',
          title: `Demand Spike Detected: ${product.name}`,
          message: `Sales velocity spiked by +${pred.salesTrendPercentage}% this week. Recalculating forward buffer to avoid unexpected stockout.`,
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          currentStock: pred.currentStock,
          metricValue: `+${pred.salesTrendPercentage}% demand surge`,
          actionRequired: 'Verify supplier availability for emergency restock if surge sustains',
          recommendedAction: 'check',
          resolved: false,
          createdAt: new Date().toISOString()
        });
      }

      // 5. Dead stock alert
      if (pred.avgDailySales <= 0.1 && pred.currentStock >= 15 && product.unitsSold <= 5) {
        const capitalLocked = pred.currentStock * product.purchasePrice;
        alerts.push({
          id: `alert-dead-${product.id}`,
          type: 'dead_stock',
          severity: 'warning',
          title: `Dead Capital Warning: ${product.name}`,
          message: `Near-zero velocity over 30 days. ${this.currentStore.currencySymbol}${capitalLocked.toLocaleString()} in working capital is idle on shelf.`,
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          currentStock: pred.currentStock,
          metricValue: `${this.currentStore.currencySymbol}${capitalLocked} locked`,
          actionRequired: 'Run a 15-20% clearance markdown or product bundle to liquidate',
          recommendedAction: 'discount',
          resolved: false,
          createdAt: new Date().toISOString()
        });
      }
    });

    return alerts;
  }

  // DASHBOARD AGGREGATED METRICS
  public getDashboardMetrics(): DashboardMetrics {
    const products = this.currentStore.products;
    const sales = this.currentStore.sales;
    const now = Date.now();
    const todayStr = new Date(now).toISOString().split('T')[0];

    let totalInventoryUnits = 0;
    let totalInventoryValueCost = 0;
    let totalInventoryValueSelling = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach((p) => {
      totalInventoryUnits += p.currentStock;
      totalInventoryValueCost += p.currentStock * p.purchasePrice;
      totalInventoryValueSelling += p.currentStock * p.sellingPrice;
      if (p.currentStock === 0) {
        outOfStockCount++;
      } else if (p.currentStock <= p.minStockLevel) {
        lowStockCount++;
      }
    });

    const potentialProfit = totalInventoryValueSelling - totalInventoryValueCost;

    // Today's sales
    const todaySales = sales.filter((s) => s.date === todayStr);
    const todaySalesAmount = todaySales.reduce((acc, s) => acc + s.totalAmount, 0);
    const todaySalesCount = todaySales.length;

    // Demand analysis counts
    const predictions = this.getDemandPredictions();
    let fastMovingCount = 0;
    let slowMovingCount = 0;
    let deadStockCount = 0;
    let deadStockCapitalLocked = 0;

    predictions.forEach((p) => {
      const prod = this.getProductById(p.productId);
      if (!prod) return;
      if (p.avgDailySales >= 4) {
        fastMovingCount++;
      } else if (p.avgDailySales <= 0.1 && p.currentStock >= 15 && prod.unitsSold <= 5) {
        deadStockCount++;
        deadStockCapitalLocked += p.currentStock * prod.purchasePrice;
      } else if (p.avgDailySales < 1) {
        slowMovingCount++;
      }
    });

    // Health Score calculation (0 - 100):
    // Penalty for out of stock, penalty for low stock, penalty for dead stock ratio
    let score = 100;
    const totalProd = Math.max(1, products.length);
    score -= (outOfStockCount / totalProd) * 35;
    score -= (lowStockCount / totalProd) * 20;
    score -= (deadStockCount / totalProd) * 15;
    const inventoryHealthScore = Math.max(25, Math.min(98, Math.round(score)));

    // Inventory turnover ratio approx:
    // (Annualized COGS / Average Inventory Value)
    // 30 days COGS estimate:
    const thirtyDaysAgo = now - 30 * 86400000;
    let cogs30Days = 0;
    sales.forEach((s) => {
      if (s.timestamp >= thirtyDaysAgo) {
        s.items.forEach((it) => {
          cogs30Days += it.quantity * it.costPrice;
        });
      }
    });
    const avgInventory = Math.max(1, totalInventoryValueCost);
    const inventoryTurnoverRatio = Number(((cogs30Days * 12) / avgInventory).toFixed(1));

    return {
      totalProducts: products.length,
      totalInventoryUnits,
      totalInventoryValueCost,
      totalInventoryValueSelling,
      potentialProfit,
      todaySalesAmount,
      todaySalesCount,
      lowStockCount,
      outOfStockCount,
      fastMovingCount,
      slowMovingCount,
      deadStockCount,
      inventoryHealthScore,
      inventoryTurnoverRatio,
      deadStockCapitalLocked
    };
  }

  // ANALYTICS BREAKDOWNS
  public getAnalytics() {
    const products = this.currentStore.products;
    const sales = this.currentStore.sales;
    const predictions = this.getDemandPredictions();

    // Fast moving vs slow moving vs dead stock lists
    const fastMoving = [...predictions]
      .sort((a, b) => b.avgDailySales - a.avgDailySales)
      .slice(0, 5)
      .map((p) => {
        const prod = this.getProductById(p.productId)!;
        return {
          ...p,
          sellingPrice: prod.sellingPrice,
          purchasePrice: prod.purchasePrice,
          grossMargin: Math.round(((prod.sellingPrice - prod.purchasePrice) / prod.sellingPrice) * 100)
        };
      });

    const slowMoving = [...predictions]
      .filter((p) => p.avgDailySales < 1 && p.currentStock > 0)
      .sort((a, b) => a.avgDailySales - b.avgDailySales)
      .slice(0, 5)
      .map((p) => {
        const prod = this.getProductById(p.productId)!;
        return {
          ...p,
          sellingPrice: prod.sellingPrice,
          purchasePrice: prod.purchasePrice,
          capitalLocked: p.currentStock * prod.purchasePrice
        };
      });

    // Dead stock items
    const deadStock = predictions
      .filter((p) => {
        const prod = this.getProductById(p.productId);
        return p.avgDailySales <= 0.1 && p.currentStock >= 15 && (prod?.unitsSold || 0) <= 5;
      })
      .map((p) => {
        const prod = this.getProductById(p.productId)!;
        return {
          ...p,
          capitalLocked: p.currentStock * prod.purchasePrice,
          daysIdle: 45
        };
      });

    // Category breakdown
    const categoryMap: { [cat: string]: { revenue: number; units: number; count: number; stockValue: number } } = {};
    products.forEach((p) => {
      if (!categoryMap[p.category]) {
        categoryMap[p.category] = { revenue: 0, units: 0, count: 0, stockValue: 0 };
      }
      categoryMap[p.category].count++;
      categoryMap[p.category].stockValue += p.currentStock * p.purchasePrice;
    });

    sales.forEach((s) => {
      s.items.forEach((it) => {
        const prod = this.getProductById(it.productId);
        if (prod && categoryMap[prod.category]) {
          categoryMap[prod.category].revenue += it.total;
          categoryMap[prod.category].units += it.quantity;
        }
      });
    });

    const categoryBreakdown = Object.keys(categoryMap).map((cat) => ({
      category: cat,
      revenue: categoryMap[cat].revenue,
      unitsSold: categoryMap[cat].units,
      productCount: categoryMap[cat].count,
      stockValue: categoryMap[cat].stockValue
    }));

    // Daily sales trends for the last 14 days
    const now = Date.now();
    const dayMs = 86400000;
    const dailyTrends = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * dayMs).toISOString().split('T')[0];
      const daySales = sales.filter((s) => s.date === d);
      const totalAmount = daySales.reduce((acc, s) => acc + s.totalAmount, 0);
      const unitsCount = daySales.reduce((acc, s) => acc + s.items.reduce((ia, it) => ia + it.quantity, 0), 0);
      dailyTrends.push({
        date: d,
        displayDate: new Date(now - i * dayMs).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: totalAmount,
        transactions: daySales.length,
        units: unitsCount
      });
    }

    return {
      fastMoving,
      slowMoving,
      deadStock,
      categoryBreakdown,
      dailyTrends
    };
  }
}

export const store = new InventoryStore();
