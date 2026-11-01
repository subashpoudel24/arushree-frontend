'use client';

import { PageHeader } from '@/components/admin/kit';
import { ProductForm } from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <>
      <PageHeader title="Add product" />
      <ProductForm />
    </>
  );
}
