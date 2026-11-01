import { Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FavoriteButton } from '@/components/FavoriteButton';
import { Product, formatPrice } from '@/lib/catalog';

const SIZES = '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw';

export const ProductCard = ({ product }: { product: Product }) => {
  const [image, hoverImage] = product.images;
  const soldOut = product.stock === 0;
  const onSale = product.compareAtPrice != null && product.compareAtPrice > product.price;
  return (
    <article className="reveal group relative flex flex-col">
      <div className="absolute right-2 top-2 z-10">
        <FavoriteButton productId={product._id} productName={product.name} />
      </div>
      <Link href={`/shop/products/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand">
          {image && (
            <Image
              src={image.url}
              alt={image.alt ?? product.name}
              fill
              sizes={SIZES}
              className={`object-cover transition-all duration-700 group-hover:scale-105 motion-reduce:transition-none ${hoverImage ? 'group-hover:opacity-0' : ''}`}
            />
          )}
          {hoverImage && (
            <Image src={hoverImage.url} alt="" fill sizes={SIZES} className="scale-105 object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100 motion-reduce:transition-none" />
          )}
          {soldOut ? (
            <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-cream">Sold out</span>
          ) : (
            onSale && <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-ink">Sale</span>
          )}
          <span aria-hidden className="absolute inset-x-3 bottom-3 translate-y-2 rounded-full bg-cream/95 py-2.5 text-center text-sm font-semibold opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            View product
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-1 pt-3">
          <h3 className="font-display text-base font-medium sm:text-lg">{product.name}</h3>
          {product.ratingCount > 0 && (
            <p className="flex items-center gap-1 text-xs text-muted">
              <Star size={14} aria-hidden className="fill-gold-strong text-gold-strong" />
              {product.ratingAverage}
              <span>({product.ratingCount})</span>
              <span className="sr-only">reviews</span>
            </p>
          )}
          <p className="mt-auto flex flex-wrap items-baseline gap-2 pt-1">
            <span className="font-semibold">{formatPrice(product.price)}</span>
            {onSale && <s className="text-xs text-muted">{formatPrice(product.compareAtPrice!)}</s>}
          </p>
        </div>
      </Link>
    </article>
  );
};

export const ProductGrid = ({ products }: { products: Product[] }) => (
  <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
    {products.map((product) => (
      <ProductCard key={product._id} product={product} />
    ))}
  </div>
);
