import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Dumbbell, Salad } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Switch from '../ui/Switch';
import SearchInput from '../ui/SearchInput';
import { Spinner } from '../ui/Feedback';
import { TextField } from '../ui/Field';
import { dietService, workoutService } from '../../services/planTemplateService';
import { useToast } from '../../context/ToastContext';
import { friendlyError } from '../../utils/errors';

const CONFIG = {
  workout: { service: workoutService, title: 'Assign workout plan', icon: Dumbbell, newPath: '/workouts/new', meta: (t) => [t.level, t.goal, `${t.days?.length || 0} days`] },
  diet: { service: dietService, title: 'Assign diet plan', icon: Salad, newPath: '/diets/new', meta: (t) => [t.goal, t.calories ? `${t.calories} kcal` : '', `${t.meals?.length || 0} meals`] },
};

/**
 * Pick a template → a snapshot is assigned to the trainee. Optionally open
 * the trainee-specific copy for customisation (the template stays untouched).
 */
export default function AssignPlanDialog({ kind, trainee, open, onClose, onDone }) {
  const cfg = CONFIG[kind];
  const toast = useToast();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [customize, setCustomize] = useState(false);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelectedId('');
    setCustomize(false);
    setNotes('');
    setSearch('');
    setError('');
    cfg.service
      .listTemplates()
      .then(setTemplates)
      .catch((err) => setError(friendlyError(err)));
  }, [open, cfg.service]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (templates || []).filter((t) => !q || t.name.toLowerCase().includes(q) || (t.goal || '').toLowerCase().includes(q));
  }, [templates, search]);

  const submit = async () => {
    const template = templates?.find((t) => t.id === selectedId);
    if (!template || busy) return;
    setBusy(true);
    try {
      const assignmentId = await cfg.service.assign(trainee, { template, content: template, customized: false, notes });
      toast.success(kind === 'workout' ? 'Workout assigned successfully.' : 'Diet plan assigned successfully.');
      onDone?.();
      onClose();
      if (customize) navigate(`/trainees/${trainee.id}/${kind}/${assignmentId}`);
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={cfg.title}
      description={trainee ? `For ${trainee.fullName}. Customising creates a personal copy; the template stays unchanged.` : ''}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} loading={busy} disabled={!selectedId}>
            {customize ? 'Assign & customise' : 'Assign plan'}
          </Button>
        </>
      }
    >
      {error ? (
        <p className="py-6 text-center text-sm text-red-600">{error}</p>
      ) : !templates ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : !templates.length ? (
        <div className="py-8 text-center">
          <cfg.icon className="mx-auto size-8 text-zinc-300" />
          <p className="mt-3 font-semibold text-zinc-900">No templates yet</p>
          <p className="mt-1 text-sm text-zinc-500">Create a reusable {kind} template first, then assign it to any member.</p>
          <Button className="mt-5" to={cfg.newPath}>
            Create {kind} template
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {templates.length > 5 && <SearchInput value={search} onSearch={setSearch} placeholder="Search templates" delay={0} />}
          <div role="radiogroup" aria-label="Templates" className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {filtered.map((t) => (
              <label
                key={t.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                  selectedId === t.id ? 'border-brand bg-brand-50/50 ring-1 ring-brand' : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <input type="radio" name="template" className="mt-1 accent-brand" checked={selectedId === t.id} onChange={() => setSelectedId(t.id)} />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-zinc-900">{t.name}</span>
                  <span className="text-xs text-zinc-500">{cfg.meta(t).filter(Boolean).join(' · ')}</span>
                  {trainee?.[kind === 'workout' ? 'workoutPlanName' : 'dietPlanName'] === t.name && (
                    <span className="ml-2 text-xs font-semibold text-brand">Currently assigned</span>
                  )}
                </span>
              </label>
            ))}
            {!filtered.length && <p className="py-4 text-center text-sm text-zinc-500">No templates match your search.</p>}
          </div>
          <Switch checked={customize} onChange={setCustomize} label="Customise for this member" description="Edit exercises/meals for this trainee after assigning." />
          <TextField label="Notes for trainee" optional value={notes} maxLength={300} onChange={(e) => setNotes(e.target.value)} />
        </div>
      )}
    </Modal>
  );
}
