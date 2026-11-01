'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useCallback, useState } from 'react';
import { GoogleButton } from '@/components/GoogleButton';
import { Alert, AuthCard, Button, Field, safeNextPath } from '@/components/ui';
import { User, useAuth } from '@/contexts/AuthContext';
import { api, errorMessage } from '@/lib/api';

const SignInForm = () => {
  const { setUser } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const finish = useCallback(
    (user: User) => {
      setUser(user);
      router.push(safeNextPath(params.get('next')));
    },
    [setUser, router, params]
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api<{ user: User }>('/auth/login', {
        method: 'POST',
        body: { email, password },
        skipRefresh: true,
      });
      finish(data.user);
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={submit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="Password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="text-right">
          <Link href="/forgot-password" className="text-sm font-medium text-bronze underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" loading={loading} className="w-full">
          Sign in
        </Button>
      </form>
      <GoogleButton onSuccess={finish} onError={setError} />
      <p className="mt-6 text-center text-sm text-muted">
        New here?{' '}
        <Link href="/signup" className="font-semibold text-bronze underline">
          Create an account
        </Link>
      </p>
    </>
  );
};

export default function SignInPage() {
  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your account">
      <Suspense>
        <SignInForm />
      </Suspense>
    </AuthCard>
  );
}
