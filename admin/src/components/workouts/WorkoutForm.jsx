import { CopyPlus, Plus, Trash2, X } from 'lucide-react';
import { Card } from '../ui/Layout';
import Button from '../ui/Button';
import ReorderButtons, { moveItem } from '../ui/ReorderButtons';
import { SelectField, TextArea, TextField } from '../ui/Field';
import { WORKOUT_GOALS, WORKOUT_LEVELS } from '../../constants/options';
import { uid } from '../../utils/format';

export const newExercise = () => ({ id: uid(), name: '', sets: '3', reps: '12', weight: '', duration: '', rest: '60 sec', instructions: '' });
export const newDay = (n) => ({ id: uid(), title: `Day ${n}`, notes: '', exercises: [newExercise()] });
export const emptyWorkout = () => ({ name: '', goal: '', level: 'Beginner', description: '', days: [newDay(1)] });

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
      if (ex.sets && (!Number.isFinite(sets) || sets < 0 || sets > 50)) errors[`ex-${ex.id}`] = 'Sets must be a number between 0 and 50.';
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

function ExerciseRow({ ex, index, count, error, onChange, onMove, onRemove }) {
  const set = (k) => (e) => onChange({ ...ex, [k]: e.target.value });
  const small = 'input !px-2.5 !py-2 text-sm';
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3">
      <div className="flex items-start gap-2">
        <span className="mt-2 flex size-6 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-xs font-bold text-zinc-500">{index + 1}</span>
        <div className="min-w-0 flex-1 space-y-2">
          <input className={small} name={`ex-${ex.id}`} placeholder="Exercise name (e.g. Bench press)" value={ex.name} onChange={set('name')} aria-label="Exercise name" aria-invalid={Boolean(error)} />
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            <input className={small} placeholder="Sets" inputMode="numeric" value={ex.sets} onChange={set('sets')} aria-label="Sets" />
            <input className={small} placeholder="Reps" value={ex.reps} onChange={set('reps')} aria-label="Reps" />
            <input className={small} placeholder="Weight" value={ex.weight} onChange={set('weight')} aria-label="Weight (optional)" />
            <input className={small} placeholder="Duration" value={ex.duration} onChange={set('duration')} aria-label="Duration (optional)" />
            <input className={small} placeholder="Rest" value={ex.rest} onChange={set('rest')} aria-label="Rest time (optional)" />
          </div>
          <input className={small} placeholder="Instructions (optional)" value={ex.instructions} onChange={set('instructions')} aria-label="Instructions (optional)" />
          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        </div>
        <div className="flex flex-col items-center">
          <ReorderButtons index={index} count={count} onMove={onMove} label="exercise" />
          <button type="button" onClick={onRemove} className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600" aria-label="Remove exercise">
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Workout plan editor: meta fields + days of ordered exercises. */
export default function WorkoutForm({ value, onChange, errors = {} }) {
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });
  const setDays = (days) => onChange({ ...value, days });
  const updateDay = (i, day) => setDays(value.days.map((d, j) => (j === i ? day : d)));

  const duplicateDay = (i) => {
    const src = value.days[i];
    const copy = { ...src, id: uid(), title: `${src.title} (copy)`, exercises: src.exercises.map((ex) => ({ ...ex, id: uid() })) };
    setDays([...value.days.slice(0, i + 1), copy, ...value.days.slice(i + 1)]);
  };

  return (
    <div className="space-y-5">
      <Card title="Plan details">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Plan name" required name="name" className="sm:col-span-2" placeholder="e.g. Beginner Fat Loss" value={value.name} onChange={set('name')} error={errors.name} />
          <SelectField label="Goal" name="goal" placeholder="Select goal" options={WORKOUT_GOALS.map((g) => ({ value: g, label: g }))} value={value.goal} onChange={set('goal')} />
          <SelectField label="Level" name="level" options={WORKOUT_LEVELS.map((g) => ({ value: g, label: g }))} value={value.level} onChange={set('level')} />
          <TextArea label="Description" optional name="description" className="sm:col-span-2" rows={2} value={value.description} onChange={set('description')} />
        </div>
      </Card>

      {errors.days && <p className="text-sm font-medium text-red-600">{errors.days}</p>}

      {value.days.map((day, i) => (
        <Card
          key={day.id}
          className="overflow-hidden"
          bodyClassName="space-y-3 bg-zinc-50/60 p-3 sm:p-4"
          title={
            <span className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-md bg-ink text-xs font-bold text-white">{i + 1}</span>
              <input
                className="input !h-9 !w-full max-w-xs !py-1 font-semibold"
                name={`day-${day.id}`}
                value={day.title}
                onChange={(e) => updateDay(i, { ...day, title: e.target.value })}
                aria-label={`Day ${i + 1} title`}
                aria-invalid={Boolean(errors[`day-${day.id}`])}
                placeholder="Day title (e.g. Chest & Triceps)"
              />
            </span>
          }
          actions={
            <span className="flex items-center">
              <ReorderButtons index={i} count={value.days.length} onMove={(idx, dir) => setDays(moveItem(value.days, idx, dir))} label="day" />
              <button type="button" onClick={() => duplicateDay(i)} className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800" aria-label="Duplicate day" title="Duplicate day">
                <CopyPlus className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setDays(value.days.filter((_, j) => j !== i))}
                disabled={value.days.length === 1}
                className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                aria-label="Remove day"
                title="Remove day"
              >
                <Trash2 className="size-4" />
              </button>
            </span>
          }
        >
          {day.exercises.map((ex, j) => (
            <ExerciseRow
              key={ex.id}
              ex={ex}
              index={j}
              count={day.exercises.length}
              error={errors[`ex-${ex.id}`]}
              onChange={(next) => updateDay(i, { ...day, exercises: day.exercises.map((x) => (x.id === ex.id ? next : x)) })}
              onMove={(idx, dir) => updateDay(i, { ...day, exercises: moveItem(day.exercises, idx, dir) })}
              onRemove={() => updateDay(i, { ...day, exercises: day.exercises.filter((x) => x.id !== ex.id) })}
            />
          ))}
          {!day.exercises.length && <p className="px-1 text-sm text-zinc-500">No exercises. Leave empty for a rest day, or add one below.</p>}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button size="sm" variant="secondary" icon={Plus} onClick={() => updateDay(i, { ...day, exercises: [...day.exercises, newExercise()] })}>
              Add exercise
            </Button>
            <input
              className="input !py-2 text-sm sm:flex-1"
              placeholder="Day notes (optional, e.g. warm-up 10 min)"
              value={day.notes}
              onChange={(e) => updateDay(i, { ...day, notes: e.target.value })}
              aria-label={`Day ${i + 1} notes`}
            />
          </div>
        </Card>
      ))}

      <Button variant="secondary" icon={Plus} className="w-full border-dashed" onClick={() => setDays([...value.days, newDay(value.days.length + 1)])}>
        Add day
      </Button>
    </div>
  );
}
