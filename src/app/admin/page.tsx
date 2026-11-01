'use client';

import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAdmin } from '@/components/admin/AdminShell';
import { Loading, PageHeader, Panel, money, titleCase, toDateInput } from '@/components/admin/kit';
import { Field } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { api, errorMessage } from '@/lib/api';

interface Dashboard {
  sales: number;
  orders: number;
  averageOrder: number;
  newCustomers: number;
  refundsNeeded: number;
  byStatus: Record<string, number>;
  topProducts: { name: string; quantity: number; revenue: number }[];
  lowStock: { _id: string; name: string; stock: number }[];
}

const Tile = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-line bg-white p-5">
    <p className="text-sm text-muted">{label}</p>
    <p className="mt-1 text-2xl font-semibold">{value}</p>
  </div>
);

export default function AdminDashboardPage() {
  const { can } = useAdmin();
  const { user } = useAuth();
  const [from, setFrom] = useState(() => toDateInput(new Date(Date.now() - 30 * 86_400_000)));
  const [to, setTo] = useState(() => toDateInput(new Date()));
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState('');
  const allowed = can('dashboard');

  useEffect(() => {
    if (!allowed || !from || !to) return;
    setError('');
    api<Dashboard>(`/admin/dashboard?from=${from}&to=${to}`)
      .then(setData)
      .catch((err) => setError(errorMessage(err)));
  }, [from, to, allowed]);

  if (!allowed) {
    return (
      <>
        <PageHeader title="Admin panel" />
        <Panel>
          <p className="text-sm text-muted">Welcome, {user?.name}. Use the menu to open the areas you can manage.</p>
        </Panel>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Dashboard">
        <div className="flex gap-2">
          <Field label="From" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
          <Field label="To" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
        </div>
      </PageHeader>
      <Loading error={error} ready={!!data}>
        {data && (
          <div className="space-y-6">
            {data.refundsNeeded > 0 && (
              <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-danger">
                <AlertTriangle size={18} aria-hidden />
                {data.refundsNeeded} canceled {data.refundsNeeded === 1 ? 'order has' : 'orders have'} been paid and may need a refund.{' '}
                <Link href="/admin/orders?status=canceled&paymentStatus=paid" className="font-semibold underline">
                  Review
                </Link>
              </p>
            )}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Tile label="Sales" value={money(data.sales)} />
              <Tile label="Orders" value={String(data.orders)} />
              <Tile label="Average order" value={money(data.averageOrder)} />
              <Tile label="New customers" value={String(data.newCustomers)} />
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <Panel title="Orders by status">
                {Object.keys(data.byStatus).length === 0 ? (
                  <p className="text-sm text-muted">No orders in this period.</p>
                ) : (
                  <dl className="space-y-2 text-sm">
                    {Object.entries(data.byStatus).map(([status, count]) => (
                      <div key={status} className="flex justify-between">
                        <dt>{titleCase(status)}</dt>
                        <dd className="font-semibold">{count}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </Panel>
              <Panel title="Top products">
                {data.topProducts.length === 0 ? (
                  <p className="text-sm text-muted">No sales in this period.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {data.topProducts.map((product) => (
                      <li key={product.name} className="flex justify-between gap-3">
                        <span>
                          {product.name} × {product.quantity}
                        </span>
                        <span className="shrink-0 font-semibold">{money(product.revenue)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
              <Panel title="Low stock">
                {data.lowStock.length === 0 ? (
                  <p className="text-sm text-muted">Everything is well stocked.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {data.lowStock.map((product) => (
                      <li key={product._id} className="flex justify-between gap-3">
                        {can('products.read') ? (
                          <Link href={`/admin/products/${product._id}`} className="underline">
                            {product.name}
                          </Link>
                        ) : (
                          product.name
                        )}
                        <span className={product.stock === 0 ? 'font-semibold text-danger' : 'font-semibold'}>{product.stock} left</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </div>
          </div>
        )}
      </Loading>
    </>
  );
}
