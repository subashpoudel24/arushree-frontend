'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Checkbox, Loading, Notice, PageHeader, Panel, useAction } from '@/components/admin/kit';
import { Button } from '@/components/ui';
import { api, errorMessage } from '@/lib/api';

interface Settings {
  cod: boolean;
  esewa: boolean;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [esewaConfigured, setEsewaConfigured] = useState(false);
  const [error, setError] = useState('');
  const { busy, notice, run } = useAction();

  useEffect(() => {
    api<{ settings: Settings; esewaConfigured: boolean }>('/admin/settings/payments')
      .then((data) => {
        setSettings(data.settings);
        setEsewaConfigured(data.esewaConfigured);
      })
      .catch((err) => setError(errorMessage(err)));
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void run(() => api('/admin/settings/payments', { method: 'PUT', body: settings }), 'Payment settings saved.');
  };

  return (
    <>
      <PageHeader title="Payment settings" />
      <Notice notice={notice} />
      <Loading error={error} ready={!!settings}>
        {settings && (
          <div className="max-w-lg">
            <Panel title="Offered at checkout">
              <form onSubmit={submit} className="space-y-2">
                <Checkbox label="Cash on delivery" checked={settings.cod} onChange={(e) => setSettings({ ...settings, cod: e.target.checked })} />
                <Checkbox label="eSewa" checked={settings.esewa} onChange={(e) => setSettings({ ...settings, esewa: e.target.checked })} />
                {!esewaConfigured && <p className="text-sm text-muted">eSewa stays hidden until its merchant details are added to the server.</p>}
                <div className="pt-2">
                  <Button type="submit" loading={busy}>
                    Save
                  </Button>
                </div>
              </form>
            </Panel>
          </div>
        )}
      </Loading>
    </>
  );
}
