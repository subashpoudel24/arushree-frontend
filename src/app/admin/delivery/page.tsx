'use client';

import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from 'react';
import { ActionLink, Loading, Notice, PageHeader, Panel, Table, Td, money, titleCase, useAction } from '@/components/admin/kit';
import { Button, Field } from '@/components/ui';
import { api, errorMessage } from '@/lib/api';

interface Charge {
  _id: string;
  province: string;
  district: string;
  city: string;
  charge: number;
}

const BLANK = { province: '', district: '', city: '', charge: 0 };

export default function AdminDeliveryPage() {
  const [items, setItems] = useState<Charge[] | null>(null);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(BLANK);
  const [filter, setFilter] = useState('');
  const { busy, notice, run } = useAction();

  const load = useCallback(async () => {
    try {
      setItems((await api<{ items: Charge[] }>('/admin/delivery-charges')).items);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const reset = () => {
    setEditingId(null);
    setForm(BLANK);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await run(async () => {
      if (editingId) await api(`/admin/delivery-charges/${editingId}`, { method: 'PATCH', body: form });
      else await api('/admin/delivery-charges', { method: 'POST', body: form });
      await load();
    }, 'Delivery charge saved.');
    if (ok) reset();
  };

  const importFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!window.confirm('This replaces the whole delivery list with the file. Continue?')) return;
    await run(async () => {
      const body = new FormData();
      body.append('file', file);
      await api('/admin/delivery-charges/import', { method: 'POST', body });
      await load();
    }, 'Delivery list replaced.');
  };

  const needle = filter.trim().toLowerCase();
  const visible = items?.filter((row) => !needle || `${row.province} ${row.district} ${row.city}`.includes(needle));

  return (
    <>
      <PageHeader title="Delivery charges">
        <label className="inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-line bg-white px-5 text-sm font-semibold hover:bg-sand has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-bronze">
          {busy ? 'Working…' : 'Upload CSV'}
          <input type="file" accept=".csv,text/csv" className="sr-only" disabled={busy} onChange={importFile} />
        </label>
      </PageHeader>
      <p className="mb-4 text-sm text-muted">
        Customers can only order to locations listed here. CSV columns: province, district, city, charge.
      </p>
      <Notice notice={notice} />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-4">
            <Field label="Search" type="search" value={filter} onChange={(e) => setFilter(e.target.value)} />
          </div>
          <Loading error={error} ready={!!items}>
            <Table head={['Province', 'District', 'City', 'Charge', '']} empty={!visible?.length}>
              {visible?.map((row) => (
                <tr key={row._id}>
                  <Td>{titleCase(row.province)}</Td>
                  <Td>{titleCase(row.district)}</Td>
                  <Td>{titleCase(row.city)}</Td>
                  <Td>{money(row.charge)}</Td>
                  <Td className="whitespace-nowrap">
                    <ActionLink
                      onClick={() => {
                        setEditingId(row._id);
                        setForm({ province: row.province, district: row.district, city: row.city, charge: row.charge });
                      }}>
                      Edit
                    </ActionLink>
                    <ActionLink
                      danger
                      onClick={() => {
                        if (!window.confirm(`Stop delivering to ${titleCase(row.city)}?`)) return;
                        void run(async () => {
                          await api(`/admin/delivery-charges/${row._id}`, { method: 'DELETE' });
                          await load();
                        });
                      }}>
                      Delete
                    </ActionLink>
                  </Td>
                </tr>
              ))}
            </Table>
          </Loading>
        </div>
        <Panel title={editingId ? 'Edit location' : 'Add location'}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Province" required value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} />
            <Field label="District" required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
            <Field label="City" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <Field label="Charge (Rs.)" type="number" min={0} required value={form.charge} onChange={(e) => setForm({ ...form, charge: Number(e.target.value) })} />
            <div className="flex gap-2">
              <Button type="submit" loading={busy}>
                Save
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
