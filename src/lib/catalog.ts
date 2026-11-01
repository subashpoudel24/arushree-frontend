// Server-side catalog reads. Rendered per request so admin edits appear immediately.
const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:4000';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  section: 'skincare' | 'oral-care';
  image?: { url: string; alt?: string };
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  featured: boolean;
  images: { url: string; alt?: string }[];
  specifications?: { title: string; description: string }[];
  categories: Category[];
  ratingAverage: number;
  ratingCount: number;
  seoTitle?: string;
  seoDescription?: string;
  updatedAt: string;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

const get = async <T>(path: string): Promise<T | null> => {
  const res = await fetch(`${BACKEND}/api/v1${path}`, { cache: 'no-store' });
  // 400 means a hand-edited URL such as ?minPrice=abc: show no results, not a crash.
  if (res.status === 404 || res.status === 400) return null;
  if (!res.ok) throw new Error(`Catalog request failed: ${res.status}`);
  return res.json();
};

export const getCategories = async () =>
  (await get<{ items: Category[] }>('/categories'))?.items ?? [];

export const getProducts = async (params: URLSearchParams) =>
  (await get<Paged<Product>>(`/products?${params}`)) ?? { items: [], total: 0, page: 1, pages: 1 };

export const getProduct = async (slug: string) =>
  (await get<{ product: Product }>(`/products/${encodeURIComponent(slug)}`))?.product ?? null;

export const getRelated = async (slug: string) =>
  (await get<{ items: Product[] }>(`/products/${encodeURIComponent(slug)}/related`))?.items ?? [];

export const formatPrice = (value: number) => `Rs. ${value.toLocaleString('en-IN')}`;
