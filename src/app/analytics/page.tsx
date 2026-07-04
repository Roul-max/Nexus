'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/lib/firebase/auth-context';
import {
  BarChart,
  Activity,
  Users,
  TrendingUp,
  Download,
  Briefcase,
  CheckCircle,
} from 'lucide-react';

interface AnalyticsData {
  leadsLast30Days: number;
  projectsLast30Days: number;
  tasksLast30Days: number;
  revenueLast30Days: number;
  totalUsers: number;
}

function useAnalyticsData() {
  const { currentOrg } = useAuth();
  const organization = currentOrg;
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organization) {
      // If there's no organization, we're not loading data for it.
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
        const response = await fetch('/api/analytics', {
          headers: { 'X-Organization-Id': org.id },
        });
        if (!response.ok) throw new Error('Failed to fetch analytics data');
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

export default function AnalyticsPage() {
  const { data, loading } = useAnalyticsData();

  const stats = [
    { name: 'New Leads (30d)', value: data?.leadsLast30Days ?? 0, icon: Users },
    { name: 'New Projects (30d)', value: data?.projectsLast30Days ?? 0, icon: Briefcase },
    { name: 'Tasks Completed (30d)', value: data?.tasksLast30Days ?? 0, icon: CheckCircle },
    { name: 'Revenue (30d)', value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((data?.revenueLast30Days ?? 0) / 100), icon: BarChart },
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

        {loading ? (
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

            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-zinc-100 rounded-xl bg-zinc-50">
              <span className="text-zinc-400 text-sm flex flex-col items-center gap-2">
                <BarChart className="w-8 h-8 text-zinc-300" />
                Revenue Chart Visualization
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm min-h-[400px] flex flex-col">
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 mb-6">
              User Acquisition
            </h2>

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

function PieChartIcon(props: React.SVGProps<SVGSVGElement>) {
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