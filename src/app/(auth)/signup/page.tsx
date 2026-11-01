'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useState } from 'react';
import { GoogleButton } from '@/components/GoogleButton';
import { Alert, AuthCard, Button, Field } from '@/components/ui';
import { User, useAuth } from '@/contexts/AuthContext';
import { api, errorMessage } from '@/lib/api';

export default function SignUpPage() {
  const { setUser } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const finish = useCallback(
    (user: User) => {
      setUser(user);
      router.push('/');
    },
    [setUser, router]
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api<{ user: User }>('/auth/register', { method: 'POST', body: form, skipRefresh: true });
      finish(data.user);
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Create your account">
      <form onSubmit={submit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <Field label="Full name" autoComplete="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Field label="Email" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Field
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          hint="At least 8 characters."
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Button type="submit" loading={loading} className="w-full">
          Create account
        </Button>
      </form>
      <GoogleButton onSuccess={finish} onError={setError} />
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link href="/signin" className="font-semibold text-bronze underline">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
