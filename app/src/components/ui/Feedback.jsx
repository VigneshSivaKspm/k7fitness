import { CircleAlert, LoaderCircle, RotateCcw } from 'lucide-react';
import Button from './Button';

export function Spinner({ className = 'size-5' }) {
  return <LoaderCircle className={`animate-spin text-brand ${className}`} aria-label="Loading" />;
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-zinc-200/70 ${className}`} aria-hidden="true" />;
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-zinc-500" role="status">
      <Spinner className="size-7" />
      {label}
    </div>
  );
}

export function SkeletonRows({ rows = 5, className = '' }) {
  return (
    <div className={`divide-y divide-zinc-100 ${className}`} role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-4">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="hidden h-6 w-20 rounded-full sm:block" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-14 text-center ${className}`}>
      {Icon && (
        <span className="relative mb-4 flex size-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
          <Icon className="size-6" />
          <span className="absolute -right-1 -bottom-1 size-3 rotate-45 bg-brand" aria-hidden="true" />
        </span>
      )}
      <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-zinc-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-12 text-center ${className}`} role="alert">
      <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <CircleAlert className="size-6" />
      </span>
      <p className="max-w-sm text-sm text-zinc-700">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={RotateCcw} className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
