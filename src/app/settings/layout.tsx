import { AppLayout } from '@/components/layout/AppLayout';
import Link from 'next/link';

const settingsNavigation = [
  { name: 'General', href: '/settings' },
  { name: 'Users', href: '/settings/users' },
  { name: 'Billing', href: '/settings/billing' },
  { name: 'API Keys', href: '/settings/api-keys' },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Settings</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your organization preferences.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-64 flex-shrink-0">
            <nav className="flex flex-col space-y-1">
              {settingsNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-3 py-2 text-sm font-medium rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </aside>
          
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </AppLayout>
  );
}
