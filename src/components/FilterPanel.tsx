import { SlidersHorizontal } from 'lucide-react';
import { ReactNode } from 'react';

// Always visible on desktop. On phones a checkbox folds it, so it is correct from
// the first paint with no JavaScript, and nothing jumps while the page loads.
export const FilterPanel = ({ hasFilters, children }: { hasFilters: boolean; children: ReactNode }) => (
  <div className="lg:w-64 lg:shrink-0">
    <input id="filter-toggle" type="checkbox" defaultChecked={hasFilters} className="peer sr-only" />
    <label
      htmlFor="filter-toggle"
      className="flex min-h-11 cursor-pointer items-center gap-2 font-semibold peer-focus-visible:outline-2 peer-focus-visible:outline-bronze lg:hidden">
      <SlidersHorizontal size={18} aria-hidden /> Filter and sort
    </label>
    <div className="hidden peer-checked:block lg:block">{children}</div>
  </div>
);
