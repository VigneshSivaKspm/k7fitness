import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';

/** Page title row with optional back link and actions. */
export function PageHeader({ title, description, actions, back, eyebrow, className = '' }) {
  return (
    <div className={`mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div className="min-w-0">
        {back && (
          <Link to={back.to} className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900">
            <ArrowLeft className="size-4" /> {back.label}
          </Link>
        )}
        {eyebrow && <p className="mb-1 text-xs font-semibold tracking-wider text-brand uppercase">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-[1.65rem]">{title}</h1>
        {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, description, actions, children, className = '', bodyClassName = 'p-5', as: As = 'section' }) {
  return (
    <As className={`card ${className}`}>
      {(title || actions) && (
        <div className="card-header">
          <div className="min-w-0">
            {title && (typeof title === 'string' ? <h2 className="card-title">{title}</h2> : <div className="card-title">{title}</div>)}
            {description && <p className="mt-0.5 text-[0.8rem] text-zinc-500">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </As>
  );
}

/** Label/value pairs for detail views. */
export function DetailList({ items, columns = 2 }) {
  const visible = items.filter((i) => !i.hidden);
  return (
    <dl className={`grid gap-x-6 gap-y-4 ${columns === 2 ? 'sm:grid-cols-2' : columns === 3 ? 'sm:grid-cols-3' : ''}`}>
      {visible.map((i) => (
        <div key={i.label} className={i.full ? 'sm:col-span-full' : ''}>
          <dt className="text-xs font-medium text-zinc-500">{i.label}</dt>
          <dd className="mt-0.5 text-sm font-medium break-words whitespace-pre-line text-zinc-900">{i.value || <span className="text-zinc-400">—</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Sticky bottom action bar for long forms on mobile. */
export function FormActions({ children }) {
  return (
    <div className="sticky bottom-16 z-20 -mx-4 mt-6 border-t border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none lg:bottom-0">
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end [&>*]:w-full sm:[&>*]:w-auto">{children}</div>
    </div>
  );
}
