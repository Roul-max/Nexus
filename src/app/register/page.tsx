'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmation: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmation, {
  message: "Passwords don't match",
  path: ["confirmation"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const credential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      if (data.name) await updateProfile(credential.user, { displayName: data.name });

      // Sync user with our backend database
      const token = await credential.user.getIdToken();
      const syncResponse = await fetch('/api/v1/auth/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      router.replace('/dashboard');
      if (!syncResponse.ok) {
        // Log error but don't block user flow
        console.error('Failed to sync user on registration', await syncResponse.text());
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-6"><div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center shadow-lg"><span className="text-white font-bold text-2xl">N</span></div></div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Create your account</h1>
        <p className="mt-2 text-sm text-zinc-600">Already registered? <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Sign in</Link></p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white py-8 px-4 shadow-xl shadow-zinc-200/50 sm:rounded-2xl sm:px-10 border border-zinc-100 space-y-6" noValidate>
          {error && <div className="rounded-lg bg-red-100 p-4 text-sm text-red-700">{error}</div>}
          <div><label htmlFor="name" className="block text-sm font-medium text-zinc-700">Name</label><input id="name" {...register('name')} className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-zinc-900 sm:text-sm" />{errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}</div>
          <div><label htmlFor="email" className="block text-sm font-medium text-zinc-700">Email address</label><input id="email" type="email" autoComplete="email" {...register('email')} className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-zinc-900 sm:text-sm" />{errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}</div>
          <div><label htmlFor="password" className="block text-sm font-medium text-zinc-700">Password</label><input id="password" type="password" autoComplete="new-password" {...register('password')} className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-zinc-900 sm:text-sm" />{errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}</div>
          <div><label htmlFor="confirmation" className="block text-sm font-medium text-zinc-700">Confirm password</label><input id="confirmation" type="password" autoComplete="new-password" {...register('confirmation')} className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-zinc-900 sm:text-sm" />{errors.confirmation && <p className="mt-2 text-sm text-red-600">{errors.confirmation.message}</p>}</div>
          <button type="submit" disabled={loading} className="flex w-full justify-center rounded-lg bg-zinc-900 py-2.5 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50">{loading ? 'Creating account...' : 'Create account'}</button>
        </form>
      </div>
    </div>
  );
}
