'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import Editor from 'react-simple-wysiwyg';
import { ImageField } from '@/components/admin/ImageField';
import { PickedImage } from '@/components/admin/ImagePicker';
import { ActionLink, Notice, Panel, Select, useAction } from '@/components/admin/kit';
import { Button, Field } from '@/components/ui';
import { api } from '@/lib/api';

export interface BlogData {
  _id?: string;
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  image?: PickedImage | null;
  authorName: string;
  authorImage?: PickedImage | null;
  status: 'draft' | 'published';
  seoTitle?: string;
  seoDescription?: string;
}

const BLANK: BlogData = { title: '', excerpt: '', content: '', authorName: '', status: 'draft' };

export const BlogForm = ({ blog }: { blog?: BlogData }) => {
  const router = useRouter();
  const [form, setForm] = useState<BlogData>(() => ({ ...BLANK, ...blog }));
  const { busy, notice, run, setNotice } = useAction();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const body = {
      title: form.title,
      ...(form.slug && { slug: form.slug }),
      excerpt: form.excerpt,
      content: form.content,
      image: form.image ?? null,
      authorName: form.authorName,
      authorImage: form.authorImage ?? null,
      status: form.status,
      ...(form.seoTitle && { seoTitle: form.seoTitle }),
      ...(form.seoDescription && { seoDescription: form.seoDescription }),
    };
    await run(async () => {
      if (blog?._id) {
        const { blog: saved } = await api<{ blog: BlogData }>(`/admin/blogs/${blog._id}`, { method: 'PATCH', body });
        setForm((current) => ({ ...current, slug: saved.slug }));
        setNotice({ type: 'success', text: 'Article saved.' });
      } else {
        const { blog: saved } = await api<{ blog: BlogData }>('/admin/blogs', { method: 'POST', body });
        router.replace(`/admin/blogs/${saved._id}`);
      }
    });
  };

  const remove = async () => {
    if (!blog?._id || !window.confirm(`Delete "${blog.title}"?`)) return;
    const ok = await run(() => api(`/admin/blogs/${blog._id}`, { method: 'DELETE' }));
    if (ok) router.replace('/admin/blogs');
  };

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <Notice notice={notice} />
        <Panel title="Article">
          <div className="space-y-4">
            <Field label="Title" required maxLength={200} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Field label="Short summary" hint="Shown on the blog list and in search results." maxLength={500} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
            <div>
              <span className="mb-1.5 block text-sm font-medium">Content</span>
              <div className="bg-white text-sm [&_.rsw-ce]:min-h-72">
                <Editor value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
              </div>
            </div>
          </div>
        </Panel>
        <Panel title="Search engines (optional)">
          <div className="space-y-4">
            <Field label="Web address name" hint="Letters, numbers and hyphens." value={form.slug ?? ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <Field label="Search title" maxLength={120} value={form.seoTitle ?? ''} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
            <Field label="Search description" maxLength={300} value={form.seoDescription ?? ''} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} />
          </div>
        </Panel>
      </div>
      <div className="space-y-6">
        <Panel title="Publishing">
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as BlogData['status'] })}>
            <option value="draft">Draft (hidden)</option>
            <option value="published">Published</option>
          </Select>
        </Panel>
        <Panel title="Images and author">
          <div className="space-y-4">
            <ImageField label="Cover image" value={form.image} onChange={(image) => setForm({ ...form, image })} />
            <Field label="Author name" maxLength={100} value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} />
            <ImageField label="Author photo" value={form.authorImage} onChange={(image) => setForm({ ...form, authorImage: image })} />
          </div>
        </Panel>
        <div className="flex items-center justify-between gap-3">
          <Button type="submit" loading={busy} className="flex-1">
            Save article
          </Button>
          {blog?._id && (
            <ActionLink danger disabled={busy} onClick={remove}>
              Delete
            </ActionLink>
          )}
        </div>
      </div>
    </form>
  );
};
