'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/firebase/auth-context';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface BreakdownData {
  name: string;
  value: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function ProjectStatusChart() {
  const { currentOrg, user } = useAuth();

  const { data, isLoading } = useQuery<BreakdownData[]>({
    queryKey: ['projectStatus', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg || !user) throw new Error('Auth context not available');
      const token = await user.getIdToken();
      const res = await fetch('/api/analytics/project-status', {
        headers: {
          'X-Organization-Id': currentOrg.id,
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch project status');
      const result = await res.json();
      return result.data;
    },
    enabled: !!currentOrg && !!user,
  });

  if (isLoading) return <div className="h-full w-full bg-zinc-50 animate-pulse rounded-lg" />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
          {data?.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}