'use client';

import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ActionLink, Badge, Loading, Notice, PageHeader, Panel, dateTimeText, downloadFile, money, orderStatusTone, paymentTone, titleCase, useAction } from '@/components/admin/kit';
import { Button } from '@/components/ui';
import { api, errorMessage } from '@/lib/api';

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentMethod: 'cod' | 'esewa';
  paymentStatus: string;
  email?: string;
  hearAboutUs?: string;
  couponCode?: string;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  esewa?: { transactionCode?: string };
  address: { firstName: string; lastName: string; phone: string; province: string; district: string; city: string; street?: string; landmark: string; additionalInfo?: string };
  items: { name: string; unitPrice: number; quantity: number; lineTotal: number; adminDiscountPercent?: number }[];
  statusHistory: { status: string; at: string; note?: string }[];
}

// Mirrors the server's rules, which remain the real check.
const NEXT: Record<string, string[]> = {
  pending_payment: ['canceled'],
  confirmed: ['shipped', 'canceled'],
  shipped: ['out_for_delivery', 'delivered', 'canceled'],
  out_for_delivery: ['delivered', 'canceled'],
  delivered: [],
  canceled: [],
};

export default function AdminOrderPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [discounts, setDiscounts] = useState<Record<number, string>>({});
  const { busy, notice, run } = useAction();

  const load = useCallback(async () => {
    try {
      setOrder((await api<{ order: Order }>(`/admin/orders/${id}`)).order);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const changeStatus = (status: string) => {
    const warning = status === 'canceled' ? 'Cancel this order? Stock goes back on sale and the customer is told.' : `Mark this order as ${titleCase(status)}?`;
    if (!window.confirm(warning)) return;
    void run(async () => {
      await api(`/admin/orders/${id}/status`, { method: 'PATCH', body: { status } });
      await load();
    }, 'Order updated.');
  };

  const changePayment = (paymentStatus: 'paid' | 'refunded') => {
    if (!window.confirm(`Mark this payment as ${paymentStatus}?`)) return;
    void run(async () => {
      await api(`/admin/orders/${id}/payment-status`, { method: 'PATCH', body: { paymentStatus } });
      await load();
    }, 'Payment updated.');
  };

  const applyDiscount = (index: number) =>
    void run(async () => {
      await api(`/admin/orders/${id}/items/${index}/discount`, { method: 'PATCH', body: { discountPercent: Number(discounts[index] ?? 0) } });
      setDiscounts((current) => ({ ...current, [index]: '' }));
      await load();
    }, 'Discount applied.');

  const canDiscount = order?.paymentMethod === 'cod' && order.paymentStatus === 'unpaid' && ['confirmed', 'shipped', 'out_for_delivery'].includes(order.status);

  return (
    <Loading error={error} ready={!!order}>
      {order && (
        <>
          <PageHeader title={order.orderNumber}>
            <Button variant="outline" onClick={() => run(() => downloadFile(`/admin/orders/${order._id}/invoice`))}>
              Invoice
            </Button>
          </PageHeader>
          <Notice notice={notice} />
          {order.status === 'canceled' && order.paymentStatus === 'paid' && (
            <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-danger">
              This canceled order has been paid. The customer needs a refund or a re-order.
            </p>
          )}
          <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
            <div className="space-y-6">
              <Panel title="Items">
                <ul className="divide-y divide-line">
                  {order.items.map((item, index) => (
                    <li key={item.name} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-muted">
                          {money(item.unitPrice)} × {item.quantity}
                          {item.adminDiscountPercent ? ` · ${item.adminDiscountPercent}% staff discount` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {canDiscount && (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              aria-label={`Discount percent for ${item.name}`}
                              placeholder="%"
                              value={discounts[index] ?? ''}
                              onChange={(e) => setDiscounts({ ...discounts, [index]: e.target.value })}
                              className="min-h-11 w-16 rounded-lg border border-line px-2 text-base sm:text-sm"
                            />
                            <ActionLink disabled={busy || discounts[index] === undefined || discounts[index] === ''} onClick={() => applyDiscount(index)}>
                              Apply
                            </ActionLink>
                          </div>
                        )}
                        <span className="font-semibold">{money(item.lineTotal)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <dl className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
                  <div className="flex justify-between">
                    <dt>Subtotal</dt>
                    <dd>{money(order.subtotal)}</dd>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between">
                      <dt>Coupon {order.couponCode}</dt>
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
              </Panel>
              <Panel title="History">
                <ol className="space-y-3 text-sm">
                  {order.statusHistory.map((entry, index) => (
                    <li key={index}>
                      <span className="font-medium">{titleCase(entry.status)}</span> <span className="text-xs text-muted">{dateTimeText(entry.at)}</span>
                      {entry.note && <p className="text-muted">{entry.note}</p>}
                    </li>
                  ))}
                </ol>
              </Panel>
            </div>
            <div className="space-y-6">
              <Panel title="Status">
                <Badge tone={orderStatusTone(order.status)}>{titleCase(order.status)}</Badge>
                <div className="mt-3 flex flex-wrap gap-2">
                  {NEXT[order.status]?.map((status) => (
                    <Button key={status} variant={status === 'canceled' ? 'outline' : 'primary'} disabled={busy} onClick={() => changeStatus(status)}>
                      {status === 'canceled' ? 'Cancel order' : `Mark ${titleCase(status)}`}
                    </Button>
                  ))}
                </div>
                {order.status === 'pending_payment' && <p className="mt-2 text-xs text-muted">This order confirms itself once eSewa verifies payment.</p>}
              </Panel>
              <Panel title="Payment">
                <p className="text-sm">
                  {order.paymentMethod === 'cod' ? 'Cash on delivery' : 'eSewa'} <Badge tone={paymentTone(order.paymentStatus)}>{titleCase(order.paymentStatus)}</Badge>
                </p>
                {order.esewa?.transactionCode && <p className="mt-1 text-xs text-muted">Reference: {order.esewa.transactionCode}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {order.paymentMethod === 'cod' && order.paymentStatus === 'unpaid' && (
                    <Button variant="outline" disabled={busy} onClick={() => changePayment('paid')}>
                      Mark paid
                    </Button>
                  )}
                  {order.paymentStatus === 'paid' && (
                    <Button variant="outline" disabled={busy} onClick={() => changePayment('refunded')}>
                      Mark refunded
                    </Button>
                  )}
                </div>
              </Panel>
              <Panel title="Customer">
                <p className="text-sm">
                  {order.address.firstName} {order.address.lastName}
                  <br />
                  {order.address.phone}
                  {order.email && (
                    <>
                      <br />
                      {order.email}
                    </>
                  )}
                  <br />
                  {[order.address.street, order.address.landmark, titleCase(order.address.city), titleCase(order.address.district), titleCase(order.address.province)].filter(Boolean).join(', ')}
                </p>
                {order.address.additionalInfo && <p className="mt-2 text-sm text-muted">Note: {order.address.additionalInfo}</p>}
                {order.hearAboutUs && <p className="mt-2 text-sm text-muted">Heard about us: {order.hearAboutUs}</p>}
              </Panel>
            </div>
          </div>
        </>
      )}
    </Loading>
  );
}
