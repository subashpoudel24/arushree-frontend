'use client';

import { Star } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Alert, Button, Spinner } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { api, errorMessage } from '@/lib/api';

interface Review {
  id: string;
  rating: number;
  text: string;
  author: string;
  createdAt: string;
}

interface ReviewPage {
  items: Review[];
  total: number;
  page: number;
  pages: number;
}

const Stars = ({ value }: { value: number }) => (
  <span className="flex" role="img" aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} size={16} aria-hidden className={n <= value ? 'fill-gold-strong text-gold-strong' : 'text-line'} />
    ))}
  </span>
);

export const ProductReviews = ({ slug }: { slug: string }) => {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [data, setData] = useState<ReviewPage | null>(null);
  const [loadError, setLoadError] = useState('');
  const [page, setPage] = useState(1);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoadError('');
    try {
      setData(await api<ReviewPage>(`/products/${slug}/reviews?page=${page}&limit=5`));
    } catch (err) {
      setLoadError(errorMessage(err));
    }
  }, [slug, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!rating) {
      setError('Please choose a rating.');
      return;
    }
    setLoading(true);
    try {
      await api(`/products/${slug}/reviews`, { method: 'POST', body: { rating, text } });
      setSubmitted(true);
      await load();
      router.refresh(); // Updates the average rating shown in the page header.
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section aria-labelledby="reviews-heading" className="mt-14">
      <h2 id="reviews-heading" className="font-display text-2xl font-semibold">
        Customer reviews
      </h2>

      {submitted ? (
        <div className="mt-4">
          <Alert type="success">Thank you for your review.</Alert>
        </div>
      ) : user ? (
        <form onSubmit={submit} className="mt-4 space-y-3 rounded-2xl border border-line bg-white p-5">
          {error && <Alert>{error}</Alert>}
          <fieldset>
            <legend className="mb-1 text-sm font-medium">Your rating</legend>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  aria-pressed={rating === n}
                  onClick={() => setRating(n)}
                  className="flex size-11 items-center justify-center">
                  <Star size={24} aria-hidden className={n <= rating ? 'fill-gold-strong text-gold-strong' : 'text-muted'} />
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="review-text" className="mb-1.5 block text-sm font-medium">
              Your review
            </label>
            <textarea
              id="review-text"
              required
              minLength={3}
              maxLength={2000}
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full rounded-lg border border-line p-3 text-base focus:border-bronze focus:outline-none sm:text-sm"
            />
          </div>
          <Button type="submit" loading={loading}>
            Submit review
          </Button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-muted">
          <Link href={`/signin?next=${encodeURIComponent(pathname)}`} className="font-semibold text-bronze underline">
            Sign in
          </Link>{' '}
          to write a review.
        </p>
      )}

      <div className="mt-6">
        {loadError ? (
          <Alert>{loadError}</Alert>
        ) : !data ? (
          <Spinner label="Loading reviews" />
        ) : data.items.length === 0 ? (
          <p className="text-sm text-muted">No reviews yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {data.items.map((review) => (
              <li key={review.id} className="py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Stars value={review.rating} />
                  <span className="text-sm font-semibold">{review.author}</span>
                  <time className="text-xs text-muted" dateTime={review.createdAt}>
                    {new Date(review.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                  </time>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm">{review.text}</p>
              </li>
            ))}
          </ul>
        )}
        {data && data.pages > 1 && (
          <div className="mt-4 flex items-center gap-3">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <span className="text-sm text-muted">
              Page {data.page} of {data.pages}
            </span>
            <Button variant="outline" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
