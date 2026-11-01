import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHero } from '@/components/PageHero';
import { Prose } from '@/components/Prose';
import { getPage } from '@/lib/content';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('about');
  return { title: page?.seoTitle || page?.title || 'About us', description: page?.seoDescription };
}

export default async function AboutPage() {
  const page = await getPage('about');
  if (!page) notFound();
  return (
    <main>
      <PageHero eyebrow="Our story" title={page.title} />
      <div className="mx-auto grid max-w-7xl items-start gap-12 px-4 py-14 sm:px-6 sm:py-20 md:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="relative md:sticky md:top-24">
          <div className="arch enter relative mx-auto aspect-[3/4] w-4/5 overflow-hidden bg-sand md:w-full">
            <Image src="/assets/images/Product-table.jpeg" alt="Kleida skincare products on display" fill priority sizes="(min-width: 768px) 40vw, 80vw" className="slow-zoom object-cover" />
          </div>
          <div className="enter drift absolute -bottom-6 right-0 w-2/5 overflow-hidden rounded-2xl border-4 border-cream shadow-lg" style={{ '--delay': '250ms' } as React.CSSProperties}>
            <div className="relative aspect-square">
              <Image src="/assets/images/Kleida-Coconut-Extra-Virgin-Oil.jpg" alt="Kleida extra virgin coconut oil" fill sizes="(min-width: 768px) 16vw, 32vw" className="object-cover" />
            </div>
          </div>
        </div>
        <div className="reveal text-lg max-md:mt-6">
          <Prose dropCap html={page.content} />
          <Link href="/shop" className="group mt-10 inline-flex min-h-13 items-center gap-3 rounded-full bg-ink px-7 font-semibold text-cream transition-colors hover:bg-bronze">
            Explore our products
            <ArrowRight size={18} aria-hidden className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </main>
  );
}
