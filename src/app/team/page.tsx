import { AppLayout } from '@/components/layout/AppLayout';
import { Plus, MoreHorizontal, Mail, Shield, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

const teamMembers = [
  { id: 1, name: 'Alex Rivera', email: 'alex@nexus.inc', role: 'Super Admin', status: 'Active', lastActive: '2 mins ago' },
  { id: 2, name: 'Sarah Jenkins', email: 'sarah@nexus.inc', role: 'Manager', status: 'Active', lastActive: '1 hour ago' },
  { id: 3, name: 'Michael Chen', email: 'michael@nexus.inc', role: 'Employee', status: 'Offline', lastActive: '2 days ago' },
  { id: 4, name: 'Emma Davis', email: 'emma@nexus.inc', role: 'Employee', status: 'Active', lastActive: '5 mins ago' },
];

export default function TeamPage() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Team Management</h1>
            <p className="text-sm text-zinc-500 mt-1">Manage user access, roles, and permissions.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
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
                {teamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-200 border border-zinc-300 overflow-hidden">
                          <img src={`https://picsum.photos/seed/${member.id + 10}/100/100`} alt={member.name} />
                        </div>
                        <div>
                          <div className="font-medium text-zinc-900">{member.name}</div>
                          <div className="text-zinc-500 mt-0.5">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-zinc-700">
                        {member.role === 'Super Admin' ? (
                          <ShieldAlert className="w-4 h-4 text-red-500" />
                        ) : member.role === 'Manager' ? (
                          <Shield className="w-4 h-4 text-indigo-500" />
                        ) : null}
                        <span className="font-medium">{member.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 text-xs font-medium rounded-full border",
                        member.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-zinc-100 text-zinc-600 border-zinc-200"
                      )}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      {member.lastActive}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-zinc-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
