'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const email = String(new FormData(event.currentTarget).get('email') ?? '').trim();
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('If an account exists for that email, a reset link has been sent.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-6"><div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center shadow-lg"><span className="text-white font-bold text-2xl">N</span></div></div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Reset your password</h1>
        <p className="mt-2 text-sm text-zinc-600">Remembered it? <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Return to sign in</Link></p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <form onSubmit={handleSubmit} className="bg-white py-8 px-4 shadow-xl shadow-zinc-200/50 sm:rounded-2xl sm:px-10 border border-zinc-100 space-y-6">
          {message && <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}
          {error && <div className="rounded-lg bg-red-100 p-4 text-sm text-red-700">{error}</div>}
          <div><label htmlFor="email" className="block text-sm font-medium text-zinc-700">Email address</label><input id="email" name="email" type="email" autoComplete="email" required className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-zinc-900 sm:text-sm" /></div>
          <button type="submit" disabled={loading} className="flex w-full justify-center rounded-lg bg-zinc-900 py-2.5 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50">{loading ? 'Sending...' : 'Send reset link'}</button>
        </form>
      </div>
    </div>
  );
}
