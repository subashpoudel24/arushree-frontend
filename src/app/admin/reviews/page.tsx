'use client';

import { useState } from 'react';
import { ActionLink, Badge, Loading, Notice, PageHeader, Pagination, Select, Table, Td, dateText, useAction, useList } from '@/components/admin/kit';
import { api } from '@/lib/api';

interface Review {
  _id: string;
  rating: number;
  text: string;
  status: 'published' | 'hidden';
  createdAt: string;
  product?: { name: string } | null;
  user?: { name: string; email: string } | null;
}

export default function AdminReviewsPage() {
  const [status, setStatus] = useState('');
  const { data, page, setPage, error, reload } = useList<Review>('/admin/reviews', status ? `status=${status}` : '');
  const { notice, run } = useAction();

  return (
    <>
      <PageHeader title="Reviews" />
      <Notice notice={notice} />
      <div className="mb-4 max-w-xs">
        <Select label="Show" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All reviews</option>
          <option value="published">Showing</option>
          <option value="hidden">Hidden</option>
        </Select>
      </div>
      <Loading error={error} ready={!!data}>
        {data && (
          <>
            <Table head={['Product', 'Customer', 'Rating', 'Review', 'Date', 'Status', '']} empty={!data.items.length}>
              {data.items.map((review) => (
                <tr key={review._id}>
                  <Td className="font-semibold">{review.product?.name ?? 'Deleted product'}</Td>
                  <Td>
                    {review.user?.name}
                    <br />
                    <span className="text-xs text-muted">{review.user?.email}</span>
                  </Td>
                  <Td>{review.rating} / 5</Td>
                  <Td className="max-w-sm whitespace-pre-line">{review.text}</Td>
                  <Td className="whitespace-nowrap">{dateText(review.createdAt)}</Td>
                  <Td>
                    <Badge tone={review.status === 'published' ? 'good' : 'plain'}>{review.status === 'published' ? 'Showing' : 'Hidden'}</Badge>
                  </Td>
                  <Td className="whitespace-nowrap">
                    <ActionLink
                      onClick={() =>
                        void run(async () => {
                          await api(`/admin/reviews/${review._id}`, {
                            method: 'PATCH',
                            body: { status: review.status === 'published' ? 'hidden' : 'published' },
                          });
                          await reload();
                        })
                      }>
                      {review.status === 'published' ? 'Hide' : 'Show'}
                    </ActionLink>
                    <ActionLink
                      danger
                      onClick={() => {
                        if (!window.confirm('Delete this review?')) return;
                        void run(async () => {
                          await api(`/admin/reviews/${review._id}`, { method: 'DELETE' });
                          await reload();
                        });
                      }}>
                      Delete
                    </ActionLink>
                  </Td>
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
