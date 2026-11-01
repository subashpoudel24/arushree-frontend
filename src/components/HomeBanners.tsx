import Link from 'next/link';
import { Banner } from '@/lib/content';

const external = (href: string) => (href.startsWith('https://') ? { target: '_blank', rel: 'noopener noreferrer' } : {});

const Slide = ({ banner, index }: { banner: Banner; index: number }) => {
  const hasText = !!(banner.heading || banner.subheading);
  const image = (
    <picture>
      {banner.mobileImage && <source media="(max-width: 639px)" srcSet={banner.mobileImage.url} />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={banner.desktopImage.url}
        alt={banner.desktopImage.alt ?? ''}
        fetchPriority={index === 0 ? 'high' : undefined}
        loading={index === 0 ? 'eager' : 'lazy'}
        className={hasText ? 'absolute inset-0 size-full object-cover' : 'block h-auto w-full'}
      />
    </picture>
  );

  // Artwork with its own wording: the whole picture is the link.
  if (!hasText) {
    return banner.buttonLink ? (
      <Link href={banner.buttonLink} {...external(banner.buttonLink)} className="block">
        {image}
      </Link>
    ) : (
      image
    );
  }

  return (
    <div className="relative flex min-h-[360px] items-center overflow-hidden sm:min-h-[520px]">
      {image}
      <div className="relative mx-auto w-full max-w-[1500px] px-4 py-14 sm:px-8 lg:px-28">
        <div className="max-w-xl">
          {banner.heading && <h2 className="enter font-display text-4xl font-medium sm:text-6xl">{banner.heading}</h2>}
          {banner.subheading && (
            <p className="enter mt-4 text-lg" style={{ '--delay': '150ms' } as React.CSSProperties}>
              {banner.subheading}
            </p>
          )}
          {banner.buttonText && banner.buttonLink && (
            <div className="enter mt-6" style={{ '--delay': '300ms' } as React.CSSProperties}>
              <Link href={banner.buttonLink} {...external(banner.buttonLink)} className="inline-flex min-h-12 items-center rounded-lg bg-gold px-7 font-semibold hover:bg-gold-strong">
                {banner.buttonText}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Full-width banners that swipe natively when there is more than one.
export const HomeBanners = ({ banners }: { banners: Banner[] }) => (
  <section aria-label="Featured" className="fade-in flex snap-x snap-mandatory overflow-x-auto">
    {banners.map((banner, index) => (
      <div key={`${banner.desktopImage.url}-${index}`} className="w-full shrink-0 snap-start">
        <Slide banner={banner} index={index} />
      </div>
    ))}
  </section>
);
