import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  XCircle,
  TrendingDown,
  TrendingUp,
  Clock,
  Layers,
  CheckCircle,
  Truck,
  ArrowRight,
  Filter
} from 'lucide-react';
import { SmartAlert } from '../types/index.ts';

interface SmartAlertsViewProps {
  alerts: SmartAlert[];
  currencySymbol: string;
  onResolveAlert: (id: string) => void;
  onActionClick: (alert: SmartAlert) => void;
}

export const SmartAlertsView: React.FC<SmartAlertsViewProps> = ({
  alerts,
  currencySymbol,
  onResolveAlert,
  onActionClick
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const filtered = alerts.filter((a) => {
    const matchesType = filterType === 'all' || a.type === filterType;
    const matchesSev = filterSeverity === 'all' || a.severity === filterSeverity;
    return matchesType && matchesSev;
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'out_of_stock':
        return <XCircle className="w-5 h-5 text-rose-600" />;
      case 'predicted_stockout':
        return <Clock className="w-5 h-5 text-rose-500 animate-pulse" />;
      case 'low_stock':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'unusual_sales_increase':
        return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case 'unusual_sales_drop':
        return <TrendingDown className="w-5 h-5 text-rose-500" />;
      case 'dead_stock':
      case 'slow_moving':
        return <Layers className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-600" />
            Smart Inventory Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time proactive triggers for stockout risks, demand anomalies, and dead capital.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            {alerts.filter((a) => !a.resolved).length} Active Alerts
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-indigo-500"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical Stockout Threats</option>
          <option value="warning">Warnings</option>
          <option value="info">Info / Opportunities</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-indigo-500"
        >
          <option value="all">All Alert Types</option>
          <option value="out_of_stock">Out of Stock</option>
          <option value="predicted_stockout">Predicted Stockout</option>
          <option value="low_stock">Low Stock Threshold</option>
          <option value="unusual_sales_increase">Demand Surge (+40%)</option>
          <option value="dead_stock">Dead Capital Locked</option>
        </select>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            <CheckCircle className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
            <div className="text-sm font-bold text-slate-700">No active alerts matching filter.</div>
            <p className="text-xs text-slate-400 mt-1">Your inventory buffers are healthy.</p>
          </div>
        ) : (
          filtered.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                alert.severity === 'critical'
                  ? 'bg-rose-50/60 border-rose-200 hover:border-rose-300'
                  : alert.severity === 'warning'
                  ? 'bg-amber-50/60 border-amber-200 hover:border-amber-300'
                  : 'bg-white border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-white shadow-2xs shrink-0">
                  {getAlertIcon(alert.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-slate-900">{alert.title}</span>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        alert.severity === 'critical'
                          ? 'bg-rose-600 text-white'
                          : alert.severity === 'warning'
                          ? 'bg-amber-500 text-white'
                          : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    {alert.metricValue && (
                      <span className="text-[10px] font-mono font-bold text-slate-600 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                        {alert.metricValue}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                    {alert.message}
                  </p>

                  {alert.actionRequired && (
                    <div className="text-[11px] font-semibold text-indigo-700 flex items-center gap-1">
                      <span>Recommendation:</span>
                      <span className="text-slate-900">{alert.actionRequired}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {alert.recommendedAction === 'reorder' && (
                  <button
                    onClick={() => onActionClick(alert)}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Place PO ({alert.recommendedReorderQty || 25}u)
                  </button>
                )}
                {alert.recommendedAction === 'discount' && (
                  <button
                    onClick={() => onActionClick(alert)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    Plan Clearance
                  </button>
                )}
                <button
                  onClick={() => onResolveAlert(alert.id)}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
