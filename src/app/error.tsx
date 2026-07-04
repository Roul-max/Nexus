'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()} className="mt-4 px-4 py-2 bg-zinc-900 text-white rounded">
        Try again
      </button>
      <Link href="/" className="mt-4 text-blue-500 hover:underline">
        Go Home
      </Link>
    </div>
  );
}
