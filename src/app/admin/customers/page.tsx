'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Badge, Loading, PageHeader, Pagination, Select, Table, Td, dateText, useList } from '@/components/admin/kit';
import { Field } from '@/components/ui';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: 'active' | 'blocked';
  orderCount: number;
  createdAt: string;
}

export default function AdminCustomersPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const query = new URLSearchParams({ ...(q && { q }), ...(status && { status }) }).toString();
  const { data, page, setPage, error } = useList<Customer>('/admin/customers', query);

  return (
    <>
      <PageHeader title="Customers" />
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_200px]">
        <Field label="Search" type="search" hint="Name, email or phone" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </Select>
      </div>
      <Loading error={error} ready={!!data}>
        {data && (
          <>
            <Table head={['Name', 'Email', 'Phone', 'Orders', 'Joined', 'Status']} empty={!data.items.length}>
              {data.items.map((customer) => (
                <tr key={customer.id}>
                  <Td>
                    <Link href={`/admin/customers/${customer.id}`} className="font-semibold underline">
                      {customer.name}
                    </Link>
                  </Td>
                  <Td>{customer.email}</Td>
                  <Td>{customer.phone}</Td>
                  <Td>{customer.orderCount}</Td>
                  <Td className="whitespace-nowrap">{dateText(customer.createdAt)}</Td>
                  <Td>
                    <Badge tone={customer.status === 'active' ? 'good' : 'bad'}>{customer.status === 'active' ? 'Active' : 'Blocked'}</Badge>
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
}
