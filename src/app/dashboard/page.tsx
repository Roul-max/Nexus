'use client';

import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Users, DollarSign, Briefcase, TrendingUp } from 'lucide-react';
import { StatCard, StatCardSkeleton } from './StatCard';
import { RecentActivity, RecentActivitySkeleton } from './RecentActivity';
import { useAuth } from '@/lib/firebase/auth-context';
import { formatCurrency } from '@/lib/currency';
import { RevenueChart } from './RevenueChart';

interface DashboardData {
  totalRevenue: number;
  activeUsers: number;
  activeProjects: number;
  newLeadsLast7Days: number;
  recentActivity: { action: string; createdAt: string; userName: string | null }[];
}

export default function DashboardPage() {
  const { currentOrg, user } = useAuth();

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboardData', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg || !user) {
        throw new Error('Organization or user not available');
      }
      const token = await user.getIdToken();
      const response = await fetch('/api/dashboard', {
        headers: {
          'X-Organization-Id': currentOrg.id,
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please check your login session.');
        }
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      return result.data;
    },
    enabled: !!currentOrg && !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const stats = [
    { name: 'Total Revenue', value: data ? formatCurrency(data.totalRevenue) : '₹0', icon: DollarSign },
    { name: 'Active Users', value: data?.activeUsers ?? 0, icon: Users },
    { name: 'Active Projects', value: data?.activeProjects ?? 0, icon: Briefcase },
    { name: 'New Leads (7d)', value: data?.newLeadsLast7Days ?? 0, icon: TrendingUp },
  ];

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
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            stats.map((stat) => (
              <StatCard key={stat.name} name={stat.name} value={stat.value} Icon={stat.icon} />
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm min-h-[400px]">
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 mb-4">
              Revenue Overview
            </h2>

            <RevenueChart />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 mb-4">
              Recent Activity
            </h2>

            {isLoading ? (
              <RecentActivitySkeleton />
            ) : (
              <RecentActivity activities={data?.recentActivity ?? []} />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}