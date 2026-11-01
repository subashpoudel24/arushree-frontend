'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Editor from 'react-simple-wysiwyg';
import { ActionLink, Badge, Checkbox, Loading, Notice, PageHeader, Panel, Table, Td, useAction } from '@/components/admin/kit';
import { Button, Field } from '@/components/ui';
import { api, errorMessage } from '@/lib/api';

interface Page {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  showInFooter: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

const BLANK: Page = { title: '', slug: '', content: '', published: true, showInFooter: true };
const SYSTEM_PATHS: Record<string, string> = { about: '/about', contact: '/contact' };

export default function AdminPagesPage() {
  const [items, setItems] = useState<Page[] | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Page | null>(null);
  const { busy, notice, run } = useAction();

  const load = useCallback(async () => {
    try {
      setItems((await api<{ items: Page[] }>('/admin/pages')).items);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const isSystem = !!editing && editing.slug in SYSTEM_PATHS;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const { _id, slug, title, content, published, showInFooter, seoTitle, seoDescription } = editing;
    const body = { title, content, published, showInFooter, ...(slug && { slug }), ...(seoTitle && { seoTitle }), ...(seoDescription && { seoDescription }) };
    const ok = await run(async () => {
      if (_id) await api(`/admin/pages/${_id}`, { method: 'PATCH', body });
      else await api('/admin/pages', { method: 'POST', body });
      await load();
    }, 'Page saved.');
    if (ok) setEditing(null);
  };

  return (
    <>
      <PageHeader title="Pages">
        <Button onClick={() => setEditing({ ...BLANK })}>Add page</Button>
      </PageHeader>
      <p className="mb-4 text-sm text-muted">Use these for your About text, privacy policy, terms and any other page.</p>
      <Notice notice={notice} />
      {editing && (
        <div className="mb-6">
          <Panel title={editing._id || isSystem ? `Edit ${editing.title}` : 'New page'}>
            <form onSubmit={submit} className="space-y-4">
              <Field label="Title" required maxLength={150} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              {!isSystem && <Field label="Web address name (optional)" hint="Made from the title if left empty." value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />}
              <div>
                <span className="mb-1.5 block text-sm font-medium">Content</span>
                <div className="bg-white text-sm [&_.rsw-ce]:min-h-56">
                  <Editor value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} />
                </div>
              </div>
              {!isSystem && <Checkbox label="Published" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />}
              <Checkbox label="Link in the footer" checked={editing.showInFooter} onChange={(e) => setEditing({ ...editing, showInFooter: e.target.checked })} />
              <Field label="Search title (optional)" maxLength={120} value={editing.seoTitle ?? ''} onChange={(e) => setEditing({ ...editing, seoTitle: e.target.value })} />
              <Field label="Search description (optional)" maxLength={300} value={editing.seoDescription ?? ''} onChange={(e) => setEditing({ ...editing, seoDescription: e.target.value })} />
              <div className="flex gap-2">
                <Button type="submit" loading={busy}>
                  Save page
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Panel>
        </div>
      )}
      <Loading error={error} ready={!!items}>
        <Table head={['Title', 'Address', 'Status', 'Footer', '']} empty={!items?.length}>
          {items?.map((page) => {
            const path = SYSTEM_PATHS[page.slug] ?? `/pages/${page.slug}`;
            return (
              <tr key={page.slug}>
                <Td className="font-semibold">{page.title}</Td>
                <Td>
                  <a href={path} target="_blank" rel="noopener noreferrer" className="underline">
                    {path}
                  </a>
                </Td>
                <Td>
                  <Badge tone={page.published ? 'good' : 'plain'}>{page.published ? 'Published' : 'Hidden'}</Badge>
                </Td>
                <Td>{page.showInFooter ? 'Yes' : 'No'}</Td>
                <Td className="whitespace-nowrap">
                  <ActionLink onClick={() => setEditing(page)}>Edit</ActionLink>
                  {page._id && !(page.slug in SYSTEM_PATHS) && (
                    <ActionLink
                      danger
                      onClick={() => {
                        if (!window.confirm(`Delete "${page.title}"?`)) return;
                        void run(async () => {
                          await api(`/admin/pages/${page._id}`, { method: 'DELETE' });
                          await load();
                        });
                      }}>
                      Delete
                    </ActionLink>
                  )}
                </Td>
              </tr>
            );
          })}
        </Table>
      </Loading>
    </>
  );
}
