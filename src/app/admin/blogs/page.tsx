'use client';

import Link from 'next/link';
import { Badge, Loading, PageHeader, Pagination, Table, Td, dateText, useList } from '@/components/admin/kit';

interface Row {
  _id: string;
  title: string;
  authorName: string;
  status: 'draft' | 'published';
  publishedAt?: string;
  updatedAt: string;
}

export default function AdminBlogsPage() {
  const { data, page, setPage, error } = useList<Row>('/admin/blogs');
  return (
    <>
      <PageHeader title="Blog">
        <Link href="/admin/blogs/new" className="inline-flex min-h-11 items-center rounded-lg bg-gold px-5 text-sm font-semibold hover:bg-gold-strong">
          Add article
        </Link>
      </PageHeader>
      <Loading error={error} ready={!!data}>
        {data && (
          <>
            <Table head={['Title', 'Author', 'Published', 'Status']} empty={!data.items.length}>
              {data.items.map((blog) => (
                <tr key={blog._id}>
                  <Td>
                    <Link href={`/admin/blogs/${blog._id}`} className="font-semibold underline">
                      {blog.title}
                    </Link>
                  </Td>
                  <Td>{blog.authorName}</Td>
                  <Td>{blog.publishedAt ? dateText(blog.publishedAt) : ''}</Td>
                  <Td>
                    <Badge tone={blog.status === 'published' ? 'good' : 'plain'}>{blog.status === 'published' ? 'Published' : 'Draft'}</Badge>
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
