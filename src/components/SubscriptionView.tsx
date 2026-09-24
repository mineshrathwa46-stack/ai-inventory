import React, { useState } from 'react';
import {
  CreditCard,
  Check,
  Sparkles,
  Zap,
  Building,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { SubscriptionInfo, SubscriptionPlan } from '../types/index.ts';

interface SubscriptionViewProps {
  subscription: SubscriptionInfo;
  onUpdatePlan: (plan: SubscriptionPlan) => Promise<void>;
  currencySymbol: string;
}

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({
  subscription,
  onUpdatePlan,
  currencySymbol
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (plan === subscription.currentPlan) return;
    setSwitchingTo(plan);
    try {
      await onUpdatePlan(plan);
    } finally {
      setSwitchingTo(null);
    }
  };

  const plans = [
    {
      id: 'free' as SubscriptionPlan,
      name: 'Starter Free',
      tagline: 'Ideal for single-counter local kirana or boutique trials',
      priceMonthly: 0,
      priceAnnual: 0,
      limits: 'Up to 25 Products',
      features: [
        'Basic Inventory Tracking',
        'POS Sales Recording',
        'Manual Stock Count Logs',
        'Daily Sales Summary',
        'Standard Email Support'
      ],
      notIncluded: [
        'AI Demand Prediction Engine',
        'Smart Stockout Risk Alerts',
        'AI Business Insights Copilot',
        'Automated Supplier Lead-Time Buffer'
      ],
      popular: false
    },
    {
      id: 'pro' as SubscriptionPlan,
      name: 'Growth Pro',
      tagline: 'For high-volume retail shops needing automated replenishment',
      priceMonthly: 299,
      priceAnnual: 249,
      limits: 'Up to 1,000 Products',
      features: [
        'All Starter Features',
        'AI Demand Prediction & Stockout Forecast',
        'Automated Reorder Quantity Formulas',
        'Proactive Smart Alerts (Surges & Drops)',
        'Inventory Turnover & Capital Velocity Audits',
        'CSV & PDF Financial Exports',
        'Advanced AI Strategic Insights'
      ],
      notIncluded: [
        'Multi-Store Consolidated Warehousing',
        'Unlimited Staff RBAC Roles'
      ],
      popular: true
    },
    {
      id: 'business' as SubscriptionPlan,
      name: 'Enterprise Business',
      tagline: 'For retail chains, supermarkets, and multi-location pharmacies',
      priceMonthly: 699,
      priceAnnual: 579,
      limits: 'Up to 10,000 Products',
      features: [
        'Everything in Pro',
        'Multiple Staff Accounts with Full RBAC',
        'Multi-Store Support (Grocery + Pharmacy)',
        'Direct Supplier Auto-PO Generation',
        'Dead Stock Capital Liquidation Planner',
        'Priority AI Model Inference',
        'Dedicated Technical Account Manager'
      ],
      notIncluded: [],
      popular: false
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          Transparent SaaS Pricing
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Flexible Plans Engineered for Retailers of Any Size
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Start for free, scale with predictive intelligence as your SKU catalog and customer footfall expand.
        </p>

        {/* Monthly vs Annual Toggle */}
        <div className="pt-2 inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              billingCycle === 'annual' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
            }`}
          >
            Annual Billing
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan) => {
          const isCurrent = subscription.currentPlan === plan.id;
          const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnual;

          return (
            <div
              key={plan.id}
              className={`p-6 rounded-3xl border flex flex-col justify-between transition-all relative ${
                plan.popular
                  ? 'bg-white border-indigo-600 shadow-xl shadow-indigo-100/50 ring-2 ring-indigo-600/20'
                  : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                  Most Popular for Small Retail
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-base font-black text-slate-900">{plan.name}</h2>
                  {isCurrent && (
                    <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Active Plan
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 mb-4">{plan.tagline}</p>

                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-black text-slate-900">
                    {price === 0 ? 'Free' : `${currencySymbol}${price}`}
                  </span>
                  {price > 0 && (
                    <span className="text-xs text-slate-500 font-semibold">/month</span>
                  )}
                </div>

                <div className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl mb-5 inline-block">
                  {plan.limits}
                </div>

                {/* Features List */}
                <div className="space-y-2 mb-6">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Included Capabilities
                  </div>
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}

                  {plan.notIncluded.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-400 line-through">
                      <span className="w-4 h-4 text-slate-300 text-center font-bold shrink-0">✕</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                disabled={isCurrent || switchingTo === plan.id}
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-slate-100 text-slate-500 cursor-default'
                    : plan.popular
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {switchingTo === plan.id
                  ? 'Switching Plan...'
                  : isCurrent
                  ? 'Current Plan Active'
                  : `Switch to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
