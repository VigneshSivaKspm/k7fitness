/**
 * Horizontally scrollable tab bar (works well on phones).
 * tabs: [{ value, label, count? }]
 */
export default function Tabs({ tabs, value, onChange, className = '', variant = 'underline' }) {
  if (variant === 'pill') {
    return (
      <div role="tablist" className={`no-scrollbar flex gap-1.5 overflow-x-auto ${className}`}>
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={value === t.value}
            onClick={() => onChange(t.value)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              value === t.value ? 'bg-ink text-white' : 'bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50'
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={`rounded-full px-1.5 text-xs ${value === t.value ? 'bg-white/20' : 'bg-zinc-100 text-zinc-500'}`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>
    );
  }
  return (
    <div role="tablist" className={`no-scrollbar flex gap-1 overflow-x-auto border-b border-zinc-200 ${className}`}>
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          role="tab"
          aria-selected={value === t.value}
          onClick={() => onChange(t.value)}
          className={`relative inline-flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition ${
            value === t.value ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          {t.icon && <t.icon className="size-4" />}
          {t.label}
          {t.count !== undefined && <span className="rounded-full bg-zinc-100 px-1.5 text-xs text-zinc-600">{t.count}</span>}
          <span className={`absolute inset-x-2 -bottom-px h-0.5 rounded-full transition ${value === t.value ? 'bg-brand' : 'bg-transparent'}`} />
        </button>
      ))}
    </div>
  );
}
