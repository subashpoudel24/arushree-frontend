import Link from 'next/link';
import { SiteSettings } from '@/lib/content';

const SOCIAL_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
};

interface Props {
  site: SiteSettings;
  pages: { title: string; slug: string }[];
}

const linkClass = 'inline-flex min-h-8 items-center hover:underline';

export const Footer = ({ site, pages }: Props) => {
  const social = Object.entries(site.social ?? {}).filter(([, url]) => url);
  return (
    <footer className="mt-auto bg-ink text-cream">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg">{site.siteName}</p>
          {site.footerText && <p className="mt-2 text-cream/70">{site.footerText}</p>}
        </div>
        <nav aria-label="Shop">
          <p className="mb-2 font-semibold">Shop</p>
          <ul>
            <li><Link href="/shop" className={linkClass}>All products</Link></li>
            <li><Link href="/shop?section=skincare" className={linkClass}>Skincare</Link></li>
            <li><Link href="/shop?section=oral-care" className={linkClass}>Oral care</Link></li>
            <li><Link href="/track-order" className={linkClass}>Track your order</Link></li>
          </ul>
        </nav>
        <nav aria-label="About">
          <p className="mb-2 font-semibold">About</p>
          <ul>
            <li><Link href="/about" className={linkClass}>About us</Link></li>
            <li><Link href="/blogs" className={linkClass}>Blog</Link></li>
            <li><Link href="/contact" className={linkClass}>Contact</Link></li>
            {pages.map((page) => (
              <li key={page.slug}><Link href={`/pages/${page.slug}`} className={linkClass}>{page.title}</Link></li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="mb-2 font-semibold">Get in touch</p>
          {site.phone && <p>{site.phone}</p>}
          {site.email && <p className="break-words"><a href={`mailto:${site.email}`} className="hover:underline">{site.email}</a></p>}
          {site.address && <p className="text-cream/70">{site.address}</p>}
          {social.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-x-4">
              {social.map(([key, url]) => (
                <li key={key}><a href={url} target="_blank" rel="noopener noreferrer" className={linkClass}>{SOCIAL_LABELS[key] ?? key}</a></li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <p className="border-t border-cream/10 px-4 py-4 text-center text-xs text-cream/70">
        © {new Date().getFullYear()} {site.siteName}. All rights reserved.
      </p>
    </footer>
  );
};
