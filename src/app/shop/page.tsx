import type { Metadata } from 'next';
import Link from 'next/link';
import { FilterPanel } from '@/components/FilterPanel';
import { PageHero } from '@/components/PageHero';
import { ProductGrid } from '@/components/ProductCard';
import { getCategories, getProducts } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Browse skincare and oral care products from Aarushree Life Sciences.',
};

type SearchParams = Record<string, string | string[] | undefined>;

const SECTIONS = [
  { value: '', label: 'All products' },
  { value: 'skincare', label: 'Skincare' },
  { value: 'oral-care', label: 'Oral care' },
];
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'popular', label: 'Most reviewed' },
];

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? '';

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const raw = await searchParams;
  const q = first(raw.q);
  const section = first(raw.section);
  const sort = first(raw.sort) || 'newest';
  const minPrice = first(raw.minPrice);
  const maxPrice = first(raw.maxPrice);
  const page = Number(first(raw.page)) || 1;
  const selected = [raw.category ?? []].flat();

  // Used for the API call and for links, so pagination keeps every filter.
  const filters = new URLSearchParams();
  if (q) filters.set('q', q);
  if (section) filters.set('section', section);
  if (sort !== 'newest') filters.set('sort', sort);
  if (minPrice) filters.set('minPrice', minPrice);
  if (maxPrice) filters.set('maxPrice', maxPrice);
  selected.forEach((slug) => filters.append('category', slug));

  const query = new URLSearchParams(filters);
  query.set('page', String(page));
  query.set('limit', '12');

  const [{ items, total, pages }, categories] = await Promise.all([getProducts(query), getCategories()]);
  const pageHref = (n: number) => {
    const next = new URLSearchParams(filters);
    if (n > 1) next.set('page', String(n));
    return `/shop${next.size ? `?${next}` : ''}`;
  };
  const sectionHref = (value: string) => {
    const next = new URLSearchParams(filters);
    next.delete('category');
    next.delete('section');
    if (value) next.set('section', value);
    return `/shop${next.size ? `?${next}` : ''}`;
  };
  const visibleCategories = section ? categories.filter((category) => category.section === section) : categories;
  const fieldClass =
    'min-h-11 w-full rounded-lg border border-line bg-white px-3 text-base focus:border-bronze focus:outline-none sm:text-sm';

  return (
    <main>
      <PageHero eyebrow="The collection" title="Our products">
        <p>Everyday care for skin and smile, made to help you feel your best.</p>
      </PageHero>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <nav aria-label="Product sections" className="flex gap-2 overflow-x-auto pb-1">
        {SECTIONS.map((item) => (
          <Link
            key={item.value}
            href={sectionHref(item.value)}
            aria-current={section === item.value ? 'page' : undefined}
            className={`inline-flex min-h-11 shrink-0 items-center rounded-full border px-5 text-sm font-medium transition-colors ${
              section === item.value ? 'border-ink bg-ink text-cream' : 'border-line bg-white hover:border-ink'
            }`}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:gap-12">
        {/* A plain GET form: filters work with no JavaScript and are shareable as links. */}
        <FilterPanel hasFilters={Boolean(q || minPrice || maxPrice || selected.length)}>
          <form method="get" action="/shop" className="space-y-5 rounded-2xl border border-line bg-white p-5 max-lg:mt-2 lg:sticky lg:top-24">
            {section && <input type="hidden" name="section" value={section} />}
            <div>
              <label htmlFor="q" className="mb-1.5 block text-sm font-medium">
                Search
              </label>
              <input id="q" type="search" name="q" maxLength={100} defaultValue={q} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="sort" className="mb-1.5 block text-sm font-medium">
                Sort by
              </label>
              <select id="sort" name="sort" defaultValue={sort} className={fieldClass}>
                {SORTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {visibleCategories.length > 0 && (
              <fieldset>
                <legend className="mb-1.5 text-sm font-medium">Category</legend>
                {visibleCategories.map((category) => (
                  <label key={category._id} className="flex min-h-11 items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="category"
                      value={category.slug}
                      defaultChecked={selected.includes(category.slug)}
                      className="size-4 accent-bronze"
                    />
                    {category.name}
                  </label>
                ))}
              </fieldset>
            )}
            <fieldset>
              <legend className="mb-1.5 text-sm font-medium">Price (Rs.)</legend>
              <div className="flex gap-2">
                <input type="number" min={0} name="minPrice" aria-label="Minimum price" placeholder="Min" defaultValue={minPrice} className={fieldClass} />
                <input type="number" min={0} name="maxPrice" aria-label="Maximum price" placeholder="Max" defaultValue={maxPrice} className={fieldClass} />
              </div>
            </fieldset>
            <button type="submit" className="min-h-11 w-full rounded-full bg-ink text-sm font-semibold text-cream transition-colors hover:bg-bronze">
              Apply
            </button>
            <Link href="/shop" className="block text-center text-sm font-medium text-bronze underline">
              Clear all
            </Link>
          </form>
        </FilterPanel>

        <div className="min-w-0 flex-1">
          <p className="mb-4 text-sm text-muted" role="status">
            {total} {total === 1 ? 'product' : 'products'}
          </p>
          {items.length === 0 ? (
            <div className="rounded-2xl border border-line bg-white p-10 text-center">
              <p className="font-semibold">No products found</p>
              <p className="mt-1 text-sm text-muted">Try removing a filter or searching for something else.</p>
            </div>
          ) : (
            <ProductGrid products={items} />
          )}
          {pages > 1 && (
            <nav aria-label="Pages" className="mt-8 flex flex-wrap justify-center gap-2">
              {Array.from({ length: pages }, (_, index) => index + 1).map((n) => (
                <Link
                  key={n}
                  href={pageHref(n)}
                  aria-current={n === page ? 'page' : undefined}
                  className={`flex size-11 items-center justify-center rounded-lg border text-sm font-medium ${
                    n === page ? 'border-gold bg-gold' : 'border-line bg-white hover:bg-sand'
                  }`}>
                  {n}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
      </div>
    </main>
  );
}
