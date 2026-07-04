import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-zinc-500">Page not found</p>
      <Link href="/" className="mt-4 px-4 py-2 bg-zinc-900 text-white rounded-lg">
        Go Home
      </Link>
    </div>
  );
}
