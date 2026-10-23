import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export default function Pagination({ page, hasPrev, hasNext, onPrev, onNext, loading, count }) {
  if (!hasPrev && !hasNext) return null;
  return (
    <nav className="flex items-center justify-between gap-3 border-t border-zinc-100 px-4 py-3 sm:px-5" aria-label="Pagination">
      <p className="text-[0.8rem] text-zinc-500">
        Page <span className="font-semibold text-zinc-800">{page}</span>
        {count !== undefined && <span className="hidden sm:inline"> · {count} shown</span>}
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" icon={ChevronLeft} onClick={onPrev} disabled={!hasPrev || loading}>
          Prev
        </Button>
        <Button variant="secondary" size="sm" onClick={onNext} disabled={!hasNext || loading}>
          Next <ChevronRight className="size-4" />
        </Button>
      </div>
    </nav>
  );
}
