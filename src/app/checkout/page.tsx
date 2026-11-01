'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Field, Spinner } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ApiRequestError, api, errorMessage } from '@/lib/api';

interface Location {
  province: string;
  district: string;
  city: string;
}
interface SavedAddress extends Location {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  street?: string;
  landmark: string;
}
interface Quote {
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
}

const money = (value: number) => `Rs. ${value.toLocaleString('en-IN')}`;
const label = (value: string) => value.replace(/\b\w/g, (c) => c.toUpperCase());
const unique = (values: string[]) => Array.from(new Set(values));
const HEAR_OPTIONS = ['Facebook', 'Instagram', 'TikTok', 'Friend or family', 'Google search', 'Other'];

const SelectField = ({
  id,
  text,
  value,
  options,
  disabled,
  optional,
  onChange,
}: {
  id: string;
  text: string;
  value: string;
  options: string[];
  disabled?: boolean;
  optional?: boolean;
  onChange: (value: string) => void;
}) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
      {text}
    </label>
    <select id={id} required={!optional} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className="min-h-11 w-full rounded-lg border border-line bg-white px-3 text-base focus:border-bronze focus:outline-none disabled:bg-sand sm:text-sm">
      <option value="">Choose</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {/* Locations are stored in lowercase. */}
          {option === option.toLowerCase() ? label(option) : option}
        </option>
      ))}
    </select>
  </div>
);

const emptyAddress = { firstName: '', lastName: '', phone: '', province: '', district: '', city: '', street: '', landmark: '', additionalInfo: '' };

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart, reload } = useCart();
  const router = useRouter();

  const [locations, setLocations] = useState<Location[] | null>(null);
  const [saved, setSaved] = useState<SavedAddress[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState(emptyAddress);
  const [email, setEmail] = useState('');
  const [saveAddress, setSaveAddress] = useState(true);
  const [hearAboutUs, setHearAboutUs] = useState('');
  const [methods, setMethods] = useState<string[]>(['cod']);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState('');
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  // Kept across retries so a repeated click can never create a second order.
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  useEffect(() => {
    api<{ items: Location[] }>('/delivery/locations')
      .then((data) => setLocations(data.items))
      .catch((err) => {
        setLocations([]);
        setError(errorMessage(err));
      });
  }, []);

  useEffect(() => {
    api<{ methods: string[] }>('/payments/methods')
      .then((data) => setMethods(data.methods))
      .catch(() => setMethods(['cod']));
  }, []);

  useEffect(() => {
    if (!user) {
      setSaved([]);
      setSelectedId('');
      return;
    }
    api<{ items: SavedAddress[] }>('/addresses')
      .then((data) => {
        setSaved(data.items);
        setSelectedId(data.items[0]?._id ?? '');
      })
      .catch(() => setSaved([]));
  }, [user]);

  const chosen = saved.find((address) => address._id === selectedId);
  const where: Location = chosen ?? form;
  const complete = where.province && where.district && where.city;
  const cartVersion = cart ? `${cart.subtotal}|${cart.discount}` : '';

  useEffect(() => {
    setQuote(null);
    setQuoteError('');
    if (!complete || !cartVersion) return;
    let current = true;
    api<Quote>('/checkout/quote', {
      method: 'POST',
      body: { province: where.province, district: where.district, city: where.city },
      guestOk: true,
    })
      .then((data) => current && setQuote(data))
      .catch((err) => current && setQuoteError(errorMessage(err)));
    return () => {
      current = false;
    };
  }, [where.province, where.district, where.city, complete, cartVersion]);

  const provinces = useMemo(() => unique((locations ?? []).map((l) => l.province)), [locations]);
  const districts = useMemo(
    () => unique((locations ?? []).filter((l) => l.province === form.province).map((l) => l.district)),
    [locations, form.province]
  );
  const cities = useMemo(
    () => unique((locations ?? []).filter((l) => l.province === form.province && l.district === form.district).map((l) => l.city)),
    [locations, form.province, form.district]
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!quote) return;
    setError('');
    setPlacing(true);
    try {
      const { additionalInfo, street, ...required } = form;
      const data = await api<{
        order: { orderNumber: string; total: number; paymentMethod: string };
        payment?: { action: string; fields: Record<string, string> };
      }>('/checkout', {
        method: 'POST',
        guestOk: true,
        body: {
          ...(chosen
            ? { addressId: chosen._id }
            : { address: { ...required, ...(street && { street }), ...(additionalInfo && { additionalInfo }) }, saveAddress: !!user && saveAddress }),
          ...(!user && email && { email }),
          paymentMethod,
          ...(hearAboutUs && { hearAboutUs }),
          idempotencyKey,
          expectedTotal: quote.total,
        },
      });
      setPlaced(true);
      if (data.payment) {
        // eSewa needs a real form POST, which takes the customer to their site.
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.payment.action;
        form.hidden = true;
        Object.entries(data.payment.fields).forEach(([name, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = name;
          input.value = value;
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
        return;
      }
      sessionStorage.setItem('last_order', JSON.stringify(data.order));
      await reload();
      router.replace('/checkout/success');
    } catch (err) {
      setError(errorMessage(err));
      // The cart or prices moved: show the customer the new numbers.
      if (err instanceof ApiRequestError && err.status === 409) await reload();
      setPlacing(false);
    }
  };

  if (placed) return <Spinner label="Finishing your order" />;
  if (!cart || !locations) return <Spinner label="Loading checkout" />;
  if (!cart.lines.length) {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">Your cart is empty</h1>
        <Link href="/shop" className="mt-6 inline-block font-semibold text-bronze underline">
          Browse products
        </Link>
      </main>
    );
  }

  const set = (key: keyof typeof emptyAddress, value: string) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="mb-6 font-display text-3xl font-semibold">Checkout</h1>
      {!user && (
        <p className="mb-6 text-sm text-muted">
          Checking out as a guest.{' '}
          <Link href="/signin?next=/checkout" className="font-semibold text-bronze underline">
            Sign in
          </Link>{' '}
          to use saved addresses.
        </p>
      )}
      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-line bg-white p-6">
            <h2 className="font-display text-xl font-semibold">Delivery address</h2>
            {saved.length > 0 && (
              <fieldset className="space-y-2">
                <legend className="sr-only">Choose an address</legend>
                {saved.map((address) => (
                  <label key={address._id} className="flex min-h-11 items-start gap-3 rounded-lg border border-line p-3 text-sm">
                    <input type="radio" name="saved" className="mt-1 accent-bronze" checked={selectedId === address._id} onChange={() => setSelectedId(address._id)} />
                    <span>
                      <strong>
                        {address.firstName} {address.lastName}
                      </strong>{' '}
                      {address.phone}
                      <br />
                      {address.landmark}, {label(address.city)}, {label(address.district)}, {label(address.province)}
                    </span>
                  </label>
                ))}
                <label className="flex min-h-11 items-center gap-3 rounded-lg border border-line p-3 text-sm">
                  <input type="radio" name="saved" className="accent-bronze" checked={!selectedId} onChange={() => setSelectedId('')} />
                  Use a new address
                </label>
              </fieldset>
            )}
            {!chosen && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" autoComplete="given-name" required maxLength={60} value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
                <Field label="Last name" autoComplete="family-name" required maxLength={60} value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
                <Field label="Phone" type="tel" autoComplete="tel" required value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                {!user && <Field label="Email (optional)" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />}
                <SelectField
                  id="province"
                  text="Province"
                  value={form.province}
                  options={provinces}
                  onChange={(value) => setForm((current) => ({ ...current, province: value, district: '', city: '' }))}
                />
                <SelectField
                  id="district"
                  text="District"
                  value={form.district}
                  options={districts}
                  disabled={!form.province}
                  onChange={(value) => setForm((current) => ({ ...current, district: value, city: '' }))}
                />
                <SelectField id="city" text="City" value={form.city} options={cities} disabled={!form.district} onChange={(value) => set('city', value)} />
                <Field label="Street (optional)" autoComplete="street-address" maxLength={200} value={form.street} onChange={(e) => set('street', e.target.value)} />
                <Field label="Nearest landmark" required minLength={2} maxLength={200} value={form.landmark} onChange={(e) => set('landmark', e.target.value)} />
                <Field label="Delivery notes (optional)" maxLength={500} value={form.additionalInfo} onChange={(e) => set('additionalInfo', e.target.value)} />
                {user && (
                  <label className="flex min-h-11 items-center gap-2 text-sm sm:col-span-2">
                    <input type="checkbox" className="size-4 accent-bronze" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
                    Save this address for next time
                  </label>
                )}
              </div>
            )}
          </section>

          <section className="space-y-4 rounded-2xl border border-line bg-white p-6">
            <h2 className="font-display text-xl font-semibold">Payment</h2>
            {methods.map((method) => (
              <label
                key={method}
                className={`flex min-h-11 items-center gap-3 rounded-lg border p-3 text-sm font-medium ${
                  paymentMethod === method ? 'border-bronze' : 'border-line'
                }`}>
                <input type="radio" name="payment" className="accent-bronze" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} />
                {method === 'cod' ? 'Cash on delivery' : 'eSewa'}
              </label>
            ))}
            <SelectField id="hear" text="How did you hear about us? (optional)" value={hearAboutUs} options={HEAR_OPTIONS} optional onChange={setHearAboutUs} />
          </section>
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border border-line bg-white p-6">
          <h2 className="font-display text-xl font-semibold">Your order</h2>
          <ul className="space-y-2 text-sm">
            {cart.lines.map((line) => (
              <li key={line.productId} className="flex justify-between gap-3">
                <span>
                  {line.name} × {line.quantity}
                </span>
                <span className="shrink-0">{money(line.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-2 border-t border-line pt-3 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{money(cart.subtotal)}</dd>
            </div>
            {cart.discount > 0 && (
              <div className="flex justify-between text-success">
                <dt>Discount ({cart.couponCode})</dt>
                <dd>-{money(cart.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>Delivery</dt>
              <dd>{quote ? money(quote.deliveryCharge) : 'Choose a location'}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd>{quote ? money(quote.total) : '-'}</dd>
            </div>
          </dl>
          {quoteError && <Alert>{quoteError}</Alert>}
          {cart.hasIssues && (
            <Alert>
              Some items are no longer available.{' '}
              <Link href="/cart" className="underline">
                Review your cart
              </Link>
              .
            </Alert>
          )}
          {error && <Alert>{error}</Alert>}
          <Button type="submit" loading={placing} disabled={!quote || cart.hasIssues} className="w-full">
            {paymentMethod === 'esewa' ? 'Pay with eSewa' : 'Place order'}
          </Button>
        </aside>
      </form>
    </main>
  );
}
