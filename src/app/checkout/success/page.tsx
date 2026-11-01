'use client';

import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface PlacedOrder {
  orderNumber: string;
  total: number;
}

export default function CheckoutSuccessPage() {
  const [order, setOrder] = useState<PlacedOrder | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('last_order');
      if (stored) setOrder(JSON.parse(stored));
    } catch {
      // The page still works without the order number.
    }
  }, []);

  return (
    <main className="mx-auto max-w-md px-4 py-20 text-center">
      <CheckCircle2 size={56} aria-hidden className="mx-auto text-success" />
      <h1 className="mt-4 font-display text-3xl font-semibold">Thank you for your order</h1>
      {order && (
        <p className="mt-3 text-muted">
          Order <strong className="text-ink">{order.orderNumber}</strong> is confirmed. Please pay Rs.{' '}
          {order.total.toLocaleString('en-IN')} in cash on delivery.
        </p>
      )}
      <div className="mt-8 flex flex-col items-center gap-3">
        {order && (
          <Link href={`/orders/${order.orderNumber}`} className="inline-flex min-h-11 items-center rounded-lg bg-gold px-6 font-semibold hover:bg-gold-strong">
            View order
          </Link>
        )}
        <Link href="/shop" className="font-semibold text-bronze underline">
          Continue shopping
        </Link>
      </div>
    </main>
  );
}
