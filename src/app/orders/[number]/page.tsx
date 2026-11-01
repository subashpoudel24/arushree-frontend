'use client';

import { Download } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { OrderTimeline } from '@/components/OrderTimeline';
import { Alert, Button, Spinner } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { ApiRequestError, api, errorMessage } from '@/lib/api';
import { Order, formatDate, money, paymentLabel, statusLabel } from '@/lib/orders';

const label = (value: string) => value.replace(/\b\w/g, (c) => c.toUpperCase());

export default function OrderDetailPage() {
  const { number } = useParams<{ number: string }>();
  const { status: authStatus } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (authStatus === 'loading') return;
    setError('');
    setNotFound(false);
    api<{ order: Order }>(`/orders/${encodeURIComponent(number)}`, { guestOk: true })
      .then((data) => setOrder(data.order))
      .catch((err) => {
        if (err instanceof ApiRequestError && (err.status === 404 || err.status === 400)) setNotFound(true);
        else setError(errorMessage(err));
      });
  }, [number, authStatus]);

  const downloadInvoice = async () => {
    setDownloading(true);
    setError('');
    try {
      // Renews an expired session first; a plain link would get a raw error instead.
      await api(`/orders/${encodeURIComponent(number)}`, { guestOk: true });
      window.location.href = `/api/v1/orders/${encodeURIComponent(number)}/invoice`;
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  if (notFound) {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">Order not found</h1>
        <p className="mt-3 text-muted">Sign in to the account that placed it, or track it with your phone number.</p>
        <Link href="/track-order" className="mt-6 inline-block font-semibold text-bronze underline">
          Track an order
        </Link>
      </main>
    );
  }
  if (error && !order) {
    return (
      <main className="mx-auto max-w-md px-4 py-24">
        <Alert>{error}</Alert>
      </main>
    );
  }
  if (!order) return <Spinner label="Loading your order" />;

  const a = order.address;
  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:py-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Order {order.orderNumber}</h1>
          <p className="mt-1 text-sm text-muted">Placed {formatDate(order.createdAt)}</p>
        </div>
        <Button variant="outline" onClick={downloadInvoice} loading={downloading} className="gap-2">
          <Download size={16} aria-hidden /> Invoice
        </Button>
      </div>
      {error && <Alert>{error}</Alert>}

      <div className="grid gap-6 md:grid-cols-[1fr_280px]">
        <section aria-labelledby="items-heading" className="rounded-2xl border border-line bg-white p-5">
          <h2 id="items-heading" className="font-display text-xl font-semibold">
            Items
          </h2>
          <ul className="mt-3 divide-y divide-line">
            {order.items.map((item) => (
              <li key={item.name} className="flex gap-3 py-3">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-sand">
                  {item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="64px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-muted">
                    {money(item.unitPrice ?? 0)} × {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold">{money(item.lineTotal ?? 0)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-2 border-t border-line pt-3 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{money(order.subtotal)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-success">
                <dt>Discount{order.couponCode ? ` (${order.couponCode})` : ''}</dt>
                <dd>-{money(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>Delivery</dt>
              <dd>{money(order.deliveryCharge)}</dd>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <dt>Total</dt>
              <dd>{money(order.total)}</dd>
            </div>
          </dl>
        </section>

        <div className="space-y-6">
          <section aria-labelledby="status-heading" className="rounded-2xl border border-line bg-white p-5">
            <h2 id="status-heading" className="font-display text-xl font-semibold">
              {statusLabel(order.status)}
            </h2>
            <p className="mb-4 mt-1 text-sm text-muted">
              {order.paymentMethod === 'cod' ? 'Cash on delivery' : 'eSewa'} · {paymentLabel(order.paymentStatus)}
            </p>
            <OrderTimeline history={order.statusHistory} />
          </section>
          <section aria-labelledby="address-heading" className="rounded-2xl border border-line bg-white p-5 text-sm">
            <h2 id="address-heading" className="font-display text-xl font-semibold">
              Delivery address
            </h2>
            <p className="mt-2">
              {a.firstName} {a.lastName}
              <br />
              {a.phone}
              <br />
              {[a.street, a.landmark, label(a.city), label(a.district), label(a.province)].filter(Boolean).join(', ')}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
