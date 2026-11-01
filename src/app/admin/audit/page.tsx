'use client';

import { Loading, PageHeader, Pagination, Table, Td, dateTimeText, useList } from '@/components/admin/kit';

interface Entry {
  _id: string;
  actorName: string;
  actorEmail: string;
  method: string;
  path: string;
  fields: string[];
  ip?: string;
  createdAt: string;
}

const VERBS: Record<string, string> = { POST: 'Added', PATCH: 'Changed', PUT: 'Changed', DELETE: 'Deleted' };

export default function AdminAuditPage() {
  const { data, page, setPage, error } = useList<Entry>('/admin/audit-logs');

  return (
    <>
      <PageHeader title="Audit log" />
      <p className="mb-4 text-sm text-muted">Every change made in the admin panel. Only field names are recorded, never their values.</p>
      <Loading error={error} ready={!!data}>
        {data && (
          <>
            <Table head={['When', 'Who', 'Action', 'Where', 'Fields']} empty={!data.items.length}>
              {data.items.map((entry) => (
                <tr key={entry._id}>
                  <Td className="whitespace-nowrap">{dateTimeText(entry.createdAt)}</Td>
                  <Td>
                    {entry.actorName}
                    <br />
                    <span className="text-xs text-muted">{entry.actorEmail}</span>
                  </Td>
                  <Td>{VERBS[entry.method] ?? entry.method}</Td>
                  <Td className="break-all text-xs">{entry.path.replace('/api/v1/admin', '')}</Td>
                  <Td className="text-xs text-muted">{entry.fields.join(', ')}</Td>
                </tr>
              ))}
            </Table>
            <Pagination page={page} pages={data.pages} onPage={setPage} />
          </>
        )}
      </Loading>
    </>
  );
}
