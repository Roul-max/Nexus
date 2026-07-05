'use client';

import { useQuery } from '@tanstack/react-query';
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '@/lib/firebase/auth-context';

interface LeadsData {
  week: string;
  value: number;
}

export function LeadsChart() {
  const { currentOrg, user } = useAuth();

  const { data, isLoading } = useQuery<LeadsData[]>({
    queryKey: ['leadsTrend', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg || !user) throw new Error('Auth context not available');
      const token = await user.getIdToken();
      try {
        const response = await fetch('/api/analytics/leads-trend', {
          headers: {
            'X-Organization-Id': currentOrg.id,
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch leads data');
        const result = await response.json();
        return result.data;
      } catch (error) {
        console.error(error);
        return [];
      }
    },
    enabled: !!currentOrg && !!user,
  });

  if (isLoading) {
    return <div className="w-full h-[300px] animate-pulse bg-zinc-50 rounded-xl" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center border-2 border-dashed border-zinc-100 rounded-xl bg-zinc-50">
        <span className="text-zinc-400 text-sm">No lead data available</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
        <XAxis dataKey="week" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: '1px solid #ccc' }}
          labelStyle={{ fontWeight: 'bold' }}
        />
        <Line type="monotone" dataKey="value" name="New Leads" stroke="#82ca9d" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}