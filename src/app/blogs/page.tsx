import { ArrowUpRight } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PageHero } from '@/components/PageHero';
import { Blog, getBlogs } from '@/lib/content';

export const metadata: Metadata = { title: 'Blog', description: 'Articles from Aarushree Life Sciences.' };

const meta = (blog: Blog) =>
  `${blog.authorName ? `${blog.authorName} · ` : ''}${new Date(blog.publishedAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}`;

export default async function BlogsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Number((await searchParams).page) || 1;
  const { items, pages } = await getBlogs(page);
  // The newest article leads the first page.
  const [lead, ...rest] = page === 1 ? items : [undefined, ...items];

  return (
    <main>
      <PageHero eyebrow="The journal" title="Notes on beauty and care" />
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        {items.length === 0 ? (
          <p className="rounded-2xl border border-line bg-white p-10 text-center text-muted">No articles yet.</p>
        ) : (
          <>
            {lead && (
              <Link href={`/blogs/${lead.slug}`} className="enter group mb-14 grid items-center gap-6 md:grid-cols-2 md:gap-12">
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-sand">
                  {lead.image && <Image src={lead.image.url} alt="" fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none" />}
                </div>
                <div>
                  <p className="eyebrow">Latest</p>
                  <h2 className="mt-3 font-display text-4xl font-medium leading-tight sm:text-5xl">{lead.title}</h2>
                  {lead.excerpt && <p className="mt-4 text-lg text-muted">{lead.excerpt}</p>}
                  <p className="mt-4 text-sm text-muted">{meta(lead)}</p>
                  <span className="mt-6 inline-flex items-center gap-1.5 font-semibold">
                    <span className="link-line">Read article</span>
                    <ArrowUpRight size={18} aria-hidden className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            )}
            {rest.length > 0 && (
              <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((blog) => (
                  <li key={blog!._id} className="reveal">
                    <Link href={`/blogs/${blog!.slug}`} className="group block">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-sand">
                        {blog!.image && <Image src={blog!.image.url} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none" />}
                      </div>
                      <h2 className="mt-4 font-display text-2xl font-medium">
                        <span className="link-line">{blog!.title}</span>
                      </h2>
                      {blog!.excerpt && <p className="mt-2 text-sm text-muted">{blog!.excerpt}</p>}
                      <p className="mt-3 text-xs text-muted">{meta(blog!)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {pages > 1 && (
          <nav aria-label="Pages" className="mt-12 flex flex-wrap justify-center gap-2">
            {Array.from({ length: pages }, (_, index) => index + 1).map((n) => (
              <Link key={n} href={n === 1 ? '/blogs' : `/blogs?page=${n}`} aria-current={n === page ? 'page' : undefined} className={`flex size-11 items-center justify-center rounded-full border text-sm font-medium ${n === page ? 'border-ink bg-ink text-cream' : 'border-line bg-white hover:border-ink'}`}>
                {n}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </main>
  );
}
