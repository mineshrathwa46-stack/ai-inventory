import { Router, Request, Response } from 'express';
import { store } from './store.ts';
import { getAIBusinessInsights, askInventoryAI } from './ai.ts';

export const apiRouter = Router();

// AUTH & USERS
apiRouter.get('/auth/me', (req: Request, res: Response) => {
  res.json({
    user: store.getCurrentUser(),
    users: store.getUsers()
  });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = store.loginUser(email || '', password || '');
    res.json({ success: true, user, token: 'session-token' });
  } catch (error) {
    res.status(401).json({ error: error instanceof Error ? error.message : 'Login failed' });
  }
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, password, storeName, storeCategory } = req.body;
  if (!name || !email || !password || !storeName || password.length < 6) {
    return res.status(400).json({ error: 'Name, email, store name and a 6+ character password are required' });
  }
  try {
    const user = store.registerUser({ name, email, password, storeName, storeCategory: storeCategory || '' });
    res.status(201).json({ success: true, user, token: 'session-token' });
  } catch (error) {
    res.status(409).json({ error: error instanceof Error ? error.message : 'Registration failed' });
  }
});

apiRouter.post('/auth/switch-role', (req: Request, res: Response) => {
  const { role } = req.body;
  const user = store.setCurrentUser(role || 'owner');
  res.json({ success: true, user });
});

// STORE PRESETS & INFO
apiRouter.get('/store/info', (req: Request, res: Response) => {
  res.json(store.getStoreInfo());
});

// PRODUCTS REST API
apiRouter.get('/products', (req: Request, res: Response) => {
  const { search, category, status, sortBy } = req.query;
  let products = [...store.getProducts()];

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.supplierName.toLowerCase().includes(q)
    );
  }

  if (category && typeof category === 'string' && category !== 'all') {
    products = products.filter((p) => p.category === category);
  }

  if (status && typeof status === 'string') {
    if (status === 'out') {
      products = products.filter((p) => p.currentStock === 0);
    } else if (status === 'low') {
      products = products.filter((p) => p.currentStock > 0 && p.currentStock <= p.minStockLevel);
    } else if (status === 'healthy') {
      products = products.filter((p) => p.currentStock > p.minStockLevel);
    }
  }

  if (sortBy && typeof sortBy === 'string') {
    if (sortBy === 'name') {
      products.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'stock_asc') {
      products.sort((a, b) => a.currentStock - b.currentStock);
    } else if (sortBy === 'stock_desc') {
      products.sort((a, b) => b.currentStock - a.currentStock);
    } else if (sortBy === 'sales_desc') {
      products.sort((a, b) => b.unitsSold - a.unitsSold);
    } else if (sortBy === 'margin_desc') {
      products.sort((a, b) => {
        const marginA = (a.sellingPrice - a.purchasePrice) / a.sellingPrice;
        const marginB = (b.sellingPrice - b.purchasePrice) / b.sellingPrice;
        return marginB - marginA;
      });
    }
  }

  res.json(products);
});

apiRouter.get('/products/sku/:sku', (req: Request, res: Response) => {
  const product = store.getProductBySku(req.params.sku);
  if (!product) {
    return res.status(404).json({ error: 'Product not found for SKU' });
  }
  res.json(product);
});

apiRouter.get('/products/:id', (req: Request, res: Response) => {
  const product = store.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

apiRouter.post('/products', (req: Request, res: Response) => {
  try {
    const { name, sku, category, sellingPrice, purchasePrice, currentStock, minStockLevel, supplierId, supplierName, shelfLocation, batchNumber, expiryDate } = req.body;
    
    if (!name || !sku || sellingPrice === undefined || purchasePrice === undefined) {
      return res.status(400).json({ error: 'Name, SKU, selling price and purchase price are required' });
    }

    // Check SKU uniqueness
    const existing = store.getProductBySku(sku);
    if (existing) {
      return res.status(400).json({ error: `A product with SKU "${sku}" already exists.` });
    }

    const supplier = supplierId ? store.getSupplierById(supplierId) : undefined;

    const newProduct = store.createProduct({
      name,
      sku: sku.toUpperCase().trim(),
      category: category || 'General',
      sellingPrice: Number(sellingPrice),
      purchasePrice: Number(purchasePrice),
      currentStock: Number(currentStock || 0),
      minStockLevel: Number(minStockLevel || 10),
      supplierId: supplierId || (supplier ? supplier.id : 'sup-1'),
      supplierName: supplierName || (supplier ? supplier.name : 'Direct Supplier'),
      shelfLocation,
      batchNumber,
      expiryDate,
      image: '📦'
    });

    res.status(201).json(newProduct);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.put('/products/:id', (req: Request, res: Response) => {
  try {
    const updated = store.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.delete('/products/:id', (req: Request, res: Response) => {
  const deleted = store.deleteProduct(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ success: true, message: 'Product deleted' });
});

// SALES REST API
apiRouter.get('/sales', (req: Request, res: Response) => {
  const sales = store.getSales();
  res.json(sales);
});

apiRouter.post('/sales', (req: Request, res: Response) => {
  try {
    const { items, discount, paymentMethod, customerName, customerPhone } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one item is required for a sale.' });
    }

    const result = store.recordSale({
      items,
      discount: Number(discount || 0),
      paymentMethod: paymentMethod || 'Cash',
      customerName,
      customerPhone
    });

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PURCHASES / RESTOCK REST API
apiRouter.get('/purchases', (req: Request, res: Response) => {
  res.json(store.getPurchases());
});

apiRouter.post('/purchases', (req: Request, res: Response) => {
  try {
    const { supplierId, items, paymentTerms, invoiceRef } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required for restocking.' });
    }

    const result = store.recordRestock({
      supplierId,
      items,
      paymentTerms,
      invoiceRef
    });

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// SUPPLIERS REST API
apiRouter.get('/suppliers', (req: Request, res: Response) => {
  res.json(store.getSuppliers());
});

apiRouter.post('/suppliers', (req: Request, res: Response) => {
  try {
    const newSup = store.createSupplier(req.body);
    res.status(201).json(newSup);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

apiRouter.put('/suppliers/:id', (req: Request, res: Response) => {
  const updated = store.updateSupplier(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Supplier not found' });
  res.json(updated);
});

// DEMAND PREDICTION REST API
apiRouter.get('/demand/forecast', (req: Request, res: Response) => {
  const predictions = store.getDemandPredictions();
  res.json(predictions);
});

// SMART ALERTS REST API
apiRouter.get('/alerts', (req: Request, res: Response) => {
  const alerts = store.getSmartAlerts();
  res.json(alerts);
});

// DASHBOARD & ANALYTICS REST API
apiRouter.get('/analytics/dashboard', (req: Request, res: Response) => {
  const metrics = store.getDashboardMetrics();
  res.json(metrics);
});

apiRouter.get('/analytics/breakdowns', (req: Request, res: Response) => {
  const breakdowns = store.getAnalytics();
  res.json(breakdowns);
});

// AI INSIGHTS & COPILOT
apiRouter.get('/ai/insights', async (req: Request, res: Response) => {
  try {
    const data = await getAIBusinessInsights();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/ai/chat', async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    const answer = await askInventoryAI(question);
    res.json({ answer });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// SUBSCRIPTION REST API
apiRouter.get('/subscription', (req: Request, res: Response) => {
  res.json(store.getSubscription());
});

apiRouter.post('/subscription/upgrade', (req: Request, res: Response) => {
  const { plan } = req.body;
  if (!['free', 'pro', 'business'].includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan' });
  }
  const updated = store.updateSubscriptionPlan(plan);
  res.json({ success: true, subscription: updated });
});

// STRUCTURED REPORTS REST API
apiRouter.get('/reports/:type', (req: Request, res: Response) => {
  const { type } = req.params;
  const storeInfo = store.getStoreInfo();
  const metrics = store.getDashboardMetrics();
  const sales = store.getSales();
  const products = store.getProducts();
  const predictions = store.getDemandPredictions();

  const generatedAt = new Date().toISOString();

  if (type === 'daily_sales') {
    const today = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter((s) => s.date === today);
    return res.json({
      title: 'Daily Sales & Settlement Report',
      period: today,
      generatedAt,
      summary: {
        totalRevenue: todaySales.reduce((acc, s) => acc + s.totalAmount, 0),
        transactionsCount: todaySales.length,
        averageBasketSize: todaySales.length > 0 ? todaySales.reduce((acc, s) => acc + s.totalAmount, 0) / todaySales.length : 0,
        currency: storeInfo.currencySymbol
      },
      records: todaySales
    });
  }

  if (type === 'inventory_valuation') {
    return res.json({
      title: 'Inventory Valuation & Asset Report',
      generatedAt,
      summary: {
        totalProducts: metrics.totalProducts,
        totalUnits: metrics.totalInventoryUnits,
        totalCostValue: metrics.totalInventoryValueCost,
        totalSellingValue: metrics.totalInventoryValueSelling,
        potentialProfit: metrics.potentialProfit,
        currency: storeInfo.currencySymbol
      },
      records: products.map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        stock: p.currentStock,
        unitCost: p.purchasePrice,
        unitSelling: p.sellingPrice,
        totalCost: p.currentStock * p.purchasePrice,
        totalSelling: p.currentStock * p.sellingPrice,
        marginPercent: Math.round(((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100)
      }))
    });
  }

  if (type === 'low_stock') {
    const lowStockItems = predictions.filter((p) => p.currentStock <= p.minStockLevel || p.daysUntilStockout <= 3);
    return res.json({
      title: 'Low Stock & Restock Procurement Sheet',
      generatedAt,
      summary: {
        itemsRequiringAction: lowStockItems.length,
        estimatedProcurementCost: lowStockItems.reduce((acc, p) => {
          const prod = store.getProductById(p.productId);
          return acc + p.recommendedReorderQty * (prod?.purchasePrice || 0);
        }, 0),
        currency: storeInfo.currencySymbol
      },
      records: lowStockItems
    });
  }

  if (type === 'ai_demand') {
    return res.json({
      title: 'AI Predictive Demand & Velocity Forecast',
      generatedAt,
      summary: {
        forecastHorizon: '7 to 30 Days',
        modelEngine: 'Weighted Rolling Velocity + Trend Multiplier + Lead Time Safety Buffer',
        currency: storeInfo.currencySymbol
      },
      records: predictions
    });
  }

  res.status(400).json({ error: 'Unknown report type' });
});
