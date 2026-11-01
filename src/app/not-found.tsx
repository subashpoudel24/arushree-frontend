import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-semibold">Page not found</h1>
      <p className="mt-3 text-muted">This page does not exist or has moved.</p>
      <Link href="/" className="mt-6 inline-block font-semibold text-bronze underline">
        Go to home
      </Link>
    </main>
  );
}
