'use client';

import { useState } from 'react';
import { ActionLink, Badge, Loading, Notice, PageHeader, Pagination, Select, dateTimeText, useAction, useList } from '@/components/admin/kit';
import { api } from '@/lib/api';

interface Message {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read';
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [status, setStatus] = useState('');
  const { data, page, setPage, error, reload } = useList<Message>('/admin/messages', status ? `status=${status}` : '');
  const { notice, run } = useAction();

  return (
    <>
      <PageHeader title="Messages" />
      <Notice notice={notice} />
      <div className="mb-4 max-w-xs">
        <Select label="Show" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All messages</option>
          <option value="new">New</option>
          <option value="read">Read</option>
        </Select>
      </div>
      <Loading error={error} ready={!!data}>
        {data && (
          <>
            {data.items.length === 0 ? (
              <p className="rounded-2xl border border-line bg-white p-10 text-center text-sm text-muted">No messages.</p>
            ) : (
              <ul className="space-y-3">
                {data.items.map((item) => (
                  <li key={item._id} className="rounded-2xl border border-line bg-white p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{item.subject || '(No subject)'}</p>
                      <Badge tone={item.status === 'new' ? 'warn' : 'plain'}>{item.status === 'new' ? 'New' : 'Read'}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {item.name} ·{' '}
                      <a href={`mailto:${encodeURIComponent(item.email)}`} className="underline">
                        {item.email}
                      </a>{' '}
                      · {dateTimeText(item.createdAt)}
                    </p>
                    <p className="mt-3 whitespace-pre-line text-sm">{item.message}</p>
                    <div className="mt-2">
                      <ActionLink
                        onClick={() =>
                          void run(async () => {
                            await api(`/admin/messages/${item._id}`, { method: 'PATCH', body: { status: item.status === 'new' ? 'read' : 'new' } });
                            await reload();
                          })
                        }>
                        Mark {item.status === 'new' ? 'read' : 'new'}
                      </ActionLink>
                      <ActionLink
                        danger
                        onClick={() => {
                          if (!window.confirm('Delete this message?')) return;
                          void run(async () => {
                            await api(`/admin/messages/${item._id}`, { method: 'DELETE' });
                            await reload();
                          });
                        }}>
                        Delete
                      </ActionLink>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Pagination page={page} pages={data.pages} onPage={setPage} />
          </>
        )}
      </Loading>
    </>
  );
}
