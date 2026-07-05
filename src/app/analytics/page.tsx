'use client';

import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/lib/firebase/auth-context';
import {
  BarChart,
  Users,
  Download,
  Briefcase,
  CheckCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { RevenueChart } from '../dashboard/RevenueChart';
import { LeadsChart } from './LeadsChart';
import { ProjectStatusChart } from './ProjectStatusChart';

interface AnalyticsData {
  leadsLast30Days: number;
  projectsLast30Days: number;
  tasksLast30Days: number;
  revenueLast30Days: number;
  totalUsers: number;
}

export default function AnalyticsPage() {
  const { currentOrg, user } = useAuth();

  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['analyticsData', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg || !user) {
        throw new Error('Organization or user not available');
      }
      const token = await user.getIdToken();
      const response = await fetch('/api/analytics', {
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
    { name: 'New Leads (30d)', value: data?.leadsLast30Days ?? 0, icon: Users },
    { name: 'New Projects (30d)', value: data?.projectsLast30Days ?? 0, icon: Briefcase },
    { name: 'Tasks Completed (30d)', value: data?.tasksLast30Days ?? 0, icon: CheckCircle },
    { name: 'Revenue (30d)', value: data ? formatCurrency(data.revenueLast30Days) : '₹0', icon: BarChart },
  ];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Analytics
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Detailed breakdown of your business performance.
            </p>
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

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm h-32 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.name} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2 text-zinc-500 mb-4">
                  <stat.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{stat.name}</span>
                </div>
                <div>
                  <div className="text-3xl font-bold text-zinc-900">{stat.value}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm min-h-[400px] flex flex-col">
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 mb-6">
              Revenue Overview
            </h2>
            <RevenueChart />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm min-h-[400px] flex flex-col">
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 mb-6">
              Lead Acquisition
            </h2>
            <LeadsChart />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm min-h-[400px] flex flex-col">
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 mb-6">Project Status</h2>
          <ProjectStatusChart />
        </div>
      </div>
    </AppLayout>
  );
}