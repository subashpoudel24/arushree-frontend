import { ArrowUpRight, Quote, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';
import { HomeBanners } from '@/components/HomeBanners';
import { ProductGrid } from '@/components/ProductCard';
import { getCategories, getProducts } from '@/lib/catalog';
import { Homepage, getHomepage, getSite, getTestimonials } from '@/lib/content';

const SectionTitle = ({ id, eyebrow, title, action, dark }: { id: string; eyebrow: string; title: ReactNode; action?: ReactNode; dark?: boolean }) => (
  <div className="reveal mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-12">
    <div>
      <p className={`eyebrow ${dark ? 'text-gold!' : ''}`}>{eyebrow}</p>
      <h2 id={id} className="mt-2 font-display text-4xl font-medium sm:text-5xl">
        {title}
      </h2>
    </div>
    {action}
  </div>
);

const NoticeBar = ({ notice }: { notice: Homepage['noticeBar'] }) => {
  if (!notice.enabled || !notice.text) return null;
  const className = 'block bg-ink px-4 py-2.5 text-center text-xs font-medium tracking-wide text-cream';
  return notice.link ? (
    <Link href={notice.link} className={`${className} underline`}>
      {notice.text}
    </Link>
  ) : (
    <p className={className}>{notice.text}</p>
  );
};

const Highlights = ({ items }: { items: NonNullable<Homepage['highlights']> }) => {
  if (!items.length) return null;
  return (
    <section aria-label="Why choose us" className="bg-[#f9f8f7]">
      <ul className="mx-auto flex max-w-[1500px] justify-around gap-3 px-3 py-8 sm:px-8 sm:py-12">
        {items.map((item, index) => (
          <li key={`${item.text}-${index}`} className="enter flex flex-1 flex-col items-center gap-2 text-center md:flex-row md:justify-center md:gap-6 md:text-left" style={{ '--delay': `${index * 150}ms` } as React.CSSProperties}>
            {item.image && <Image src={item.image.url} alt={item.image.alt ?? ''} width={100} height={100} className="size-14 shrink-0 object-contain sm:size-20 lg:size-24" />}
            <span className="text-[11px] uppercase tracking-[0.15em] sm:text-sm lg:text-xl">{item.text}</span>
          </li>
        ))}
      </ul>
      <svg aria-hidden viewBox="0 0 1440 34" preserveAspectRatio="none" className="block h-6 w-full sm:h-8">
        <path d="M0 1C300-4 620 30 900 28c200-1 360-16 540-16v22H0Z" fill="var(--color-gold)" />
      </svg>
    </section>
  );
};

const shell = 'mx-auto max-w-7xl px-4 sm:px-6';

export default async function Home() {
  const [{ site }, homepage, latest, featured, categories, testimonials] = await Promise.all([
    getSite(),
    getHomepage(),
    getProducts(new URLSearchParams({ limit: '8', sort: 'newest' })),
    getProducts(new URLSearchParams({ limit: '4', featured: 'true' })),
    getCategories(),
    getTestimonials(),
  ]);

  const viewAll = (
    <Link href="/shop" className="group inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold">
      <span className="link-line">View all</span>
      <ArrowUpRight size={16} aria-hidden className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  );

  const sections: Record<string, ReactNode> = {
    new_products: (
      <section key="new" aria-labelledby="new-heading" className={`${shell} py-16 sm:py-24`}>
        {latest.items.length > 0 ? (
          <>
            <SectionTitle id="new-heading" eyebrow="Just arrived" title="New products" action={viewAll} />
            <ProductGrid products={latest.items} />
          </>
        ) : (
          <p className="py-10 text-center text-muted">Products are coming soon.</p>
        )}
      </section>
    ),
    categories: categories.length > 0 && (
      <section key="categories" aria-labelledby="categories-heading" className="bg-sand py-16 sm:py-24">
        <div className={shell}>
          <SectionTitle id="categories-heading" eyebrow="Find your ritual" title="Shop by category" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-8 md:grid-cols-4">
            {categories.map((category, index) => (
              <Link key={category._id} href={`/shop?category=${category.slug}`} className="reveal group block">
                <div className="arch relative aspect-[3/4] overflow-hidden bg-cream">
                  {category.image && (
                    <Image src={category.image.url} alt="" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-110 motion-reduce:transition-none" />
                  )}
                </div>
                <p className="mt-4 flex items-baseline gap-2">
                  <span className="text-xs text-bronze">{String(index + 1).padStart(2, '0')}</span>
                  <span className="link-line font-display text-xl">{category.name}</span>
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    ),
    featured: featured.items.length > 0 && (
      <section key="featured" aria-labelledby="featured-heading" className={`${shell} py-16 sm:py-24`}>
        <SectionTitle id="featured-heading" eyebrow="Our favorites" title={<>Loved <em className="text-bronze">most</em></>} action={viewAll} />
        <ProductGrid products={featured.items} />
      </section>
    ),
    testimonials: testimonials.length > 0 && (
      <section key="testimonials" aria-labelledby="testimonials-heading" className="bg-ink py-16 text-cream sm:py-24">
        <div className={shell}>
          <SectionTitle dark id="testimonials-heading" eyebrow="In their words" title="What customers say" />
          <ul className="flex snap-x gap-5 overflow-x-auto pb-4">
            {testimonials.map((testimonial) => (
              <li key={testimonial._id} className="flex w-80 shrink-0 snap-start flex-col rounded-2xl border border-cream/15 p-7 transition-colors hover:border-gold sm:w-96">
                <Quote aria-hidden size={28} className="text-gold" />
                {testimonial.title && <p className="mt-4 font-semibold">{testimonial.title}</p>}
                <p className="mt-3 flex-1 font-display text-xl leading-snug">{testimonial.text}</p>
                <div className="mt-6 flex items-center gap-3">
                  {testimonial.authorImage && (
                    <span className="relative size-10 overflow-hidden rounded-full">
                      <Image src={testimonial.authorImage.url} alt="" fill sizes="40px" className="object-cover" />
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-medium">{testimonial.authorName}</p>
                    <p className="flex" role="img" aria-label={`${testimonial.rating} out of 5 stars`}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} size={13} aria-hidden className={n <= Math.round(testimonial.rating) ? 'fill-gold text-gold' : 'text-cream/25'} />
                      ))}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    ),
  };

  return (
    <main>
      {homepage && <NoticeBar notice={homepage.noticeBar} />}
      <h1 className="sr-only">{site.siteName}</h1>
      {homepage && homepage.banners.length > 0 && <HomeBanners banners={homepage.banners} />}
      {homepage && homepage.showHighlights !== false && <Highlights items={homepage.highlights ?? []} />}
      {homepage?.sections.filter((section) => section.enabled).map((section) => sections[section.key])}
    </main>
  );
}
