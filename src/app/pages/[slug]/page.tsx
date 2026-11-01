import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { Prose } from '@/components/Prose';
import { getPage } from '@/lib/content';

type Props = { params: Promise<{ slug: string }> };

const load = cache(getPage);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await load((await params).slug);
  return page ? { title: page.seoTitle || page.title, description: page.seoDescription } : { title: 'Page not found' };
}

export default async function ContentPage({ params }: Props) {
  const page = await load((await params).slug);
  if (!page) notFound();
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-16">
      <h1 className="mb-6 font-display text-4xl font-semibold">{page.title}</h1>
      <Prose html={page.content} />
    </main>
  );
}
