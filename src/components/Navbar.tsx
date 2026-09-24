import React, { useState } from 'react';
import {
  Sparkles,
  Bell,
  Store,
  User as UserIcon,
  ChevronDown,
  Layers,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { User, SmartAlert, SubscriptionInfo } from '../types/index.ts';

interface NavbarProps {
  currentUser: User | null;
  onSwitchRole: (role: 'owner' | 'manager' | 'cashier') => void;
  storeInfo: { name: string; category: string; currencySymbol: string };
  alerts: SmartAlert[];
  subscription: SubscriptionInfo;
  onOpenAlerts: () => void;
  onOpenSubscription: () => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchRole,
  storeInfo,
  alerts,
  subscription,
  onOpenAlerts,
  onOpenSubscription
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const unreadAlerts = alerts.filter((a) => !a.resolved);
  const criticalCount = unreadAlerts.filter((a) => a.severity === 'critical').length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
                  StockPulse<span className="text-indigo-600">AI</span>
                </span>
              </div>
            </div>
          </div>

          {/* Center: Store Switcher */}
          <div className="relative">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-slate-800 text-xs sm:text-sm font-semibold border border-slate-200"
            >
              <Store className="w-4 h-4 text-indigo-600" />
              <span className="truncate max-w-[130px] sm:max-w-[200px]">{storeInfo.name}</span>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Plan Badge */}
            <button
              onClick={onOpenSubscription}
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                subscription.currentPlan === 'business'
                  ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                  : subscription.currentPlan === 'pro'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
              {subscription.currentPlan.toUpperCase()} Plan
            </button>

            {/* Smart Alerts Bell */}
            <button
              onClick={onOpenAlerts}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Smart Stockout & Anomaly Alerts"
            >
              <Bell className="w-5 h-5" />
              {unreadAlerts.length > 0 && (
                <span
                  className={`absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] font-extrabold text-white ${
                    criticalCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
                  }`}
                >
                  {unreadAlerts.length}
                </span>
              )}
            </button>

            {/* User & Role Switcher */}
            {currentUser && <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
              >
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-300"
                />
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                    {currentUser.name}
                    <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-bold bg-slate-100 text-slate-600">
                      {currentUser.role}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute top-full mt-1 right-0 w-60 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-500">{currentUser.email}</div>
                  </div>

                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
                    Switch role
                  </div>

                  <button
                    onClick={() => {
                      onSwitchRole('owner');
                      setShowRoleMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs font-semibold text-slate-800 flex items-center justify-between"
                  >
                    <span>👑 Business Owner (Full Access)</span>
                    {currentUser.role === 'owner' && <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>

                  <button
                    onClick={() => {
                      onSwitchRole('manager');
                      setShowRoleMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs font-semibold text-slate-800 flex items-center justify-between"
                  >
                    <span>📋 Inventory Manager</span>
                    {currentUser.role === 'manager' && <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>

                  <button
                    onClick={() => {
                      onSwitchRole('cashier');
                      setShowRoleMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs font-semibold text-slate-800 flex items-center justify-between"
                  >
                    <span>🧾 Cashier / POS Staff</span>
                    {currentUser.role === 'cashier' && <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                </div>
              )}
            </div>}
          </div>
        </div>
      </div>
    </header>
  );
};
