import { Mail, MapPin, Phone } from 'lucide-react';
import type { Metadata } from 'next';
import { ContactForm } from '@/components/ContactForm';
import { PageHero } from '@/components/PageHero';
import { Prose } from '@/components/Prose';
import { getPage, getSite } from '@/lib/content';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('contact');
  return { title: page?.seoTitle || page?.title || 'Contact us', description: page?.seoDescription };
}

const SOCIAL_LABELS: Record<string, string> = { facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube' };

export default async function ContactPage() {
  const [page, { site }] = await Promise.all([getPage('contact'), getSite()]);
  const details = [
    site.phone && { icon: Phone, label: 'Call us', value: site.phone, href: `tel:${site.phone.split('/')[0].replace(/\s/g, '')}` },
    site.email && { icon: Mail, label: 'Email us', value: site.email, href: `mailto:${site.email}` },
    site.address && { icon: MapPin, label: 'Visit us', value: site.address },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string }[];
  const social = Object.entries(site.social ?? {}).filter(([, url]) => url);

  return (
    <main>
      <PageHero eyebrow="Say hello" title={page?.title ?? 'Contact us'} />
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-[0.85fr_1.15fr]">
        <section aria-label="Contact details" className="enter relative overflow-hidden rounded-3xl bg-ink p-8 text-cream sm:p-10">
          <div aria-hidden className="arch drift absolute -bottom-24 -right-14 h-72 w-52 border border-gold/40" />
          {page && (
            <div className="font-display text-2xl">
              <Prose html={page.content} />
            </div>
          )}
          <ul className="relative mt-8 space-y-6">
            {details.map(({ icon: Icon, label, value, href }) => (
              <li key={label} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold text-ink">
                  <Icon size={18} aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest text-cream/60">{label}</p>
                  {href ? (
                    <a href={href} className="link-line break-words">
                      {value}
                    </a>
                  ) : (
                    <p>{value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {social.length > 0 && (
            <ul className="relative mt-8 flex flex-wrap gap-2">
              {social.map(([key, url]) => (
                <li key={key}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-cream/30 px-4 text-sm transition-colors hover:border-gold hover:text-gold">
                    {SOCIAL_LABELS[key] ?? key}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
        <div className="enter" style={{ '--delay': '150ms' } as React.CSSProperties}>
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
