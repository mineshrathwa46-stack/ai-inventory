import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  DollarSign,
  Package,
  AlertTriangle,
  TrendingUp,
  Table,
  CheckCircle2
} from 'lucide-react';
import { api } from '../api.ts';

interface ReportsViewProps {
  currencySymbol: string;
  storeName: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  currencySymbol,
  storeName
}) => {
  const [reportType, setReportType] = useState<
    'daily_sales' | 'inventory_valuation' | 'low_stock' | 'ai_demand'
  >('daily_sales');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async (type: any) => {
    setLoading(true);
    try {
      const data = await api.getReport(type);
      setReportData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(reportType);
  }, [reportType]);

  const exportCSV = () => {
    if (!reportData || !reportData.records) return;
    const records = reportData.records;
    if (records.length === 0) return;

    const headers = Object.keys(records[0]).filter(k => typeof records[0][k] !== 'object');
    const csvContent = [
      headers.join(','),
      ...records.map((row: any) =>
        headers.map((h) => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            Financial & Operational Intelligence Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Generate and export CSV/Printable audits for accounting, tax settlement, and replenishment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            disabled={!reportData || loading}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / PDF
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { id: 'daily_sales', label: "Daily Sales Settlement", icon: DollarSign },
          { id: 'inventory_valuation', label: "Inventory Valuation", icon: Package },
          { id: 'low_stock', label: "Procurement / Low Stock", icon: AlertTriangle },
          { id: 'ai_demand', label: "AI Predictive Forecast", icon: TrendingUp }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = reportType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id as any)}
              className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                active
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500'}`} />
              <span className="text-xs font-bold">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Report Content Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2" />
            <span className="text-xs font-medium">Generating report...</span>
          </div>
        ) : reportData ? (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h2 className="text-base font-black text-slate-900">{reportData.title}</h2>
                <div className="text-xs text-slate-500">
                  {storeName} • Generated: {new Date(reportData.generatedAt).toLocaleString()}
                </div>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                {reportData.records?.length || 0} Records Found
              </span>
            </div>

            {/* Summary KPI Strip */}
            {reportData.summary && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 bg-slate-50 rounded-xl p-3 border border-slate-200/80 my-3">
                {Object.entries(reportData.summary).map(([key, val]: any) => {
                  if (key === 'currency') return null;
                  return (
                    <div key={key}>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span className="text-sm font-black text-slate-900">
                        {typeof val === 'number'
                          ? key.toLowerCase().includes('cost') ||
                            key.toLowerCase().includes('revenue') ||
                            key.toLowerCase().includes('value') ||
                            key.toLowerCase().includes('profit') ||
                            key.toLowerCase().includes('basket')
                            ? `${currencySymbol}${Math.round(val).toLocaleString()}`
                            : val.toLocaleString()
                          : String(val)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Records Data Table */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    {reportType === 'daily_sales' && (
                      <>
                        <th className="py-2.5 px-3">Invoice</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Payment</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                      </>
                    )}
                    {reportType === 'inventory_valuation' && (
                      <>
                        <th className="py-2.5 px-3">SKU</th>
                        <th className="py-2.5 px-3">Product</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Stock</th>
                        <th className="py-2.5 px-3">Unit Cost</th>
                        <th className="py-2.5 px-3">Unit Selling</th>
                        <th className="py-2.5 px-3 text-right">Asset Valuation</th>
                      </>
                    )}
                    {reportType === 'low_stock' && (
                      <>
                        <th className="py-2.5 px-3">SKU</th>
                        <th className="py-2.5 px-3">Product</th>
                        <th className="py-2.5 px-3">Current Stock</th>
                        <th className="py-2.5 px-3">Burn Rate</th>
                        <th className="py-2.5 px-3">Days Left</th>
                        <th className="py-2.5 px-3 text-right">Reorder Qty</th>
                      </>
                    )}
                    {reportType === 'ai_demand' && (
                      <>
                        <th className="py-2.5 px-3">SKU</th>
                        <th className="py-2.5 px-3">Product</th>
                        <th className="py-2.5 px-3">Avg Daily</th>
                        <th className="py-2.5 px-3">Trend %</th>
                        <th className="py-2.5 px-3">7d Demand</th>
                        <th className="py-2.5 px-3">Lead Time</th>
                        <th className="py-2.5 px-3 text-right">Safety Buffer</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.records?.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      {reportType === 'daily_sales' && (
                        <>
                          <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{row.invoiceNo}</td>
                          <td className="py-2.5 px-3 text-slate-500">{row.date}</td>
                          <td className="py-2.5 px-3">{row.customerName || 'Walk-in'}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100">
                              {row.paymentMethod}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-slate-900">
                            {currencySymbol}{row.totalAmount}
                          </td>
                        </>
                      )}
                      {reportType === 'inventory_valuation' && (
                        <>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{row.sku}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{row.name}</td>
                          <td className="py-2.5 px-3">{row.category}</td>
                          <td className="py-2.5 px-3 font-bold">{row.stock}</td>
                          <td className="py-2.5 px-3">{currencySymbol}{row.unitCost}</td>
                          <td className="py-2.5 px-3">{currencySymbol}{row.unitSelling}</td>
                          <td className="py-2.5 px-3 text-right font-black text-slate-900">
                            {currencySymbol}{row.totalCost.toLocaleString()}
                          </td>
                        </>
                      )}
                      {reportType === 'low_stock' && (
                        <>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{row.sku}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{row.productName}</td>
                          <td className="py-2.5 px-3 font-bold text-rose-600">{row.currentStock}</td>
                          <td className="py-2.5 px-3">{row.avgDailySales}/day</td>
                          <td className="py-2.5 px-3 font-semibold text-amber-600">~{row.daysUntilStockout}d</td>
                          <td className="py-2.5 px-3 text-right font-black text-emerald-700">
                            +{row.recommendedReorderQty} units
                          </td>
                        </>
                      )}
                      {reportType === 'ai_demand' && (
                        <>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{row.sku}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{row.productName}</td>
                          <td className="py-2.5 px-3 font-bold text-indigo-700">{row.avgDailySales}/day</td>
                          <td className="py-2.5 px-3 font-semibold text-emerald-600">{row.salesTrendPercentage}%</td>
                          <td className="py-2.5 px-3 font-bold">{row.predicted7DayDemand} units</td>
                          <td className="py-2.5 px-3">{row.leadTimeDays} days</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                            +{row.safetyStock} units
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
