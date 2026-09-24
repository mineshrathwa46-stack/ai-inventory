import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Trash2,
  CheckCircle,
  FileText,
  Calendar,
  Building,
  DollarSign,
  Sparkles,
  ArrowRight,
  PackageCheck
} from 'lucide-react';
import { Product, Supplier, PurchaseRecord, DemandPrediction } from '../types/index.ts';

interface PurchasesViewProps {
  products: Product[];
  suppliers: Supplier[];
  purchases: PurchaseRecord[];
  demandPredictions: DemandPrediction[];
  currencySymbol: string;
  onRecordRestock: (payload: {
    supplierId: string;
    items: { productId: string; quantity: number; purchasePrice?: number }[];
    paymentTerms?: string;
    invoiceRef?: string;
  }) => Promise<any>;
  prefilledProductId?: string;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
  products,
  suppliers,
  purchases,
  demandPredictions,
  currencySymbol,
  onRecordRestock,
  prefilledProductId
}) => {
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [invoiceRef, setInvoiceRef] = useState(`INV-SUP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [paymentTerms, setPaymentTerms] = useState('Net 15');
  const [orderItems, setOrderItems] = useState<
    { productId: string; quantity: number; purchasePrice: number }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-prefill if prefilledProductId passed
  React.useEffect(() => {
    if (prefilledProductId) {
      const prod = products.find((p) => p.id === prefilledProductId);
      if (prod) {
        setSelectedSupplierId(prod.supplierId);
        const pred = demandPredictions.find((d) => d.productId === prefilledProductId);
        const qty = pred?.recommendedReorderQty && pred.recommendedReorderQty > 0 ? pred.recommendedReorderQty : 25;
        setOrderItems([
          {
            productId: prod.id,
            quantity: qty,
            purchasePrice: prod.purchasePrice
          }
        ]);
      }
    }
  }, [prefilledProductId, products, demandPredictions]);

  // Fast Auto-Fill using AI Reorder Recommendations for selected supplier
  const handleAutoFillAIRecommendations = () => {
    const recommendedForSup = demandPredictions.filter((pred) => {
      const prod = products.find((p) => p.id === pred.productId);
      return prod?.supplierId === selectedSupplierId && pred.recommendedReorderQty > 0;
    });

    if (recommendedForSup.length === 0) {
      // Just take any items that need restocking
      const anyNeeded = demandPredictions
        .filter((pred) => pred.recommendedReorderQty > 0)
        .slice(0, 3);
      if (anyNeeded.length > 0) {
        const prod = products.find((p) => p.id === anyNeeded[0].productId);
        if (prod) setSelectedSupplierId(prod.supplierId);
        setOrderItems(
          anyNeeded.map((p) => {
            const prodItem = products.find((pr) => pr.id === p.productId)!;
            return {
              productId: p.productId,
              quantity: p.recommendedReorderQty,
              purchasePrice: prodItem.purchasePrice
            };
          })
        );
        return;
      }
    }

    setOrderItems(
      recommendedForSup.map((pred) => {
        const prod = products.find((p) => p.id === pred.productId)!;
        return {
          productId: pred.productId,
          quantity: pred.recommendedReorderQty,
          purchasePrice: prod.purchasePrice
        };
      })
    );
  };

  const addItemRow = () => {
    const firstProd = products.find((p) => p.supplierId === selectedSupplierId) || products[0];
    if (!firstProd) return;
    setOrderItems((prev) => [
      ...prev,
      {
        productId: firstProd.id,
        quantity: 20,
        purchasePrice: firstProd.purchasePrice
      }
    ]);
  };

  const updateItemRow = (index: number, field: string, value: any) => {
    setOrderItems((prev) => {
      const copy = [...prev];
      if (field === 'productId') {
        const prod = products.find((p) => p.id === value);
        copy[index] = {
          ...copy[index],
          productId: value,
          purchasePrice: prod ? prod.purchasePrice : copy[index].purchasePrice
        };
      } else {
        copy[index] = { ...copy[index], [field]: value };
      }
      return copy;
    });
  };

  const removeItemRow = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalCost = orderItems.reduce((acc, it) => acc + it.quantity * it.purchasePrice, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      setErrorMessage('Please add at least one product to receive.');
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await onRecordRestock({
        supplierId: selectedSupplierId,
        items: orderItems,
        paymentTerms,
        invoiceRef
      });

      setSuccessMessage('Restock received! Physical inventory updated automatically.');
      setOrderItems([]);
      setInvoiceRef(`INV-SUP-${Math.floor(1000 + Math.random() * 9000)}`);
      setTimeout(() => setSuccessMessage(''), 6000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to record purchase');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-indigo-600" />
            Purchases & Restocking Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Record supplier shipments, increase inventory counts automatically, and track procurement costs.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold animate-in fade-in">
          {errorMessage}
        </div>
      )}

      {/* Main Container: New PO Form & Procurement History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: New Restock Receipt Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-indigo-600" />
                Record Received Inward Stock
              </h2>
              <p className="text-[11px] text-slate-500">
                Instantly increments current physical stock on shelf.
              </p>
            </div>

            {/* 1-Click AI Auto-Fill */}
            <button
              type="button"
              onClick={handleAutoFillAIRecommendations}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-50 to-sky-50 hover:from-indigo-100 hover:to-sky-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Fill AI Reorder Needs
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Supplier *</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-indigo-500"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Invoice / Ref #</label>
                <input
                  type="text"
                  value={invoiceRef}
                  onChange={(e) => setInvoiceRef(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Terms</label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-indigo-500"
                >
                  <option value="Net 15">Net 15 Days</option>
                  <option value="Net 30">Net 30 Days</option>
                  <option value="COD">Cash On Delivery (COD)</option>
                  <option value="Immediate UPI">Immediate UPI</option>
                </select>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Received Products List
                </span>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Line Item
                </button>
              </div>

              {orderItems.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-slate-400 text-xs">
                  No items added yet. Click "+ Add Line Item" or "Fill AI Reorder Needs" above.
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {orderItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-3"
                    >
                      <div className="flex-1 w-full sm:w-auto">
                        <select
                          value={item.productId}
                          onChange={(e) => updateItemRow(idx, 'productId', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-indigo-500"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Current Stock: {p.currentStock})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div>
                          <label className="text-[10px] text-slate-500 block">Units</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItemRow(idx, 'quantity', Number(e.target.value))}
                            className="w-18 px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white font-bold text-center focus:outline-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 block">Cost ({currencySymbol})</label>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={item.purchasePrice}
                            onChange={(e) =>
                              updateItemRow(idx, 'purchasePrice', Number(e.target.value))
                            }
                            className="w-20 px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white font-bold text-center focus:outline-indigo-500"
                          />
                        </div>

                        <div className="w-20 text-right">
                          <label className="text-[10px] text-slate-500 block">Total</label>
                          <span className="text-xs font-bold text-slate-900">
                            {currencySymbol}{item.quantity * item.purchasePrice}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total Cost & Save */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">Total Purchase Cost:</span>
                <div className="text-xl font-black text-slate-900">
                  {currencySymbol}{totalCost.toLocaleString()}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || orderItems.length === 0}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <PackageCheck className="w-4 h-4" />
                {isSubmitting ? 'Recording Restock...' : 'Receive Stock & Update Inventory'}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Procurement History Log (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Past Purchase Orders (POs)
            </h2>
            <span className="text-xs font-semibold text-slate-500">{purchases.length} total</span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {purchases.map((po) => (
              <div
                key={po.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 font-mono">{po.poNumber}</div>
                    <div className="text-[11px] text-slate-600 font-medium">{po.supplierName}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {po.status}
                  </span>
                </div>

                <div className="mt-2 text-[11px] text-slate-500">
                  {po.items.map((it) => `${it.productName} (${it.quantity} units)`).join(', ')}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">{po.date}</span>
                  <span className="font-black text-slate-900">
                    {currencySymbol}{po.totalCost.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
