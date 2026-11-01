'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAdmin } from '@/components/admin/AdminShell';
import { Badge, Loading, Notice, PageHeader, Panel, Table, Td, dateText, money, orderStatusTone, titleCase, useAction } from '@/components/admin/kit';
import { Button } from '@/components/ui';
import { api, errorMessage } from '@/lib/api';

interface Detail {
  customer: { id: string; name: string; email: string; phone: string | null; status: 'active' | 'blocked'; createdAt: string };
  orders: { _id: string; orderNumber: string; total: number; status: string; createdAt: string }[];
  totalSpent: number;
}

export default function AdminCustomerPage() {
  const { id } = useParams<{ id: string }>();
  const { can } = useAdmin();
  const [data, setData] = useState<Detail | null>(null);
  const [error, setError] = useState('');
  const { busy, notice, run } = useAction();

  const load = useCallback(async () => {
    try {
      setData(await api<Detail>(`/admin/customers/${id}`));
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = () => {
    if (!data) return;
    const blocking = data.customer.status === 'active';
    if (blocking && !window.confirm(`Block ${data.customer.name}? They will be signed out and unable to sign in.`)) return;
    void run(async () => {
      await api(`/admin/customers/${id}/status`, { method: 'PATCH', body: { status: blocking ? 'blocked' : 'active' } });
      await load();
    }, blocking ? 'Customer blocked.' : 'Customer unblocked.');
  };

  return (
    <Loading error={error} ready={!!data}>
      {data && (
        <>
          <PageHeader title={data.customer.name}>
            <Button variant="outline" loading={busy} onClick={toggle}>
              {data.customer.status === 'active' ? 'Block customer' : 'Unblock customer'}
            </Button>
          </PageHeader>
          <Notice notice={notice} />
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <Panel title="Details">
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-muted">Email</dt>
                  <dd className="break-words">{data.customer.email}</dd>
                </div>
                <div>
                  <dt className="text-muted">Phone</dt>
                  <dd>{data.customer.phone ?? 'Not given'}</dd>
                </div>
                <div>
                  <dt className="text-muted">Joined</dt>
                  <dd>{dateText(data.customer.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Total spent</dt>
                  <dd className="font-semibold">{money(data.totalSpent)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Status</dt>
                  <dd>
                    <Badge tone={data.customer.status === 'active' ? 'good' : 'bad'}>{titleCase(data.customer.status)}</Badge>
                  </dd>
                </div>
              </dl>
            </Panel>
            <div>
              <h2 className="mb-3 font-display text-lg font-semibold">Orders</h2>
              <Table head={['Order', 'Date', 'Total', 'Status']} empty={!data.orders.length}>
                {data.orders.map((order) => (
                  <tr key={order._id}>
                    <Td>
                      {can('orders') ? (
                        <Link href={`/admin/orders/${order._id}`} className="font-semibold underline">
                          {order.orderNumber}
                        </Link>
                      ) : (
                        order.orderNumber
                      )}
                    </Td>
                    <Td>{dateText(order.createdAt)}</Td>
                    <Td>{money(order.total)}</Td>
                    <Td>
                      <Badge tone={orderStatusTone(order.status)}>{titleCase(order.status)}</Badge>
                    </Td>
                  </tr>
                ))}
              </Table>
            </div>
          </div>
        </>
      )}
    </Loading>
  );
}
