'use client';

import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { ImageField } from '@/components/admin/ImageField';
import { Checkbox, Loading, Notice, PageHeader, Panel, useAction } from '@/components/admin/kit';
import { Button, Field } from '@/components/ui';
import { api, errorMessage } from '@/lib/api';
import type { Banner, Homepage } from '@/lib/content';

const SECTION_LABELS: Record<string, string> = {
  new_products: 'New products',
  categories: 'Shop by category',
  featured: 'Featured products',
  testimonials: 'Testimonials',
};

const move = <T,>(list: T[], index: number, by: number) => {
  const next = [...list];
  const [item] = next.splice(index, 1);
  next.splice(index + by, 0, item);
  return next;
};

export default function AdminHomepagePage() {
  const [form, setForm] = useState<Homepage | null>(null);
  const [error, setError] = useState('');
  const [newImageMissing, setNewImageMissing] = useState(false);
  const { busy, notice, run } = useAction();

  useEffect(() => {
    api<{ homepage: Homepage }>('/admin/homepage')
      .then((data) => setForm(data.homepage))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  const setBanner = (index: number, patch: Partial<Banner>) =>
    setForm((current) => current && { ...current, banners: current.banners.map((banner, i) => (i === index ? { ...banner, ...patch } : banner)) });

  const highlights = form?.highlights ?? [];
  const setHighlight = (index: number, patch: Partial<NonNullable<Homepage['highlights']>[number]>) =>
    setForm((current) => current && { ...current, highlights: (current.highlights ?? []).map((item, i) => (i === index ? { ...item, ...patch } : item)) });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    if (form.banners.some((banner) => !banner.desktopImage?.url)) {
      setNewImageMissing(true);
      return;
    }
    setNewImageMissing(false);
    void run(() => api('/admin/homepage', { method: 'PUT', body: form }), 'Homepage saved. It is live now.');
  };

  return (
    <>
      <PageHeader title="Homepage" />
      <Notice notice={notice} />
      {newImageMissing && <Notice notice={{ type: 'error', text: 'Every banner needs a desktop image.' }} />}
      <Loading error={error} ready={!!form}>
        {form && (
          <form onSubmit={submit} className="max-w-4xl space-y-6">
            <Panel title="Notice bar">
              <div className="space-y-3">
                <Checkbox label="Show the notice bar" checked={form.noticeBar.enabled} onChange={(e) => setForm({ ...form, noticeBar: { ...form.noticeBar, enabled: e.target.checked } })} />
                <Field label="Text" maxLength={200} value={form.noticeBar.text} onChange={(e) => setForm({ ...form, noticeBar: { ...form.noticeBar, text: e.target.value } })} />
                <Field label="Link (optional)" hint="Like /shop, or a full https:// address." value={form.noticeBar.link ?? ''} onChange={(e) => setForm({ ...form, noticeBar: { ...form.noticeBar, link: e.target.value } })} />
              </div>
            </Panel>

            <Panel title="Trust section (below the banner)">
              <Checkbox label="Show this section" checked={form.showHighlights !== false} onChange={(e) => setForm({ ...form, showHighlights: e.target.checked })} />
              <div className="mt-3 space-y-4">
                {highlights.map((item, index) => (
                  <fieldset key={index} className="rounded-xl border border-line p-4">
                    <legend className="px-1 text-sm font-semibold">Item {index + 1}</legend>
                    <div className="grid items-end gap-4 sm:grid-cols-[1fr_1fr_auto]">
                      <ImageField label="Icon or image" value={item.image} onChange={(image) => setHighlight(index, { image })} />
                      <Field label="Text" required maxLength={60} value={item.text} onChange={(e) => setHighlight(index, { text: e.target.value })} />
                      <div className="flex">
                        <button type="button" aria-label={`Move item ${index + 1} up`} disabled={index === 0} onClick={() => setForm({ ...form, highlights: move(highlights, index, -1) })} className="flex size-11 items-center justify-center disabled:opacity-30">
                          <ArrowUp size={18} aria-hidden />
                        </button>
                        <button type="button" aria-label={`Move item ${index + 1} down`} disabled={index === highlights.length - 1} onClick={() => setForm({ ...form, highlights: move(highlights, index, 1) })} className="flex size-11 items-center justify-center disabled:opacity-30">
                          <ArrowDown size={18} aria-hidden />
                        </button>
                        <button type="button" aria-label={`Remove item ${index + 1}`} onClick={() => setForm({ ...form, highlights: highlights.filter((_, i) => i !== index) })} className="flex size-11 items-center justify-center text-danger">
                          <Trash2 size={18} aria-hidden />
                        </button>
                      </div>
                    </div>
                  </fieldset>
                ))}
              </div>
              <div className="mt-4">
                <Button type="button" variant="outline" disabled={highlights.length >= 6} onClick={() => setForm({ ...form, highlights: [...highlights, { text: '' }] })}>
                  Add item
                </Button>
              </div>
            </Panel>

            <Panel title="Banners">
              <div className="space-y-6">
                {form.banners.map((banner, index) => (
                  <fieldset key={index} className="space-y-3 rounded-xl border border-line p-4">
                    <legend className="px-1 text-sm font-semibold">Banner {index + 1}</legend>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Checkbox label="Showing" checked={banner.enabled} onChange={(e) => setBanner(index, { enabled: e.target.checked })} />
                      <div className="flex">
                        <button type="button" aria-label={`Move banner ${index + 1} up`} disabled={index === 0} onClick={() => setForm({ ...form, banners: move(form.banners, index, -1) })} className="flex size-11 items-center justify-center disabled:opacity-30">
                          <ArrowUp size={18} aria-hidden />
                        </button>
                        <button type="button" aria-label={`Move banner ${index + 1} down`} disabled={index === form.banners.length - 1} onClick={() => setForm({ ...form, banners: move(form.banners, index, 1) })} className="flex size-11 items-center justify-center disabled:opacity-30">
                          <ArrowDown size={18} aria-hidden />
                        </button>
                        <button type="button" aria-label={`Remove banner ${index + 1}`} onClick={() => setForm({ ...form, banners: form.banners.filter((_, i) => i !== index) })} className="flex size-11 items-center justify-center text-danger">
                          <Trash2 size={18} aria-hidden />
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Heading (optional)" hint="Leave the text empty if your image already includes its wording." maxLength={120} value={banner.heading} onChange={(e) => setBanner(index, { heading: e.target.value })} />
                      <Field label="Smaller text (optional)" maxLength={250} value={banner.subheading} onChange={(e) => setBanner(index, { subheading: e.target.value })} />
                      <Field label="Button text (optional)" maxLength={40} value={banner.buttonText} onChange={(e) => setBanner(index, { buttonText: e.target.value })} />
                      <Field label="Link" hint="Where the banner goes when clicked, like /shop." value={banner.buttonLink ?? ''} onChange={(e) => setBanner(index, { buttonLink: e.target.value })} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ImageField label="Desktop image" value={banner.desktopImage?.url ? banner.desktopImage : null} removable={false} onChange={(image) => image && setBanner(index, { desktopImage: image })} />
                      <ImageField label="Phone image (optional)" hint="A taller version keeps text readable on phones." value={banner.mobileImage} onChange={(image) => setBanner(index, { mobileImage: image })} />
                    </div>
                    <Field
                      label="Describe the image (for screen readers and search)"
                      maxLength={200}
                      value={banner.desktopImage?.alt ?? ''}
                      onChange={(e) => setBanner(index, { desktopImage: { ...banner.desktopImage, alt: e.target.value } })}
                    />
                  </fieldset>
                ))}
              </div>
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setForm({
                      ...form,
                      banners: [...form.banners, { heading: '', subheading: '', buttonText: '', buttonLink: '', desktopImage: { url: '' }, enabled: true }],
                    })
                  }>
                  Add banner
                </Button>
              </div>
            </Panel>

            <Panel title="Sections, top to bottom">
              <ul className="divide-y divide-line">
                {form.sections.map((section, index) => (
                  <li key={section.key} className="flex items-center justify-between gap-3">
                    <Checkbox
                      label={SECTION_LABELS[section.key]}
                      checked={section.enabled}
                      onChange={(e) => setForm({ ...form, sections: form.sections.map((item, i) => (i === index ? { ...item, enabled: e.target.checked } : item)) })}
                    />
                    <div className="flex">
                      <button type="button" aria-label={`Move ${SECTION_LABELS[section.key]} up`} disabled={index === 0} onClick={() => setForm({ ...form, sections: move(form.sections, index, -1) })} className="flex size-11 items-center justify-center disabled:opacity-30">
                        <ArrowUp size={18} aria-hidden />
                      </button>
                      <button type="button" aria-label={`Move ${SECTION_LABELS[section.key]} down`} disabled={index === form.sections.length - 1} onClick={() => setForm({ ...form, sections: move(form.sections, index, 1) })} className="flex size-11 items-center justify-center disabled:opacity-30">
                        <ArrowDown size={18} aria-hidden />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>

            <Button type="submit" loading={busy}>
              Save homepage
            </Button>
          </form>
        )}
      </Loading>
    </>
  );
}
