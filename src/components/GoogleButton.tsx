'use client';

import Script from 'next/script';
import { useCallback, useRef } from 'react';
import { User } from '@/contexts/AuthContext';
import { api, errorMessage } from '@/lib/api';

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

interface GoogleIdentity {
  accounts: {
    id: {
      initialize: (config: { client_id: string; callback: (r: { credential: string }) => void }) => void;
      renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
    };
  };
}

interface Props {
  onSuccess: (user: User) => void;
  onError: (message: string) => void;
}

export const GoogleButton = ({ onSuccess, onError }: Props) => {
  const container = useRef<HTMLDivElement>(null);

  const render = useCallback(() => {
    const google = (window as unknown as { google?: GoogleIdentity }).google;
    if (!google || !clientId || !container.current) return;
    google.accounts.id.initialize({
      client_id: clientId,
      callback: async ({ credential }) => {
        try {
          const data = await api<{ user: User }>('/auth/google', {
            method: 'POST',
            body: { credential },
            skipRefresh: true,
          });
          onSuccess(data.user);
        } catch (err) {
          onError(errorMessage(err));
        }
      },
    });
    google.accounts.id.renderButton(container.current, { theme: 'outline', size: 'large', width: 320 });
  }, [onSuccess, onError]);

  if (!clientId) return null;

  return (
    <>
      <div className="my-5 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
      </div>
      <div ref={container} className="flex justify-center" />
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={render} />
    </>
  );
};
