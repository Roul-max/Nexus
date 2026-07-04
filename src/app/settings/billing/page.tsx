import Link from 'next/link';

export default function SettingsBillingPage() {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-200">
        <h2 className="font-bold text-zinc-900">Billing settings</h2>
        <p className="text-sm text-zinc-500 mt-1">Manage subscription and invoice settings for your organization.</p>
      </div>
      <div className="p-6">
        <Link href="/billing" className="inline-flex px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">Open billing</Link>
      </div>
    </div>
  );
}
