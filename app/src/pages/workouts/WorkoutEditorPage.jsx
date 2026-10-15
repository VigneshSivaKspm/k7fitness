import TemplateEditor from '../../components/plans/TemplateEditor';
import { WORKOUT_CONFIG } from '../../components/plans/planConfigs';

export default function WorkoutEditorPage() {
  return <TemplateEditor config={WORKOUT_CONFIG} />;
}
