'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ReactNode, SelectHTMLAttributes, useCallback, useEffect, useId, useState } from 'react';
import { Alert, Button, Spinner } from '@/components/ui';
import { api, errorMessage } from '@/lib/api';

export const PageHeader = ({ title, children }: { title: string; children?: ReactNode }) => (
  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
    <h1 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h1>
    {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
  </div>
);

export const Panel = ({ title, children }: { title?: string; children: ReactNode }) => (
  <section className="rounded-2xl border border-line bg-white p-5">
    {title && <h2 className="mb-4 font-display text-lg font-semibold">{title}</h2>}
    {children}
  </section>
);

export const Select = ({ label, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) => {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <select id={id} {...props} className="min-h-11 w-full rounded-lg border border-line bg-white px-3 text-base focus:border-bronze focus:outline-none sm:text-sm">
        {children}
      </select>
    </div>
  );
};

export const Checkbox = ({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
  <label className="flex min-h-11 items-center gap-2 text-sm">
    <input type="checkbox" {...props} className="size-4 accent-bronze" />
    {label}
  </label>
);

// Scrolls sideways on phones instead of breaking the page width.
export const Table = ({ head, children, empty }: { head: string[]; children: ReactNode; empty?: boolean }) => (
  <div className="overflow-x-auto rounded-2xl border border-line bg-white">
    <table className="w-full min-w-[640px] text-left text-sm">
      <thead className="border-b border-line bg-sand/50 text-xs uppercase tracking-wide text-muted">
        <tr>
          {head.map((heading, index) => (
            <th key={heading || index} scope="col" className="px-4 py-3 font-semibold">
              {heading}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-line">{children}</tbody>
    </table>
    {empty && <p className="p-8 text-center text-sm text-muted">Nothing here yet.</p>}
  </div>
);

export const Td = ({ children, className = '' }: { children?: ReactNode; className?: string }) => (
  <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>
);

const BADGES: Record<string, string> = {
  good: 'bg-green-50 text-success',
  bad: 'bg-red-50 text-danger',
  warn: 'bg-amber-50 text-amber-800',
  plain: 'bg-sand text-ink',
};

export const Badge = ({ tone = 'plain', children }: { tone?: 'good' | 'bad' | 'warn' | 'plain'; children: ReactNode }) => (
  <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${BADGES[tone]}`}>{children}</span>
);

export const ActionLink = ({ onClick, children, danger, disabled }: { onClick: () => void; children: ReactNode; danger?: boolean; disabled?: boolean }) => (
  <button type="button" disabled={disabled} onClick={onClick} className={`min-h-11 px-2 text-sm font-semibold underline disabled:opacity-50 ${danger ? 'text-danger' : 'text-bronze'}`}>
    {children}
  </button>
);

export const Pagination = ({ page, pages, onPage }: { page: number; pages: number; onPage: (page: number) => void }) =>
  pages > 1 ? (
    <nav aria-label="Pages" className="mt-4 flex items-center justify-end gap-3">
      <Button variant="outline" aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        <ChevronLeft size={16} aria-hidden />
      </Button>
      <span className="text-sm text-muted">
        Page {page} of {pages}
      </span>
      <Button variant="outline" aria-label="Next page" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        <ChevronRight size={16} aria-hidden />
      </Button>
    </nav>
  ) : null;

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

// Loads one page of a list; changing `query` goes back to the first page.
export const useList = <T,>(path: string, query = '', limit = 20) => {
  const [data, setData] = useState<Paged<T> | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => setPage(1), [query]);

  const reload = useCallback(async () => {
    setError('');
    try {
      setData(await api<Paged<T>>(`${path}?page=${page}&limit=${limit}${query ? `&${query}` : ''}`));
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [path, page, query, limit]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, page, setPage, error, reload };
};

export const Loading = ({ error, ready, children }: { error?: string; ready: boolean; children: ReactNode }) =>
  error && !ready ? <Alert>{error}</Alert> : !ready ? <Spinner /> : <>{children}</>;

// Downloads need a live session cookie, so renew it first.
export const downloadFile = async (path: string) => {
  await api('/admin/session');
  window.location.href = `/api/v1${path}`;
};

// Runs an action and reports its failure, for the many small buttons in the panel.
export const useAction = () => {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const run = useCallback(async (action: () => Promise<unknown>, success?: string) => {
    setBusy(true);
    setNotice(null);
    try {
      await action();
      if (success) setNotice({ type: 'success', text: success });
      return true;
    } catch (err) {
      setNotice({ type: 'error', text: errorMessage(err) });
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  return { busy, notice, run, setNotice };
};

export const Notice = ({ notice }: { notice: { type: 'error' | 'success'; text: string } | null }) =>
  notice ? (
    <div className="mb-4">
      <Alert type={notice.type}>{notice.text}</Alert>
    </div>
  ) : null;

export const money = (value: number) => `Rs. ${value.toLocaleString('en-IN')}`;
export const dateText = (value: string) => new Date(value).toLocaleDateString('en-GB', { dateStyle: 'medium' });
export const dateTimeText = (value: string) => new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
export const titleCase = (value: string) => value.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
export const toDateInput = (value?: string | Date | null) => (value ? new Date(value).toISOString().slice(0, 10) : '');

export const orderStatusTone = (status: string) =>
  status === 'canceled' ? 'bad' : status === 'delivered' ? 'good' : status === 'pending_payment' ? 'warn' : 'plain';
export const paymentTone = (status: string) => (status === 'paid' ? 'good' : status === 'refunded' ? 'warn' : 'plain');
