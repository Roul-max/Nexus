'use client';

import { useEffect, useState, useTransition } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/lib/firebase/auth-context';
import { Trash2 } from 'lucide-react';

interface Invitation {
  id: string;
  email: string;
  createdAt: string;
  role: { name: string };
}

export function PendingInvitations() {
  const { currentOrg } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const fetchInvitations = async () => {
    if (!currentOrg) return;
    setLoading(true);
    try {
      const response = await fetch('/api/v1/team/invitations', {
        headers: { 'X-Organization-Id': currentOrg.id },
      });
      if (!response.ok) throw new Error('Failed to fetch invitations');
      const result = await response.json();
      setInvitations(result.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [currentOrg]);

  const handleRevoke = async (invitationId: string) => {
    if (!currentOrg) return;
    startTransition(async () => {
      await fetch(`/api/v1/team/invitations/${invitationId}`, {
        method: 'DELETE',
        headers: { 'X-Organization-Id': currentOrg.id },
      });
      // Refetch invitations after revoking
      await fetchInvitations();
    });
  };

  if (loading) return <div className="text-center py-4">Loading pending invitations...</div>;
  if (invitations.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight text-zinc-900 mb-4">Pending Invitations</h2>
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium">
              <tr>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Invited</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {invitations.map((invite) => (
                <tr key={invite.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-900">{invite.email}</td>
                  <td className="px-6 py-4 text-zinc-700 capitalize">{invite.role.name}</td>
                  <td className="px-6 py-4 text-zinc-500">{formatDistanceToNow(new Date(invite.createdAt), { addSuffix: true })}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleRevoke(invite.id)} disabled={isPending} className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}