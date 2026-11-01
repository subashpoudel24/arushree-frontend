'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Pagination, useAction, useList, Notice } from '@/components/admin/kit';
import { Button, Spinner } from '@/components/ui';
import { api } from '@/lib/api';

export interface PickedImage {
  url: string;
  publicId?: string;
  alt?: string;
}

interface MediaItem {
  _id: string;
  url: string;
  publicId: string;
  filename: string;
}

export const uploadImage = async (file: File) => {
  const body = new FormData();
  body.append('image', file);
  const { media } = await api<{ media: MediaItem }>('/admin/media', { method: 'POST', body });
  return media;
};

export const UploadButton = ({ onUploaded, busy, disabled }: { onUploaded: (file: File) => void; busy?: boolean; disabled?: boolean }) => (
  <label className="inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-gold px-5 text-sm font-semibold hover:bg-gold-strong has-[:disabled]:opacity-60 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-bronze">
    {busy ? 'Uploading…' : 'Upload image'}
    <input
      type="file"
      accept="image/jpeg,image/png,image/webp"
      className="sr-only"
      disabled={busy || disabled}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (file) onUploaded(file);
      }}
    />
  </label>
);

const LibraryDialog = ({ onClose, onPick }: { onClose: () => void; onPick: (image: PickedImage) => void }) => {
  const dialog = useRef<HTMLDialogElement>(null);
  const { data, page, setPage, error, reload } = useList<MediaItem>('/admin/media', '', 24);
  const { busy, notice, run } = useAction();

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  const upload = (file: File) =>
    run(async () => {
      const media = await uploadImage(file);
      onPick({ url: media.url, publicId: media.publicId });
      await reload();
    });

  return (
    <dialog ref={dialog} onClose={onClose} aria-label="Media library" className="m-auto w-[min(92vw,800px)] rounded-2xl p-0 backdrop:bg-black/50">
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold">Choose an image</h2>
          <button type="button" aria-label="Close" onClick={() => dialog.current?.close()} className="flex size-11 items-center justify-center">
            <X aria-hidden />
          </button>
        </div>
        <Notice notice={notice ?? (error ? { type: 'error', text: error } : null)} />
        <div className="mb-4">
          <UploadButton onUploaded={upload} busy={busy} />
        </div>
        {!data ? (
          !error && <Spinner />
        ) : data.items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">No images yet. Upload the first one.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {data.items.map((item) => (
              <button
                key={item._id}
                type="button"
                aria-label={`Use ${item.filename}`}
                onClick={() => onPick({ url: item.url, publicId: item.publicId })}
                className="relative aspect-square overflow-hidden rounded-lg border border-line hover:border-bronze">
                <Image src={item.url} alt="" fill sizes="150px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
        {data && <Pagination page={page} pages={data.pages} onPage={setPage} />}
      </div>
    </dialog>
  );
};

export const ChooseImageButton = ({ label, onPick }: { label: string; onPick: (image: PickedImage) => void }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        {label}
      </Button>
      {open && (
        <LibraryDialog
          onClose={() => setOpen(false)}
          onPick={(image) => {
            onPick(image);
            setOpen(false);
          }}
        />
      )}
    </>
  );
};
