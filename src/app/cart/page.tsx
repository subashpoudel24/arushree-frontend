'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Alert, Button, Spinner } from '@/components/ui';
import { CartLine, useCart } from '@/contexts/CartContext';
import { errorMessage } from '@/lib/api';

const money = (value: number) => `Rs. ${value.toLocaleString('en-IN')}`;

const LineItem = ({ line, onError }: { line: CartLine; onError: (message: string) => void }) => {
  const { setQuantity, removeItem } = useCart();
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<void>) => {
    onError('');
    setBusy(true);
    try {
      await action();
    } catch (err) {
      onError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="flex gap-3 py-4 sm:gap-4">
      <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-sand">
        {line.imageUrl && <Image src={line.imageUrl} alt="" fill sizes="80px" className="object-cover" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          {line.slug ? (
            <Link href={`/shop/products/${line.slug}`} className="font-medium hover:text-bronze">
              {line.name}
            </Link>
          ) : (
            <span className="font-medium">{line.name}</span>
          )}
          <span className="shrink-0 font-semibold">{money(line.lineTotal)}</span>
        </div>
        <p className="text-sm text-muted">{money(line.unitPrice)} each</p>
        {line.issue && (
          <p className="mt-1 text-sm text-danger">
            {line.issue === 'unavailable'
              ? 'No longer available. Please remove it.'
              : line.stock
                ? `Only ${line.stock} left. Please lower the quantity.`
                : 'Sold out. Please remove it.'}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <div role="group" aria-label={`Quantity of ${line.name}`} className="flex items-center rounded-lg border border-line bg-white">
            <button type="button" aria-label="Decrease quantity" disabled={busy || line.quantity <= 1} onClick={() => run(() => setQuantity(line.productId, line.quantity - 1))} className="flex size-11 items-center justify-center disabled:opacity-40">
              <Minus size={16} aria-hidden />
            </button>
            <span className="w-8 text-center text-sm font-semibold" aria-live="polite">
              {line.quantity}
            </span>
            <button type="button" aria-label="Increase quantity" disabled={busy || line.quantity >= line.stock || !!line.issue} onClick={() => run(() => setQuantity(line.productId, line.quantity + 1))} className="flex size-11 items-center justify-center disabled:opacity-40">
              <Plus size={16} aria-hidden />
            </button>
          </div>
          <button type="button" aria-label={`Remove ${line.name}`} disabled={busy} onClick={() => run(() => removeItem(line.productId))} className="flex size-11 items-center justify-center text-muted hover:text-danger">
            <Trash2 size={18} aria-hidden />
          </button>
        </div>
      </div>
    </li>
  );
};

export default function CartPage() {
  const { cart, loadError, reload, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [applying, setApplying] = useState(false);

  const submitCoupon = async (e: FormEvent) => {
    e.preventDefault();
    setCouponMessage('');
    setApplying(true);
    try {
      await applyCoupon(code);
      setCode('');
    } catch (err) {
      setCouponMessage(errorMessage(err));
    } finally {
      setApplying(false);
    }
  };

  if (loadError) {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold">Your cart could not be loaded</h1>
        <Button className="mt-6" onClick={() => void reload()}>
          Try again
        </Button>
      </main>
    );
  }
  if (!cart) return <Spinner label="Loading your cart" />;

  if (!cart.lines.length) {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">Your cart is empty</h1>
        <Link href="/shop" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-gold px-6 font-semibold hover:bg-gold-strong">
          Browse products
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="mb-6 font-display text-3xl font-semibold">Your cart</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {error && <Alert>{error}</Alert>}
          <ul className="divide-y divide-line rounded-2xl border border-line bg-white px-4 sm:px-6">
            {cart.lines.map((line) => (
              <LineItem key={line.productId} line={line} onError={setError} />
            ))}
          </ul>
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border border-line bg-white p-6">
          <h2 className="font-display text-xl font-semibold">Summary</h2>
          {cart.couponCode ? (
            <div className="flex items-center justify-between rounded-lg bg-sand px-3 py-2 text-sm">
              <span>
                Coupon <strong>{cart.couponCode}</strong>
              </span>
              <button type="button" onClick={() => void removeCoupon()} className="min-h-11 px-2 font-medium text-bronze underline">
                Remove
              </button>
            </div>
          ) : (
            <form onSubmit={submitCoupon} className="space-y-2">
              <label htmlFor="coupon" className="block text-sm font-medium">
                Coupon code
              </label>
              <div className="flex gap-2">
                <input id="coupon" value={code} maxLength={50} autoComplete="off" required onChange={(e) => setCode(e.target.value)} className="min-h-11 min-w-0 flex-1 rounded-lg border border-line px-3 text-base uppercase focus:border-bronze focus:outline-none sm:text-sm" />
                <Button type="submit" variant="outline" loading={applying}>
                  Apply
                </Button>
              </div>
            </form>
          )}
          {(couponMessage || cart.couponError) && <Alert>{couponMessage || cart.couponError}</Alert>}
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{money(cart.subtotal)}</dd>
            </div>
            {cart.discount > 0 && (
              <div className="flex justify-between text-success">
                <dt>Discount</dt>
                <dd>-{money(cart.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between text-muted">
              <dt>Delivery</dt>
              <dd>Calculated at checkout</dd>
            </div>
          </dl>
          {cart.hasIssues ? (
            <Alert>Please fix the items marked in your cart before checking out.</Alert>
          ) : (
            <Link href="/checkout" className="flex min-h-11 items-center justify-center rounded-lg bg-gold font-semibold hover:bg-gold-strong">
              Go to checkout
            </Link>
          )}
        </aside>
      </div>
    </main>
  );
}
