import { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';

/** Edits a list of short strings (plan features, benefits…). */
export default function ListEditor({ label, items = [], onChange, placeholder = 'Add an item', max = 20, hint }) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const v = draft.trim();
    if (!v || items.includes(v) || items.length >= max) return;
    onChange([...items, v]);
    setDraft('');
  };
  const move = (i, dir) => {
    const next = [...items];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  };

  return (
    <div>
      {label && <p className="label">{label}</p>}
      {items.length > 0 && (
        <ul className="mb-2 divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white">
          {items.map((item, i) => (
            <li key={item} className="flex items-center gap-2 py-1.5 pr-1.5 pl-3 text-sm text-zinc-800">
              <span className="min-w-0 flex-1 break-words">{item}</span>
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30" aria-label={`Move ${item} up`}>
                <ArrowUp className="size-3.5" />
              </button>
              <button type="button" disabled={i === items.length - 1} onClick={() => move(i, 1)} className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30" aria-label={`Move ${item} down`}>
                <ArrowDown className="size-3.5" />
              </button>
              <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="rounded p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${item}`}>
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          className="input"
          value={draft}
          maxLength={120}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          aria-label={placeholder}
        />
        <button type="button" onClick={add} disabled={!draft.trim()} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50">
          <Plus className="size-4" /> Add
        </button>
      </div>
      {hint && <p className="mt-1.5 text-[0.8rem] text-zinc-500">{hint}</p>}
    </div>
  );
}
