// Server-side content reads, so admin edits appear on the next page load.
const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:4000';

export interface ImageValue {
  url: string;
  publicId?: string;
  alt?: string;
}

export interface SiteSettings {
  siteName: string;
  logo: ImageValue;
  phone: string;
  email: string;
  address: string;
  footerText: string;
  social: { facebook?: string; instagram?: string; tiktok?: string; youtube?: string };
  googleAnalyticsId?: string;
}

export interface Banner {
  heading: string;
  subheading: string;
  buttonText: string;
  buttonLink?: string;
  desktopImage: ImageValue;
  mobileImage?: ImageValue | null;
  enabled: boolean;
}

export interface Homepage {
  noticeBar: { enabled: boolean; text: string; link?: string };
  showHighlights?: boolean;
  highlights?: { text: string; image?: ImageValue | null }[];
  banners: Banner[];
  sections: { key: 'new_products' | 'categories' | 'featured' | 'testimonials'; enabled: boolean }[];
}

export interface Page {
  title: string;
  slug: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  updatedAt?: string;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  image?: ImageValue;
  authorName: string;
  authorImage?: ImageValue;
  publishedAt: string;
  updatedAt: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Testimonial {
  _id: string;
  authorName: string;
  authorImage?: ImageValue;
  rating: number;
  title: string;
  text: string;
}

const get = async <T>(path: string): Promise<T | null> => {
  const res = await fetch(`${BACKEND}/api/v1${path}`, { cache: 'no-store' });
  if (res.status === 404 || res.status === 400) return null;
  if (!res.ok) throw new Error(`Content request failed: ${res.status}`);
  return res.json();
};

const FALLBACK_SITE: SiteSettings = {
  siteName: 'Aarushree Life Sciences',
  logo: { url: '/logo.svg' },
  phone: '',
  email: '',
  address: '',
  footerText: '',
  social: {},
};

// The header and footer wrap every page, so a brief API outage must not take them down.
export const getSite = async () => {
  try {
    const data = await get<{ site: SiteSettings; footerPages: { title: string; slug: string }[] }>('/content/site');
    return data ?? { site: FALLBACK_SITE, footerPages: [] };
  } catch {
    return { site: FALLBACK_SITE, footerPages: [] };
  }
};

export const getHomepage = async () => (await get<{ homepage: Homepage }>('/content/homepage'))?.homepage ?? null;
export const getPage = async (slug: string) => (await get<{ page: Page }>(`/content/pages/${encodeURIComponent(slug)}`))?.page ?? null;
export const getPublishedPages = async () => (await get<{ items: { slug: string; updatedAt: string }[] }>('/content/pages'))?.items ?? [];
export const getTestimonials = async () => (await get<{ items: Testimonial[] }>('/testimonials'))?.items ?? [];
export const getBlogs = async (page: number, limit = 12) =>
  (await get<{ items: Blog[]; total: number; page: number; pages: number }>(`/blogs?page=${page}&limit=${limit}`)) ?? { items: [], total: 0, page: 1, pages: 1 };
export const getBlog = async (slug: string) => (await get<{ blog: Blog }>(`/blogs/${encodeURIComponent(slug)}`))?.blog ?? null;
