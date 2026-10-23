import { Dumbbell } from 'lucide-react';
import TemplateList from '../../components/plans/TemplateList';
import { workoutService } from '../../services/planTemplateService';

const CONFIG = {
  service: workoutService,
  kind: 'workout',
  title: 'Workout plans',
  description: 'Reusable workout templates. Assign them to members and customise per member without changing the template.',
  icon: Dumbbell,
  basePath: '/workouts',
  emptyHint: 'Create templates like “Beginner Fat Loss” or “Intermediate Strength” once, then assign them in seconds.',
  meta: (t) => [t.level, t.goal, `${t.dayCount ?? t.days?.length ?? 0} days`],
};

export default function WorkoutList() {
  return <TemplateList config={CONFIG} />;
}
