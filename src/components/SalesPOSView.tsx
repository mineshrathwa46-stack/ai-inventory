import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  Receipt,
  User,
  CreditCard,
  Banknote,
  Smartphone,
  Search,
  AlertCircle,
  Clock,
  Printer
} from 'lucide-react';
import { Product, SaleTransaction } from '../types/index.ts';

interface SalesPOSViewProps {
  products: Product[];
  salesHistory: SaleTransaction[];
  currencySymbol: string;
  onRecordSale: (saleData: {
    items: { productId: string; quantity: number; unitPrice?: number }[];
    discount?: number;
    paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Credit';
    customerName?: string;
    customerPhone?: string;
  }) => Promise<SaleTransaction>;
  onViewReceipt: (sale: SaleTransaction) => void;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export const SalesPOSView: React.FC<SalesPOSViewProps> = ({
  products,
  salesHistory,
  currencySymbol,
  onRecordSale,
  onViewReceipt
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Credit'>('UPI');
  const [discount, setDiscount] = useState<number>(0);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [justCompletedSale, setJustCompletedSale] = useState<SaleTransaction | null>(null);

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const availableProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const addToCart = (product: Product) => {
    if (product.currentStock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.currentStock) return prev; // Cannot exceed physical stock
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.currentStock) return item; // stock limit
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.product.sellingPrice * item.quantity, 0);
  const totalAmount = Math.max(0, subtotal - (discount || 0));

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setErrorMessage('');
    setIsProcessing(true);

    try {
      const sale = await onRecordSale({
        items: cart.map((c) => ({
          productId: c.product.id,
          quantity: c.quantity,
          unitPrice: c.product.sellingPrice
        })),
        discount,
        paymentMethod,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined
      });

      // Reset cart
      setCart([]);
      setDiscount(0);
      setCustomerName('');
      setCustomerPhone('');
      setJustCompletedSale(sale);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to record sale');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-indigo-600" />
            Point of Sale & Checkout Register
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time stock deduction, demand engine updates, and receipt printing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Inventory Auto-Sync
          </span>
        </div>
      </div>

      {justCompletedSale && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-900">
                Sale Recorded Successfully! (Invoice #{justCompletedSale.invoiceNo})
              </div>
              <div className="text-[11px] text-emerald-700">
                Inventory deducted atomically. Daily sales analytics and demand velocity recalibrated.
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              onViewReceipt(justCompletedSale);
              setJustCompletedSale(null);
            }}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Receipt
          </button>
        </div>
      )}

      {/* POS Grid: Catalog on Left, Register Cart on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Product Selection (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Category Pills */}
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  categoryFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    categoryFilter === c
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[560px] overflow-y-auto pr-1">
            {availableProducts.map((p) => {
              const inCart = cart.find((it) => it.product.id === p.id);
              const isOutOfStock = p.currentStock <= 0;

              return (
                <button
                  key={p.id}
                  disabled={isOutOfStock}
                  onClick={() => addToCart(p)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                    isOutOfStock
                      ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                      : inCart
                      ? 'bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                  }`}
                >
                  {inCart && (
                    <span className="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                      {inCart.quantity}
                    </span>
                  )}
                  <div>
                    <div className="text-2xl mb-1">{p.image || '📦'}</div>
                    <div className="text-xs font-bold text-slate-900 line-clamp-1">{p.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{p.sku}</div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">
                      {currencySymbol}{p.sellingPrice}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        isOutOfStock
                          ? 'text-rose-500'
                          : p.currentStock <= p.minStockLevel
                          ? 'text-amber-500'
                          : 'text-slate-400'
                      }`}
                    >
                      {isOutOfStock ? 'Out of stock' : `${p.currentStock} left`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Checkout Register Cart (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900">Current Order Register</h2>
              </div>
              <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                {cart.reduce((a, b) => a + b.quantity, 0)} Items
              </span>
            </div>

            {errorMessage && (
              <div className="p-3 mb-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <ShoppingCart className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                <p className="text-xs font-medium">Cart is empty.</p>
                <p className="text-[11px] text-slate-400">Click any product on the left to add.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto mb-4 pr-1">
                {cart.map((item) => (
                  <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {item.product.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {currencySymbol}{item.product.sellingPrice} each
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-0.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-6 h-6 rounded bg-white hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-6 h-6 rounded bg-white hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-xs font-bold text-slate-900 text-right w-16">
                      {currencySymbol}{item.product.sellingPrice * item.quantity}
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Customer & Discount Controls */}
            {cart.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Customer Name (Opt)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Phone / Mobile (Opt)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-medium">Discount ({currencySymbol}):</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={discount || ''}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-24 px-2.5 py-1 text-xs rounded-lg border border-slate-200 focus:outline-indigo-500 font-bold"
                  />
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'UPI', label: 'UPI / QR', icon: Smartphone },
                      { id: 'Cash', label: 'Cash', icon: Banknote },
                      { id: 'Card', label: 'Card', icon: CreditCard },
                      { id: 'Credit', label: 'Khata', icon: User }
                    ].map((m) => {
                      const Icon = m.icon;
                      const active = paymentMethod === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMethod(m.id as any)}
                          className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 text-[11px] font-bold transition-all cursor-pointer ${
                            active
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cart Totals & Checkout Button */}
          {cart.length > 0 && (
            <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>{currencySymbol}{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount:</span>
                    <span>-{currencySymbol}{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-100">
                  <span>Total Due:</span>
                  <span className="text-base text-indigo-600">
                    {currencySymbol}{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                disabled={isProcessing}
                onClick={handleCheckout}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-sm shadow-md shadow-indigo-100 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? 'Processing Transaction...' : `Complete Sale • ${currencySymbol}${totalAmount.toLocaleString()}`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Sales Log */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Recent Completed Transactions</h2>
          </div>
          <span className="text-xs text-slate-500">{salesHistory.length} total logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Invoice No</th>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Items</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salesHistory.slice(0, 6).map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">
                    {s.invoiceNo}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {s.date}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-slate-900">
                      {s.items.reduce((a, b) => a + b.quantity, 0)} units
                    </span>{' '}
                    <span className="text-slate-400">({s.items.map((i) => i.productName).join(', ')})</span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-700">
                    {s.customerName || 'Walk-in'}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {s.paymentMethod}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {currencySymbol}{s.totalAmount.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onViewReceipt(s)}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-indigo-50 text-indigo-600 font-bold text-[11px] cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
