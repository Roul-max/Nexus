'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Briefcase, 
  CheckSquare, 
  PieChart, 
  MessageSquare,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  CreditCard,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from "framer-motion";
import { ProtectedRoute } from './ProtectedRoute';
import { auth } from '@/lib/firebase/client';
import { signOut } from 'firebase/auth';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'CRM', href: '/crm', icon: Briefcase },
  { name: 'Projects', href: '/projects', icon: CheckSquare },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: PieChart },
  { name: 'AI Assistant', href: '/ai', icon: MessageSquare },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setSignOutError(null);
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      console.error('Sign out failed:', error);
      setSignOutError('Unable to sign out. Please try again.');
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans">
        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-zinc-900/80 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.div
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-white border-r border-zinc-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between h-16 px-6 border-b border-zinc-200 flex-shrink-0">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900">Nexus</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-zinc-500 hover:text-zinc-900">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4 px-2">
              Main Menu
            </div>
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-zinc-100 text-zinc-900" 
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-zinc-900" : "text-zinc-400")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-zinc-200 flex-shrink-0">
            {signOutError && <p className="px-3 pb-2 text-xs text-red-600">{signOutError}</p>}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-3 py-2 text-zinc-600 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </motion.div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Topbar */}
          <header className="flex-shrink-0 h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 lg:hidden">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-zinc-500 hover:text-zinc-900"
              >
                <Menu className="w-6 h-6" />
              </button>
              <span className="text-lg font-bold">Nexus</span>
            </div>

            <div className="flex-1 flex justify-end items-center gap-4">
              <div className="relative hidden sm:block w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                />
              </div>
              <button className="relative p-2 text-zinc-400 hover:text-zinc-900 transition-colors rounded-full hover:bg-zinc-100">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="w-8 h-8 rounded-full bg-zinc-200 border border-zinc-300 overflow-hidden">
                <img src="https://picsum.photos/seed/avatar/100/100" alt="User Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-zinc-50 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
