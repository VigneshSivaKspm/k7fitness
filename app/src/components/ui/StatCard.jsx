import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import { Skeleton } from './Feedback';

const ACCENTS = {
  brand: 'bg-brand-50 text-brand',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  danger: 'bg-red-50 text-red-600',
  neutral: 'bg-zinc-100 text-zinc-600',
};

export default function StatCard({ label, value, icon: Icon, hint, to, tone = 'brand', loading }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.8rem] font-medium text-zinc-500">{label}</p>
        {Icon && (
          <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${ACCENTS[tone]}`}>
            <Icon className="size-[1.1rem]" />
          </span>
        )}
      </div>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-24" />
      ) : (
        <p className="tabular mt-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-[1.7rem]">{value}</p>
      )}
      {hint && <p className="mt-1 truncate text-xs text-zinc-500">{hint}</p>}
      <span className="absolute bottom-0 left-5 h-0.5 w-8 rounded-full bg-brand opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
      {to && <ArrowUpRight className="absolute right-4 bottom-4 size-4 text-zinc-300 transition group-hover:text-brand" aria-hidden="true" />}
    </>
  );
  const cls = 'card group relative block p-4 sm:p-5 transition';
  return to ? (
    <Link to={to} className={`${cls} hover:-translate-y-0.5 hover:shadow-pop`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
