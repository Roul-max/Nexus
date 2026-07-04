'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-zinc-900 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="flex items-center gap-2 mb-8 justify-center text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
        
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">N</span>
          </div>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-zinc-600">
          Or{' '}
          <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
