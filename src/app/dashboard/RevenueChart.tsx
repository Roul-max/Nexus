'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/firebase/auth-context';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TrendData {
  month: string;
  value: number;
}

export function RevenueChart() {
  const { currentOrg, user } = useAuth();

  const { data, isLoading } = useQuery<TrendData[]>({
    queryKey: ['revenueTrend', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg || !user) throw new Error('Auth context not available');
      const token = await user.getIdToken();
      const res = await fetch('/api/analytics/revenue-trend', {
        headers: {
          'X-Organization-Id': currentOrg.id,
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch revenue trend');
      const result = await res.json();
      return result.data;
    },
    enabled: !!currentOrg && !!user,
  });

  if (isLoading) return <div className="h-full w-full bg-zinc-50 animate-pulse rounded-lg" />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip />
        <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
      </AreaChart>
    </ResponsiveContainer>
  );
}