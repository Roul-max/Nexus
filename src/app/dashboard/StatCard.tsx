import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  name: string;
  value: string | number;
  Icon: LucideIcon;
}

export function StatCard({ name, value, Icon }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-100">
          <Icon className="w-5 h-5 text-zinc-600" />
        </div>
        {/* Trend indicator can be added back here when data is available */}
      </div>
      <div className="text-zinc-500 text-sm font-medium">{name}</div>
      <div className="text-2xl font-bold text-zinc-900 mt-1">{value}</div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
      <div className="h-10 w-10 rounded-full bg-zinc-100 mb-4 animate-pulse" />
      <div className="h-4 w-3/4 rounded bg-zinc-100 mb-2 animate-pulse" />
      <div className="h-7 w-1/2 rounded bg-zinc-100 animate-pulse" />
    </div>
  );
}