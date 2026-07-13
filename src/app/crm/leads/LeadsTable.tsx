'use client';

import { format } from 'date-fns';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  company: string | null;
  status: string;
  createdAt: string;
  assignedTo: {
    id: string;
    name: string | null;
  } | null;
}

interface LeadsResponse {
  data: Lead[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface LeadsTableProps {
  data: LeadsResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  page: number;
  setPage: (page: number) => void;
}

export function LeadsTable({ data, isLoading, isError, page, setPage }: LeadsTableProps) {
  const leads = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Assigned To</th>
              <th className="px-6 py-4">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-12 text-zinc-500">Loading leads...</td></tr>
            ) : isError ? (
              <tr><td colSpan={5} className="text-center py-12 text-red-500">Failed to load leads.</td></tr>
            ) : leads.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-zinc-500">No leads found.</td></tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-900">{lead.firstName} {lead.lastName}</div>
                    <div className="text-zinc-500 mt-0.5">{lead.email}</div>
                  </td>
                  <td className="px-6 py-4 text-zinc-700">{lead.company || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full border bg-blue-50 text-blue-700 border-blue-200 capitalize">
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-700">{lead.assignedTo?.name || 'Unassigned'}</td>
                  <td className="px-6 py-4 text-zinc-500">{format(new Date(lead.createdAt), 'MMM d, yyyy')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {meta && meta.totalPages > 1 && (
        <div className="p-4 border-t border-zinc-200 flex items-center justify-between">
          <span className="text-sm text-zinc-600">
            Page {meta.page} of {meta.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 border border-zinc-300 bg-white text-sm font-medium rounded-md hover:bg-zinc-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === meta.totalPages}
              className="px-3 py-1.5 border border-zinc-300 bg-white text-sm font-medium rounded-md hover:bg-zinc-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


