import React from 'react';
import { Printer, X, CheckCircle, Sparkles } from 'lucide-react';
import { SaleTransaction } from '../types/index.ts';

interface ReceiptModalProps {
  sale: SaleTransaction | null;
  onClose: () => void;
  storeName: string;
  storeCategory: string;
  currencySymbol: string;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  sale,
  onClose,
  storeName,
  storeCategory,
  currencySymbol
}) => {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 text-slate-800 text-xs">
        {/* Actions bar (hidden in print) */}
        <div className="no-print flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
            Tax Invoice / Sales Receipt
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center gap-1 hover:bg-indigo-700 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Thermal Receipt Container */}
        <div className="border border-dashed border-slate-300 p-4 rounded-xl bg-slate-50/50 font-mono">
          <div className="text-center mb-3">
            <h2 className="text-base font-black tracking-tight text-slate-900 uppercase">
              {storeName}
            </h2>
            <p className="text-[10px] text-slate-500">{storeCategory}</p>
            <p className="text-[9px] text-slate-400 mt-0.5">GSTIN: 27AAACH2384K1Z8</p>
          </div>

          <div className="border-t border-b border-slate-300 py-1.5 text-[10px] space-y-0.5 text-slate-600">
            <div className="flex justify-between">
              <span>Invoice:</span>
              <span className="font-bold text-slate-900">{sale.invoiceNo}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{sale.date}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span>{sale.customerName || 'Cash Customer'}</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{sale.cashierName}</span>
            </div>
          </div>

          {/* Line Items */}
          <div className="py-2 space-y-1.5 border-b border-slate-300 text-[11px]">
            {sale.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start">
                <div className="flex-1 pr-2">
                  <div className="font-bold text-slate-900 leading-tight">{item.productName}</div>
                  <div className="text-[10px] text-slate-500">
                    {item.quantity} x {currencySymbol}{item.unitPrice}
                  </div>
                </div>
                <span className="font-bold text-slate-900">
                  {currencySymbol}{item.total}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="pt-2 text-[11px] space-y-1">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span>{currencySymbol}{sale.subtotal}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount:</span>
                <span>-{currencySymbol}{sale.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-xs font-black text-slate-900 pt-1 border-t border-slate-300">
              <span>TOTAL PAID:</span>
              <span>{currencySymbol}{sale.totalAmount}</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
              <span>Payment Mode:</span>
              <span className="font-bold text-indigo-700">{sale.paymentMethod}</span>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-slate-200 text-center text-[9px] text-slate-400">
            <p>Thank you for shopping with us!</p>
            <p className="mt-0.5">Powered by StockPulse AI Platform</p>
          </div>
        </div>
      </div>
    </div>
  );
};
