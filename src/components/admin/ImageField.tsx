'use client';

import Image from 'next/image';
import { useAdmin } from '@/components/admin/AdminShell';
import { ChooseImageButton, PickedImage } from '@/components/admin/ImagePicker';
import { ActionLink } from '@/components/admin/kit';

interface Props {
  label: string;
  value?: PickedImage | null;
  onChange: (image: PickedImage | null) => void;
  removable?: boolean;
  hint?: string;
}

// One image with preview. The library needs media permission; viewing does not.
export const ImageField = ({ label, value, onChange, removable = true, hint }: Props) => {
  const { can } = useAdmin();
  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {hint && <p className="-mt-1 mb-1.5 text-xs text-muted">{hint}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-line bg-sand">
          {value && <Image src={value.url} alt="" fill sizes="64px" className="object-cover" />}
        </div>
        {can('media.write') && <ChooseImageButton label={value ? 'Change' : 'Choose image'} onPick={onChange} />}
        {value && removable && (
          <ActionLink danger onClick={() => onChange(null)}>
            Remove
          </ActionLink>
        )}
      </div>
    </div>
  );
};
