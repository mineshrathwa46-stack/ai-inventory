import React, { useState } from 'react';
import {
  Users2,
  Plus,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  FileText,
  DollarSign,
  Truck,
  CheckCircle
} from 'lucide-react';
import { Supplier, Product } from '../types/index.ts';

interface SuppliersViewProps {
  suppliers: Supplier[];
  products: Product[];
  currencySymbol: string;
  onAddSupplier: (sup: Partial<Supplier>) => Promise<void>;
  onSelectSupplierForPO: (supplierId: string) => void;
  canEdit: boolean;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  products,
  currencySymbol,
  onAddSupplier,
  onSelectSupplierForPO,
  canEdit
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formGst, setFormGst] = useState('');
  const [formTerms, setFormTerms] = useState('Net 15');
  const [formLeadTime, setFormLeadTime] = useState(2);
  const [formRating, setFormRating] = useState(4.8);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAddSupplier({
        name: formName,
        contactPerson: formContact,
        phone: formPhone,
        email: formEmail,
        address: formAddress,
        gstNumber: formGst,
        paymentTerms: formTerms,
        leadTimeDays: Number(formLeadTime),
        rating: Number(formRating),
        categories: ['General Wholesale']
      });
      setShowAddModal(false);
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
            <Users2 className="w-6 h-6 text-indigo-600" />
            Supplier Directory & Lead-Time Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Track vendor reliability ratings, delivery lead-times for buffer calculation, and historical PO spending.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Supplier
          </button>
        )}
      </div>

      {/* Supplier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suppliers.map((sup) => {
          const suppliedProds = products.filter((p) => p.supplierId === sup.id);

          return (
            <div
              key={sup.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h2 className="text-sm font-black text-slate-900">{sup.name}</h2>
                    <div className="text-xs text-slate-500 font-medium">
                      Contact: {sup.contactPerson}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg border border-amber-200 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{sup.rating}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sup.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sup.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{sup.address}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Lead Time</span>
                    <span className="font-extrabold text-indigo-700">{sup.leadTimeDays} Days</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Terms</span>
                    <span className="font-bold text-slate-800">{sup.paymentTerms}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Total Spent</span>
                    <span className="font-bold text-slate-800">
                      {currencySymbol}{sup.totalSpent.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Products supplied tag list */}
                <div className="mt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Supplied Catalog ({suppliedProds.length} SKUs):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {suppliedProds.slice(0, 4).map((p) => (
                      <span
                        key={p.id}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700"
                      >
                        {p.name}
                      </span>
                    ))}
                    {suppliedProds.length > 4 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-400">
                        +{suppliedProds.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  GST: {sup.gstNumber}
                </span>
                <button
                  onClick={() => onSelectSupplierForPO(sup.id)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5" />
                  Create Reorder PO
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900">Add New Vendor / Supplier</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex FMCG Logistics"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="Suresh Kumar"
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98200 12345"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="orders@apexlogistics.in"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">GST / Tax ID</label>
                  <input
                    type="text"
                    placeholder="27AAACH2384K1Z8"
                    value={formGst}
                    onChange={(e) => setFormGst(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Transit Lead Time (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formLeadTime}
                    onChange={(e) => setFormLeadTime(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Terms</label>
                  <select
                    value={formTerms}
                    onChange={(e) => setFormTerms(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-indigo-500 font-medium"
                  >
                    <option value="Net 15">Net 15 Days</option>
                    <option value="Net 30">Net 30 Days</option>
                    <option value="COD">COD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Warehouse Address</label>
                <input
                  type="text"
                  placeholder="APMC Market, Yard 4, Vashi"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                />
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
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Add Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
