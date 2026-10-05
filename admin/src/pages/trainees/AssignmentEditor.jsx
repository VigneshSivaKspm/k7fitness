import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Info } from 'lucide-react';
import { FormActions, PageHeader } from '../../components/ui/Layout';
import Button from '../../components/ui/Button';
import { ErrorState, PageLoader } from '../../components/ui/Feedback';
import { DIET_CONFIG, WORKOUT_CONFIG } from '../../components/plans/planConfigs';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useAsync';
import { friendlyError } from '../../utils/errors';
import { focusFirstError } from '../../utils/validation';

const CONFIGS = { workout: WORKOUT_CONFIG, diet: DIET_CONFIG };

/**
 * Customise one trainee's assigned workout/diet. Edits the assignment's own
 * snapshot only. The master template is never modified.
 */
export default function AssignmentEditor() {
  const { id: traineeId, kind, assignmentId } = useParams();
  const config = CONFIGS[kind];
  const navigate = useNavigate();
  const toast = useToast();
  const [assignment, setAssignment] = useState(null);
  const [value, setValue] = useState(null);
  const [state, setState] = useState({ loading: true, error: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  useDocumentTitle(`Customise ${kind} plan`);

  useEffect(() => {
    if (!config) return;
    config.service
      .getAssignment(assignmentId)
      .then((a) => {
        if (!a || a.traineeId !== traineeId) return setState({ loading: false, error: 'This plan assignment could not be found.' });
        setAssignment(a);
        setValue(config.fromDoc(a));
        setState({ loading: false, error: '' });
      })
      .catch((err) => setState({ loading: false, error: friendlyError(err) }));
  }, [config, assignmentId, traineeId]);

  if (!config) return <ErrorState message="Unknown plan type." />;
  if (state.loading) return <PageLoader />;
  if (state.error) return <ErrorState message={state.error} />;

  const back = `/trainees/${traineeId}?tab=${kind}`;

  const save = async (e) => {
    e.preventDefault();
    if (busy) return;
    const errs = config.validate(value);
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error('Please fix the highlighted fields.');
      return focusFirstError(errs);
    }
    setBusy(true);
    try {
      await config.service.updateAssignment(assignment, config.clean(value));
      toast.success(`${config.Label} plan updated for ${assignment.traineeName}.`);
      navigate(back);
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const Form = config.Form;
  return (
    <form onSubmit={save} noValidate className="mx-auto max-w-4xl">
      <PageHeader back={{ to: back, label: assignment.traineeName }} eyebrow={`${assignment.traineeName} · ${assignment.memberId}`} title={`Customise ${kind} plan`} />
      <p className="mb-5 flex items-start gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-dark ring-1 ring-brand-100">
        <Info className="mt-0.5 size-4 shrink-0" />
        Changes apply to {assignment.traineeName.split(' ')[0]}’s plan only.
        {assignment.templateName && ` The “${assignment.templateName}” template stays unchanged.`}
      </p>
      <Form value={value} onChange={setValue} errors={errors} />
      <FormActions>
        <Button variant="secondary" onClick={() => navigate(back)} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" loading={busy}>
          Save for this member
        </Button>
      </FormActions>
    </form>
  );
}
