'use client';

import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Button, Spinner } from '@/components/ui';
import { useCart } from '@/contexts/CartContext';
import { api, errorMessage } from '@/lib/api';

type Result =
  | { kind: 'paid' | 'pending' | 'paid_after_cancel'; orderNumber: string }
  | { kind: 'error'; message: string };

const Verify = () => {
  const data = useSearchParams().get('data');
  const { reload } = useCart();
  const [result, setResult] = useState<Result | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!data) {
      setResult({ kind: 'error', message: 'This page needs a payment response from eSewa.' });
      return;
    }
    let current = true;
    setResult(null);
    api<{ result: 'paid' | 'pending' | 'paid_after_cancel'; order: { orderNumber: string } }>('/payments/esewa/verify', {
      method: 'POST',
      body: { data },
      skipRefresh: true,
    })
      .then((res) => {
        if (!current) return;
        setResult({ kind: res.result, orderNumber: res.order.orderNumber });
        void reload();
      })
      .catch((err) => current && setResult({ kind: 'error', message: errorMessage(err) }));
    return () => {
      current = false;
    };
  }, [data, attempt, reload]);

  if (!result) return <Spinner label="Confirming your payment" />;

  if (result.kind === 'error') {
    return (
      <>
        <AlertCircle size={56} aria-hidden className="mx-auto text-danger" />
        <h1 className="mt-4 font-display text-3xl font-semibold">We could not confirm this payment</h1>
        <p className="mt-3 text-muted">{result.message} If money left your account, please contact us.</p>
        <Button className="mt-6" onClick={() => setAttempt(attempt + 1)}>
          Check again
        </Button>
      </>
    );
  }
  if (result.kind === 'pending') {
    return (
      <>
        <Clock size={56} aria-hidden className="mx-auto text-bronze" />
        <h1 className="mt-4 font-display text-3xl font-semibold">Your payment is still processing</h1>
        <p className="mt-3 text-muted">
          Order <strong className="text-ink">{result.orderNumber}</strong> will be confirmed as soon as eSewa completes it.
        </p>
        <Button className="mt-6" onClick={() => setAttempt(attempt + 1)}>
          Check again
        </Button>
      </>
    );
  }
  if (result.kind === 'paid_after_cancel') {
    return (
      <>
        <AlertCircle size={56} aria-hidden className="mx-auto text-danger" />
        <h1 className="mt-4 font-display text-3xl font-semibold">Payment received after the order expired</h1>
        <p className="mt-3 text-muted">
          Order <strong className="text-ink">{result.orderNumber}</strong> had already been canceled. Please contact us with this number
          and we will sort out your refund or re-order.
        </p>
      </>
    );
  }
  return (
    <>
      <CheckCircle2 size={56} aria-hidden className="mx-auto text-success" />
      <h1 className="mt-4 font-display text-3xl font-semibold">Payment successful</h1>
      <p className="mt-3 text-muted">
        Thank you. Order <strong className="text-ink">{result.orderNumber}</strong> is confirmed.
      </p>
      <Link href={`/orders/${result.orderNumber}`} className="mt-8 inline-flex min-h-11 items-center rounded-lg bg-gold px-6 font-semibold hover:bg-gold-strong">
        View order
      </Link>
    </>
  );
};

export default function PaymentSuccessPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-20 text-center">
      <Suspense fallback={<Spinner />}>
        <Verify />
      </Suspense>
    </main>
  );
}
