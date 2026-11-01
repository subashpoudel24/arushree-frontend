'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ActionLink, Badge, Checkbox, Loading, Notice, PageHeader, Pagination, Panel, Select, Table, Td, dateText, toDateInput, useAction, useList } from '@/components/admin/kit';
import { Button, Field } from '@/components/ui';
import { api } from '@/lib/api';

interface Coupon {
  _id: string;
  code: string;
  description: string;
  discountPercent: number;
  maxDiscount: number;
  validFrom: string;
  validTill: string;
  active: boolean;
  usageLimit: number;
  usedCount: number;
  perCustomerLimit: number;
  product?: { _id: string; name: string } | null;
}

const BLANK = {
  code: '',
  description: '',
  discountPercent: 10,
  maxDiscount: 500,
  validFrom: toDateInput(new Date()),
  validTill: toDateInput(new Date(Date.now() + 30 * 86_400_000)),
  active: true,
  usageLimit: 100,
  perCustomerLimit: 1,
  product: '',
};

const statusOf = (coupon: Coupon): ['good' | 'bad' | 'plain', string] => {
  if (!coupon.active) return ['plain', 'Off'];
  if (new Date(coupon.validTill) < new Date()) return ['bad', 'Expired'];
  if (coupon.usedCount >= coupon.usageLimit) return ['bad', 'Used up'];
  return ['good', 'Active'];
};

export default function AdminCouponsPage() {
  const { data, page, setPage, error, reload } = useList<Coupon>('/admin/coupons');
  const [products, setProducts] = useState<{ _id: string; name: string }[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(BLANK);
  const { busy, notice, run } = useAction();

  useEffect(() => {
    // Every product, across pages, for the "only this product" choice.
    (async () => {
      const all: { _id: string; name: string }[] = [];
      for (let p = 1, pages = 1; p <= pages; p += 1) {
        const res = await api<{ items: { _id: string; name: string }[]; pages: number }>(`/admin/products?limit=48&page=${p}`);
        all.push(...res.items);
        pages = res.pages;
      }
      setProducts(all);
    })().catch(() => setProducts([]));
  }, []);

  const reset = () => {
    setEditingId(null);
    setForm(BLANK);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await run(async () => {
      const body = { ...form, product: form.product || null };
      if (editingId) await api(`/admin/coupons/${editingId}`, { method: 'PATCH', body });
      else await api('/admin/coupons', { method: 'POST', body });
      await reload();
    }, editingId ? 'Coupon saved.' : 'Coupon added.');
    if (ok) reset();
  };

  const num = (key: 'discountPercent' | 'maxDiscount' | 'usageLimit' | 'perCustomerLimit', value: string) => setForm({ ...form, [key]: Number(value) });

  return (
    <>
      <PageHeader title="Coupons" />
      <Notice notice={notice} />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Loading error={error} ready={!!data}>
          {data && (
            <div>
              <Table head={['Code', 'Discount', 'Applies to', 'Valid until', 'Used', 'Status', '']} empty={!data.items.length}>
                {data.items.map((coupon) => {
                  const [tone, label] = statusOf(coupon);
                  return (
                    <tr key={coupon._id}>
                      <Td className="font-semibold">{coupon.code}</Td>
                      <Td>
                        {coupon.discountPercent}% (up to Rs. {coupon.maxDiscount})
                      </Td>
                      <Td>{coupon.product?.name ?? 'Whole cart'}</Td>
                      <Td>{dateText(coupon.validTill)}</Td>
                      <Td>
                        {coupon.usedCount} / {coupon.usageLimit}
                      </Td>
                      <Td>
                        <Badge tone={tone}>{label}</Badge>
                      </Td>
                      <Td className="whitespace-nowrap">
                        <ActionLink
                          onClick={() => {
                            setEditingId(coupon._id);
                            setForm({
                              code: coupon.code,
                              description: coupon.description,
                              discountPercent: coupon.discountPercent,
                              maxDiscount: coupon.maxDiscount,
                              validFrom: toDateInput(coupon.validFrom),
                              validTill: toDateInput(coupon.validTill),
                              active: coupon.active,
                              usageLimit: coupon.usageLimit,
                              perCustomerLimit: coupon.perCustomerLimit,
                              product: coupon.product?._id ?? '',
                            });
                          }}>
                          Edit
                        </ActionLink>
                        <ActionLink
                          danger
                          onClick={() => {
                            if (!window.confirm(`Delete coupon ${coupon.code}?`)) return;
                            void run(async () => {
                              await api(`/admin/coupons/${coupon._id}`, { method: 'DELETE' });
                              await reload();
                            });
                          }}>
                          Delete
                        </ActionLink>
                      </Td>
                    </tr>
                  );
                })}
              </Table>
              <Pagination page={page} pages={data.pages} onPage={setPage} />
            </div>
          )}
        </Loading>
        <Panel title={editingId ? 'Edit coupon' : 'Add coupon'}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Code" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            <Field label="Description" maxLength={300} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Discount %" type="number" min={1} max={100} required value={form.discountPercent} onChange={(e) => num('discountPercent', e.target.value)} />
              <Field label="Maximum Rs." type="number" min={0} required value={form.maxDiscount} onChange={(e) => num('maxDiscount', e.target.value)} />
              <Field label="Starts" type="date" required value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} />
              <Field label="Ends" type="date" required value={form.validTill} onChange={(e) => setForm({ ...form, validTill: e.target.value })} />
              <Field label="Total uses" type="number" min={0} required value={form.usageLimit} onChange={(e) => num('usageLimit', e.target.value)} />
              <Field label="Uses per customer" type="number" min={1} required value={form.perCustomerLimit} onChange={(e) => num('perCustomerLimit', e.target.value)} />
            </div>
            <Select label="Applies to" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })}>
              <option value="">Whole cart</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </Select>
            <Checkbox label="Active" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            <div className="flex gap-2">
              <Button type="submit" loading={busy}>
                {editingId ? 'Save' : 'Add coupon'}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={reset}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Panel>
      </div>
    </>
  );
}
