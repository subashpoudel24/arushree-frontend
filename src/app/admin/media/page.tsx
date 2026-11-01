'use client';

import Image from 'next/image';
import { useAdmin } from '@/components/admin/AdminShell';
import { UploadButton, uploadImage } from '@/components/admin/ImagePicker';
import { ActionLink, Loading, Notice, PageHeader, Pagination, useAction, useList } from '@/components/admin/kit';
import { api } from '@/lib/api';

interface Media {
  _id: string;
  url: string;
  filename: string;
  bytes: number;
}

export default function AdminMediaPage() {
  const { can } = useAdmin();
  const { data, page, setPage, error, reload } = useList<Media>('/admin/media', '', 24);
  const { busy, notice, run } = useAction();

  return (
    <>
      <PageHeader title="Media library">
        <UploadButton
          busy={busy}
          onUploaded={(file) =>
            void run(async () => {
              await uploadImage(file);
              await reload();
            }, 'Image uploaded.')
          }
        />
      </PageHeader>
      <p className="mb-4 text-sm text-muted">JPG, PNG or WebP, up to 5 MB. Images in use cannot be deleted.</p>
      <Notice notice={notice} />
      <Loading error={error} ready={!!data}>
        {data && (
          <>
            {data.items.length === 0 ? (
              <p className="rounded-2xl border border-line bg-white p-10 text-center text-sm text-muted">No images yet.</p>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {data.items.map((item) => (
                  <li key={item._id} className="overflow-hidden rounded-2xl border border-line bg-white">
                    <div className="relative aspect-square bg-sand">
                      <Image src={item.url} alt={item.filename} fill sizes="200px" className="object-cover" />
                    </div>
                    <div className="p-2">
                      <p className="truncate text-xs" title={item.filename}>
                        {item.filename}
                      </p>
                      <p className="text-xs text-muted">{Math.ceil(item.bytes / 1024)} KB</p>
                      {can('media.delete') && (
                        <ActionLink
                          danger
                          onClick={() => {
                            if (!window.confirm(`Delete ${item.filename}?`)) return;
                            void run(async () => {
                              await api(`/admin/media/${item._id}`, { method: 'DELETE' });
                              await reload();
                            });
                          }}>
                          Delete
                        </ActionLink>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Pagination page={page} pages={data.pages} onPage={setPage} />
          </>
        )}
      </Loading>
    </>
  );
}
