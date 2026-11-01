'use client';

import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert, Button } from '@/components/ui';
import { useCart } from '@/contexts/CartContext';
import { errorMessage } from '@/lib/api';

export const AddToCart = ({ productId, stock }: { productId: string; stock: number }) => {
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [busy, setBusy] = useState<'add' | 'buy' | null>(null);
  const max = Math.min(stock, 99);

  if (stock <= 0) return null;

  const add = async (mode: 'add' | 'buy') => {
    setMessage(null);
    setBusy(mode);
    try {
      await addItem(productId, quantity);
      if (mode === 'buy') {
        router.push('/checkout');
        return;
      }
      setMessage({ type: 'success', text: 'Added to your cart.' });
    } catch (err) {
      setMessage({ type: 'error', text: errorMessage(err) });
    }
    setBusy(null);
  };

  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium" id="quantity-label">
          Quantity
        </span>
        <div role="group" aria-labelledby="quantity-label" className="flex items-center rounded-lg border border-line bg-white">
          <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity(quantity - 1)} className="flex size-11 items-center justify-center disabled:opacity-40">
            <Minus size={16} aria-hidden />
          </button>
          <span className="w-8 text-center text-sm font-semibold" aria-live="polite">
            {quantity}
          </span>
          <button type="button" aria-label="Increase quantity" disabled={quantity >= max} onClick={() => setQuantity(quantity + 1)} className="flex size-11 items-center justify-center disabled:opacity-40">
            <Plus size={16} aria-hidden />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button onClick={() => add('add')} loading={busy === 'add'} disabled={!!busy} className="flex-1 gap-2">
          <ShoppingBag size={18} aria-hidden /> Add to cart
        </Button>
        <Button variant="outline" onClick={() => add('buy')} loading={busy === 'buy'} disabled={!!busy} className="flex-1">
          Buy now
        </Button>
      </div>
      {message && <Alert type={message.type}>{message.text}</Alert>}
    </div>
  );
};
