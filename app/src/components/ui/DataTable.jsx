import { SkeletonRows } from './Feedback';

/**
 * Responsive data table.
 *  • ≥ md: a clean table with sticky header and row hover.
 *  • < md: each row becomes a tappable card via `renderCard(row)`.
 *
 * columns: [{ key, header, render(row), className, align: 'right' }]
 */
export default function DataTable({ columns, rows, rowKey = 'id', onRowClick, renderCard, loading, empty, minWidth = 720 }) {
  if (loading && !rows.length) return <SkeletonRows rows={6} />;
  if (!rows.length) return empty || null;

  const clickable = Boolean(onRowClick);
  const key = (row) => (typeof rowKey === 'function' ? rowKey(row) : row[rowKey]);

  return (
    <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
      {/* Desktop / tablet */}
      <div className={`overflow-x-auto ${renderCard ? 'hidden md:block' : ''}`}>
        <table className="w-full text-left text-sm" style={{ minWidth }}>
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/80">
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={`px-4 py-3 text-xs font-semibold tracking-wide whitespace-nowrap text-zinc-500 uppercase first:pl-5 last:pr-5 ${
                    c.align === 'right' ? 'text-right' : ''
                  } ${c.className || ''}`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((row) => (
              <tr
                key={key(row)}
                onClick={clickable ? () => onRowClick(row) : undefined}
                className={`transition-colors ${clickable ? 'cursor-pointer hover:bg-brand-50/40' : 'hover:bg-zinc-50/60'}`}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`px-4 py-3.5 align-middle text-zinc-700 first:pl-5 last:pr-5 ${c.align === 'right' ? 'text-right' : ''} ${c.className || ''}`}
                    onClick={c.stopPropagation ? (e) => e.stopPropagation() : undefined}
                  >
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      {renderCard && (
        <ul className="divide-y divide-zinc-100 md:hidden">
          {rows.map((row) => (
            <li key={key(row)}>
              {clickable ? (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onRowClick(row)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onRowClick(row))}
                  className="block w-full px-4 py-3.5 text-left transition active:bg-zinc-50"
                >
                  {renderCard(row)}
                </div>
              ) : (
                <div className="px-4 py-3.5">{renderCard(row)}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
