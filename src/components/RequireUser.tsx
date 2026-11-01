'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { Button, Spinner } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

// Page-level UX only. The API enforces access on every request.
export const RequireUser = ({ staff, children }: { staff?: boolean; children: ReactNode }) => {
  const { user, status, isStaff, reload } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'ready' && !user) {
      router.replace(`/signin?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, user, router, pathname]);

  if (status === 'error') {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold">Cannot reach the server</h1>
        <p className="mb-6 mt-3 text-muted">Please check your connection and try again.</p>
        <Button onClick={() => void reload()}>Try again</Button>
      </main>
    );
  }
  if (status === 'loading' || !user) return <Spinner />;
  if (staff && !isStaff) {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-muted">This area is for store staff only.</p>
      </main>
    );
  }
  return <>{children}</>;
};
