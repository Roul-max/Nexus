'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const navigation = [
  { name: 'Leads', href: '/crm/leads' },
  { name: 'Contacts', href: '/crm/contacts' },
  { name: 'Companies', href: '/crm/companies' },
  { name: 'Opportunities', href: '/crm/opportunities' },
];

export function CrmNav() {
  const pathname = usePathname();

  return (
    <div className="mt-4">
      <div className="sm:hidden">
        {/* Mobile menu, if needed */}
      </div>
      <div className="hidden sm:block">
        <nav className="flex space-x-4" aria-label="Tabs">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                pathname.startsWith(item.href) ? 'bg-zinc-100 text-zinc-700' : 'text-zinc-500 hover:text-zinc-700',
                'rounded-md px-3 py-2 text-sm font-medium'
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}