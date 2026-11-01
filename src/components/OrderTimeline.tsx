import { OrderHistoryEntry, formatDateTime, statusLabel } from '@/lib/orders';

export const OrderTimeline = ({ history }: { history: OrderHistoryEntry[] }) => (
  <ol className="space-y-3 border-l-2 border-line pl-4">
    {history.map((entry, index) => (
      <li key={`${entry.status}-${entry.at}`} className="relative text-sm">
        <span
          aria-hidden
          className={`absolute -left-[21px] top-1 size-2.5 rounded-full ${index === history.length - 1 ? 'bg-bronze' : 'bg-line'}`}
        />
        <p className="font-medium">{statusLabel(entry.status)}</p>
        <time className="text-xs text-muted" dateTime={entry.at}>
          {formatDateTime(entry.at)}
        </time>
      </li>
    ))}
  </ol>
);
