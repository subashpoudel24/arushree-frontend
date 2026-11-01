'use client';

import { BlogForm } from '@/components/admin/BlogForm';
import { PageHeader } from '@/components/admin/kit';

export default function NewBlogPage() {
  return (
    <>
      <PageHeader title="Add article" />
      <BlogForm />
    </>
  );
}
