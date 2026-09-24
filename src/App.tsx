import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { ProductsView } from './components/ProductsView.tsx';
import { SalesPOSView } from './components/SalesPOSView.tsx';
import { PurchasesView } from './components/PurchasesView.tsx';
import { DemandForecastView } from './components/DemandForecastView.tsx';
import { SmartAlertsView } from './components/SmartAlertsView.tsx';
import { AIInsightsView } from './components/AIInsightsView.tsx';
import { AnalyticsView } from './components/AnalyticsView.tsx';
import { SuppliersView } from './components/SuppliersView.tsx';
import { ReportsView } from './components/ReportsView.tsx';
import { SubscriptionView } from './components/SubscriptionView.tsx';
import { AuthView } from './components/AuthView.tsx';
import { ReceiptModal } from './components/ReceiptModal.tsx';
import { api } from './api.ts';
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
  SubscriptionInfo,
  SubscriptionPlan
} from './types/index.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [loading, setLoading] = useState<boolean>(true);

  // Core Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [salesHistory, setSalesHistory] = useState<SaleTransaction[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [breakdowns, setBreakdowns] = useState<any>(null);
  const [demandPredictions, setDemandPredictions] = useState<DemandPrediction[]>([]);
  const [aiInsights, setAiInsights] = useState<{ insights: AIInsightItem[]; isAI: boolean }>({
    insights: [],
    isAI: false
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    currentPlan: 'pro',
    status: 'active',
    maxProducts: 1000,
    features: [],
    renewalDate: '2026-10-24'
  });

  const [storeInfo, setStoreInfo] = useState({
    id: '',
    name: '',
    category: '',
    currency: 'INR',
    currencySymbol: '₹'
  });

  const [receiptSale, setReceiptSale] = useState<SaleTransaction | null>(null);
  const [prefilledRestockProductId, setPrefilledRestockProductId] = useState<string | undefined>();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initial Load & Refresh
  const loadAllData = async () => {
    try {
      const meRes = await api.getMe();
      if (!meRes.user) {
        setCurrentUser(null);
        return;
      }
      setCurrentUser(meRes.user);

      const [
        storeRes,
        prodRes,
        salesRes,
        purchasesRes,
        supRes,
        metricsRes,
        breakdownsRes,
        demandRes,
        alertsRes,
        insightsRes,
        subRes
      ] = await Promise.all([
        api.getStoreInfo(),
        api.getProducts(),
        api.getSales(),
        api.getPurchases(),
        api.getSuppliers(),
        api.getDashboardMetrics(),
        api.getAnalyticsBreakdowns(),
        api.getDemandForecast(),
        api.getAlerts(),
        api.getAIInsights(),
        api.getSubscription()
      ]);

      if (storeRes) setStoreInfo(storeRes);
      setProducts(prodRes || []);
      setSalesHistory(salesRes || []);
      setPurchases(purchasesRes || []);
      setSuppliers(supRes || []);
      setMetrics(metricsRes);
      setBreakdowns(breakdownsRes);
      setDemandPredictions(demandRes || []);
      setAlerts(alertsRes || []);
      setAiInsights(insightsRes || { insights: [], isAI: false });
      setSubscription(subRes);
    } catch (err) {
      console.error('Error fetching inventory state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Role Switcher
  const handleSwitchRole = async (role: 'owner' | 'manager' | 'cashier') => {
    try {
      const res = await api.switchRole(role);
      if (res.user) {
        setCurrentUser(res.user);
        showToast(`Switched active profile to ${res.user.name} (${res.user.role.toUpperCase()})`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Product Handlers
  const handleAddProduct = async (data: Partial<Product>) => {
    await api.createProduct(data);
    await loadAllData();
    showToast(`Product "${data.name}" added to inventory catalog.`);
  };

  const handleUpdateProduct = async (id: string, data: Partial<Product>) => {
    await api.updateProduct(id, data);
    await loadAllData();
    showToast(`Product updated successfully.`);
  };

  const handleDeleteProduct = async (id: string) => {
    await api.deleteProduct(id);
    await loadAllData();
    showToast(`Product deleted from catalog.`);
  };

  // Sale Handler
  const handleRecordSale = async (saleData: any) => {
    const res = await api.recordSale(saleData);
    await loadAllData();
    showToast(`Sale #${res.sale.invoiceNo} completed! Inventory and demand models updated.`);
    return res.sale;
  };

  // Restock Handler
  const handleRecordRestock = async (payload: any) => {
    const res = await api.recordRestock(payload);
    await loadAllData();
    showToast(`Inward stock received! Current inventory increased.`);
    return res.purchase;
  };

  // Supplier Handler
  const handleAddSupplier = async (data: Partial<Supplier>) => {
    await api.createSupplier(data);
    await loadAllData();
    showToast(`Supplier "${data.name}" added to directory.`);
  };

  // Subscription Handler
  const handleUpdateSubscription = async (plan: SubscriptionPlan) => {
    const res = await api.updateSubscription(plan);
    setSubscription(res.subscription);
    showToast(`Subscription plan upgraded to ${plan.toUpperCase()} Tier!`);
  };

  // Alerts Actions
  const handleResolveAlert = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)));
    showToast(`Alert dismissed.`);
  };

  const handleAlertAction = (alert: SmartAlert) => {
    if (alert.recommendedAction === 'reorder') {
      setPrefilledRestockProductId(alert.productId);
      setActiveTab('purchases');
    } else if (alert.recommendedAction === 'discount') {
      setActiveTab('insights');
    }
  };

  const handleAIInsightAction = (insight: AIInsightItem) => {
    if (insight.actionType === 'reorder') {
      setPrefilledRestockProductId(insight.targetProductId);
      setActiveTab('purchases');
    } else if (insight.actionType === 'buffer') {
      setActiveTab('demand');
    } else if (insight.actionType === 'supplier') {
      setActiveTab('suppliers');
    } else {
      setActiveTab('products');
    }
  };

  const handleQuickRestock = (productId?: string) => {
    setPrefilledRestockProductId(productId);
    setActiveTab('purchases');
  };

  const canEditProducts = currentUser?.role === 'owner' || currentUser?.role === 'manager';

  if (!loading && !currentUser) {
    return <AuthView onAuthenticated={(user) => {
      setCurrentUser(user);
      setLoading(true);
      loadAllData();
    }} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-800">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        storeInfo={storeInfo}
        alerts={alerts}
        subscription={subscription}
        onOpenAlerts={() => setActiveTab('alerts')}
        onOpenSubscription={() => setActiveTab('subscription')}
        activeTab={activeTab}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-16 lg:bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Workspace: Desktop Sidebar + View Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-20 lg:pb-10">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          alerts={alerts}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {loading ? (
            <div className="py-24 text-center">
              <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
              <div className="text-sm font-bold text-slate-700">Loading STOCKTINE Intelligence...</div>
              <p className="text-xs text-slate-400 mt-1">Calibrating velocity vectors and supplier lead buffers</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  metrics={metrics}
                  breakdowns={breakdowns}
                  alerts={alerts}
                  demandPredictions={demandPredictions}
                  currencySymbol={storeInfo.currencySymbol}
                  storeName={storeInfo.name}
                  onNavigate={setActiveTab}
                  onQuickRestock={handleQuickRestock}
                />
              )}

              {activeTab === 'products' && (
                <ProductsView
                  products={products}
                  suppliers={suppliers}
                  currencySymbol={storeInfo.currencySymbol}
                  onAddProduct={handleAddProduct}
                  onUpdateProduct={handleUpdateProduct}
                  onDeleteProduct={handleDeleteProduct}
                  canEdit={canEditProducts}
                />
              )}

              {activeTab === 'sales' && (
                <SalesPOSView
                  products={products}
                  salesHistory={salesHistory}
                  currencySymbol={storeInfo.currencySymbol}
                  onRecordSale={handleRecordSale}
                  onViewReceipt={(s) => setReceiptSale(s)}
                />
              )}

              {activeTab === 'purchases' && (
                <PurchasesView
                  products={products}
                  suppliers={suppliers}
                  purchases={purchases}
                  demandPredictions={demandPredictions}
                  currencySymbol={storeInfo.currencySymbol}
                  onRecordRestock={handleRecordRestock}
                  prefilledProductId={prefilledRestockProductId}
                />
              )}

              {activeTab === 'demand' && (
                <DemandForecastView
                  predictions={demandPredictions}
                  products={products}
                  suppliers={suppliers}
                  currencySymbol={storeInfo.currencySymbol}
                  onInitiateRestock={(prodId) => {
                    setPrefilledRestockProductId(prodId);
                    setActiveTab('purchases');
                  }}
                />
              )}

              {activeTab === 'alerts' && (
                <SmartAlertsView
                  alerts={alerts}
                  currencySymbol={storeInfo.currencySymbol}
                  onResolveAlert={handleResolveAlert}
                  onActionClick={handleAlertAction}
                />
              )}

              {activeTab === 'insights' && (
                <AIInsightsView
                  insights={aiInsights.insights}
                  onRefresh={loadAllData}
                  currencySymbol={storeInfo.currencySymbol}
                  storeName={storeInfo.name}
                  onActionClick={handleAIInsightAction}
                />
              )}

              {activeTab === 'analytics' && metrics && (
                <AnalyticsView
                  metrics={metrics}
                  breakdowns={breakdowns}
                  currencySymbol={storeInfo.currencySymbol}
                />
              )}

              {activeTab === 'suppliers' && (
                <SuppliersView
                  suppliers={suppliers}
                  products={products}
                  currencySymbol={storeInfo.currencySymbol}
                  onAddSupplier={handleAddSupplier}
                  onSelectSupplierForPO={(supId) => {
                    const firstProd = products.find((p) => p.supplierId === supId);
                    if (firstProd) setPrefilledRestockProductId(firstProd.id);
                    setActiveTab('purchases');
                  }}
                  canEdit={canEditProducts}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsView
                  currencySymbol={storeInfo.currencySymbol}
                  storeName={storeInfo.name}
                />
              )}

              {activeTab === 'subscription' && (
                <SubscriptionView
                  subscription={subscription}
                  onUpdatePlan={handleUpdateSubscription}
                  currencySymbol={storeInfo.currencySymbol}
                />
              )}

            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alerts={alerts}
      />

      {/* Printable Receipt Modal */}
      <ReceiptModal
        sale={receiptSale}
        onClose={() => setReceiptSale(null)}
        storeName={storeInfo.name}
        storeCategory={storeInfo.category}
        currencySymbol={storeInfo.currencySymbol}
      />
    </div>
  );
}
