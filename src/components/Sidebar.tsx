import React from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  TrendingUp,
  Bell,
  Sparkles,
  BarChart3,
  Users2,
  FileText,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import { User, SmartAlert } from '../types/index.ts';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  alerts: SmartAlert[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  alerts
}) => {
  const unreadAlerts = alerts.filter((a) => !a.resolved);
  const isCashier = currentUser?.role === 'cashier';

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['owner', 'manager', 'cashier'],
      badge: null
    },
    {
      id: 'products',
      label: 'Products & Stock',
      icon: Package,
      roles: ['owner', 'manager', 'cashier'],
      badge: null
    },
    {
      id: 'sales',
      label: 'Record Sale (POS)',
      icon: ShoppingCart,
      roles: ['owner', 'manager', 'cashier'],
      badge: null
    },
    {
      id: 'purchases',
      label: 'Restock / Purchases',
      icon: Truck,
      roles: ['owner', 'manager'],
      badge: null
    },
    {
      id: 'demand',
      label: 'AI Demand Prediction',
      icon: TrendingUp,
      roles: ['owner', 'manager'],
      badge: 'Core AI'
    },
    {
      id: 'alerts',
      label: 'Smart Alerts',
      icon: Bell,
      roles: ['owner', 'manager', 'cashier'],
      badge: unreadAlerts.length > 0 ? String(unreadAlerts.length) : null,
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      id: 'insights',
      label: 'AI Business Insights',
      icon: Sparkles,
      roles: ['owner', 'manager']
    },
    {
      id: 'analytics',
      label: 'Inventory Intelligence',
      icon: BarChart3,
      roles: ['owner', 'manager'],
      badge: null
    },
    {
      id: 'suppliers',
      label: 'Suppliers',
      icon: Users2,
      roles: ['owner', 'manager'],
      badge: null
    },
    {
      id: 'reports',
      label: 'Reports & Export',
      icon: FileText,
      roles: ['owner', 'manager'],
      badge: null
    },
    {
      id: 'subscription',
      label: 'SaaS Plans',
      icon: CreditCard,
      roles: ['owner'],
      badge: null
    },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 shrink-0 justify-between">
      <div>
        {/* Nav Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const allowed = !currentUser || item.roles.includes(currentUser.role);
            const active = activeTab === item.id;
            const Icon = item.icon;

            if (!allowed) {
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-400 text-xs font-medium cursor-not-allowed opacity-50"
                  title="Restricted by Role-Based Access Control"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                      active
                        ? 'bg-white/20 text-white'
                        : item.badgeColor || 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Role Indicator Footer */}
      <div className="pt-4 border-t border-slate-100">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-semibold text-slate-700">Role:</span>
          <span className="font-bold text-indigo-700 uppercase text-[11px]">{currentUser?.role || 'Unauthenticated'}</span>
        </div>
      </div>
    </aside>
  );
};
