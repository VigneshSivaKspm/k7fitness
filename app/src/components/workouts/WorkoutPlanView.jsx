/** Read-only, print-friendly rendering of a workout plan's days and exercises. */
export default function WorkoutPlanView({ plan, compact = false }) {
  const days = plan?.days || [];
  if (!days.length) return <p className="text-sm text-zinc-500">This plan has no workout days yet.</p>;
  return (
    <div className={`grid gap-4 ${compact ? '' : 'xl:grid-cols-2'}`}>
      {days.map((day, i) => (
        <section key={day.id || i} className="print-break overflow-hidden rounded-xl border border-zinc-200">
          <header className="flex items-center gap-3 border-b border-zinc-100 bg-zinc-50 px-4 py-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-ink text-xs font-bold text-white">{i + 1}</span>
            <h3 className="font-semibold text-zinc-900">{day.title || `Day ${i + 1}`}</h3>
          </header>
          {day.exercises?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <thead>
                  <tr className="text-left text-[0.7rem] tracking-wide text-zinc-500 uppercase">
                    <th className="px-4 py-2 font-semibold">Exercise</th>
                    <th className="px-2 py-2 text-center font-semibold">Sets</th>
                    <th className="px-2 py-2 text-center font-semibold">Reps</th>
                    <th className="px-2 py-2 text-center font-semibold">Weight</th>
                    <th className="px-4 py-2 text-right font-semibold">Rest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {day.exercises.map((ex, j) => (
                    <tr key={ex.id || j}>
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-zinc-900">{ex.name}</p>
                        {(ex.duration || ex.instructions) && (
                          <p className="mt-0.5 text-xs text-zinc-500">{[ex.duration, ex.instructions].filter(Boolean).join(' · ')}</p>
                        )}
                      </td>
                      <td className="tabular px-2 py-2.5 text-center">{ex.sets || '—'}</td>
                      <td className="tabular px-2 py-2.5 text-center">{ex.reps || '—'}</td>
                      <td className="px-2 py-2.5 text-center">{ex.weight || '—'}</td>
                      <td className="px-4 py-2.5 text-right">{ex.rest || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-4 py-3 text-sm text-zinc-500">{day.notes || 'Rest / recovery day'}</p>
          )}
          {day.notes && day.exercises?.length > 0 && <p className="border-t border-zinc-100 px-4 py-2 text-xs text-zinc-500">{day.notes}</p>}
        </section>
      ))}
    </div>
  );
}
