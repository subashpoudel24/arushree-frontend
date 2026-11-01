import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, useId } from 'react';

export const Button = ({
  loading,
  variant = 'primary',
  className = '',
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; variant?: 'primary' | 'outline' }) => (
  <button
    {...props}
    disabled={disabled || loading}
    aria-busy={loading}
    className={`inline-flex min-h-11 items-center justify-center rounded-lg px-5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
      variant === 'primary'
        ? 'bg-gold text-ink hover:bg-gold-strong'
        : 'border border-line bg-white text-ink hover:bg-sand'
    } ${className}`}>
    {loading ? 'Please wait…' : children}
  </button>
);

export const Field = ({
  label,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) => {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={hint ? `${id}-hint` : undefined}
        {...props}
        className="min-h-11 w-full rounded-lg border border-line bg-white px-3 text-base focus:border-bronze focus:outline-none disabled:bg-sand sm:text-sm"
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
};

export const Alert = ({ type = 'error', children }: { type?: 'error' | 'success'; children: ReactNode }) => (
  <p
    role={type === 'error' ? 'alert' : 'status'}
    className={`rounded-lg px-3 py-2.5 text-sm ${
      type === 'error' ? 'bg-red-50 text-danger' : 'bg-green-50 text-success'
    }`}>
    {children}
  </p>
);

export const Spinner = ({ label = 'Loading' }: { label?: string }) => (
  <div role="status" className="flex justify-center py-20">
    <span className="size-8 animate-spin rounded-full border-2 border-line border-t-bronze" />
    <span className="sr-only">{label}</span>
  </div>
);

export const AuthCard = ({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) => (
  <main className="mx-auto w-full max-w-md px-4 py-12 sm:py-16">
    <h1 className="text-center font-display text-3xl font-semibold">{title}</h1>
    {subtitle && <p className="mt-2 text-center text-sm text-muted">{subtitle}</p>}
    <div className="mt-8 rounded-2xl border border-line bg-white p-6 sm:p-8">{children}</div>
  </main>
);

// Only same-site paths, so a crafted ?next= link cannot send people to another website.
export const safeNextPath = (value: string | null, fallback = '/') =>
  value && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') ? value : fallback;
