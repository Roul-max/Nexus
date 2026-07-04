import { formatDistanceToNow } from 'date-fns';

interface Activity {
  action: string;
  createdAt: string;
  userName: string | null;
}

export function RecentActivity({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-zinc-500">No recent activity.</p>
    );
  }

  return (
    <div className="space-y-6">
      {activities.map((activity, i) => (
        <div key={i} className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex-shrink-0" />
          <div>
            <p className="text-sm text-zinc-900 font-medium">
              {activity.userName ?? 'System'} performed action:{' '}
              <span className="font-mono text-xs bg-zinc-100 p-1 rounded">
                {activity.action}
              </span>
            </p>

            <p className="text-xs text-zinc-500 mt-0.5">
              {formatDistanceToNow(new Date(activity.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecentActivitySkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <div className="w-8 h-8 rounded-full bg-zinc-100 flex-shrink-0" />
          <div className="flex-grow space-y-2">
            <div className="h-4 w-full rounded bg-zinc-100" />
            <div className="h-3 w-1/4 rounded bg-zinc-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
