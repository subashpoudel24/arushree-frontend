'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Badge, Loading, Notice, PageHeader, Pagination, Select, Table, Td, dateTimeText, downloadFile, money, orderStatusTone, paymentTone, titleCase, useAction, useList } from '@/components/admin/kit';
import { Button, Field } from '@/components/ui';

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  address: { firstName: string; lastName: string; phone: string; city: string };
}

const STATUSES = ['pending_payment', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'canceled'];
const PAYMENTS = ['unpaid', 'payment_pending', 'paid', 'refunded'];

const Orders = () => {
  const params = useSearchParams();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState(params.get('status') ?? '');
  const [paymentStatus, setPaymentStatus] = useState(params.get('paymentStatus') ?? '');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const query = new URLSearchParams({
    ...(q && { q }),
    ...(status && { status }),
    ...(paymentStatus && { paymentStatus }),
    ...(from && { from }),
    ...(to && { to }),
  }).toString();
  const { data, page, setPage, error } = useList<Order>('/admin/orders', query);
  const { busy, notice, run } = useAction();

  return (
    <>
      <PageHeader title="Orders">
        <Button variant="outline" loading={busy} onClick={() => run(() => downloadFile(`/admin/orders/export${query ? `?${query}` : ''}`))}>
          Export Excel
        </Button>
      </PageHeader>
      <Notice notice={notice} />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Field label="Search" type="search" hint="Order, name, phone or email" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {titleCase(value)}
            </option>
          ))}
        </Select>
        <Select label="Payment" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
          <option value="">All</option>
          {PAYMENTS.map((value) => (
            <option key={value} value={value}>
              {titleCase(value)}
            </option>
          ))}
        </Select>
        <Field label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Field label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      <Loading error={error} ready={!!data}>
        {data && (
          <>
            <p className="mb-2 text-sm text-muted" role="status">
              {data.total} {data.total === 1 ? 'order' : 'orders'}
            </p>
            <Table head={['Order', 'Date', 'Customer', 'Total', 'Payment', 'Status']} empty={!data.items.length}>
              {data.items.map((order) => (
                <tr key={order._id}>
                  <Td>
                    <Link href={`/admin/orders/${order._id}`} className="font-semibold underline">
                      {order.orderNumber}
                    </Link>
                  </Td>
                  <Td className="whitespace-nowrap">{dateTimeText(order.createdAt)}</Td>
                  <Td>
                    {order.address.firstName} {order.address.lastName}
                    <br />
                    <span className="text-xs text-muted">{order.address.phone}</span>
                  </Td>
                  <Td>{money(order.total)}</Td>
                  <Td>
                    <span className="mr-2 text-xs uppercase text-muted">{order.paymentMethod}</span>
                    <Badge tone={paymentTone(order.paymentStatus)}>{titleCase(order.paymentStatus)}</Badge>
                  </Td>
                  <Td>
                    <Badge tone={orderStatusTone(order.status)}>{titleCase(order.status)}</Badge>
                  </Td>
                </tr>
              ))}
            </Table>
            <Pagination page={page} pages={data.pages} onPage={setPage} />
          </>
        )}
      </Loading>
    </>
  );
};

export default function AdminOrdersPage() {
  return (
    <Suspense>
      <Orders />
    </Suspense>
  );
}
