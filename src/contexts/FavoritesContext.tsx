'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

interface FavoritesValue {
  ids: Set<string>;
  toggle: (productId: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesValue | null>(null);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      setIds(new Set());
      return;
    }
    api<{ items: { _id: string }[] }>('/favorites')
      .then((data) => setIds(new Set(data.items.map((item) => item._id))))
      .catch(() => setIds(new Set()));
  }, [user]);

  const toggle = useCallback(
    async (productId: string) => {
      const adding = !ids.has(productId);
      const apply = (add: boolean) =>
        setIds((current) => {
          const next = new Set(current);
          if (add) next.add(productId);
          else next.delete(productId);
          return next;
        });
      apply(adding);
      try {
        await api(`/favorites/${productId}`, { method: adding ? 'PUT' : 'DELETE' });
      } catch (err) {
        apply(!adding);
        throw err;
      }
    },
    [ids]
  );

  const value = useMemo(() => ({ ids, toggle }), [ids, toggle]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = () => {
  const value = useContext(FavoritesContext);
  if (!value) throw new Error('useFavorites must be used inside FavoritesProvider');
  return value;
};
