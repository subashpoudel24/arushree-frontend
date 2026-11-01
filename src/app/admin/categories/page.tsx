'use client';

import Image from 'next/image';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useAdmin } from '@/components/admin/AdminShell';
import { ChooseImageButton, PickedImage } from '@/components/admin/ImagePicker';
import { ActionLink, Badge, Checkbox, Loading, Notice, PageHeader, Panel, Select, Table, Td, titleCase, useAction } from '@/components/admin/kit';
import { Button, Field } from '@/components/ui';
import { api, errorMessage } from '@/lib/api';

interface Category {
  _id: string;
  name: string;
  slug: string;
  section: string;
  image?: PickedImage;
  displayOrder: number;
  active: boolean;
}

const BLANK = { name: '', section: 'skincare', displayOrder: 0, active: true, image: undefined as PickedImage | undefined };

export default function AdminCategoriesPage() {
  const { can } = useAdmin();
  const canEdit = can('products.write');
  const [items, setItems] = useState<Category[] | null>(null);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(BLANK);
  const { busy, notice, run } = useAction();

  const load = useCallback(async () => {
    try {
      setItems((await api<{ items: Category[] }>('/admin/categories')).items);
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
    const { image, ...rest } = form;
    const ok = await run(async () => {
      const body = { ...rest, image: image ?? null };
      if (editingId) await api(`/admin/categories/${editingId}`, { method: 'PATCH', body });
      else await api('/admin/categories', { method: 'POST', body });
      await load();
    }, editingId ? 'Category saved.' : 'Category added.');
    if (ok) reset();
  };

  const remove = (category: Category) => {
    if (!window.confirm(`Delete "${category.name}"?`)) return;
    void run(async () => {
      await api(`/admin/categories/${category._id}`, { method: 'DELETE' });
      await load();
    });
  };

  return (
    <>
      <PageHeader title="Categories" />
      <Notice notice={notice} />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Loading error={error} ready={!!items}>
          <Table head={['', 'Name', 'Section', 'Order', 'Status', '']} empty={!items?.length}>
            {items?.map((category) => (
              <tr key={category._id}>
                <Td>
                  <div className="relative size-12 overflow-hidden rounded-lg bg-sand">
                    {category.image && <Image src={category.image.url} alt="" fill sizes="48px" className="object-cover" />}
                  </div>
                </Td>
                <Td className="font-semibold">{category.name}</Td>
                <Td>{titleCase(category.section)}</Td>
                <Td>{category.displayOrder}</Td>
                <Td>
                  <Badge tone={category.active ? 'good' : 'plain'}>{category.active ? 'Showing' : 'Hidden'}</Badge>
                </Td>
                <Td className="whitespace-nowrap">
                  {canEdit && (
                    <>
                      <ActionLink
                        onClick={() => {
                          setEditingId(category._id);
                          setForm({ name: category.name, section: category.section, displayOrder: category.displayOrder, active: category.active, image: category.image });
                        }}>
                        Edit
                      </ActionLink>
                      <ActionLink danger onClick={() => remove(category)}>
                        Delete
                      </ActionLink>
                    </>
                  )}
                </Td>
              </tr>
            ))}
          </Table>
        </Loading>
        {canEdit && (
          <Panel title={editingId ? 'Edit category' : 'Add category'}>
            <form onSubmit={submit} className="space-y-4">
              <Field label="Name" required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Select label="Section" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}>
                <option value="skincare">Skincare</option>
                <option value="oral-care">Oral care</option>
              </Select>
              <Field label="Display order" hint="Lower numbers show first." type="number" min={0} value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
              <Checkbox label="Show in the shop" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              <div className="flex flex-wrap items-center gap-3">
                {form.image && (
                  <div className="relative size-14 overflow-hidden rounded-lg bg-sand">
                    <Image src={form.image.url} alt="" fill sizes="56px" className="object-cover" />
                  </div>
                )}
                {can('media.write') && <ChooseImageButton label={form.image ? 'Change image' : 'Add image'} onPick={(image) => setForm({ ...form, image })} />}
                {form.image && (
                  <ActionLink danger onClick={() => setForm({ ...form, image: undefined })}>
                    Remove
                  </ActionLink>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit" loading={busy}>
                  {editingId ? 'Save' : 'Add category'}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={reset}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Panel>
        )}
      </div>
    </>
  );
}
