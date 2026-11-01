'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChangeEvent, useState } from 'react';
import { useAdmin } from '@/components/admin/AdminShell';
import { Badge, Loading, Notice, PageHeader, Pagination, Select, Table, Td, downloadFile, money, useAction, useList } from '@/components/admin/kit';
import { Button, Field } from '@/components/ui';
import { api } from '@/lib/api';

interface Row {
  _id: string;
  name: string;
  price: number;
  stock: number;
  status: 'draft' | 'published';
  featured: boolean;
  images: { url: string }[];
  categories: { name: string }[];
}

export default function AdminProductsPage() {
  const { can } = useAdmin();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const query = new URLSearchParams({ ...(q && { q }), ...(status && { status }) }).toString();
  const { data, page, setPage, error, reload } = useList<Row>('/admin/products', query);
  const { busy, notice, run } = useAction();

  const importFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    await run(async () => {
      const body = new FormData();
      body.append('file', file);
      const result = await api<{ created: number; updated: number }>('/admin/products/import', { method: 'POST', body });
      await reload();
      return result;
    }, 'Products imported.');
  };

  return (
    <>
      <PageHeader title="Products">
        <Button variant="outline" onClick={() => run(() => downloadFile('/admin/products/export'))}>
          Export CSV
        </Button>
        {can('products.write') && (
          <>
            <label className="inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-line bg-white px-5 text-sm font-semibold hover:bg-sand has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-bronze">
              {busy ? 'Working…' : 'Import CSV'}
              <input type="file" accept=".csv,text/csv" className="sr-only" disabled={busy} onChange={importFile} />
            </label>
            <Link href="/admin/products/new" className="inline-flex min-h-11 items-center rounded-lg bg-gold px-5 text-sm font-semibold hover:bg-gold-strong">
              Add product
            </Link>
          </>
        )}
      </PageHeader>
      <Notice notice={notice} />
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_200px]">
        <Field label="Search" type="search" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </Select>
      </div>
      <Loading error={error} ready={!!data}>
        {data && (
          <>
            <Table head={['', 'Product', 'Categories', 'Price', 'Stock', 'Status']} empty={!data.items.length}>
              {data.items.map((product) => (
                <tr key={product._id}>
                  <Td>
                    <div className="relative size-12 overflow-hidden rounded-lg bg-sand">
                      {product.images[0] && <Image src={product.images[0].url} alt="" fill sizes="48px" className="object-cover" />}
                    </div>
                  </Td>
                  <Td>
                    <Link href={`/admin/products/${product._id}`} className="font-semibold underline">
                      {product.name}
                    </Link>
                    {product.featured && <span className="ml-2 text-xs text-muted">Featured</span>}
                  </Td>
                  <Td>{product.categories.map((category) => category.name).join(', ')}</Td>
                  <Td>{money(product.price)}</Td>
                  <Td className={product.stock === 0 ? 'font-semibold text-danger' : ''}>{product.stock}</Td>
                  <Td>
                    <Badge tone={product.status === 'published' ? 'good' : 'plain'}>{product.status === 'published' ? 'Published' : 'Draft'}</Badge>
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
