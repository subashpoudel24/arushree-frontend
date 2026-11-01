import type { MetadataRoute } from 'next';
import { getCategories, getProducts } from '@/lib/catalog';
import { getBlogs, getPublishedPages } from '@/lib/content';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aarushreelifesciences.com';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: SITE },
    { url: `${SITE}/shop` },
    { url: `${SITE}/blogs` },
    { url: `${SITE}/about` },
    { url: `${SITE}/contact` },
  ];
  const contentPages = await getPublishedPages();
  contentPages
    .filter((page) => !['about', 'contact'].includes(page.slug))
    .forEach((page) => entries.push({ url: `${SITE}/pages/${page.slug}`, lastModified: page.updatedAt }));
  for (let page = 1, pages = 1; page <= pages; page += 1) {
    const result = await getBlogs(page, 48);
    pages = result.pages;
    result.items.forEach((blog) => entries.push({ url: `${SITE}/blogs/${blog.slug}`, lastModified: blog.updatedAt }));
  }
  const categories = await getCategories();
  categories.forEach((category) => entries.push({ url: `${SITE}/shop?category=${category.slug}` }));

  // The API caps each page at 48 items, so walk through every page.
  for (let page = 1, pages = 1; page <= pages; page += 1) {
    const result = await getProducts(new URLSearchParams({ page: String(page), limit: '48' }));
    pages = result.pages;
    result.items.forEach((product) =>
      entries.push({ url: `${SITE}/shop/products/${product.slug}`, lastModified: product.updatedAt })
    );
  }
  return entries;
}
