import { AppLayout } from '@/components/layout/AppLayout';
import { CreditCard, Check, Shield, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Starter',
    price: '$29',
    interval: '/mo',
    description: 'Perfect for small teams getting started.',
    features: ['Up to 5 team members', 'Basic CRM features', '10 Projects', 'Community Support'],
    current: false,
    buttonText: 'Upgrade to Starter',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$99',
    interval: '/mo',
    description: 'The complete toolkit for growing businesses.',
    features: ['Up to 20 team members', 'Advanced CRM & Automation', 'Unlimited Projects', 'AI Assistant (1k tokens/mo)', 'Priority Support'],
    current: true,
    buttonText: 'Current Plan',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    interval: '',
    description: 'Advanced security and support for large organizations.',
    features: ['Unlimited team members', 'Custom integrations', 'Dedicated AI Model', 'SAML SSO', '24/7 Phone Support'],
    current: false,
    buttonText: 'Contact Sales',
    popular: false,
  }
];

export default function BillingPage() {
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Billing & Subscription</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your plan, payment methods, and billing history.</p>
        </div>

        {/* Current Plan Overview */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
              <Zap className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900">Professional Plan</h2>
              <p className="text-sm text-zinc-500">Next billing date: November 15, 2026</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors">
              Cancel Subscription
            </button>
            <button className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
              Update Payment Method
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={cn(
                "bg-white rounded-2xl border p-6 flex flex-col relative transition-all",
                plan.popular ? "border-indigo-600 shadow-md ring-1 ring-indigo-600" : "border-zinc-200 shadow-sm",
                plan.current ? "opacity-90" : "hover:border-zinc-300"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-3 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-zinc-900">{plan.name}</h3>
                <p className="text-sm text-zinc-500 mt-1 h-10">{plan.description}</p>
              </div>
              <div className="mb-6 flex items-baseline">
                <span className="text-4xl font-bold tracking-tight text-zinc-900">{plan.price}</span>
                <span className="text-sm text-zinc-500 font-medium ml-1">{plan.interval}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-zinc-600">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button 
                disabled={plan.current}
                className={cn(
                  "w-full py-2.5 rounded-lg text-sm font-medium transition-colors",
                  plan.current 
                    ? "bg-zinc-100 text-zinc-400 cursor-not-allowed" 
                    : plan.popular 
                      ? "bg-indigo-600 text-white hover:bg-indigo-700" 
                      : "bg-zinc-900 text-white hover:bg-zinc-800"
                )}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Invoice History */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center">
            <h3 className="font-bold text-zinc-900">Billing History</h3>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Download All</button>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {[
                { date: 'Oct 15, 2026', amount: '$99.00', status: 'Paid' },
                { date: 'Sep 15, 2026', amount: '$99.00', status: 'Paid' },
                { date: 'Aug 15, 2026', amount: '$99.00', status: 'Paid' },
              ].map((invoice, i) => (
                <tr key={i} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 text-zinc-900 font-medium">{invoice.date}</td>
                  <td className="px-6 py-4 text-zinc-600">{invoice.amount}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-zinc-500 hover:text-zinc-900 font-medium">PDF</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
