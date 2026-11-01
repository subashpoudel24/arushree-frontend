'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useState } from 'react';
import { RequireUser } from '@/components/RequireUser';
import { Alert, Button, Field } from '@/components/ui';
import { User, useAuth } from '@/contexts/AuthContext';
import { api, errorMessage } from '@/lib/api';

const ProfileForm = ({ user }: { user: User }) => {
  const { setUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [notice, setNotice] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setNotice(null);
    setLoading(true);
    try {
      const data = await api<{ user: User }>('/account/profile', { method: 'PATCH', body: { name, phone } });
      setUser(data.user);
      setNotice({ type: 'success', text: 'Your profile has been saved.' });
    } catch (err) {
      setNotice({ type: 'error', text: errorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-line bg-white p-6">
      <h2 className="font-display text-xl font-semibold">Profile</h2>
      {notice && <Alert type={notice.type}>{notice.text}</Alert>}
      <Field label="Full name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
      <Field label="Email" type="email" value={user.email} disabled readOnly />
      <Field label="Phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <Button type="submit" loading={loading}>
        Save changes
      </Button>
    </form>
  );
};

const AvatarForm = ({ user }: { user: User }) => {
  const { setUser } = useAuth();
  const [notice, setNotice] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const upload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setNotice(null);
    setLoading(true);
    try {
      const body = new FormData();
      body.append('image', file);
      const data = await api<{ user: User }>('/account/avatar', { method: 'POST', body });
      setUser(data.user);
      setNotice({ type: 'success', text: 'Your photo has been updated.' });
    } catch (err) {
      setNotice({ type: 'error', text: errorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4 rounded-2xl border border-line bg-white p-6">
      <h2 className="font-display text-xl font-semibold">Profile photo</h2>
      {notice && <Alert type={notice.type}>{notice.text}</Alert>}
      <div className="flex items-center gap-4">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-sand">
          {user.avatarUrl && <Image src={user.avatarUrl} alt="" fill sizes="64px" className="object-cover" />}
        </div>
        <div>
          <label className="inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-line px-4 text-sm font-semibold hover:bg-sand has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-bronze">
            {loading ? 'Uploading…' : 'Choose photo'}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={loading} onChange={upload} />
          </label>
          <p className="mt-1 text-xs text-muted">JPG, PNG or WebP, up to 5 MB.</p>
        </div>
      </div>
    </section>
  );
};

const PasswordForm = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [notice, setNotice] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setNotice(null);
    setLoading(true);
    try {
      const data = await api<{ message: string }>('/account/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
      });
      setNotice({ type: 'success', text: `${data.message} Other devices have been signed out.` });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setNotice({ type: 'error', text: errorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-line bg-white p-6">
      <h2 className="font-display text-xl font-semibold">Change password</h2>
      {notice && <Alert type={notice.type}>{notice.text}</Alert>}
      <Field label="Current password" type="password" autoComplete="current-password" hint="Leave empty if you only use Google to sign in." value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
      <Field label="New password" type="password" autoComplete="new-password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      <Button type="submit" loading={loading}>
        Update password
      </Button>
    </form>
  );
};

const Account = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-12">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">My account</h1>
        <Button
          variant="outline"
          onClick={async () => {
            await logout();
            router.push('/');
          }}>
          Sign out
        </Button>
      </div>
      <AvatarForm user={user!} />
      <ProfileForm user={user!} />
      <PasswordForm />
    </main>
  );
};

export default function AccountPage() {
  return (
    <RequireUser>
      <Account />
    </RequireUser>
  );
}
