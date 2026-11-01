'use client';

import { Button } from '@/components/ui';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-semibold">Something went wrong</h1>
      <p className="mb-6 mt-3 text-muted">Please try again.</p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
