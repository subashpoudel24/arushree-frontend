import { ArrowLeft, Star } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { AddToCart } from '@/components/AddToCart';
import { FavoriteButton } from '@/components/FavoriteButton';
import { ProductGrid } from '@/components/ProductCard';
import { ProductGallery } from '@/components/ProductGallery';
import { ProductReviews } from '@/components/ProductReviews';
import { formatPrice, getProduct, getRelated } from '@/lib/catalog';

type Props = { params: Promise<{ slug: string }> };

// Slugs from a URL can be anything; the API rejects malformed ones with 400.
const loadProduct = cache(async (slug: string) =>
  /^[a-z0-9-]{1,120}$/.test(slug) ? getProduct(slug) : null
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await loadProduct((await params).slug);
  if (!product) return { title: 'Product not found' };
  const description = product.seoDescription || product.shortDescription;
  return {
    title: product.seoTitle || product.name,
    description,
    openGraph: {
      title: product.seoTitle || product.name,
      description,
      images: product.images[0] ? [product.images[0].url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) notFound();
  const related = await getRelated(slug);
  const inStock = product.stock > 0;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription,
    image: product.images.map((image) => image.url),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'NPR',
      price: product.price,
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    ...(product.ratingCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.ratingAverage,
        reviewCount: product.ratingCount,
      },
    }),
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        // "<" is escaped so product text can never close this script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <Link href="/shop" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium hover:text-bronze">
        <ArrowLeft size={16} aria-hidden /> Back to shop
      </Link>

      <div className="mt-2 grid gap-8 md:grid-cols-2 md:gap-12">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          <p className="text-sm text-muted">{product.categories.map((category) => category.name).join(', ')}</p>
          <div className="mt-1 flex items-start justify-between gap-4">
            <h1 className="font-display text-3xl font-semibold sm:text-4xl">{product.name}</h1>
            <FavoriteButton productId={product._id} productName={product.name} />
          </div>
          {product.ratingCount > 0 && (
            <p className="mt-2 flex items-center gap-1 text-sm text-muted">
              <Star size={16} aria-hidden className="fill-gold-strong text-gold-strong" />
              {product.ratingAverage} ({product.ratingCount} {product.ratingCount === 1 ? 'review' : 'reviews'})
            </p>
          )}
          <p className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-semibold">{formatPrice(product.price)}</span>
            {product.compareAtPrice != null && product.compareAtPrice > product.price && (
              <s className="text-muted">{formatPrice(product.compareAtPrice)}</s>
            )}
          </p>
          <p className={`mt-2 text-sm font-medium ${inStock ? 'text-success' : 'text-danger'}`}>
            {inStock ? (product.stock <= 5 ? `Only ${product.stock} left` : 'In stock') : 'Sold out'}
          </p>
          {product.shortDescription && <p className="mt-4">{product.shortDescription}</p>}
          <AddToCart productId={product._id} stock={product.stock} />

          {product.description && (
            <section aria-labelledby="description-heading" className="mt-8">
              <h2 id="description-heading" className="font-display text-xl font-semibold">
                Description
              </h2>
              {/* Cleaned by the API when it is saved. */}
              <div
                className="mt-2 space-y-3 text-sm leading-relaxed [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </section>
          )}

          {!!product.specifications?.length && (
            <section aria-labelledby="specs-heading" className="mt-8">
              <h2 id="specs-heading" className="font-display text-xl font-semibold">
                Specifications
              </h2>
              <dl className="mt-2 divide-y divide-line text-sm">
                {product.specifications.map((spec) => (
                  <div key={spec.title} className="flex justify-between gap-4 py-2">
                    <dt className="font-medium">{spec.title}</dt>
                    <dd className="text-right text-muted">{spec.description}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      </div>

      <ProductReviews slug={product.slug} />

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-14">
          <h2 id="related-heading" className="mb-6 font-display text-2xl font-semibold">
            You may also like
          </h2>
          <ProductGrid products={related} />
        </section>
      )}
    </main>
  );
}
