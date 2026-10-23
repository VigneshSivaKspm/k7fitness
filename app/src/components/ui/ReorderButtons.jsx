import { ArrowDown, ArrowUp } from 'lucide-react';

/** Up/down move controls: reliable on touch screens and keyboard accessible. */
export default function ReorderButtons({ index, count, onMove, label = 'item' }) {
  const cls = 'rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-800 disabled:pointer-events-none disabled:opacity-30';
  return (
    <span className="inline-flex">
      <button type="button" className={cls} disabled={index === 0} onClick={() => onMove(index, -1)} aria-label={`Move ${label} up`}>
        <ArrowUp className="size-4" />
      </button>
      <button type="button" className={cls} disabled={index === count - 1} onClick={() => onMove(index, 1)} aria-label={`Move ${label} down`}>
        <ArrowDown className="size-4" />
      </button>
    </span>
  );
}

export function moveItem(list, index, dir) {
  const next = [...list];
  const target = index + dir;
  if (target < 0 || target >= next.length) return list;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
