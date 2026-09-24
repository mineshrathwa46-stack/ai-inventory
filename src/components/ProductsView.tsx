import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  QrCode,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Tag,
  Building,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Product, Supplier } from '../types/index.ts';

interface ProductsViewProps {
  products: Product[];
  suppliers: Supplier[];
  currencySymbol: string;
  onAddProduct: (prod: Partial<Product>) => Promise<void>;
  onUpdateProduct: (id: string, prod: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onSelectProductForDemand?: (productId: string) => void;
  canEdit: boolean;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  suppliers,
  currencySymbol,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onSelectProductForDemand,
  canEdit
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'out' | 'low' | 'healthy'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock_asc' | 'stock_desc' | 'sales_desc' | 'margin_desc'>('sales_desc');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [skuScannerActive, setSkuScannerActive] = useState(false);
  const [scannedSkuInput, setScannedSkuInput] = useState('');
  const [skuScanResult, setSkuScanResult] = useState<Product | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState('Beverages');
  const [formSellingPrice, setFormSellingPrice] = useState<number>(50);
  const [formPurchasePrice, setFormPurchasePrice] = useState<number>(35);
  const [formCurrentStock, setFormCurrentStock] = useState<number>(20);
  const [formMinStockLevel, setFormMinStockLevel] = useState<number>(15);
  const [formSupplierId, setFormSupplierId] = useState(suppliers[0]?.id || '');
  const [formShelfLocation, setFormShelfLocation] = useState('Aisle 1');
  const [formBatchNumber, setFormBatchNumber] = useState('');
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  // Extract categories
  const categories = Array.from(new Set(products.map((p) => p.category)));

  // Filter & Sort
  const filtered = products
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.supplierName.toLowerCase().includes(search.toLowerCase());
      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      let matchesStock = true;
      if (stockFilter === 'out') matchesStock = p.currentStock === 0;
      else if (stockFilter === 'low') matchesStock = p.currentStock > 0 && p.currentStock <= p.minStockLevel;
      else if (stockFilter === 'healthy') matchesStock = p.currentStock > p.minStockLevel;

      return matchesSearch && matchesCat && matchesStock;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'stock_asc') return a.currentStock - b.currentStock;
      if (sortBy === 'stock_desc') return b.currentStock - a.currentStock;
      if (sortBy === 'sales_desc') return b.unitsSold - a.unitsSold;
      if (sortBy === 'margin_desc') {
        const mA = (a.sellingPrice - a.purchasePrice) / a.sellingPrice;
        const mB = (b.sellingPrice - b.purchasePrice) / b.sellingPrice;
        return mB - mA;
      }
      return 0;
    });

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormCategory(categories[0] || 'General');
    setFormSellingPrice(100);
    setFormPurchasePrice(70);
    setFormCurrentStock(30);
    setFormMinStockLevel(15);
    setFormSupplierId(suppliers[0]?.id || '');
    setFormShelfLocation('Aisle 1 - Bay A');
    setFormBatchNumber(`B-${new Date().getFullYear()}-01`);
    setFormExpiryDate('2027-12-31');
    setErrorMsg('');
    setShowAddModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormSku(p.sku);
    setFormCategory(p.category);
    setFormSellingPrice(p.sellingPrice);
    setFormPurchasePrice(p.purchasePrice);
    setFormCurrentStock(p.currentStock);
    setFormMinStockLevel(p.minStockLevel);
    setFormSupplierId(p.supplierId);
    setFormShelfLocation(p.shelfLocation || '');
    setFormBatchNumber(p.batchNumber || '');
    setFormExpiryDate(p.expiryDate || '');
    setErrorMsg('');
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSaving(true);
    try {
      const selectedSup = suppliers.find((s) => s.id === formSupplierId);
      const payload: Partial<Product> = {
        name: formName,
        sku: formSku,
        category: formCategory,
        sellingPrice: Number(formSellingPrice),
        purchasePrice: Number(formPurchasePrice),
        currentStock: Number(formCurrentStock),
        minStockLevel: Number(formMinStockLevel),
        supplierId: formSupplierId,
        supplierName: selectedSup?.name || 'Direct Supplier',
        shelfLocation: formShelfLocation,
        batchNumber: formBatchNumber,
        expiryDate: formExpiryDate
      };

      if (editingProduct) {
        await onUpdateProduct(editingProduct.id, payload);
      } else {
        await onAddProduct(payload);
      }
      setShowAddModal(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleSimulateScan = (skuToScan: string) => {
    const found = products.find((p) => p.sku.toLowerCase() === skuToScan.trim().toLowerCase());
    setSkuScanResult(found || null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600" />
            Product & Inventory Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your SKU catalog, pricing margins, reorder thresholds, and shelf locations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Barcode/SKU Scan Modal Trigger */}
          <button
            onClick={() => setSkuScannerActive(!skuScannerActive)}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-indigo-600" />
            Scan / Search SKU
          </button>

          {canEdit && (
            <button
              onClick={openAddModal}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          )}
        </div>
      </div>

      {/* Barcode / SKU Quick Scan Drawer */}
      {skuScannerActive && (
        <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-800 animate-in fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-indigo-400" />
              <span className="text-sm font-bold">Fast Barcode & SKU Lookup Scanner</span>
            </div>
            <button
              onClick={() => {
                setSkuScannerActive(false);
                setSkuScanResult(null);
              }}
              className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
            >
              Close ✕
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Scan or enter SKU..."
              value={scannedSkuInput}
              onChange={(e) => {
                setScannedSkuInput(e.target.value);
                handleSimulateScan(e.target.value);
              }}
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-400 focus:outline-indigo-500 font-mono"
            />
          </div>

          {skuScanResult && (
            <div className="mt-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{skuScanResult.image || '📦'}</span>
                <div>
                  <div className="text-sm font-bold text-white">{skuScanResult.name}</div>
                  <div className="text-xs text-slate-400 font-mono">
                    SKU: {skuScanResult.sku} | Category: {skuScanResult.category} | Shelf:{' '}
                    {skuScanResult.shelfLocation || 'Main'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Price: </span>
                  <span className="font-bold text-emerald-400">
                    {currencySymbol}{skuScanResult.sellingPrice}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Stock: </span>
                  <span
                    className={`font-black ${
                      skuScanResult.currentStock === 0
                        ? 'text-rose-400'
                        : skuScanResult.currentStock <= skuScanResult.minStockLevel
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {skuScanResult.currentStock} units
                  </span>
                </div>
                {canEdit && (
                  <button
                    onClick={() => openEditModal(skuScanResult)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-500 cursor-pointer"
                  >
                    Edit Product
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search, Filter & Sort Controls */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by name, SKU, category, or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-indigo-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Stock Status Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-indigo-500"
          >
            <option value="all">All Stock Levels</option>
            <option value="out">Out of Stock (0)</option>
            <option value="low">Low Stock (≤ min)</option>
            <option value="healthy">Healthy Stock</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-indigo-500"
          >
            <option value="sales_desc">Sort: Highest Sales Velocity</option>
            <option value="stock_asc">Sort: Stock: Low to High</option>
            <option value="stock_desc">Sort: Stock: High to Low</option>
            <option value="margin_desc">Sort: Highest Gross Margin</option>
            <option value="name">Sort: Product Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Product & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4">Purchase Cost</th>
                <th className="py-3 px-4">Gross Margin</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4">Units Sold</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No products match the selected criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const marginPercent = Math.round(
                    ((product.sellingPrice - product.purchasePrice) / product.sellingPrice) * 100
                  );
                  const isOutOfStock = product.currentStock === 0;
                  const isLowStock = product.currentStock > 0 && product.currentStock <= product.minStockLevel;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{product.image || '📦'}</span>
                          <div>
                            <div className="font-bold text-slate-900 line-clamp-1">{product.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                              <span>SKU: {product.sku}</span>
                              {product.shelfLocation && (
                                <span className="text-indigo-600 font-sans">• {product.shelfLocation}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {product.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900">
                        {currencySymbol}{product.sellingPrice.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {currencySymbol}{product.purchasePrice.toLocaleString()}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`font-bold ${
                            marginPercent >= 30
                              ? 'text-emerald-600'
                              : marginPercent >= 15
                              ? 'text-indigo-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {marginPercent}%
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-800">
                              {product.currentStock} units
                            </span>
                            <span className="text-slate-400 text-[10px]">Min: {product.minStockLevel}</span>
                          </div>

                          {/* Stock Health Bar */}
                          <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              style={{
                                width: `${Math.min(100, (product.currentStock / Math.max(1, product.minStockLevel * 2)) * 100)}%`
                              }}
                              className={`h-full rounded-full ${
                                isOutOfStock
                                  ? 'bg-rose-500'
                                  : isLowStock
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                            />
                          </div>

                          <div className="text-[10px]">
                            {isOutOfStock ? (
                              <span className="font-bold text-rose-600 flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> Out of Stock
                              </span>
                            ) : isLowStock ? (
                              <span className="font-bold text-amber-600 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Low Stock
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-medium">Healthy Buffer</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {product.unitsSold} units
                      </td>

                      <td className="py-3 px-4 text-slate-600 truncate max-w-[140px]" title={product.supplierName}>
                        {product.supplierName}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && (
                            <>
                              <button
                                onClick={() => openEditModal(product)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                                title="Edit Product"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete ${product.name}?`)) {
                                    onDeleteProduct(product.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900">
                {editingProduct ? 'Edit Product Details' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fortune Sunflower Oil 1L"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="OIL-FS-1L"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="Beverages / Medical"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Selling Price ({currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={formSellingPrice}
                    onChange={(e) => setFormSellingPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Purchase Cost ({currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={formPurchasePrice}
                    onChange={(e) => setFormPurchasePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Stock *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formCurrentStock}
                    onChange={(e) => setFormCurrentStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Min Stock Threshold *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formMinStockLevel}
                    onChange={(e) => setFormMinStockLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Supplier</label>
                <select
                  value={formSupplierId}
                  onChange={(e) => setFormSupplierId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-indigo-500 font-medium"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Lead time: {s.leadTimeDays}d)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shelf Location</label>
                  <input
                    type="text"
                    placeholder="Aisle 2 - Bay B"
                    value={formShelfLocation}
                    onChange={(e) => setFormShelfLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expiry Date (Opt)</label>
                  <input
                    type="date"
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
