import TemplateEditor from '../../components/plans/TemplateEditor';
import { DIET_CONFIG } from '../../components/plans/planConfigs';

export default function DietEditorPage() {
  return <TemplateEditor config={DIET_CONFIG} />;
}
