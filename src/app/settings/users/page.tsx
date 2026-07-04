'use client';

import { useAuth } from '@/lib/firebase/auth-context';

export default function SettingsUsersPage() {
  const { profile, currentOrg } = useAuth();
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-200">
        <h2 className="font-bold text-zinc-900">Organization users</h2>
        <p className="text-sm text-zinc-500 mt-1">Users with access to {currentOrg?.name ?? 'this organization'}.</p>
      </div>
      <div className="p-6">
        {profile ? (
          <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-4">
            <div><p className="font-medium text-zinc-900">{profile.name || 'Current user'}</p><p className="text-sm text-zinc-500">{profile.email}</p></div>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">Member</span>
          </div>
        ) : <p className="text-sm text-zinc-500">Loading users...</p>}
      </div>
    </div>
  );
}
