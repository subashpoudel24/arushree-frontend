import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { AnimatedHeading } from '@/components/PageHero';
import { Prose } from '@/components/Prose';
import { getBlog } from '@/lib/content';

type Props = { params: Promise<{ slug: string }> };

const load = cache(getBlog);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const blog = await load((await params).slug);
  if (!blog) return { title: 'Article not found' };
  const description = blog.seoDescription || blog.excerpt;
  return {
    title: blog.seoTitle || blog.title,
    description,
    openGraph: {
      type: 'article',
      title: blog.seoTitle || blog.title,
      description,
      publishedTime: blog.publishedAt,
      images: blog.image ? [blog.image.url] : undefined,
    },
  };
}

export default async function BlogPage({ params }: Props) {
  const blog = await load((await params).slug);
  if (!blog) notFound();
  return (
    <main>
      <header className="mx-auto w-full max-w-4xl px-4 pt-8 text-center sm:pt-12">
        <Link href="/blogs" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium hover:text-bronze">
          <ArrowLeft size={16} aria-hidden /> All articles
        </Link>
        <AnimatedHeading text={blog.title} className="mt-4 font-display text-4xl font-medium leading-tight sm:text-6xl" />
        <div className="enter mt-5 flex items-center justify-center gap-2 text-sm text-muted" style={{ '--delay': '300ms' } as React.CSSProperties}>
          {blog.authorImage && (
            <span className="relative size-8 overflow-hidden rounded-full">
              <Image src={blog.authorImage.url} alt="" fill sizes="32px" className="object-cover" />
            </span>
          )}
          {blog.authorName && <span>{blog.authorName} ·</span>}
          <time dateTime={blog.publishedAt}>{new Date(blog.publishedAt).toLocaleDateString('en-GB', { dateStyle: 'long' })}</time>
        </div>
      </header>
      {blog.image && (
        <div className="enter relative mx-auto mt-10 aspect-[16/9] w-full max-w-6xl overflow-hidden bg-sand sm:rounded-3xl" style={{ '--delay': '200ms' } as React.CSSProperties}>
          <Image src={blog.image.url} alt={blog.image.alt ?? ''} fill priority sizes="(min-width: 1152px) 1152px, 100vw" className="slow-zoom object-cover" />
        </div>
      )}
      <article className="mx-auto w-full max-w-2xl px-4 py-12 text-lg sm:py-16">
        <Prose dropCap html={blog.content ?? ''} />
      </article>
    </main>
  );
}
