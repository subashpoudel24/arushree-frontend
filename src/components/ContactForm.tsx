'use client';

import { FormEvent, useState } from 'react';
import { Alert, Button, Field } from '@/components/ui';
import { api, errorMessage } from '@/lib/api';

const BLANK = { name: '', email: '', subject: '', message: '', website: '' };

export const ContactForm = () => {
  const [form, setForm] = useState(BLANK);
  const [notice, setNotice] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setNotice(null);
    setLoading(true);
    try {
      const data = await api<{ message: string }>('/contact', { method: 'POST', body: form, skipRefresh: true });
      setNotice({ type: 'success', text: data.message });
      setForm(BLANK);
    } catch (err) {
      setNotice({ type: 'error', text: errorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-3xl border border-line bg-white p-6 sm:p-10">
      <h2 className="font-display text-3xl font-medium">Send us a message</h2>
      {notice && <Alert type={notice.type}>{notice.text}</Alert>}
      <Field label="Your name" autoComplete="name" required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <Field label="Email" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <Field label="Subject (optional)" maxLength={200} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium">
          Message
        </label>
        <textarea id="contact-message" required minLength={5} maxLength={5000} rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full rounded-lg border border-line p-3 text-base focus:border-bronze focus:outline-none sm:text-sm" />
      </div>
      {/* Hidden from people. Bots fill it in, which marks their message as spam. */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
        </label>
      </div>
      <Button type="submit" loading={loading}>
        Send message
      </Button>
    </form>
  );
};
