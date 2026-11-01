'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { ImageField } from '@/components/admin/ImageField';
import { PickedImage } from '@/components/admin/ImagePicker';
import { ActionLink, Badge, Checkbox, Loading, Notice, PageHeader, Panel, Table, Td, useAction } from '@/components/admin/kit';
import { Button, Field } from '@/components/ui';
import { api, errorMessage } from '@/lib/api';

interface Testimonial {
  _id: string;
  authorName: string;
  authorImage?: PickedImage;
  rating: number;
  title: string;
  text: string;
  active: boolean;
  displayOrder: number;
}

const BLANK = { authorName: '', authorImage: null as PickedImage | null, rating: 5, title: '', text: '', active: true, displayOrder: 0 };

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[] | null>(null);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(BLANK);
  const { busy, notice, run } = useAction();

  const load = useCallback(async () => {
    try {
      setItems((await api<{ items: Testimonial[] }>('/admin/testimonials')).items);
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
      if (editingId) await api(`/admin/testimonials/${editingId}`, { method: 'PATCH', body: form });
      else await api('/admin/testimonials', { method: 'POST', body: form });
      await load();
    }, 'Testimonial saved.');
    if (ok) reset();
  };

  return (
    <>
      <PageHeader title="Testimonials" />
      <Notice notice={notice} />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Loading error={error} ready={!!items}>
          <Table head={['Name', 'Rating', 'Text', 'Order', 'Status', '']} empty={!items?.length}>
            {items?.map((item) => (
              <tr key={item._id}>
                <Td className="font-semibold">{item.authorName}</Td>
                <Td>{item.rating} / 5</Td>
                <Td className="max-w-xs">{item.text}</Td>
                <Td>{item.displayOrder}</Td>
                <Td>
                  <Badge tone={item.active ? 'good' : 'plain'}>{item.active ? 'Showing' : 'Hidden'}</Badge>
                </Td>
                <Td className="whitespace-nowrap">
                  <ActionLink
                    onClick={() => {
                      setEditingId(item._id);
                      setForm({ authorName: item.authorName, authorImage: item.authorImage ?? null, rating: item.rating, title: item.title, text: item.text, active: item.active, displayOrder: item.displayOrder });
                    }}>
                    Edit
                  </ActionLink>
                  <ActionLink
                    danger
                    onClick={() => {
                      if (!window.confirm(`Delete the testimonial from ${item.authorName}?`)) return;
                      void run(async () => {
                        await api(`/admin/testimonials/${item._id}`, { method: 'DELETE' });
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
        <Panel title={editingId ? 'Edit testimonial' : 'Add testimonial'}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Name" required maxLength={100} value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} />
            <ImageField label="Photo (optional)" value={form.authorImage} onChange={(image) => setForm({ ...form, authorImage: image })} />
            <Field label="Rating (1 to 5)" type="number" min={1} max={5} step={0.5} required value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
            <Field label="Title (optional)" maxLength={150} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div>
              <label htmlFor="testimonial-text" className="mb-1.5 block text-sm font-medium">
                Testimonial
              </label>
              <textarea id="testimonial-text" required minLength={3} maxLength={1000} rows={4} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} className="w-full rounded-lg border border-line p-3 text-base focus:border-bronze focus:outline-none sm:text-sm" />
            </div>
            <Field label="Display order" hint="Lower numbers show first." type="number" min={0} value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
            <Checkbox label="Show on the website" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
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
