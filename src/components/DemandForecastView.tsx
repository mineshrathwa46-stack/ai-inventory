import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Info,
  Calendar,
  CheckCircle,
  Truck,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Calculator,
  RefreshCw,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { DemandPrediction, Product, Supplier } from '../types/index.ts';

interface DemandForecastViewProps {
  predictions: DemandPrediction[];
  products: Product[];
  suppliers: Supplier[];
  currencySymbol: string;
  onInitiateRestock: (productId: string) => void;
}

export const DemandForecastView: React.FC<DemandForecastViewProps> = ({
  predictions,
  products,
  suppliers,
  currencySymbol,
  onInitiateRestock
}) => {
  const [selectedPrediction, setSelectedPrediction] = useState<DemandPrediction | null>(
    predictions[0] || null
  );
  const [forecastHorizon, setForecastHorizon] = useState<7 | 14 | 30>(7);
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredPredictions = predictions.filter((p) => {
    const matchesSearch =
      p.productName.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesRisk =
      filterRisk === 'all' || p.explanation.riskLevel.toLowerCase().includes(filterRisk.toLowerCase());
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6">
      {/* Header & Differentiator Callout */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white shadow-md border border-indigo-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 mb-2">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Core Differentiator
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              “Don’t just track your inventory. Predict what your business needs next.”
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-medium">
              Transparent, data-backed replenishment modeling: 70/30 weighted sales velocity, trend multipliers, and supplier transit lead time buffers.
            </p>
          </div>

          {/* Forecast Horizon Switcher */}
          <div className="bg-white/10 p-1 rounded-xl flex items-center gap-1 border border-white/10 shrink-0">
            <span className="text-[11px] font-bold text-slate-300 px-2">Forecast Horizon:</span>
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => setForecastHorizon(days as any)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  forecastHorizon === days
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search forecast by SKU or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white w-full sm:w-64 focus:outline-indigo-500"
          />

          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-indigo-500"
          >
            <option value="all">All Risk Levels</option>
            <option value="urgent">Urgent Stockouts (&lt; 3 days)</option>
            <option value="moderate">Moderate Risk</option>
            <option value="healthy">Healthy Stock</option>
            <option value="overstock">Overstocked / Slow</option>
          </select>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing {filteredPredictions.length} predicted products
        </div>
      </div>

      {/* Main Grid: Forecast List & Mathematical Explainability Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Predictions Table (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5">Product</th>
                  <th className="py-3 px-3">Stock</th>
                  <th className="py-3 px-3">Avg Daily</th>
                  <th className="py-3 px-3">Stockout In</th>
                  <th className="py-3 px-3 font-bold text-indigo-700">
                    {forecastHorizon}d Demand
                  </th>
                  <th className="py-3 px-3 font-black text-slate-900">Recommended PO</th>
                  <th className="py-3 px-3 text-right">Why?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPredictions.map((pred) => {
                  const isSelected = selectedPrediction?.productId === pred.productId;
                  const demandNumber =
                    forecastHorizon === 7
                      ? pred.predicted7DayDemand
                      : forecastHorizon === 14
                      ? pred.predicted14DayDemand
                      : pred.predicted30DayDemand;

                  const isUrgent = pred.daysUntilStockout <= 2.5;
                  const isModerate = pred.daysUntilStockout <= 6;

                  return (
                    <tr
                      key={pred.productId}
                      onClick={() => setSelectedPrediction(pred)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-50/70 font-semibold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900 line-clamp-1">{pred.productName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{pred.sku}</div>
                      </td>

                      <td className="py-3 px-3 font-bold">
                        <span
                          className={
                            pred.currentStock === 0
                              ? 'text-rose-600'
                              : pred.currentStock <= pred.minStockLevel
                              ? 'text-amber-600'
                              : 'text-slate-800'
                          }
                        >
                          {pred.currentStock}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{pred.avgDailySales}/day</div>
                        <div
                          className={`text-[10px] font-bold ${
                            pred.salesTrendPercentage > 0
                              ? 'text-emerald-600'
                              : pred.salesTrendPercentage < 0
                              ? 'text-rose-600'
                              : 'text-slate-400'
                          }`}
                        >
                          {pred.salesTrendPercentage >= 0 ? '+' : ''}
                          {pred.salesTrendPercentage}%
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isUrgent
                              ? 'bg-rose-100 text-rose-800'
                              : isModerate
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {pred.currentStock === 0 ? 'Exhausted' : `~${pred.daysUntilStockout} days`}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-bold text-indigo-700">
                        {demandNumber} units
                      </td>

                      <td className="py-3 px-3">
                        {pred.recommendedReorderQty > 0 ? (
                          <span className="font-black text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            +{pred.recommendedReorderQty} units
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Stock Healthy</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          className="px-2 py-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 rounded-lg shadow-2xs hover:bg-indigo-50"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Mathematical Transparency & Explainability Inspector (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          {selectedPrediction ? (
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-sm font-black text-slate-900">
                    Why this Recommendation?
                  </h2>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    selectedPrediction.explanation.riskLevel === 'Urgent Stockout'
                      ? 'bg-rose-100 text-rose-800'
                      : selectedPrediction.explanation.riskLevel === 'Moderate Risk'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {selectedPrediction.explanation.riskLevel}
                </span>
              </div>

              <div className="mt-3">
                <h3 className="text-base font-black text-slate-900">
                  {selectedPrediction.productName}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  SKU: {selectedPrediction.sku} | Category: {selectedPrediction.category}
                </p>
              </div>

              {/* Data Metrics Pill Summary */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Current Stock</span>
                  <div className="text-base font-black text-slate-900">
                    {selectedPrediction.currentStock} units
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Daily Burn Rate</span>
                  <div className="text-base font-black text-indigo-700">
                    {selectedPrediction.avgDailySales} units/day
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Days to Stockout</span>
                  <div className="text-base font-black text-amber-600">
                    ~{selectedPrediction.daysUntilStockout} days
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Supplier Lead Time</span>
                  <div className="text-base font-black text-slate-800">
                    {selectedPrediction.leadTimeDays} days transit
                  </div>
                </div>
              </div>

              {/* Formula & Explainability Card */}
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                  <Info className="w-4 h-4 text-indigo-600" />
                  Deterministic Formula Calculation:
                </div>
                <div className="p-2 rounded-lg bg-white border border-indigo-200 text-xs font-mono font-bold text-indigo-950 text-center">
                  {selectedPrediction.explanation.formula}
                </div>
                <p className="text-[11px] text-indigo-900/80 leading-relaxed">
                  {selectedPrediction.explanation.velocitySummary}
                </p>
                <p className="text-[11px] text-indigo-900/80 leading-relaxed">
                  {selectedPrediction.explanation.bufferReasoning}
                </p>
              </div>

              {/* Action: 1-Click PO */}
              <div className="pt-2">
                <button
                  onClick={() => onInitiateRestock(selectedPrediction.productId)}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  1-Click Restock PO ({selectedPrediction.recommendedReorderQty > 0 ? selectedPrediction.recommendedReorderQty : 20} units)
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Select any item from the left table to inspect its mathematical formula.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
