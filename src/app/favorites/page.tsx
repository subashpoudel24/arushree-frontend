'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ProductGrid } from '@/components/ProductCard';
import { RequireUser } from '@/components/RequireUser';
import { Alert, Spinner } from '@/components/ui';
import { useFavorites } from '@/contexts/FavoritesContext';
import { api, errorMessage } from '@/lib/api';
import type { Product } from '@/lib/catalog';

const Favorites = () => {
  const { ids } = useFavorites();
  const [items, setItems] = useState<Product[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ items: Product[] }>('/favorites')
      .then((data) => setItems(data.items))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  // Removing a heart on this page takes the product away straight after.
  const visible = items?.filter((item) => ids.has(item._id)) ?? [];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="mb-6 font-display text-3xl font-semibold">My favorites</h1>
      {error ? (
        <Alert>{error}</Alert>
      ) : !items ? (
        <Spinner />
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-10 text-center">
          <p className="font-semibold">No favorites yet</p>
          <Link href="/shop" className="mt-2 inline-block text-sm font-semibold text-bronze underline">
            Browse products
          </Link>
        </div>
      ) : (
        <ProductGrid products={visible} />
      )}
    </main>
  );
};

export default function FavoritesPage() {
  return (
    <RequireUser>
      <Favorites />
    </RequireUser>
  );
}
