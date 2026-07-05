'use client';

import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '@/lib/firebase/auth-context';
import { formatCurrency } from '@/lib/currency';

interface RevenueData {
  date: string;
  revenue: number;
}

export function RevenueChart() {
  const { currentOrg } = useAuth();
  const [data, setData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentOrg) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch('/api/analytics/revenue-trend', {
          headers: { 'X-Organization-Id': currentOrg!.id },
        });
        if (!response.ok) throw new Error('Failed to fetch revenue data');
        const result = await response.json();
        setData(result.data);
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

  if (data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center border-2 border-dashed border-zinc-100 rounded-xl bg-zinc-50">
        <span className="text-zinc-400 text-sm">No revenue data available</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value).replace('.00', '')} />
        <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
        <Tooltip
          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: '1px solid #ccc' }}
          formatter={(value: number) => formatCurrency(value)}
        />
        <Area type="monotone" dataKey="revenue" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}