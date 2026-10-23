import { useId } from 'react';

/**
 * Minimal, brand-styled bar chart. Bars are crimson, with the latest bar
 * emphasised; an accessible data table is provided for screen readers.
 * data: [{ label, value }]
 */
export default function BarChart({ data, format = (v) => v, height = 180, highlightLast = true }) {
  const id = useId();
  const max = Math.max(...data.map((d) => d.value), 0);
  const nice = max === 0 ? 1 : max;
  const allZero = max === 0;

  return (
    <figure aria-labelledby={id}>
      <div className="flex items-end gap-2 sm:gap-3" style={{ height }} aria-hidden="true">
        {data.map((d, i) => {
          const pct = (d.value / nice) * 100;
          const last = highlightLast && i === data.length - 1;
          return (
            <div key={d.label} className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
              <span className={`tabular text-[0.7rem] font-semibold whitespace-nowrap ${last ? 'text-zinc-900' : 'text-zinc-500 opacity-0 transition group-hover:opacity-100'} max-sm:hidden`}>
                {format(d.value)}
              </span>
              <div
                className={`w-full max-w-12 rounded-t-md transition-all duration-500 ${last ? 'bg-brand' : 'bg-zinc-800/85 group-hover:bg-brand-dark'}`}
                style={{ height: `${allZero ? 2 : Math.max(pct, d.value > 0 ? 3 : 1)}%` }}
                title={`${d.label}: ${format(d.value)}`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2 border-t border-zinc-100 pt-2 sm:gap-3" aria-hidden="true">
        {data.map((d, i) => (
          <span
            key={d.label}
            className={`min-w-0 flex-1 text-center text-[0.7rem] font-medium whitespace-nowrap text-zinc-500 ${
              data.length > 8 && (data.length - 1 - i) % 2 ? 'max-sm:invisible' : ''
            } ${data.length > 8 ? 'sm:truncate' : 'truncate'}`}
          >
            {d.label}
          </span>
        ))}
      </div>
      <figcaption id={id} className="sr-only">
        <table>
          <tbody>
            {data.map((d) => (
              <tr key={d.label}>
                <th>{d.label}</th>
                <td>{format(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  );
}

/** Horizontal share bars — used for plan distribution and payment methods. */
export function ShareBars({ data, format = (v) => v }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const sorted = [...data].sort((a, b) => b.value - a.value);
  return (
    <ul className="space-y-3.5">
      {sorted.map((d, i) => (
        <li key={d.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-medium text-zinc-700">{d.label}</span>
            <span className="tabular shrink-0 text-zinc-500">
              <span className="font-semibold text-zinc-900">{format(d.value)}</span> · {Math.round((d.value / total) * 100)}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
            <div
              className={`h-full rounded-full ${i === 0 ? 'bg-brand' : i === 1 ? 'bg-brand-dark' : i === 2 ? 'bg-zinc-700' : 'bg-zinc-400'}`}
              style={{ width: `${(d.value / total) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
