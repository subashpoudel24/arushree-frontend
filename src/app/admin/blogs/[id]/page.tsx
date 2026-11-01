'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BlogData, BlogForm } from '@/components/admin/BlogForm';
import { Loading, PageHeader } from '@/components/admin/kit';
import { api, errorMessage } from '@/lib/api';

export default function EditBlogPage() {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<BlogData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ blog: BlogData }>(`/admin/blogs/${id}`)
      .then((data) => setBlog(data.blog))
      .catch((err) => setError(errorMessage(err)));
  }, [id]);

  return (
    <>
      <PageHeader title={blog?.title ?? 'Article'} />
      <Loading error={error} ready={!!blog}>
        {blog && <BlogForm key={blog._id} blog={blog} />}
      </Loading>
    </>
  );
}
