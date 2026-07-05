'use client';

import { useEffect, useState } from 'react';
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from 'recharts';
import { useAuth } from '@/lib/firebase/auth-context';

interface ProjectStatusData {
  name: string;
  value: number;
}

const COLORS = {
  active: '#8884d8',
  completed: '#82ca9d',
  archived: '#ffc658',
};

export function ProjectStatusChart() {
  const { currentOrg } = useAuth();
  const [data, setData] = useState<ProjectStatusData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentOrg) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch('/api/analytics/project-status', {
          headers: { 'X-Organization-Id': currentOrg!.id },
        });
        if (!response.ok) throw new Error('Failed to fetch project status data');
        const result = await response.json();
        const formattedData = Object.entries(result.data).map(([key, value]) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value: value as number,
        }));
        setData(formattedData);
      } catch (error) {
        console.error(error);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentOrg]);

  if (loading) {
    return <div className="w-full h-[300px] animate-pulse bg-zinc-50 rounded-xl" />;
  }

  if (data.every(d => d.value === 0)) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center border-2 border-dashed border-zinc-100 rounded-xl bg-zinc-50">
        <span className="text-zinc-400 text-sm">No project data available</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name" label>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}