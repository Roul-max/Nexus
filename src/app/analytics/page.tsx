import { Suspense } from 'react';
import { and, count, eq, gte, sum } from 'drizzle-orm';
import { AppLayout } from '@/components/layout/AppLayout';
import { db } from '@/db';
import { invoices, leads } from '@/db/schema';
import { requireTenant } from '@/lib/auth';
import { BarChart, Activity, Users, TrendingUp, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

async function AnalyticsStats() {
  const { membership } = await requireTenant();
  const orgId = membership.organizationId;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const newLeadsPromise = db
    .select({ value: count() })
    .from(leads)
    .where(and(eq(leads.organizationId, orgId), gte(leads.createdAt, thirtyDaysAgo)));

  const mrrPromise = db
    .select({ value: sum(invoices.amountPaid) })
    .from(invoices)
    .where(
      and(
        eq(invoices.organizationId, orgId),
        eq(invoices.status, 'paid'),
        gte(invoices.paidAt, thirtyDaysAgo)
      )
    );

  const [[{ value: newLeads }], [{ value: mrr }]] = await Promise.all([
    newLeadsPromise,
    mrrPromise,
  ]);

  const stats = [
    { name: 'Session Duration', value: 'N/A', change: null, icon: Activity },
    { name: 'New Leads', value: newLeads, change: null, icon: Users },
    { name: 'Conversion Rate', value: 'N/A', change: null, icon: TrendingUp },
    {
      name: 'MRR Growth',
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
        (mrr ?? 0) / 100
      ),
      change: null,
      icon: BarChart,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 text-zinc-500 mb-4">
            <stat.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{stat.name}</span>
          </div>
          <div>
            <div className="text-3xl font-bold text-zinc-900">{stat.value}</div>
            {stat.change && (
              <div className="text-sm text-emerald-600 font-medium mt-1">{stat.change}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Analytics</h1>
            <p className="text-sm text-zinc-500 mt-1">Detailed breakdown of your business performance.</p>
          </div>
          <div className="flex gap-3">
            <select className="px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900">
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>This Year</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 text-zinc-500 mb-4">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Session Duration</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-zinc-900">4m 12s</div>
              <div className="text-sm text-emerald-600 font-medium mt-1">+12.5% from last month</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 text-zinc-500 mb-4">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">New Leads</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-zinc-900">842</div>
              <div className="text-sm text-emerald-600 font-medium mt-1">+5.2% from last month</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 text-zinc-500 mb-4">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Conversion Rate</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-zinc-900">12.4%</div>
              <div className="text-sm text-red-600 font-medium mt-1">-1.1% from last month</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 text-zinc-500 mb-4">
              <BarChart className="w-4 h-4" />
              <span className="text-sm font-medium">MRR Growth</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-zinc-900">$12,450</div>
              <div className="text-sm text-emerald-600 font-medium mt-1">+8.4% from last month</div>
            </div>
          </div>
        </div>
        <Suspense fallback={<div className="h-28 animate-pulse bg-zinc-50 rounded-2xl" />}>
          <AnalyticsStats />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm min-h-[400px] flex flex-col">
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 mb-6">Revenue Overview</h2>
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-zinc-100 rounded-xl bg-zinc-50">
              <span className="text-zinc-400 text-sm flex flex-col items-center gap-2">
                <BarChart className="w-8 h-8 text-zinc-300" />
                Revenue Chart Visualization
              </span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm min-h-[400px] flex flex-col">
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 mb-6">User Acquisition</h2>
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-zinc-100 rounded-xl bg-zinc-50">
              <span className="text-zinc-400 text-sm flex flex-col items-center gap-2">
                <PieChartIcon className="w-8 h-8 text-zinc-300" />
                Acquisition Channels Chart
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function PieChartIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}
