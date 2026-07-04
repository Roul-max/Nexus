import Link from 'next/link';
import { ArrowRight, Box } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      <header className="px-6 py-4 flex items-center justify-between border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">N</span>
          </div>
          <span className="text-xl font-bold tracking-tight">Nexus</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
            Log in
          </Link>
          <Link href="/dashboard" className="text-sm font-medium px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors">
            Go to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-24 sm:py-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-50 border border-zinc-200 text-sm font-medium text-zinc-600 mb-8">
          <Box className="w-4 h-4" />
          <span>Nexus v2.0 is now live</span>
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter text-zinc-900 mb-8 max-w-4xl">
          The operating system for modern business.
        </h1>
        
        <p className="text-lg sm:text-xl text-zinc-500 mb-10 max-w-2xl leading-relaxed">
          Manage CRM, Projects, Teams, and Billing in a single, beautiful platform. Powered by AI to accelerate your workflow.
        </p>

        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-full font-medium hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95"
          >
            Enter Platform
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button className="px-6 py-3 bg-white border border-zinc-200 text-zinc-900 rounded-full font-medium hover:bg-zinc-50 transition-colors">
            Book Demo
          </button>
        </div>
      </main>
    </div>
  );
}
