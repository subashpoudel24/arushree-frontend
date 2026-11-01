'use client';

import { Heart } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';

export const FavoriteButton = ({ productId, productName }: { productId: string; productName: string }) => {
  const { user } = useAuth();
  const { ids, toggle } = useFavorites();
  const [failed, setFailed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const active = ids.has(productId);

  const onClick = async () => {
    if (!user) {
      router.push(`/signin?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setFailed(false);
    await toggle(productId).catch(() => setFailed(true));
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${active ? 'Remove' : 'Add'} ${productName} ${active ? 'from' : 'to'} favorites`}
      title={failed ? 'Could not save. Please try again.' : undefined}
      className="flex size-11 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm hover:text-danger">
      <Heart size={20} aria-hidden fill={active ? 'currentColor' : 'none'} className={active ? 'text-danger' : ''} />
    </button>
  );
};
