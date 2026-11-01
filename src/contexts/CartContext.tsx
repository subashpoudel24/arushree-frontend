'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

export interface CartLine {
  productId: string;
  name: string;
  slug: string;
  imageUrl?: string;
  unitPrice: number;
  compareAtPrice?: number;
  quantity: number;
  stock: number;
  lineTotal: number;
  issue?: 'unavailable' | 'insufficient_stock';
}

export interface Cart {
  lines: CartLine[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  couponError?: string;
  hasIssues: boolean;
  itemCount: number;
}

interface CartValue {
  cart: Cart | null;
  loadError: boolean;
  reload: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<void>;
  setQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
}

const CartContext = createContext<CartValue | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, status } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loadError, setLoadError] = useState(false);

  const call = useCallback(async (path: string, method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET', body?: unknown) => {
    const data = await api<{ cart: Cart }>(path, { method, body, guestOk: true });
    setCart(data.cart);
  }, []);

  const reload = useCallback(async () => {
    setLoadError(false);
    try {
      await call('/cart');
    } catch {
      setLoadError(true);
    }
  }, [call]);

  // Signing in or out switches which cart is showing.
  const userId = user?.id;
  useEffect(() => {
    if (status !== 'loading') void reload();
  }, [status, userId, reload]);

  const value = useMemo<CartValue>(
    () => ({
      cart,
      loadError,
      reload,
      addItem: (productId, quantity) => call('/cart/items', 'POST', { productId, quantity }),
      setQuantity: (productId, quantity) => call(`/cart/items/${productId}`, 'PATCH', { quantity }),
      removeItem: (productId) => call(`/cart/items/${productId}`, 'DELETE'),
      applyCoupon: (code) => call('/cart/coupon', 'POST', { code }),
      removeCoupon: () => call('/cart/coupon', 'DELETE'),
    }),
    [cart, loadError, reload, call]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart must be used inside CartProvider');
  return value;
};
