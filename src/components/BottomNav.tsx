import React from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  Sparkles,
  Bell
} from 'lucide-react';
import { SmartAlert } from '../types/index.ts';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  alerts: SmartAlert[];
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  alerts
}) => {
  const unreadAlerts = alerts.filter((a) => !a.resolved);

  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'products', label: 'Stock', icon: Package },
    { id: 'sales', label: 'POS', icon: ShoppingCart },
    { id: 'demand', label: 'Forecast', icon: TrendingUp },
    { id: 'insights', label: 'AI', icon: Sparkles },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: Bell,
      badge: unreadAlerts.length > 0 ? unreadAlerts.length : null
    }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {items.map((it) => {
          const Icon = it.icon;
          const active = activeTab === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setActiveTab(it.id)}
              className={`flex flex-col items-center py-1 px-2 rounded-lg relative transition-colors cursor-pointer ${
                active ? 'text-indigo-600 font-bold' : 'text-slate-500 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {it.badge && (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-black rounded-full h-3.5 w-3.5 flex items-center justify-center">
                    {it.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5">{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
