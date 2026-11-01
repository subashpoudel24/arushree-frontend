'use client';

import Image from 'next/image';
import { useState } from 'react';

export const ProductGallery = ({ images, name }: { images: { url: string; alt?: string }[]; name: string }) => {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-sand">
        {current ? (
          <Image src={current.url} alt={current.alt ?? name} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        ) : (
          <p className="flex h-full items-center justify-center text-sm text-muted">No image yet</p>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              aria-label={`Show image ${index + 1} of ${images.length}`}
              aria-current={index === active}
              onClick={() => setActive(index)}
              className={`relative size-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                index === active ? 'border-bronze' : 'border-line'
              }`}>
              <Image src={image.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
