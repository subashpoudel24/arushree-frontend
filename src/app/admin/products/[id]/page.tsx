'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loading, PageHeader } from '@/components/admin/kit';
import { ProductData, ProductForm } from '@/components/admin/ProductForm';
import { api, errorMessage } from '@/lib/api';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ product: ProductData }>(`/admin/products/${id}`)
      .then((data) => setProduct(data.product))
      .catch((err) => setError(errorMessage(err)));
  }, [id]);

  return (
    <>
      <PageHeader title={product?.name ?? 'Product'} />
      <Loading error={error} ready={!!product}>
        {product && <ProductForm key={product._id} product={product} />}
      </Loading>
    </>
  );
}
