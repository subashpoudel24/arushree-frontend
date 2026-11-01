'use client';

import { FormEvent, useState } from 'react';
import { OrderTimeline } from '@/components/OrderTimeline';
import { Alert, AuthCard, Button, Field } from '@/components/ui';
import { api, errorMessage } from '@/lib/api';
import { Order, money, paymentLabel, statusLabel } from '@/lib/orders';

type Tracked = Pick<Order, 'orderNumber' | 'status' | 'paymentStatus' | 'total' | 'items' | 'statusHistory'>;

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Tracked | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    setLoading(true);
    try {
      const data = await api<{ order: Tracked }>('/orders/track', {
        method: 'POST',
        body: { orderNumber, phone },
        skipRefresh: true,
      });
      setOrder(data.order);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Track your order" subtitle="Enter the order number and the phone number used for delivery.">
      <form onSubmit={submit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <Field label="Order number" required placeholder="AL-2026-XXXXXXXX" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
        <Field label="Phone" type="tel" autoComplete="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Button type="submit" loading={loading} className="w-full">
          Track order
        </Button>
      </form>
      {order && (
        <section aria-live="polite" className="mt-6 space-y-3 border-t border-line pt-5">
          <h2 className="font-display text-xl font-semibold">{statusLabel(order.status)}</h2>
          <p className="text-sm text-muted">
            {order.orderNumber} · {money(order.total)} · {paymentLabel(order.paymentStatus)}
          </p>
          <ul className="text-sm">
            {order.items.map((item) => (
              <li key={item.name}>
                {item.name} × {item.quantity}
              </li>
            ))}
          </ul>
          <OrderTimeline history={order.statusHistory} />
        </section>
      )}
    </AuthCard>
  );
}
