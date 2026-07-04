import { User, Building, Bell, Lock, Palette, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200">
          <h2 className="font-bold text-zinc-900">Public Profile</h2>
          <p className="text-sm text-zinc-500 mt-1">This information will be displayed publicly so be careful what you share.</p>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700">Photo</label>
            <div className="mt-2 flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden">
                <img src="https://picsum.photos/seed/avatar/100/100" alt="Avatar" />
              </div>
              <button className="px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors">
                Change
              </button>
              <button className="text-sm font-medium text-zinc-500 hover:text-red-600 transition-colors">
                Remove
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="first-name" className="block text-sm font-medium text-zinc-700">First name</label>
              <input type="text" id="first-name" defaultValue="Alex" className="mt-1 w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent sm:text-sm" />
            </div>
            <div>
              <label htmlFor="last-name" className="block text-sm font-medium text-zinc-700">Last name</label>
              <input type="text" id="last-name" defaultValue="Rivera" className="mt-1 w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent sm:text-sm" />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700">Email address</label>
            <input type="email" id="email" defaultValue="alex@nexus.inc" className="mt-1 w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent sm:text-sm text-zinc-500 cursor-not-allowed" disabled />
          </div>
        </div>
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex justify-end">
          <button className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
