'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ImageField } from '@/components/admin/ImageField';
import { Loading, Notice, PageHeader, Panel, useAction } from '@/components/admin/kit';
import { Button, Field } from '@/components/ui';
import { api, errorMessage } from '@/lib/api';
import type { SiteSettings } from '@/lib/content';

const SOCIALS = [
  ['facebook', 'Facebook'],
  ['instagram', 'Instagram'],
  ['tiktok', 'TikTok'],
  ['youtube', 'YouTube'],
] as const;

export default function AdminSitePage() {
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [error, setError] = useState('');
  const { busy, notice, run } = useAction();

  useEffect(() => {
    api<{ site: SiteSettings }>('/admin/site')
      .then((data) => setForm(data.site))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void run(() => api('/admin/site', { method: 'PUT', body: form }), 'Site settings saved.');
  };

  return (
    <>
      <PageHeader title="Site settings" />
      <Notice notice={notice} />
      <Loading error={error} ready={!!form}>
        {form && (
          <form onSubmit={submit} className="max-w-3xl space-y-6">
            <Panel title="Brand">
              <div className="space-y-4">
                <Field label="Site name" required maxLength={100} value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} />
                <ImageField label="Logo" value={form.logo} removable={false} onChange={(image) => image && setForm({ ...form, logo: image })} />
                <Field label="Footer text" maxLength={300} value={form.footerText} onChange={(e) => setForm({ ...form, footerText: e.target.value })} />
              </div>
            </Panel>
            <Panel title="Contact details">
              <div className="space-y-4">
                <Field label="Phone" maxLength={50} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <Field label="Email" type="email" hint="Contact form messages are also sent here." value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Field label="Address" maxLength={300} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
            </Panel>
            <Panel title="Social links">
              <div className="space-y-4">
                {SOCIALS.map(([key, label]) => (
                  <Field key={key} label={label} type="url" placeholder="https://" value={form.social?.[key] ?? ''} onChange={(e) => setForm({ ...form, social: { ...form.social, [key]: e.target.value } })} />
                ))}
              </div>
            </Panel>
            <Panel title="Analytics">
              <Field label="Google Analytics ID (optional)" hint="Like G-XXXXXXXXXX. Leave empty to turn analytics off." value={form.googleAnalyticsId ?? ''} onChange={(e) => setForm({ ...form, googleAnalyticsId: e.target.value })} />
            </Panel>
            <Button type="submit" loading={busy}>
              Save settings
            </Button>
          </form>
        )}
      </Loading>
    </>
  );
}
