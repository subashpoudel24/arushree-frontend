import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { RequireUser } from '@/components/RequireUser';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireUser staff>
      <AdminShell>{children}</AdminShell>
    </RequireUser>
  );
}
