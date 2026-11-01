import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aarushreelifesciences.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/account', '/favorites', '/cart', '/checkout', '/orders', '/payment', '/api/'] },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
