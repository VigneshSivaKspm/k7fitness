import { Dumbbell, Pencil, Printer, RefreshCw, Salad, Trash2 } from 'lucide-react';
import { Card } from '../../ui/Layout';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import { EmptyState, ErrorState, Skeleton } from '../../ui/Feedback';
import WorkoutPlanView from '../../workouts/WorkoutPlanView';
import DietPlanView from '../../diets/DietPlanView';
import { useAsync } from '../../../hooks/useAsync';
import { dietService, workoutService } from '../../../services/planTemplateService';
import { useConfirm } from '../../../context/ConfirmContext';
import { useToast } from '../../../context/ToastContext';
import { formatDate } from '../../../utils/dates';

const CONFIG = {
  workout: { service: workoutService, idField: 'workoutAssignmentId', icon: Dumbbell, label: 'workout', View: WorkoutPlanView },
  diet: { service: dietService, idField: 'dietAssignmentId', icon: Salad, label: 'diet', View: DietPlanView },
};

/** Shows the trainee's current workout/diet assignment and previous ones. */
export default function PlanTab({ kind, trainee, onAssign, onChanged }) {
  const cfg = CONFIG[kind];
  const confirm = useConfirm();
  const toast = useToast();
  const assignmentId = trainee[cfg.idField];
  const current = useAsync(() => (assignmentId ? cfg.service.getAssignment(assignmentId) : Promise.resolve(null)), [assignmentId]);
  const history = useAsync(() => cfg.service.listAssignments(trainee.id), [trainee.id, assignmentId]);
  const a = current.data;
  const previous = (history.data || []).filter((h) => h.id !== assignmentId);

  const remove = () =>
    confirm({
      title: `Remove ${cfg.label} plan?`,
      message: `${a.name} will no longer be assigned to ${trainee.fullName}. It stays in their plan history.`,
      confirmText: 'Remove plan',
      onConfirm: async () => {
        await cfg.service.unassign(trainee);
        toast.success(`${cfg.label === 'workout' ? 'Workout' : 'Diet'} plan removed.`);
        onChanged();
      },
    });

  return (
    <div className="space-y-5">
      <Card
        title={a ? a.name : `${cfg.label === 'workout' ? 'Workout' : 'Diet'} plan`}
        description={
          a
            ? [a.goal, a.level, `Assigned ${formatDate(a.assignedAt)}`, a.customized ? 'Customised' : a.templateName && `From template “${a.templateName}”`]
                .filter(Boolean)
                .join(' · ')
            : undefined
        }
        actions={
          a ? (
            <div className="flex flex-wrap justify-end gap-2">
              <Button size="sm" variant="secondary" icon={Printer} to={`/print/${kind}/assignment/${a.id}`}>
                <span className="max-sm:sr-only">Print</span>
              </Button>
              <Button size="sm" variant="secondary" icon={Pencil} to={`/trainees/${trainee.id}/${kind}/${a.id}`}>
                <span className="max-sm:sr-only">Customise</span>
              </Button>
              <Button size="sm" icon={RefreshCw} onClick={onAssign}>
                <span className="max-sm:sr-only">Change</span>
              </Button>
            </div>
          ) : null
        }
      >
        {current.error ? (
          <ErrorState message={current.error} onRetry={current.reload} />
        ) : current.loading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : !a ? (
          <EmptyState
            icon={cfg.icon}
            title={`No ${cfg.label} plan assigned`}
            description={`Assign a ${cfg.label} template. You can customise it for ${trainee.fullName.split(' ')[0]} without changing the template.`}
            action={<Button onClick={onAssign}>Assign {cfg.label} plan</Button>}
          />
        ) : (
          <>
            {a.description && <p className="mb-4 text-sm text-zinc-600">{a.description}</p>}
            {a.notes && <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-100">Note: {a.notes}</p>}
            <cfg.View plan={a} />
            <div className="mt-5 border-t border-zinc-100 pt-4">
              <Button variant="danger-ghost" size="sm" icon={Trash2} onClick={remove}>
                Remove plan
              </Button>
            </div>
          </>
        )}
      </Card>

      {previous.length > 0 && (
        <Card title="Previous plans" bodyClassName="">
          <ul className="divide-y divide-zinc-100">
            {previous.map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-zinc-900">{h.name}</p>
                  <p className="text-xs text-zinc-500">
                    {formatDate(h.assignedAt)} – {h.endedAt ? formatDate(h.endedAt) : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {h.customized && <Badge>Customised</Badge>}
                  <Button size="sm" variant="ghost" icon={Printer} to={`/print/${kind}/assignment/${h.id}`} aria-label={`Print ${h.name}`} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
