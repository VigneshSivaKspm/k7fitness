import { useState } from 'react';
import { CopyPlus, Plus, Trash2, X } from 'lucide-react';
import { Card } from '../ui/Layout';
import Button from '../ui/Button';
import ReorderButtons, { moveItem } from '../ui/ReorderButtons';
import { SelectField, TextArea, TextField } from '../ui/Field';
import { DIET_GOALS, MEAL_SLOTS } from '../../constants/options';
import { uid } from '../../utils/format';

export const newFood = () => ({ id: uid(), food: '', quantity: '', notes: '', alternatives: '' });
export const newMeal = (slot) => ({ id: uid(), slot, time: '', items: [newFood()] });
export const emptyDiet = () => ({
  name: '',
  goal: '',
  description: '',
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  meals: ['Breakfast', 'Lunch', 'Dinner'].map(newMeal),
});

const MACROS = [
  { key: 'calories', label: 'Calories', unit: 'kcal', max: 10000 },
  { key: 'protein', label: 'Protein', unit: 'g', max: 1000 },
  { key: 'carbs', label: 'Carbs', unit: 'g', max: 2000 },
  { key: 'fat', label: 'Fat', unit: 'g', max: 1000 },
];

export function validateDiet(d) {
  const errors = {};
  if (!d.name.trim()) errors.name = 'Plan name is required.';
  else if (d.name.length > 80) errors.name = 'Plan name is too long.';
  for (const m of MACROS) {
    const raw = d[m.key];
    if (raw === '' || raw === null || raw === undefined) continue;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0 || n > m.max) errors[m.key] = `${m.label} must be between 0 and ${m.max}.`;
  }
  if (!d.meals.length) errors.meals = 'Add at least one meal.';
  d.meals.forEach((meal) => {
    if (!meal.slot.trim()) errors[`meal-${meal.id}`] = 'Meal name is required.';
    meal.items.forEach((it) => {
      if (!it.food.trim()) errors[`food-${it.id}`] = 'Food is required.';
    });
  });
  return errors;
}

export function cleanDiet(d) {
  const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
  return {
    name: d.name.trim(),
    goal: d.goal,
    description: d.description.trim(),
    calories: num(d.calories),
    protein: num(d.protein),
    carbs: num(d.carbs),
    fat: num(d.fat),
    meals: d.meals.map((m) => ({
      id: m.id,
      slot: m.slot.trim(),
      time: m.time || '',
      items: m.items.map((it) => ({
        id: it.id,
        food: it.food.trim(),
        quantity: (it.quantity || '').trim(),
        notes: (it.notes || '').trim(),
        alternatives: (it.alternatives || '').trim(),
      })),
    })),
    mealCount: d.meals.length,
  };
}

/** Diet chart editor: meta, macros and ordered meal slots with food items. */
export default function DietForm({ value, onChange, errors = {} }) {
  const [slotToAdd, setSlotToAdd] = useState('');
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });
  const setMeals = (meals) => onChange({ ...value, meals });
  const updateMeal = (i, meal) => setMeals(value.meals.map((m, j) => (j === i ? meal : m)));
  const usedSlots = new Set(value.meals.map((m) => m.slot));

  const addMeal = () => {
    const slot = slotToAdd === '__custom' ? 'Custom meal' : slotToAdd || MEAL_SLOTS.find((s) => !usedSlots.has(s)) || 'Custom meal';
    // Insert preset slots in their natural order of the day.
    const order = MEAL_SLOTS.indexOf(slot);
    let at = value.meals.length;
    if (order >= 0) {
      const idx = value.meals.findIndex((m) => MEAL_SLOTS.indexOf(m.slot) > order);
      if (idx >= 0) at = idx;
    }
    setMeals([...value.meals.slice(0, at), newMeal(slot), ...value.meals.slice(at)]);
    setSlotToAdd('');
  };

  return (
    <div className="space-y-5">
      <Card title="Plan details">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Plan name" required name="name" className="sm:col-span-2" placeholder="e.g. High Protein Muscle Gain" value={value.name} onChange={set('name')} error={errors.name} />
          <SelectField label="Goal" name="goal" placeholder="Select goal" options={DIET_GOALS.map((g) => ({ value: g, label: g }))} value={value.goal} onChange={set('goal')} />
          <TextArea label="Description" optional name="description" rows={1} value={value.description} onChange={set('description')} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {MACROS.map((m) => (
            <TextField
              key={m.key}
              label={`${m.label} (${m.unit})`}
              name={m.key}
              type="number"
              inputMode="numeric"
              min="0"
              optional
              value={value[m.key] ?? ''}
              onChange={set(m.key)}
              error={errors[m.key]}
            />
          ))}
        </div>
      </Card>

      {errors.meals && <p className="text-sm font-medium text-red-600">{errors.meals}</p>}

      {value.meals.map((meal, i) => (
        <Card
          key={meal.id}
          className="overflow-hidden"
          bodyClassName="space-y-2 bg-zinc-50/60 p-3 sm:p-4"
          title={
            <span className="flex flex-wrap items-center gap-2">
              <input
                className="input !h-10 !w-40 !py-1 font-semibold sm:!w-44"
                name={`meal-${meal.id}`}
                value={meal.slot}
                list="meal-slots"
                onChange={(e) => updateMeal(i, { ...meal, slot: e.target.value })}
                aria-label="Meal name"
                aria-invalid={Boolean(errors[`meal-${meal.id}`])}
              />
              <input type="time" className="input !h-10 !w-32 !py-1" value={meal.time} onChange={(e) => updateMeal(i, { ...meal, time: e.target.value })} aria-label={`${meal.slot} time (optional)`} />
            </span>
          }
          actions={
            <span className="flex items-center">
              <ReorderButtons index={i} count={value.meals.length} onMove={(idx, dir) => setMeals(moveItem(value.meals, idx, dir))} label="meal" />
              <button
                type="button"
                onClick={() =>
                  setMeals([...value.meals.slice(0, i + 1), { ...meal, id: uid(), items: meal.items.map((it) => ({ ...it, id: uid() })) }, ...value.meals.slice(i + 1)])
                }
                className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800"
                aria-label="Duplicate meal"
              >
                <CopyPlus className="size-4" />
              </button>
              <button type="button" onClick={() => setMeals(value.meals.filter((_, j) => j !== i))} className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600" aria-label="Remove meal">
                <Trash2 className="size-4" />
              </button>
            </span>
          }
        >
          {meal.items.map((it, j) => {
            const setItem = (k) => (e) => updateMeal(i, { ...meal, items: meal.items.map((x) => (x.id === it.id ? { ...x, [k]: e.target.value } : x)) });
            const small = 'input !px-2.5 !py-2 text-sm';
            const lbl = 'mb-1 block text-[0.7rem] font-semibold tracking-wide text-zinc-500 uppercase';
            return (
              <div key={it.id} className="rounded-xl border border-zinc-200 bg-white p-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-xs font-bold text-zinc-500">{j + 1}</span>
                  <input className={`${small} min-w-0 flex-1 font-medium`} name={`food-${it.id}`} placeholder="Food (e.g. Oats with milk)" value={it.food} onChange={setItem('food')} aria-label="Food" aria-invalid={Boolean(errors[`food-${it.id}`])} />
                  <div className="flex shrink-0 items-center">
                    <ReorderButtons index={j} count={meal.items.length} onMove={(idx, dir) => updateMeal(i, { ...meal, items: moveItem(meal.items, idx, dir) })} label="food" />
                    <button type="button" onClick={() => updateMeal(i, { ...meal, items: meal.items.filter((x) => x.id !== it.id) })} className="rounded-md p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600" aria-label="Remove food">
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
                {errors[`food-${it.id}`] && <p className="mt-1.5 text-xs font-medium text-red-600">{errors[`food-${it.id}`]}</p>}
                <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
                  <label className="block min-w-0">
                    <span className={lbl}>Quantity</span>
                    <input className={small} placeholder="e.g. 60 g / 1 bowl" value={it.quantity} onChange={setItem('quantity')} />
                  </label>
                  <label className="block min-w-0">
                    <span className={lbl}>Notes</span>
                    <input className={small} placeholder="Optional" value={it.notes} onChange={setItem('notes')} />
                  </label>
                  <label className="block min-w-0">
                    <span className={lbl}>Alternatives</span>
                    <input className={small} placeholder="Optional" value={it.alternatives} onChange={setItem('alternatives')} />
                  </label>
                </div>
              </div>
            );
          })}
          <Button size="sm" variant="secondary" icon={Plus} onClick={() => updateMeal(i, { ...meal, items: [...meal.items, newFood()] })}>
            Add food
          </Button>
        </Card>
      ))}

      <datalist id="meal-slots">
        {MEAL_SLOTS.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-zinc-300 p-3 sm:flex-row">
        <select className="input sm:flex-1" value={slotToAdd} onChange={(e) => setSlotToAdd(e.target.value)} aria-label="Meal to add">
          <option value="">Next meal slot</option>
          {MEAL_SLOTS.map((s) => (
            <option key={s} value={s} disabled={usedSlots.has(s)}>
              {s}
              {usedSlots.has(s) ? ' (added)' : ''}
            </option>
          ))}
          <option value="__custom">Custom meal slot…</option>
        </select>
        <Button variant="secondary" icon={Plus} onClick={addMeal}>
          Add meal
        </Button>
      </div>
    </div>
  );
}
