'use client';

import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import Editor from 'react-simple-wysiwyg';
import { useAdmin } from '@/components/admin/AdminShell';
import { ChooseImageButton, PickedImage } from '@/components/admin/ImagePicker';
import { ActionLink, Checkbox, Notice, Panel, Select, titleCase, useAction } from '@/components/admin/kit';
import { Button, Field } from '@/components/ui';
import { api } from '@/lib/api';

interface Category {
  _id: string;
  name: string;
  section: string;
}

export interface ProductData {
  _id?: string;
  name: string;
  slug?: string;
  shortDescription: string;
  description: string;
  price: number | '';
  compareAtPrice?: number | '' | null;
  stock: number | '';
  status: 'draft' | 'published';
  featured: boolean;
  images: PickedImage[];
  specifications: { title: string; description: string }[];
  categories: (string | { _id: string })[];
  seoTitle?: string;
  seoDescription?: string;
}

const BLANK: ProductData = {
  name: '',
  shortDescription: '',
  description: '',
  price: '',
  compareAtPrice: '',
  stock: 0,
  status: 'draft',
  featured: false,
  images: [],
  specifications: [],
  categories: [],
  seoTitle: '',
  seoDescription: '',
};

export const ProductForm = ({ product }: { product?: ProductData }) => {
  const router = useRouter();
  const { can } = useAdmin();
  const canEdit = can('products.write');
  const [form, setForm] = useState<ProductData>(() => ({ ...BLANK, ...product }));
  const [categories, setCategories] = useState<Category[]>([]);
  const { busy, notice, run, setNotice } = useAction();
  const selected = form.categories.map((c) => (typeof c === 'string' ? c : c._id));

  useEffect(() => {
    api<{ items: Category[] }>('/admin/categories')
      .then((data) => setCategories(data.items))
      .catch(() => setNotice({ type: 'error', text: 'Could not load categories.' }));
  }, [setNotice]);

  const set = <K extends keyof ProductData>(key: K, value: ProductData[K]) => setForm((current) => ({ ...current, [key]: value }));

  const moveImage = (index: number, by: number) => {
    const images = [...form.images];
    const [image] = images.splice(index, 1);
    images.splice(index + by, 0, image);
    set('images', images);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const body = {
      name: form.name,
      ...(form.slug && { slug: form.slug }),
      shortDescription: form.shortDescription,
      description: form.description,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice === '' || form.compareAtPrice == null ? null : Number(form.compareAtPrice),
      stock: Number(form.stock),
      status: form.status,
      featured: form.featured,
      images: form.images.map(({ url, publicId, alt }) => ({ url, ...(publicId && { publicId }), ...(alt && { alt }) })),
      specifications: form.specifications.filter((spec) => spec.title.trim() && spec.description.trim()),
      categories: selected,
      ...(form.seoTitle && { seoTitle: form.seoTitle }),
      ...(form.seoDescription && { seoDescription: form.seoDescription }),
    };
    await run(async () => {
      if (product?._id) {
        const { product: saved } = await api<{ product: ProductData }>(`/admin/products/${product._id}`, { method: 'PATCH', body });
        set('slug', saved.slug);
        setNotice({ type: 'success', text: 'Product saved.' });
      } else {
        const { product: saved } = await api<{ product: ProductData }>('/admin/products', { method: 'POST', body });
        router.replace(`/admin/products/${saved._id}`);
      }
    });
  };

  const remove = async () => {
    if (!product?._id || !window.confirm(`Delete "${product.name}"? Past orders keep their own copy.`)) return;
    const ok = await run(() => api(`/admin/products/${product._id}`, { method: 'DELETE' }));
    if (ok) router.replace('/admin/products');
  };

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Notice notice={notice} />
        <Panel title="Details">
          <div className="space-y-4">
            <Field label="Name" required maxLength={200} value={form.name} onChange={(e) => set('name', e.target.value)} />
            <Field label="Short description" maxLength={500} value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} />
            <div>
              <span className="mb-1.5 block text-sm font-medium">Full description</span>
              <div className="bg-white text-sm [&_.rsw-ce]:min-h-40">
                <Editor value={form.description} onChange={(e) => set('description', e.target.value)} />
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Images">
          <p className="mb-3 text-sm text-muted">The first image is the one shown in the shop.</p>
          {form.images.length > 0 && (
            <ul className="mb-4 space-y-3">
              {form.images.map((image, index) => (
                <li key={image.url} className="flex flex-wrap items-center gap-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-sand">
                    <Image src={image.url} alt="" fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="min-w-40 flex-1">
                    <Field
                      label={`Description of image ${index + 1}, for screen readers`}
                      maxLength={200}
                      value={image.alt ?? ''}
                      onChange={(e) => set('images', form.images.map((item, i) => (i === index ? { ...item, alt: e.target.value } : item)))}
                    />
                  </div>
                  <div className="flex">
                    <button type="button" aria-label={`Move image ${index + 1} up`} disabled={index === 0} onClick={() => moveImage(index, -1)} className="flex size-11 items-center justify-center disabled:opacity-30">
                      <ArrowUp size={18} aria-hidden />
                    </button>
                    <button type="button" aria-label={`Move image ${index + 1} down`} disabled={index === form.images.length - 1} onClick={() => moveImage(index, 1)} className="flex size-11 items-center justify-center disabled:opacity-30">
                      <ArrowDown size={18} aria-hidden />
                    </button>
                    <button type="button" aria-label={`Remove image ${index + 1}`} onClick={() => set('images', form.images.filter((_, i) => i !== index))} className="flex size-11 items-center justify-center text-danger">
                      <Trash2 size={18} aria-hidden />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {can('media.write') && (
            <ChooseImageButton
              label="Add image"
              onPick={(image) => {
                if (!form.images.some((item) => item.url === image.url)) set('images', [...form.images, image]);
              }}
            />
          )}
        </Panel>

        <Panel title="Specifications">
          <div className="space-y-3">
            {form.specifications.map((spec, index) => (
              <div key={index} className="flex flex-wrap items-end gap-2">
                <div className="min-w-32 flex-1">
                  <Field label="Title" maxLength={100} value={spec.title} onChange={(e) => set('specifications', form.specifications.map((s, i) => (i === index ? { ...s, title: e.target.value } : s)))} />
                </div>
                <div className="min-w-32 flex-[2]">
                  <Field label="Value" maxLength={500} value={spec.description} onChange={(e) => set('specifications', form.specifications.map((s, i) => (i === index ? { ...s, description: e.target.value } : s)))} />
                </div>
                <button type="button" aria-label={`Remove specification ${index + 1}`} onClick={() => set('specifications', form.specifications.filter((_, i) => i !== index))} className="flex size-11 items-center justify-center text-danger">
                  <Trash2 size={18} aria-hidden />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <Button type="button" variant="outline" onClick={() => set('specifications', [...form.specifications, { title: '', description: '' }])}>
              Add specification
            </Button>
          </div>
        </Panel>

        <Panel title="Search engines (optional)">
          <div className="space-y-4">
            <Field label="Web address name" hint="Leave as is unless you need to change it. Letters, numbers and hyphens." value={form.slug ?? ''} onChange={(e) => set('slug', e.target.value)} />
            <Field label="Search title" maxLength={120} value={form.seoTitle ?? ''} onChange={(e) => set('seoTitle', e.target.value)} />
            <Field label="Search description" maxLength={300} value={form.seoDescription ?? ''} onChange={(e) => set('seoDescription', e.target.value)} />
          </div>
        </Panel>
      </div>

      <div className="space-y-6">
        <Panel title="Publishing">
          <div className="space-y-3">
            <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value as ProductData['status'])}>
              <option value="draft">Draft (hidden from the shop)</option>
              <option value="published">Published</option>
            </Select>
            <Checkbox label="Featured on the home page" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} />
          </div>
        </Panel>
        <Panel title="Price and stock">
          <div className="space-y-4">
            <Field label="Selling price (Rs.)" type="number" min={0} step="0.01" required value={form.price} onChange={(e) => set('price', e.target.value === '' ? '' : Number(e.target.value))} />
            <Field label="Crossed-out price (Rs.)" hint="Optional. Must be higher than the selling price." type="number" min={0} step="0.01" value={form.compareAtPrice ?? ''} onChange={(e) => set('compareAtPrice', e.target.value === '' ? '' : Number(e.target.value))} />
            <Field label="Stock" type="number" min={0} step={1} required value={form.stock} onChange={(e) => set('stock', e.target.value === '' ? '' : Number(e.target.value))} />
          </div>
        </Panel>
        <Panel title="Categories">
          {categories.length === 0 ? (
            <p className="text-sm text-muted">No categories yet.</p>
          ) : (
            categories.map((category) => (
              <Checkbox
                key={category._id}
                label={`${category.name} (${titleCase(category.section)})`}
                checked={selected.includes(category._id)}
                onChange={(e) => set('categories', e.target.checked ? [...selected, category._id] : selected.filter((id) => id !== category._id))}
              />
            ))
          )}
        </Panel>
        {canEdit ? (
          <div className="flex items-center justify-between gap-3">
            <Button type="submit" loading={busy} className="flex-1">
              Save product
            </Button>
            {product?._id && (
              <ActionLink danger disabled={busy} onClick={remove}>
                Delete
              </ActionLink>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted">You can view products but not change them.</p>
        )}
      </div>
    </form>
  );
};
