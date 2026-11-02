import WorkoutForm, { cleanWorkout, emptyWorkout, validateWorkout } from '../workouts/WorkoutForm';
import DietForm, { cleanDiet, emptyDiet, validateDiet } from '../diets/DietForm';
import { dietService, workoutService } from '../../services/planTemplateService';
import { uid } from '../../utils/format';

/** Ensures every nested row has a stable id for React keys. */
const withIds = (list = [], child) =>
  list.map((x) => ({ ...x, id: x.id || uid(), ...(child ? { [child]: (x[child] || []).map((c) => ({ ...c, id: c.id || uid() })) } : {}) }));

export const WORKOUT_CONFIG = {
  service: workoutService,
  kind: 'workout',
  label: 'workout',
  Label: 'Workout',
  basePath: '/workouts',
  Form: WorkoutForm,
  empty: emptyWorkout,
  validate: validateWorkout,
  clean: cleanWorkout,
  fromDoc: (t) => ({
    name: t.name || '',
    goal: t.goal || '',
    level: t.level || 'Beginner',
    description: t.description || '',
    days: withIds(t.days, 'exercises'),
  }),
};

export const DIET_CONFIG = {
  service: dietService,
  kind: 'diet',
  label: 'diet',
  Label: 'Diet',
  basePath: '/diets',
  Form: DietForm,
  empty: emptyDiet,
  validate: validateDiet,
  clean: cleanDiet,
  fromDoc: (t) => ({
    name: t.name || '',
    goal: t.goal || '',
    description: t.description || '',
    calories: t.calories ?? '',
    protein: t.protein ?? '',
    carbs: t.carbs ?? '',
    fat: t.fat ?? '',
    meals: withIds(t.meals, 'items'),
  }),
};
