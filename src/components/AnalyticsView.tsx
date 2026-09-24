import React from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Layers,
  ArrowUpRight,
  Flame,
  Clock,
  DollarSign,
  Package,
  Repeat
} from 'lucide-react';
import { DashboardMetrics } from '../types/index.ts';

interface AnalyticsViewProps {
  metrics: DashboardMetrics;
  breakdowns: any;
  currencySymbol: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  metrics,
  breakdowns,
  currencySymbol
}) => {
  const categoryBreakdown = breakdowns?.categoryBreakdown || [];
  const fastMoving = breakdowns?.fastMoving || [];
  const slowMoving = breakdowns?.slowMoving || [];
  const deadStock = breakdowns?.deadStock || [];

  const totalCatRevenue = categoryBreakdown.reduce((acc: number, c: any) => acc + c.revenue, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          Inventory Intelligence & Capital Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Turnover efficiency, gross margin contribution, category volume, and dead stock liquidation audits.
        </p>
      </div>

      {/* Top 3 Executive Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Annualized Inventory Turnover
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-600">
              {metrics.inventoryTurnoverRatio}x
            </span>
            <span className="text-xs text-slate-500 font-medium">per year</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Calculated as COGS (30-day run rate) ÷ Average Inventory at cost.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Capital In Inventory
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {currencySymbol}{metrics.totalInventoryValueCost.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">at cost</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Selling retail value: {currencySymbol}{metrics.totalInventoryValueSelling.toLocaleString()} (+{currencySymbol}{metrics.potentialProfit.toLocaleString()})
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Dead Capital Locked
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">
              {currencySymbol}{metrics.deadStockCapitalLocked.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">{metrics.deadStockCount} SKUs</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Zero or near-zero sales velocity for &gt;45 days. Candidate for clearance bundle.
          </p>
        </div>
      </div>

      {/* Category Performance Breakdown */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-indigo-600" />
          Category Revenue & Capital Share
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryBreakdown.map((cat: any) => {
            const revPercent = totalCatRevenue > 0 ? Math.round((cat.revenue / totalCatRevenue) * 100) : 0;
            return (
              <div
                key={cat.category}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-xs">{cat.category}</span>
                  <span className="text-[11px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {revPercent}% share
                  </span>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-3">
                  <div
                    style={{ width: `${revPercent}%` }}
                    className="bg-indigo-600 h-full rounded-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>
                    <span className="text-slate-400 block">Revenue:</span>
                    <span className="font-bold text-slate-900">
                      {currencySymbol}{cat.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Units Sold:</span>
                    <span className="font-bold text-slate-900">{cat.unitsSold} units</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Stock Value:</span>
                    <span className="font-semibold text-slate-800">
                      {currencySymbol}{cat.stockValue.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">SKU Count:</span>
                    <span className="font-semibold text-slate-800">{cat.productCount} SKUs</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Velocity Comparison: Fast Movers vs Slow Movers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fast Moving / High Margin */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Top Velocity Champions</h3>
              <p className="text-[11px] text-slate-500">Highest inventory turnover and cash contribution</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {fastMoving.map((p: any) => (
              <div key={p.productId} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">{p.productName}</div>
                  <div className="text-[11px] text-slate-500">
                    SKU: {p.sku} | Margin: <span className="font-bold text-emerald-600">{p.grossMargin}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-indigo-700">
                    {p.avgDailySales} units/day
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Stock: {p.currentStock} (~{p.daysUntilStockout}d left)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slow Moving & Idle Inventory */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Slow Moving & At-Risk Capital</h3>
              <p className="text-[11px] text-slate-500">Burn rate &lt; 1 unit/day holding working capital</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {slowMoving.map((p: any) => (
              <div key={p.productId} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">{p.productName}</div>
                  <div className="text-[11px] text-slate-500">
                    Stock: {p.currentStock} units on hand
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-amber-700">
                    {currencySymbol}{p.capitalLocked.toLocaleString()} locked
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Velocity: {p.avgDailySales} units/day
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
