import { useParams } from 'react-router';
import PrintShell from '../components/PrintShell';
import WorkoutPlanView from '../components/workouts/WorkoutPlanView';
import DietPlanView from '../components/diets/DietPlanView';
import { ErrorState, PageLoader } from '../components/ui/Feedback';
import { dietService, workoutService } from '../services/planTemplateService';
import { useAsync, useDocumentTitle } from '../hooks/useAsync';
import { formatDate } from '../utils/dates';

const SERVICES = { workout: workoutService, diet: dietService };

/** /print/:kind/(template|assignment)/:id — printable workout or diet chart. */
export default function PrintPlanPage() {
  const { kind, source, id } = useParams();
  const service = SERVICES[kind];
  const { data, loading, error } = useAsync(
    () => (source === 'assignment' ? service.getAssignment(id) : service.getTemplate(id)),
    [kind, source, id],
  );
  useDocumentTitle(data ? `${data.name} (print)` : 'Print');

  if (!service) return <ErrorState message="Unknown plan type." />;
  if (loading) return <PageLoader />;
  if (error || !data) return <ErrorState message={error || 'This plan could not be found.'} />;

  const forMember = source === 'assignment';
  const label = kind === 'workout' ? 'Workout chart' : 'Diet chart';
  const subtitle = [
    forMember ? `${data.traineeName} · ${data.memberId}` : null,
    data.goal,
    data.level,
    forMember ? `Assigned ${formatDate(data.assignedAt)}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <PrintShell title={`${label}: ${data.name}`} subtitle={subtitle} footer="Consult your trainer before changing your plan. Stay consistent. Train hard, live strong.">
      {data.description && <p className="mb-4 text-sm text-zinc-600">{data.description}</p>}
      {data.notes && <p className="mb-4 rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-700 ring-1 ring-zinc-200">Note: {data.notes}</p>}
      {kind === 'workout' ? <WorkoutPlanView plan={data} compact /> : <DietPlanView plan={data} />}
    </PrintShell>
  );
}
