'use client';

import { XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Spinner } from '@/components/ui';
import { api } from '@/lib/api';

const Failure = () => {
  const ref = useSearchParams().get('ref');
  const [result, setResult] = useState<string | null>(ref ? null : 'none');

  useEffect(() => {
    if (!ref) return;
    api<{ result: string }>('/payments/esewa/cancel', { method: 'POST', body: { ref }, skipRefresh: true })
      .then((data) => setResult(data.result))
      .catch(() => setResult('unknown'));
  }, [ref]);

  if (!result) return <Spinner label="Checking your payment" />;

  // The customer paid after all: never tell them it failed.
  if (result === 'paid') {
    return (
      <>
        <h1 className="font-display text-3xl font-semibold">Your payment went through</h1>
        <p className="mt-3 text-muted">Your order is confirmed.</p>
        <Link href="/orders" className="mt-6 inline-block font-semibold text-bronze underline">
          View my orders
        </Link>
      </>
    );
  }

  return (
    <>
      <XCircle size={56} aria-hidden className="mx-auto text-danger" />
      <h1 className="mt-4 font-display text-3xl font-semibold">Payment not completed</h1>
      <p className="mt-3 text-muted">
        {result === 'unknown'
          ? 'We could not check this payment yet. If money left your account, your order will be confirmed automatically.'
          : 'You have not been charged. Your items are still in your cart.'}
      </p>
      <Link href="/cart" className="mt-8 inline-flex min-h-11 items-center rounded-lg bg-gold px-6 font-semibold hover:bg-gold-strong">
        Back to cart
      </Link>
    </>
  );
};

export default function PaymentFailurePage() {
  return (
    <main className="mx-auto max-w-md px-4 py-20 text-center">
      <Suspense fallback={<Spinner />}>
        <Failure />
      </Suspense>
    </main>
  );
}
