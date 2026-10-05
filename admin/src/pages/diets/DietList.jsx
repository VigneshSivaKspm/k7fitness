import { Salad } from 'lucide-react';
import TemplateList from '../../components/plans/TemplateList';
import { dietService } from '../../services/planTemplateService';

const CONFIG = {
  service: dietService,
  kind: 'diet',
  title: 'Diet plans',
  description: 'Reusable diet charts. Assign them to members and customise per member without changing the template.',
  icon: Salad,
  basePath: '/diets',
  emptyHint: 'Create templates like “Weight Loss” or “High Protein” once, then assign them in seconds.',
  meta: (t) => [t.goal, t.calories ? `${t.calories} kcal` : '', `${t.mealCount ?? t.meals?.length ?? 0} meals`],
};

export default function DietList() {
  return <TemplateList config={CONFIG} />;
}
