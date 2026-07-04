'use client';

import { useEffect, useState, useTransition } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';;
import { useAuth } from '@/lib/firebase/auth-context';
import { Plus, MoreHorizontal, Shield, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InviteMemberModal } from './_components/InviteMemberModal';
import { PendingInvitations } from './_components/PendingInvitations';

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  role: string;
  lastActive: string;
  status: 'Active' | 'Offline';
}

function useTeamMembers() {
  const { currentOrg } = useAuth();
  const organization = currentOrg;
  const [members, setMembers] = useState<TeamMember[]>([]);
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
        const response = await fetch('/api/team', {
          headers: { 'X-Organization-Id': org.id },
        });
        if (!response.ok) throw new Error('Failed to fetch team members');
        const result = await response.json();
        setMembers(result.data);
      } catch (error) {
        console.error(error);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [organization]);

  return { members, loading };
}

export default function TeamPage() {
  const { members: teamMembers, loading } = useTeamMembers();
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Team Management</h1>
            <p className="text-sm text-zinc-500 mt-1">Manage user access, roles, and permissions.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setInviteModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
              <Plus className="w-4 h-4" />
              Invite Member
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Active</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-zinc-500">
                      Loading...
                    </td>
                  </tr>
                ) : teamMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-zinc-500">
                      No team members found.
                    </td>
                  </tr>
                ) : (
                  teamMembers.map(member => (
                    <tr key={member.id} className="hover:bg-zinc-50 transition-colors" >
                      <td className="px-6 py-4" >
                        <div className="flex items-center gap-3" >
                          <div className="w-8 h-8 rounded-full bg-zinc-200 border border-zinc-300 overflow-hidden" >
                            <img src={`https://avatar.vercel.sh/${member.email}.png`} alt={member.name ?? ''} />
                          </div>
                          <div >
                            <div className="font-medium text-zinc-900">{member.name}</div>
                            <div className="text-zinc-500 mt-0.5">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4" >
                        <div className="flex items-center gap-1.5 text-zinc-700" >
                          {member.role === 'admin' ? (
                            <ShieldAlert className="w-4 h-4 text-red-500" />
                          ) : member.role === 'manager' ? (
                            <Shield className="w-4 h-4 text-indigo-500" />
                          ) : null}
                          <span className="font-medium capitalize" > {member.role}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4" >
                        <span className={cn(
                          "px-2.5 py-1 text-xs font-medium rounded-full border",
                          member.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-zinc-100 text-zinc-600 border-zinc-200"
                        )} >
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-500" >
                        {member.lastActive}
                      </td>
                      <td className="px-6 py-4 text-right" >
                        <button className="p-2 text-zinc-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors" >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        <PendingInvitations />

        <InviteMemberModal isOpen={isInviteModalOpen} onClose={() => setInviteModalOpen(false)} />
      </div>
    </AppLayout>
  );
}
