'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Users, DollarSign, Briefcase, TrendingUp } from 'lucide-react';
import { StatCard, StatCardSkeleton } from './StatCard';
import { RecentActivity, RecentActivitySkeleton } from './RecentActivity';
import { useAuth } from '@/lib/firebase/auth-context';
import { RevenueChart } from '@/components/charts/RevenueChart';

interface DashboardData {
  totalRevenue: number;
  activeUsers: number;
  activeProjects: number;
  newLeadsLast7Days: number;
  recentActivity: { action: string; createdAt: string; userName: string | null }[];
}

function useDashboardData() {
  const { currentOrg } = useAuth();
  const organization = currentOrg;
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organization) {
      // If there's no organization, we're not loading data for it.
      // This can happen during initial load or if the user has no orgs.
      setLoading(false);
      return;
    }

    async function fetchData() {
      setLoading(true);
      const org = organization;
      if (!org) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch('/api/dashboard', {
          headers: { 'X-Organization-Id': org.id },
        });
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const result = await response.json();
        setData(result.data);
      } catch (error) {
        console.error(error);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [organization]);

  return { data, loading };
}

export default function DashboardPage() {
  const { data, loading } = useDashboardData();

  const stats = [
    { name: 'Total Revenue', value: data ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.totalRevenue / 100) : '$0.00', icon: DollarSign },
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
          {loading ? (
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

            {loading ? (
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