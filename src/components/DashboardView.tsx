import React from 'react';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  XCircle,
  Activity,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Truck,
  ShoppingCart,
  QrCode,
  Flame,
  Clock,
  Layers,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { DashboardMetrics, SmartAlert, DemandPrediction } from '../types/index.ts';

interface DashboardViewProps {
  metrics: DashboardMetrics | null;
  breakdowns: any;
  alerts: SmartAlert[];
  demandPredictions: DemandPrediction[];
  currencySymbol: string;
  storeName: string;
  onNavigate: (tab: string) => void;
  onQuickRestock: (productId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  breakdowns,
  alerts,
  demandPredictions,
  currencySymbol,
  storeName,
  onNavigate,
  onQuickRestock
}) => {
  if (!metrics) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const criticalAlerts = alerts.filter((a) => a.severity === 'critical' && !a.resolved);
  const imminentStockouts = demandPredictions.filter((p) => p.daysUntilStockout <= 3);

  // 14-day sales data from breakdowns
  const dailyTrends: { date: string; displayDate: string; revenue: number; transactions: number; units: number }[] =
    breakdowns?.dailyTrends || [];

  const maxRevenue = Math.max(...dailyTrends.map((d) => d.revenue), 1000);

  return (
    <div className="space-y-6">
      {/* End-to-End Workflow Showcase Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md relative overflow-hidden border border-indigo-900/50">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-2">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Autonomous Retail Intelligence
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {storeName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-medium">
              Real-time statistical demand prediction, automated stockout prevention, and AI-driven restocking.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onNavigate('sales')}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              New Sale (POS)
            </button>
            <button
              onClick={() => onNavigate('demand')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 flex items-center gap-1.5 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Demand Forecast
            </button>
          </div>
        </div>

        {/* Workflow Breadcrumb Strip */}
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-[11px] font-semibold text-slate-400">
          <div className="flex items-center gap-1 text-indigo-300">
            <span className="w-4 h-4 rounded-full bg-indigo-500/30 text-indigo-300 flex items-center justify-center text-[10px]">1</span>
            <span>Product Catalog</span>
          </div>
          <div className="flex items-center gap-1 text-indigo-300">
            <span className="w-4 h-4 rounded-full bg-indigo-500/30 text-indigo-300 flex items-center justify-center text-[10px]">2</span>
            <span>Live POS Sales</span>
          </div>
          <div className="flex items-center gap-1 text-indigo-300">
            <span className="w-4 h-4 rounded-full bg-indigo-500/30 text-indigo-300 flex items-center justify-center text-[10px]">3</span>
            <span>Stock Auto-Update</span>
          </div>
          <div className="flex items-center gap-1 text-indigo-300">
            <span className="w-4 h-4 rounded-full bg-indigo-500/30 text-indigo-300 flex items-center justify-center text-[10px]">4</span>
            <span>Velocity Engine</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 font-bold">
            <span className="w-4 h-4 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center text-[10px]">5</span>
            <span>Demand Prediction</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 font-bold">
            <span className="w-4 h-4 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center text-[10px]">6</span>
            <span>Reorder Qty Calc</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400 font-bold">
            <span className="w-4 h-4 rounded-full bg-amber-500/30 text-amber-300 flex items-center justify-center text-[10px]">7</span>
            <span>Smart Restock PO</span>
          </div>
        </div>
      </div>

      {/* Critical Stockout Warning Banner */}
      {criticalAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-rose-900">
                Action Required: {criticalAlerts.length} Critical Stockout Alert{criticalAlerts.length > 1 ? 's' : ''}
              </h2>
              <p className="text-xs text-rose-700 mt-0.5">
                {criticalAlerts[0]?.title} — {criticalAlerts[0]?.message}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('demand')}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Review Reorder POs
            </button>
            <button
              onClick={() => onNavigate('alerts')}
              className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-800 text-xs font-semibold hover:bg-rose-50 cursor-pointer"
            >
              View All ({alerts.length})
            </button>
          </div>
        </div>
      )}

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inventory Value */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Inventory Value
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {currencySymbol}{metrics.totalInventoryValueCost.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-slate-500">at cost</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Selling Value:</span>
            <span className="font-bold text-slate-900">
              {currencySymbol}{metrics.totalInventoryValueSelling.toLocaleString()}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-slate-500">Gross Margin Potential:</span>
            <span className="font-bold text-emerald-600">
              +{currencySymbol}{metrics.potentialProfit.toLocaleString()} (
              {Math.round((metrics.potentialProfit / Math.max(1, metrics.totalInventoryValueSelling)) * 100)}%)
            </span>
          </div>
        </div>

        {/* Today's Sales */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Today's Sales
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {currencySymbol}{metrics.todaySalesAmount.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              Live
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Orders Completed:</span>
            <span className="font-bold text-slate-900">{metrics.todaySalesCount} transactions</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Avg Basket Size:</span>
            <span className="font-bold text-slate-700">
              {metrics.todaySalesCount > 0
                ? `${currencySymbol}${Math.round(metrics.todaySalesAmount / metrics.todaySalesCount)}`
                : '—'}
            </span>
          </div>
        </div>

        {/* Inventory Health Score */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Inventory Health
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="#e2e8f0"
                  strokeWidth="4"
                  fill="transparent"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke={metrics.inventoryHealthScore > 75 ? '#10b981' : metrics.inventoryHealthScore > 50 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="4"
                  strokeDasharray="125.6"
                  strokeDashoffset={125.6 - (125.6 * metrics.inventoryHealthScore) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute font-black text-sm text-slate-900">
                {metrics.inventoryHealthScore}%
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                {metrics.inventoryHealthScore > 75 ? 'Optimal Stock' : metrics.inventoryHealthScore > 50 ? 'Moderate Risks' : 'Critical Action'}
              </div>
              <p className="text-[11px] text-slate-500">
                {metrics.outOfStockCount > 0 ? `${metrics.outOfStockCount} items stockout` : 'No dead capital'}
              </p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Turnover Velocity:</span>
            <span className="font-bold text-indigo-600">{metrics.inventoryTurnoverRatio}x / year</span>
          </div>
        </div>

        {/* Stockout & Reorder Needs */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Stockout Threats
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {metrics.lowStockCount + metrics.outOfStockCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">SKUs need action</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-rose-600 font-bold flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              {metrics.outOfStockCount} Out of Stock
            </span>
            <span className="text-amber-600 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {metrics.lowStockCount} Low Stock
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Idle Dead Capital:</span>
            <span className="font-bold text-slate-700">
              {currencySymbol}{metrics.deadStockCapitalLocked.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: 14-Day Sales Velocity & Imminent Stockouts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 14-Day Sales Trends Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  14-Day Daily Sales Velocity & Demand History
                </h3>
                <p className="text-xs text-slate-500">
                  Statistical baseline utilized by the demand engine to forecast future replenishment.
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-700">
                Last 14 Days
              </span>
            </div>

            {/* Custom SVG Bar Chart with Hover Tooltip simulation */}
            <div className="h-56 w-full flex items-end gap-1.5 sm:gap-2.5 pt-6 pb-2 px-1">
              {dailyTrends.map((d, idx) => {
                const heightPercent = Math.max(8, Math.round((d.revenue / maxRevenue) * 100));
                const isToday = idx === dailyTrends.length - 1;
                return (
                  <div
                    key={d.date}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative"
                  >
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 bg-slate-900 text-white text-[10px] rounded-lg py-1 px-2 whitespace-nowrap shadow-md pointer-events-none">
                      <div className="font-bold">{d.displayDate}</div>
                      <div>{currencySymbol}{d.revenue.toLocaleString()} ({d.units} units)</div>
                    </div>

                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-md transition-all ${
                        isToday
                          ? 'bg-gradient-to-t from-indigo-600 to-sky-400 shadow-sm shadow-indigo-200'
                          : 'bg-indigo-100 hover:bg-indigo-300'
                      }`}
                    />
                    <span className="text-[10px] text-slate-400 mt-2 font-medium truncate max-w-full">
                      {d.displayDate.split(' ')[1] || d.displayDate}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600"></span> Today's Run
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-100"></span> Historical Velocity
              </span>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              Full Analytics <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Col: AI Stockout Threat Radar */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                Imminent Stockouts
              </h3>
              <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                {imminentStockouts.length} Alert{imminentStockouts.length !== 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Items projected to exhaust stock within 3 days based on current burn rate.
            </p>

            <div className="space-y-2.5">
              {imminentStockouts.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs text-center font-medium">
                  <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
                  All active products have healthy stock buffers (&gt; 3 days)!
                </div>
              ) : (
                imminentStockouts.slice(0, 4).map((item) => (
                  <div
                    key={item.productId}
                    className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all bg-slate-50/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-slate-900 line-clamp-1">
                          {item.productName}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Stock: <span className="font-bold text-slate-800">{item.currentStock}</span> | Burn:{' '}
                          <span className="font-bold text-slate-800">{item.avgDailySales}/day</span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                          item.currentStock === 0
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.currentStock === 0 ? '0 Left' : `~${item.daysUntilStockout}d left`}
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-indigo-700 font-semibold">
                        Reorder: +{item.recommendedReorderQty} units
                      </span>
                      <button
                        onClick={() => onQuickRestock(item.productId)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        1-Click PO →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate('demand')}
            className="w-full mt-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer text-center"
          >
            Open Demand Engine & Reorder Sheet
          </button>
        </div>
      </div>

      {/* Fast Movers vs Dead Stock Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fast Moving Products */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Fast-Moving Velocity Drivers</h3>
                <p className="text-[11px] text-slate-500">Highest daily turnover products</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('products')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {breakdowns?.fastMoving?.slice(0, 4).map((p: any) => (
              <div key={p.productId} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">{p.productName}</div>
                  <div className="text-[11px] text-slate-500">
                    Velocity: <span className="font-bold text-emerald-600">{p.avgDailySales} units/day</span> | Margin:{' '}
                    <span className="font-semibold text-slate-700">{p.grossMargin}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">{p.currentStock} on hand</div>
                  <div className="text-[10px] text-slate-400">SKU: {p.sku}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dead Stock & Idle Capital */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Dead Stock & Idle Capital Alert</h3>
                <p className="text-[11px] text-slate-500">Locking cash without turnover</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('insights')}
              className="text-xs font-bold text-amber-600 hover:text-amber-800 cursor-pointer"
            >
              AI Clearance Plan
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {breakdowns?.deadStock?.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No dead stock detected. Inventory turnover is healthy!
              </div>
            ) : (
              breakdowns?.deadStock?.slice(0, 3).map((p: any) => (
                <div key={p.productId} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{p.productName}</div>
                    <div className="text-[11px] text-rose-600 font-semibold">
                      Idle for 45+ days | {p.currentStock} units unsold
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-amber-700">
                      {currencySymbol}{p.capitalLocked.toLocaleString()} locked
                    </div>
                    <div className="text-[10px] text-slate-500">Rec: 15% markdown</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
