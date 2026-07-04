import { Suspense } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Users, DollarSign, Briefcase, TrendingUp } from 'lucide-react';
import { StatCard, StatCardSkeleton } from './StatCard';
import { RecentActivity, RecentActivitySkeleton } from './RecentActivity';

async function DashboardStats() {
  const stats = [
    {
      name: 'Total Revenue',
      value: '$0',
      icon: DollarSign,
    },
    {
      name: 'Active Users',
      value: '0',
      icon: Users,
    },
    {
      name: 'Active Projects',
      value: '0',
      icon: Briefcase,
    },
    {
      name: 'Conversion Rate',
      value: 'N/A',
      icon: TrendingUp,
    },
  ];

  return (
    <>
      {stats.map((stat) => (
        <StatCard
          key={stat.name}
          name={stat.name}
          value={stat.value}
          Icon={stat.icon}
        />
      ))}
    </>
  );
}

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Dashboard
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Here is what's happening with your projects today.
            </p>
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors">
              Export
            </button>

            <button className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
              Generate Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Suspense
            fallback={
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            }
          >
            <DashboardStats />
          </Suspense>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm min-h-[400px]">
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 mb-4">
              Revenue Overview
            </h2>

            <div className="w-full h-[300px] flex items-center justify-center border-2 border-dashed border-zinc-100 rounded-xl bg-zinc-50">
              <span className="text-zinc-400 text-sm">
                No analytics data available
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 mb-4">
              Recent Activity
            </h2>

            <Suspense fallback={<RecentActivitySkeleton />}>
              <RecentActivity />
            </Suspense>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}