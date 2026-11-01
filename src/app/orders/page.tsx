'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { RequireUser } from '@/components/RequireUser';
import { Alert, Button, Spinner } from '@/components/ui';
import { api, errorMessage } from '@/lib/api';
import { Order, formatDate, money, statusLabel } from '@/lib/orders';

interface OrderPage {
  items: Order[];
  page: number;
  pages: number;
}

const Orders = () => {
  const [data, setData] = useState<OrderPage | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    api<OrderPage>(`/orders?page=${page}&limit=10`)
      .then(setData)
      .catch((err) => setError(errorMessage(err)));
  }, [page]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
      <h1 className="mb-6 font-display text-3xl font-semibold">My orders</h1>
      {error ? (
        <Alert>{error}</Alert>
      ) : !data ? (
        <Spinner />
      ) : data.items.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-10 text-center">
          <p className="font-semibold">No orders yet</p>
          <Link href="/shop" className="mt-2 inline-block text-sm font-semibold text-bronze underline">
            Browse products
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {data.items.map((order) => (
            <li key={order.orderNumber}>
              <Link href={`/orders/${order.orderNumber}`} className="block rounded-2xl border border-line bg-white p-5 hover:bg-sand">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">{order.orderNumber}</span>
                  <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold">{statusLabel(order.status)}</span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {formatDate(order.createdAt)} · {order.items.length} {order.items.length === 1 ? 'item' : 'items'} · {money(order.total)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {data && data.pages > 1 && (
        <div className="mt-6 flex items-center gap-3">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted">
            Page {data.page} of {data.pages}
          </span>
          <Button variant="outline" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </main>
  );
};

export default function OrdersPage() {
  return (
    <RequireUser>
      <Orders />
    </RequireUser>
  );
}
