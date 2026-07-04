'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';

type ApiKeyRecord = {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
};

export default function SettingsApiKeysPage() {
  const { user, currentOrg } = useAuth();
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const authenticatedHeaders = useCallback(async () => {
    if (!user || !currentOrg) throw new Error('Organization context is unavailable');
    return {
      Authorization: `Bearer ${await user.getIdToken()}`,
      'x-organization-id': currentOrg.id,
    };
  }, [user, currentOrg]);

  const loadKeys = useCallback(async () => {
    if (!user || !currentOrg) return;
    try {
      const response = await fetch('/api/v1/api-keys', { headers: await authenticatedHeaders() });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? 'Unable to load API keys');
      setKeys(body.keys ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load API keys');
    }
  }, [authenticatedHeaders, currentOrg, user]);

  useEffect(() => { void loadKeys(); }, [loadKeys]);

  const createKey = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setCreatedKey(null);
    const name = String(new FormData(event.currentTarget).get('name') ?? '').trim();
    try {
      const response = await fetch('/api/v1/api-keys', {
        method: 'POST',
        headers: { ...(await authenticatedHeaders()), 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? 'Unable to create API key');
      setCreatedKey(body.key);
      event.currentTarget.reset();
      await loadKeys();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to create API key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200"><h2 className="font-bold text-zinc-900">API keys</h2><p className="text-sm text-zinc-500 mt-1">Create keys for organization integrations.</p></div>
        <form onSubmit={createKey} className="p-6 flex gap-3">
          <input name="name" required maxLength={255} placeholder="Key name" className="flex-1 px-3 py-2 bg-white border border-zinc-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 sm:text-sm" />
          <button disabled={loading} className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 disabled:opacity-50">{loading ? 'Creating...' : 'Create key'}</button>
        </form>
        {error && <p className="px-6 pb-4 text-sm text-red-600">{error}</p>}
        {createdKey && <div className="mx-6 mb-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700"><p className="font-medium">Copy this key now. It will not be shown again.</p><code className="mt-2 block break-all">{createdKey}</code></div>}
      </div>
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-zinc-200">{keys.length ? keys.map((key) => <div key={key.id} className="flex items-center justify-between p-4"><div><p className="font-medium text-zinc-900">{key.name}</p><p className="text-xs text-zinc-500">Created {new Date(key.createdAt).toLocaleDateString()}</p></div><span className="text-xs text-zinc-500">{key.lastUsedAt ? `Last used ${new Date(key.lastUsedAt).toLocaleDateString()}` : 'Never used'}</span></div>) : <p className="p-6 text-sm text-zinc-500">No API keys created.</p>}</div>
      </div>
    </div>
  );
}
