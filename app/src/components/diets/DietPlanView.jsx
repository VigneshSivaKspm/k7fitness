import { Clock } from 'lucide-react';

export function MacroSummary({ plan }) {
  const macros = [
    { label: 'Calories', value: plan.calories, unit: 'kcal' },
    { label: 'Protein', value: plan.protein, unit: 'g' },
    { label: 'Carbs', value: plan.carbs, unit: 'g' },
    { label: 'Fat', value: plan.fat, unit: 'g' },
  ].filter((m) => m.value);
  if (!macros.length) return null;
  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {macros.map((m) => (
        <div key={m.label} className="rounded-xl bg-zinc-50 px-4 py-3 ring-1 ring-zinc-100">
          <dt className="text-[0.7rem] font-semibold tracking-wide text-zinc-500 uppercase">{m.label}</dt>
          <dd className="tabular mt-0.5 text-lg font-bold text-zinc-900">
            {m.value}
            <span className="ml-0.5 text-xs font-medium text-zinc-500">{m.unit}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Read-only, print-friendly rendering of a diet plan. */
export default function DietPlanView({ plan }) {
  const meals = plan?.meals || [];
  return (
    <div className="space-y-4">
      <MacroSummary plan={plan} />
      {!meals.length ? (
        <p className="text-sm text-zinc-500">This plan has no meals yet.</p>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {meals.map((meal, i) => (
            <section key={meal.id || i} className="print-break overflow-hidden rounded-xl border border-zinc-200">
              <header className="flex items-center justify-between gap-3 border-b border-zinc-100 bg-zinc-50 px-4 py-2.5">
                <h3 className="font-semibold text-zinc-900">{meal.slot}</h3>
                {meal.time && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500">
                    <Clock className="size-3.5" /> {meal.time}
                  </span>
                )}
              </header>
              <ul className="divide-y divide-zinc-100">
                {(meal.items || []).map((item, j) => (
                  <li key={item.id || j} className="px-4 py-2.5 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="font-medium text-zinc-900">{item.food}</span>
                      {item.quantity && <span className="shrink-0 text-zinc-600">{item.quantity}</span>}
                    </div>
                    {item.notes && <p className="mt-0.5 text-xs text-zinc-500">{item.notes}</p>}
                    {item.alternatives && <p className="mt-0.5 text-xs text-zinc-500">Alternatives: {item.alternatives}</p>}
                  </li>
                ))}
                {!meal.items?.length && <li className="px-4 py-2.5 text-sm text-zinc-500">No items</li>}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
