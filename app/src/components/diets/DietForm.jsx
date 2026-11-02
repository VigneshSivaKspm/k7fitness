import { useState } from 'react';
import {
  CopyPlus,
  Plus,
  PlusCircle,
  Trash2,
  X,
  ArrowUp,
  ArrowDown,
  Clock,
} from 'lucide-react';
import { Card } from '../ui/Layout';
import Button from '../ui/Button';
import ReorderButtons, { moveItem } from '../ui/ReorderButtons';
import { SelectField, TextArea, TextField } from '../ui/Field';
import { DIET_GOALS, MEAL_SLOTS } from '../../constants/options';
import { uid } from '../../utils/format';

export const newFood = () => ({
  id: uid(),
  food: '',
  quantity: '',
  notes: '',
  alternatives: '',
});

export const newMeal = (slot) => ({
  id: uid(),
  slot,
  time: '',
  items: [newFood()],
});

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
    if (!Number.isFinite(n) || n < 0 || n > m.max)
      errors[m.key] = `${m.label} must be between 0 and ${m.max}.`;
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
  const num = (v) =>
    v === '' || v === null || v === undefined ? null : Number(v);
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

/**
 * Excel-Style Spreadsheet Table for Food Items in a Meal
 */
function MealFoodTable({
  items,
  errors,
  onChange,
  onAddRow,
  onAddMultipleRows,
}) {
  const updateItem = (index, field, value) => {
    const next = items.map((it, idx) =>
      idx === index ? { ...it, [field]: value } : it
    );
    onChange(next);
  };

  const removeRow = (index) => {
    onChange(items.filter((_, idx) => idx !== index));
  };

  const moveRow = (index, dir) => {
    onChange(moveItem(items, index, dir));
  };

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-xl border border-zinc-300 bg-white shadow-xs">
        <table className="w-full min-w-[700px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-300 bg-zinc-100 text-[0.68rem] font-bold uppercase tracking-wider text-zinc-700 select-none">
              <th className="w-12 border-r border-zinc-200 px-2 py-2 text-center text-zinc-500 bg-zinc-200/60 font-mono">
                #
              </th>
              <th className="min-w-[220px] border-r border-zinc-200 px-3 py-2">
                Food Item <span className="text-red-500">*</span>
              </th>
              <th className="w-44 border-r border-zinc-200 px-3 py-2">
                Portion / Quantity
              </th>
              <th className="min-w-[180px] border-r border-zinc-200 px-3 py-2">
                Healthy Alternatives
              </th>
              <th className="min-w-[180px] border-r border-zinc-200 px-3 py-2">
                Preparation / Notes
              </th>
              <th className="w-20 px-2 py-2 text-center text-zinc-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-200 font-sans">
            {items.map((it, index) => {
              const hasError = Boolean(errors[`food-${it.id}`]);
              const rowNum = index + 1;

              return (
                <tr
                  key={it.id || index}
                  className="group hover:bg-amber-50/30 transition-colors"
                >
                  <td className="border-r border-zinc-200 bg-zinc-50 px-2 py-1 text-center font-mono text-[0.7rem] font-bold text-zinc-500 select-none">
                    {rowNum}
                  </td>

                  <td
                    className={`border-r border-zinc-200 p-0 ${
                      hasError ? 'bg-red-50/70' : ''
                    }`}
                  >
                    <input
                      type="text"
                      name={`food-${it.id}`}
                      value={it.food}
                      onChange={(e) =>
                        updateItem(index, 'food', e.target.value)
                      }
                      placeholder="e.g. Rolled Oats with Skimmed Milk"
                      className="w-full bg-transparent px-3 py-2 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand"
                    />
                    {hasError && (
                      <p className="px-3 pb-1 text-[0.68rem] font-semibold text-red-600">
                        {errors[`food-${it.id}`]}
                      </p>
                    )}
                  </td>

                  <td className="border-r border-zinc-200 p-0">
                    <input
                      type="text"
                      value={it.quantity}
                      onChange={(e) =>
                        updateItem(index, 'quantity', e.target.value)
                      }
                      placeholder="e.g. 60g oats + 200ml milk"
                      className="w-full bg-transparent px-3 py-2 text-xs font-medium text-zinc-800 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand"
                    />
                  </td>

                  <td className="border-r border-zinc-200 p-0">
                    <input
                      type="text"
                      value={it.alternatives}
                      onChange={(e) =>
                        updateItem(index, 'alternatives', e.target.value)
                      }
                      placeholder="e.g. 3 Boiled Egg Whites or 100g Paneer"
                      className="w-full bg-transparent px-3 py-2 text-xs text-zinc-700 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand"
                    />
                  </td>

                  <td className="border-r border-zinc-200 p-0">
                    <input
                      type="text"
                      value={it.notes}
                      onChange={(e) =>
                        updateItem(index, 'notes', e.target.value)
                      }
                      placeholder="e.g. Sprinkle cinnamon & chia seeds"
                      className="w-full bg-transparent px-3 py-2 text-xs text-zinc-700 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand"
                    />
                  </td>

                  <td className="px-1 py-1 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => moveRow(index, -1)}
                        disabled={index === 0}
                        className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-20"
                        title="Move Up"
                      >
                        <ArrowUp className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveRow(index, 1)}
                        disabled={index === items.length - 1}
                        className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-20"
                        title="Move Down"
                      >
                        <ArrowDown className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                        title="Delete Row"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {!items.length && (
              <tr>
                <td
                  colSpan="6"
                  className="py-6 text-center text-xs text-zinc-500 font-medium"
                >
                  No food items in this meal yet. Click below to add your first food row.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={Plus}
            onClick={onAddRow}
            className="text-xs font-semibold hover:border-brand hover:text-brand"
          >
            Add Food Item
          </Button>
          <button
            type="button"
            onClick={onAddMultipleRows}
            className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition"
          >
            <PlusCircle className="size-3.5" /> Add 3 Rows
          </button>
        </div>

        <span className="text-[0.7rem] text-zinc-500 font-medium">
          {items.length} {items.length === 1 ? 'food item' : 'food items'} in this meal
        </span>
      </div>
    </div>
  );
}

/** Diet chart editor: meta, macros and ordered meal slots with Excel sheet food tables */
export default function DietForm({ value, onChange, errors = {} }) {
  const [slotToAdd, setSlotToAdd] = useState('');
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });
  const setMeals = (meals) => onChange({ ...value, meals });
  const updateMeal = (i, meal) =>
    setMeals(value.meals.map((m, j) => (j === i ? meal : m)));
  const usedSlots = new Set(value.meals.map((m) => m.slot));

  const addMeal = () => {
    const slot =
      slotToAdd === '__custom'
        ? 'Custom meal'
        : slotToAdd ||
          MEAL_SLOTS.find((s) => !usedSlots.has(s)) ||
          'Custom meal';
    const order = MEAL_SLOTS.indexOf(slot);
    let at = value.meals.length;
    if (order >= 0) {
      const idx = value.meals.findIndex((m) => MEAL_SLOTS.indexOf(m.slot) > order);
      if (idx >= 0) at = idx;
    }
    setMeals([
      ...value.meals.slice(0, at),
      newMeal(slot),
      ...value.meals.slice(at),
    ]);
    setSlotToAdd('');
  };

  return (
    <div className="space-y-6">
      {/* Plan Details Card */}
      <Card title="Plan details">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Plan name"
            required
            name="name"
            className="sm:col-span-2"
            placeholder="e.g. Lean Muscle High Protein Diet"
            value={value.name}
            onChange={set('name')}
            error={errors.name}
          />
          <SelectField
            label="Goal"
            name="goal"
            placeholder="Select goal"
            options={DIET_GOALS.map((g) => ({ value: g, label: g }))}
            value={value.goal}
            onChange={set('goal')}
          />
          <div className="grid grid-cols-2 gap-2 sm:col-span-1">
            <TextField
              label="Calories (kcal)"
              name="calories"
              placeholder="e.g. 2400"
              value={value.calories}
              onChange={set('calories')}
              error={errors.calories}
            />
            <TextField
              label="Protein (g)"
              name="protein"
              placeholder="e.g. 150"
              value={value.protein}
              onChange={set('protein')}
              error={errors.protein}
            />
          </div>
          <TextArea
            label="Description"
            optional
            name="description"
            className="sm:col-span-2"
            rows={2}
            value={value.description}
            onChange={set('description')}
          />
        </div>
      </Card>

      {errors.meals && (
        <p className="text-sm font-medium text-red-600">{errors.meals}</p>
      )}

      {/* Meals with Excel Spreadsheet Tables */}
      {value.meals.map((meal, i) => (
        <Card
          key={meal.id}
          className="overflow-hidden border-zinc-200"
          bodyClassName="space-y-3 bg-zinc-50/70 p-3 sm:p-5"
          title={
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-zinc-950 text-xs font-mono font-bold text-white shadow-xs">
                {i + 1}
              </span>
              <input
                className="input !h-9 !w-full max-w-xs !py-1 font-bold text-sm bg-white"
                name={`meal-${meal.id}`}
                value={meal.slot}
                onChange={(e) =>
                  updateMeal(i, { ...meal, slot: e.target.value })
                }
                aria-label={`Meal ${i + 1} slot`}
                placeholder="Meal slot (e.g. Breakfast)"
              />
              <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-lg px-2 py-1">
                <Clock className="size-3 text-zinc-400" />
                <input
                  type="text"
                  placeholder="e.g. 08:30 AM"
                  className="w-24 text-xs font-mono font-bold text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
                  value={meal.time}
                  onChange={(e) =>
                    updateMeal(i, { ...meal, time: e.target.value })
                  }
                />
              </div>
            </div>
          }
          actions={
            <div className="flex items-center gap-1">
              <ReorderButtons
                index={i}
                count={value.meals.length}
                onMove={(idx, dir) =>
                  setMeals(moveItem(value.meals, idx, dir))
                }
                label="meal"
              />
              <button
                type="button"
                onClick={() =>
                  setMeals([
                    ...value.meals.slice(0, i + 1),
                    {
                      ...meal,
                      id: uid(),
                      items: meal.items.map((it) => ({ ...it, id: uid() })),
                    },
                    ...value.meals.slice(i + 1),
                  ])
                }
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 transition"
                aria-label="Duplicate meal"
                title="Duplicate meal"
              >
                <CopyPlus className="size-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setMeals(value.meals.filter((_, j) => j !== i))
                }
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-red-50 hover:text-red-600 transition"
                aria-label="Remove meal"
                title="Remove meal"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          }
        >
          <MealFoodTable
            items={meal.items}
            errors={errors}
            onChange={(items) => updateMeal(i, { ...meal, items })}
            onAddRow={() =>
              updateMeal(i, {
                ...meal,
                items: [...meal.items, newFood()],
              })
            }
            onAddMultipleRows={() =>
              updateMeal(i, {
                ...meal,
                items: [
                  ...meal.items,
                  newFood(),
                  newFood(),
                  newFood(),
                ],
              })
            }
          />
        </Card>
      ))}

      {/* Add Meal Dropdown / Action */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-white p-3">
        <select
          value={slotToAdd}
          onChange={(e) => setSlotToAdd(e.target.value)}
          className="select text-xs py-2 flex-1 max-w-xs"
        >
          <option value="">Next recommended meal slot</option>
          {MEAL_SLOTS.map((s) => (
            <option key={s} value={s}>
              {s} {usedSlots.has(s) ? '(already added)' : ''}
            </option>
          ))}
          <option value="__custom">Custom meal slot...</option>
        </select>
        <Button
          variant="secondary"
          size="sm"
          icon={Plus}
          onClick={addMeal}
          className="font-semibold"
        >
          Add Meal Timing
        </Button>
      </div>
    </div>
  );
}
