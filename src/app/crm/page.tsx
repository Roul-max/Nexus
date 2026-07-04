'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { Search, Plus, Filter, MoreHorizontal, Mail, Phone, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';

const statusColors = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  contacted: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  qualified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  lost: 'bg-red-50 text-red-700 border-red-200',
  converted: 'bg-purple-50 text-purple-700 border-purple-200',
};

export default function CRMPage() {
  const { currentOrg, user } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      if (!currentOrg || !user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/v1/leads', { headers: {
          Authorization: `Bearer ${token}`,
          'x-organization-id': currentOrg.id,
        }});
        if (res.ok) {
          const json = await res.json();
          setLeads(json.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch leads', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, [currentOrg, user]);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Leads</h1>
            <p className="text-sm text-zinc-500 mt-1">Manage your incoming leads and sales pipeline.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
              <Plus className="w-4 h-4" />
              Add Lead
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search leads by name, company, or email..." 
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Lead Name</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Lead Score</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                      Loading leads...
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-zinc-500">
                        <Building className="w-8 h-8 mb-3 text-zinc-300" />
                        <p className="text-sm font-medium text-zinc-900">No leads found</p>
                        <p className="text-sm mt-1">Get started by adding your first lead.</p>
                        <button className="mt-4 flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors">
                          <Plus className="w-4 h-4" />
                          Add Lead
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-zinc-900">{lead.firstName} {lead.lastName}</div>
                        {lead.company && (
                          <div className="flex items-center gap-1 text-zinc-500 mt-1">
                            <Building className="w-3 h-3" />
                            {lead.company}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {lead.email && (
                            <div className="flex items-center gap-2 text-zinc-600">
                              <Mail className="w-3 h-3" />
                              {lead.email}
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center gap-2 text-zinc-600">
                              <Phone className="w-3 h-3" />
                              {lead.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1 text-xs font-medium rounded-full border capitalize",
                          statusColors[lead.status as keyof typeof statusColors] || 'bg-zinc-50 text-zinc-700 border-zinc-200'
                        )}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden max-w-[100px]">
                            <div 
                              className={cn(
                                "h-full rounded-full",
                                lead.score > 80 ? "bg-emerald-500" : lead.score > 50 ? "bg-yellow-500" : "bg-red-500"
                              )} 
                              style={{ width: `${Math.min(100, Math.max(0, lead.score))}%` }} 
                            />
                          </div>
                          <span className="text-zinc-600 font-medium">{lead.score || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-zinc-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {leads.length > 0 && (
            <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 text-sm text-zinc-500 flex justify-between items-center">
              <span>Showing {leads.length} leads</span>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-white border border-zinc-200 rounded text-zinc-600 hover:bg-zinc-50 disabled:opacity-50" disabled>Previous</button>
                <button className="px-3 py-1 bg-white border border-zinc-200 rounded text-zinc-600 hover:bg-zinc-50 disabled:opacity-50" disabled>Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
