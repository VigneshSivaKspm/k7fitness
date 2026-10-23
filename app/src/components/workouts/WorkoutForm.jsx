import { CopyPlus, Plus, PlusCircle, Trash2, X, ArrowUp, ArrowDown } from 'lucide-react';
import { Card } from '../ui/Layout';
import Button from '../ui/Button';
import ReorderButtons, { moveItem } from '../ui/ReorderButtons';
import { SelectField, TextArea, TextField } from '../ui/Field';
import { WORKOUT_GOALS, WORKOUT_LEVELS } from '../../constants/options';
import { uid } from '../../utils/format';

export const newExercise = () => ({
  id: uid(),
  name: '',
  sets: '3',
  reps: '12',
  weight: '',
  duration: '',
  rest: '60 sec',
  instructions: '',
});

export const newDay = (n) => ({
  id: uid(),
  title: `Day ${n}`,
  notes: '',
  exercises: [newExercise()],
});

export const emptyWorkout = () => ({
  name: '',
  goal: '',
  level: 'Beginner',
  description: '',
  days: [newDay(1)],
});

export function validateWorkout(w) {
  const errors = {};
  if (!w.name.trim()) errors.name = 'Plan name is required.';
  else if (w.name.length > 80) errors.name = 'Plan name is too long.';
  if (!w.days.length) errors.days = 'Add at least one day.';
  w.days.forEach((d, i) => {
    if (!d.title.trim()) errors[`day-${d.id}`] = `Day ${i + 1} needs a title.`;
    d.exercises.forEach((ex) => {
      if (!ex.name.trim()) errors[`ex-${ex.id}`] = 'Exercise name is required.';
      const sets = Number(ex.sets);
      if (ex.sets && (!Number.isFinite(sets) || sets < 0 || sets > 50))
        errors[`ex-${ex.id}`] = 'Sets must be between 0 and 50.';
    });
  });
  return errors;
}

/** Strips empty optional fields so stored documents stay small and clean. */
export function cleanWorkout(w) {
  return {
    name: w.name.trim(),
    goal: w.goal,
    level: w.level,
    description: w.description.trim(),
    days: w.days.map((d) => ({
      id: d.id,
      title: d.title.trim(),
      notes: (d.notes || '').trim(),
      exercises: d.exercises.map((ex) => ({
        id: ex.id,
        name: ex.name.trim(),
        sets: String(ex.sets || '').trim(),
        reps: String(ex.reps || '').trim(),
        weight: (ex.weight || '').trim(),
        duration: (ex.duration || '').trim(),
        rest: (ex.rest || '').trim(),
        instructions: (ex.instructions || '').trim(),
      })),
    })),
    dayCount: w.days.length,
  };
}

/**
 * Excel-Style Spreadsheet Table for Exercises in a Day
 */
function DayExerciseTable({
  exercises,
  dayIndex,
  errors,
  onChange,
  onAddRow,
  onAddMultipleRows,
}) {
  const updateExercise = (index, field, value) => {
    const next = exercises.map((ex, idx) =>
      idx === index ? { ...ex, [field]: value } : ex
    );
    onChange(next);
  };

  const removeRow = (index) => {
    onChange(exercises.filter((_, idx) => idx !== index));
  };

  const moveRow = (index, dir) => {
    onChange(moveItem(exercises, index, dir));
  };

  return (
    <div className="space-y-2">
      {/* Excel Sheet Outer Container */}
      <div className="overflow-x-auto rounded-xl border border-zinc-300 bg-white shadow-xs">
        <table className="w-full min-w-[760px] border-collapse text-left text-xs">
          {/* Spreadsheet Header Row */}
          <thead>
            <tr className="border-b border-zinc-300 bg-zinc-100 text-[0.68rem] font-bold uppercase tracking-wider text-zinc-700 select-none">
              <th className="w-12 border-r border-zinc-200 px-2 py-2 text-center text-zinc-500 bg-zinc-200/60 font-mono">
                #
              </th>
              <th className="min-w-[200px] border-r border-zinc-200 px-3 py-2">
                Exercise Movement <span className="text-red-500">*</span>
              </th>
              <th className="w-20 border-r border-zinc-200 px-2 py-2 text-center">
                Sets
              </th>
              <th className="w-24 border-r border-zinc-200 px-2 py-2 text-center">
                Reps
              </th>
              <th className="w-28 border-r border-zinc-200 px-2 py-2 text-center">
                Weight
              </th>
              <th className="w-28 border-r border-zinc-200 px-2 py-2 text-center">
                Rest
              </th>
              <th className="w-24 border-r border-zinc-200 px-2 py-2 text-center">
                Duration
              </th>
              <th className="min-w-[180px] border-r border-zinc-200 px-3 py-2">
                Instructions / Form Notes
              </th>
              <th className="w-20 px-2 py-2 text-center text-zinc-500">
                Action
              </th>
            </tr>
          </thead>

          {/* Spreadsheet Rows */}
          <tbody className="divide-y divide-zinc-200 font-sans">
            {exercises.map((ex, index) => {
              const hasError = Boolean(errors[`ex-${ex.id}`]);
              const rowNum = index + 1;

              return (
                <tr
                  key={ex.id || index}
                  className="group hover:bg-amber-50/30 transition-colors"
                >
                  {/* Excel Row Index */}
                  <td className="border-r border-zinc-200 bg-zinc-50 px-2 py-1 text-center font-mono text-[0.7rem] font-bold text-zinc-500 select-none">
                    {rowNum}
                  </td>

                  {/* Exercise Name */}
                  <td
                    className={`border-r border-zinc-200 p-0 ${
                      hasError ? 'bg-red-50/70' : ''
                    }`}
                  >
                    <input
                      type="text"
                      name={`ex-${ex.id}`}
                      value={ex.name}
                      onChange={(e) =>
                        updateExercise(index, 'name', e.target.value)
                      }
                      placeholder="e.g. Barbell Bench Press"
                      className="w-full bg-transparent px-3 py-2 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand"
                    />
                    {hasError && (
                      <p className="px-3 pb-1 text-[0.68rem] font-semibold text-red-600">
                        {errors[`ex-${ex.id}`]}
                      </p>
                    )}
                  </td>

                  {/* Sets */}
                  <td className="border-r border-zinc-200 p-0 text-center">
                    <input
                      type="text"
                      value={ex.sets}
                      onChange={(e) =>
                        updateExercise(index, 'sets', e.target.value)
                      }
                      placeholder="3"
                      className="w-full bg-transparent px-2 py-2 text-center font-mono text-xs font-bold text-zinc-900 placeholder:text-zinc-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand"
                    />
                  </td>

                  {/* Reps */}
                  <td className="border-r border-zinc-200 p-0 text-center">
                    <input
                      type="text"
                      value={ex.reps}
                      onChange={(e) =>
                        updateExercise(index, 'reps', e.target.value)
                      }
                      placeholder="10-12"
                      className="w-full bg-transparent px-2 py-2 text-center font-mono text-xs text-zinc-800 placeholder:text-zinc-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand"
                    />
                  </td>

                  {/* Weight */}
                  <td className="border-r border-zinc-200 p-0 text-center">
                    <input
                      type="text"
                      value={ex.weight}
                      onChange={(e) =>
                        updateExercise(index, 'weight', e.target.value)
                      }
                      placeholder="Progressive"
                      className="w-full bg-transparent px-2 py-2 text-center font-mono text-xs text-zinc-700 placeholder:text-zinc-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand"
                    />
                  </td>

                  {/* Rest */}
                  <td className="border-r border-zinc-200 p-0 text-center">
                    <input
                      type="text"
                      value={ex.rest}
                      onChange={(e) =>
                        updateExercise(index, 'rest', e.target.value)
                      }
                      placeholder="60 sec"
                      className="w-full bg-transparent px-2 py-2 text-center font-mono text-xs text-zinc-700 placeholder:text-zinc-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand"
                    />
                  </td>

                  {/* Duration */}
                  <td className="border-r border-zinc-200 p-0 text-center">
                    <input
                      type="text"
                      value={ex.duration}
                      onChange={(e) =>
                        updateExercise(index, 'duration', e.target.value)
                      }
                      placeholder="Optional"
                      className="w-full bg-transparent px-2 py-2 text-center font-mono text-xs text-zinc-600 placeholder:text-zinc-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand"
                    />
                  </td>

                  {/* Instructions */}
                  <td className="border-r border-zinc-200 p-0">
                    <input
                      type="text"
                      value={ex.instructions}
                      onChange={(e) =>
                        updateExercise(index, 'instructions', e.target.value)
                      }
                      placeholder="Optional tips (e.g. slow negative, squeeze chest)"
                      className="w-full bg-transparent px-3 py-2 text-xs text-zinc-700 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand"
                    />
                  </td>

                  {/* Row Actions */}
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
                        disabled={index === exercises.length - 1}
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

            {!exercises.length && (
              <tr>
                <td
                  colSpan="9"
                  className="py-6 text-center text-xs text-zinc-500 font-medium"
                >
                  No exercises in this day yet. Click below to add your first movement row.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Spreadsheet Bottom Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={Plus}
            onClick={onAddRow}
            className="text-xs font-semibold hover:border-brand hover:text-brand"
          >
            Add Row
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
          {exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'} in this day
        </span>
      </div>
    </div>
  );
}

/** Workout plan editor: meta fields + Excel sheet table for each day */
export default function WorkoutForm({ value, onChange, errors = {} }) {
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });
  const setDays = (days) => onChange({ ...value, days });
  const updateDay = (i, day) =>
    setDays(value.days.map((d, j) => (j === i ? day : d)));

  const duplicateDay = (i) => {
    const src = value.days[i];
    const copy = {
      ...src,
      id: uid(),
      title: `${src.title} (copy)`,
      exercises: src.exercises.map((ex) => ({ ...ex, id: uid() })),
    };
    setDays([...value.days.slice(0, i + 1), copy, ...value.days.slice(i + 1)]);
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
            placeholder="e.g. Beginner Fat Loss"
            value={value.name}
            onChange={set('name')}
            error={errors.name}
          />
          <SelectField
            label="Goal"
            name="goal"
            placeholder="Select goal"
            options={WORKOUT_GOALS.map((g) => ({ value: g, label: g }))}
            value={value.goal}
            onChange={set('goal')}
          />
          <SelectField
            label="Level"
            name="level"
            options={WORKOUT_LEVELS.map((g) => ({ value: g, label: g }))}
            value={value.level}
            onChange={set('level')}
          />
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

      {errors.days && (
        <p className="text-sm font-medium text-red-600">{errors.days}</p>
      )}

      {/* Days with Excel Spreadsheet Tables */}
      {value.days.map((day, i) => (
        <Card
          key={day.id}
          className="overflow-hidden border-zinc-200"
          bodyClassName="space-y-3 bg-zinc-50/70 p-3 sm:p-5"
          title={
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-zinc-950 text-xs font-mono font-bold text-white shadow-xs">
                {i + 1}
              </span>
              <input
                className="input !h-9 !w-full max-w-xs !py-1 font-bold text-sm bg-white"
                name={`day-${day.id}`}
                value={day.title}
                onChange={(e) =>
                  updateDay(i, { ...day, title: e.target.value })
                }
                aria-label={`Day ${i + 1} title`}
                aria-invalid={Boolean(errors[`day-${day.id}`])}
                placeholder="Day title (e.g. Chest & Triceps)"
              />
            </div>
          }
          actions={
            <div className="flex items-center gap-1">
              <ReorderButtons
                index={i}
                count={value.days.length}
                onMove={(idx, dir) => setDays(moveItem(value.days, idx, dir))}
                label="day"
              />
              <button
                type="button"
                onClick={() => duplicateDay(i)}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 transition"
                aria-label="Duplicate day"
                title="Duplicate day"
              >
                <CopyPlus className="size-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setDays(value.days.filter((_, j) => j !== i))
                }
                disabled={value.days.length === 1}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 transition"
                aria-label="Remove day"
                title="Remove day"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          }
        >
          {/* Day Notes Bar */}
          <div className="flex items-center gap-2">
            <span className="text-[0.7rem] font-bold uppercase tracking-wider text-zinc-500 shrink-0">
              Day Notes:
            </span>
            <input
              className="input !py-1.5 !px-3 text-xs flex-1 bg-white"
              placeholder="e.g. Warm up rotator cuffs for 10 min, stretch hamstrings"
              value={day.notes}
              onChange={(e) => updateDay(i, { ...day, notes: e.target.value })}
              aria-label={`Day ${i + 1} notes`}
            />
          </div>

          {/* Excel Sheet Table for Exercises */}
          <DayExerciseTable
            exercises={day.exercises}
            dayIndex={i}
            errors={errors}
            onChange={(exercises) => updateDay(i, { ...day, exercises })}
            onAddRow={() =>
              updateDay(i, {
                ...day,
                exercises: [...day.exercises, newExercise()],
              })
            }
            onAddMultipleRows={() =>
              updateDay(i, {
                ...day,
                exercises: [
                  ...day.exercises,
                  newExercise(),
                  newExercise(),
                  newExercise(),
                ],
              })
            }
          />
        </Card>
      ))}

      {/* Add Day Button */}
      <Button
        variant="secondary"
        icon={Plus}
        className="w-full border-dashed py-3 font-semibold hover:border-brand hover:text-brand"
        onClick={() =>
          setDays([...value.days, newDay(value.days.length + 1)])
        }
      >
        Add Another Workout Day
      </Button>
    </div>
  );
}
