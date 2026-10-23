import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  CalendarCheck,
  CalendarClock,
  Dumbbell,
  Eye,
  Flame,
  LogOut,
  MessageCircle,
  Phone,
  Plus,
  RefreshCw,
  Salad,
  Scale,
  Search,
  Target,
  UserCheck,
  UserRound,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useAsync';
import { listAssignedMembers } from '../../services/trainerAuthService';
import { updateMemberBodyMetrics } from '../../services/traineeService';
import { getMembershipStatus, getPaymentStatus } from '../../utils/status';
import { calculateBmi, cmToFeetInches, bodyTypeDetails } from '../../utils/fitness';
import { BodyTypeSvg } from '../../components/fitness/BodyTypeArt';
import BodyTypeSelector from '../../components/fitness/BodyTypeSelector';
import { assetUrl, formatPhone, telLink, whatsappLink } from '../../utils/format';
import { formatDate } from '../../utils/dates';
import { FITNESS_GOALS, fitnessGoalLabel } from '../../constants/options';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Badge, { StatusBadge } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { SelectField, TextField } from '../../components/ui/Field';
import AssignPlanDialog from '../../components/trainees/AssignPlanDialog';
import DailyQuoteBanner from '../../components/ui/DailyQuoteBanner';

export default function TrainerDashboard() {
  useDocumentTitle('Trainer Portal · K7 Fitness');
  const { trainer, logout } = useAuth();
  const { settings, gymName, money } = useSettings();
  const toast = useToast();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Dialog states
  const [planDialog, setPlanDialog] = useState(null); // { kind: 'workout' | 'diet', member }
  const [metricsDialog, setMetricsDialog] = useState(null); // member
  const [savingMetrics, setSavingMetrics] = useState(false);
  const [metricsForm, setMetricsForm] = useState({ height: '', weight: '', age: '', gender: 'male', bodyType: 'mesomorph', goal: 'general_fitness' });

  const loadData = async () => {
    if (!trainer?.id) return;
    setLoading(true);
    try {
      const data = await listAssignedMembers(trainer.id);
      setMembers(data);
    } catch (err) {
      toast.error('Failed to load assigned members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [trainer?.id]);

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.fullName?.toLowerCase().includes(q) ||
        m.memberId?.toLowerCase().includes(q) ||
        m.phone?.includes(q)
    );
  }, [members, search]);

  const activeCount = members.filter((m) => getMembershipStatus(m, settings.expiryAlertDays) === 'active').length;
  const expiringCount = members.filter((m) => getMembershipStatus(m, settings.expiryAlertDays) === 'expiring').length;

  const openMetrics = (m) => {
    setMetricsDialog(m);
    setMetricsForm({
      height: m.height ? String(m.height) : '',
      weight: m.weight ? String(m.weight) : '',
      age: m.age ? String(m.age) : '',
      gender: m.gender || 'male',
      bodyType: m.bodyType || 'mesomorph',
      goal: m.goal || 'general_fitness',
    });
  };

  const saveMetrics = async (e) => {
    e.preventDefault();
    if (!metricsDialog || savingMetrics) return;
    setSavingMetrics(true);
    try {
      await updateMemberBodyMetrics(metricsDialog.id, metricsForm);
      toast.success(`Body metrics updated for ${metricsDialog.fullName}.`);
      setMetricsDialog(null);
      loadData();
    } catch (err) {
      toast.error('Failed to update body metrics.');
    } finally {
      setSavingMetrics(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-zinc-900 pb-16">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-ink p-1.5 shadow-sm shadow-brand/20">
              <img src={assetUrl('icons/logo.png')} alt="K7" className="size-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-900 leading-tight">Trainer Portal</span>
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider text-brand">
                  Personal Training
                </span>
              </div>
              <p className="text-xs text-zinc-500">{gymName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5">
              <Avatar name={trainer?.name || 'Trainer'} src={trainer?.photoUrl} size="sm" />
              <div className="text-right">
                <p className="text-xs font-bold text-zinc-900 leading-tight">{trainer?.name}</p>
                <p className="text-[0.68rem] text-zinc-500">{trainer?.specialization || 'Personal Trainer'}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" icon={LogOut} onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 space-y-6">
        {/* Daily Motivational Quote Banner */}
        <DailyQuoteBanner />

        {/* Welcome Coach Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-ink via-zinc-900 to-zinc-800 p-6 text-white shadow-lg sm:p-8">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar name={trainer?.name || 'Trainer'} src={trainer?.photoUrl} size="xl" className="!ring-2 !ring-brand" />
              <div>
                <span className="inline-block rounded-md bg-brand/20 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-brand-light">
                  Personal Training Coach
                </span>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Welcome back, {trainer?.name?.split(' ')[0] || 'Coach'}!
                </h1>
                <p className="mt-1 text-sm text-zinc-300">
                  Manage your personal training clients, tailor their workouts, customize nutrition charts, and track their fitness transformation.
                </p>
              </div>
            </div>
            <Button variant="secondary" icon={RefreshCw} onClick={loadData} loading={loading} className="self-start sm:self-auto !bg-white/10 !text-white !border-white/20 hover:!bg-white/20">
              Refresh Clients
            </Button>
          </div>
        </div>

        {/* Quick KPI Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="card p-4 sm:p-5">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
              <Users className="size-4 text-brand" /> Assigned PT Members
            </div>
            <p className="tabular mt-2 text-2xl font-bold text-zinc-900">{members.length}</p>
            <p className="text-xs text-zinc-400 mt-0.5">1-on-1 personal coaching</p>
          </div>

          <div className="card p-4 sm:p-5">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
              <UserCheck className="size-4 text-emerald-600" /> Active Memberships
            </div>
            <p className="tabular mt-2 text-2xl font-bold text-emerald-700">{activeCount}</p>
            <p className="text-xs text-zinc-400 mt-0.5">Currently training</p>
          </div>

          <div className="card p-4 sm:p-5">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
              <CalendarClock className="size-4 text-amber-600" /> Expiring Soon
            </div>
            <p className="tabular mt-2 text-2xl font-bold text-amber-600">{expiringCount}</p>
            <p className="text-xs text-zinc-400 mt-0.5">Next {settings.expiryAlertDays} days</p>
          </div>

          <div className="card p-4 sm:p-5">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
              <Flame className="size-4 text-red-600" /> Training Focus
            </div>
            <p className="truncate mt-2 text-lg font-bold text-zinc-900">Custom Routines</p>
            <p className="text-xs text-zinc-400 mt-0.5">Workout & Food Charts</p>
          </div>
        </div>

        {/* Assigned Personal Training Members List */}
        <div className="card overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 p-4 sm:p-5">
            <div>
              <h2 className="text-base font-bold text-zinc-900">My Personal Training Clients</h2>
              <p className="text-xs text-zinc-500">Members assigned directly to you for personalized training.</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="search"
                placeholder="Search client by name, ID or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input h-9 pl-9 text-xs"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-zinc-500">Loading assigned PT members...</div>
          ) : !filteredMembers.length ? (
            <div className="p-12 text-center">
              <UserRound className="mx-auto size-12 text-zinc-300" />
              <p className="mt-3 font-semibold text-zinc-900">
                {search ? 'No matching personal training clients' : 'No personal training members assigned yet'}
              </p>
              <p className="mt-1 text-xs text-zinc-500 max-w-md mx-auto">
                {search
                  ? 'Try searching with a different name or Member ID.'
                  : 'When the gym admin assigns members to you as their Personal Trainer, they will appear here.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {filteredMembers.map((m) => {
                const bmi = calculateBmi(m.height, m.weight);
                const feet = cmToFeetInches(Number(m.height));
                const bType = bodyTypeDetails(m.bodyType, m.gender);
                const status = getMembershipStatus(m, settings.expiryAlertDays);

                return (
                  <div key={m.id} className="p-4 sm:p-5 hover:bg-zinc-50/60 transition">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Member Info */}
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <Avatar name={m.fullName} src={m.photoUrl} size="lg" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-zinc-900">{m.fullName}</h3>
                            <span className="font-semibold text-xs text-zinc-500">({m.memberId})</span>
                            <Badge tone="brand">Personal Training</Badge>
                            <StatusBadge kind="membership" status={status} />
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                            {m.phone && (
                              <a href={telLink(m.phone)} className="hover:text-brand flex items-center gap-1">
                                <Phone className="size-3" /> {formatPhone(m.phone)}
                              </a>
                            )}
                            <span>·</span>
                            <span>Joined: {formatDate(m.joiningDate)}</span>
                            {m.currentPlanName && (
                              <>
                                <span>·</span>
                                <span>Plan: {m.currentPlanName}</span>
                              </>
                            )}
                          </div>

                          {/* Body Metrics Summary Strip */}
                          <div className="mt-2.5 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700">
                              <Scale className="size-3 text-zinc-500" />
                              {m.weight ? `${m.weight} kg` : 'Weight: —'}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700">
                              {m.height ? `${m.height} cm (${feet || ''})` : 'Height: —'}
                            </span>
                            {bmi && (
                              <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${
                                bmi.tone === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                BMI {bmi.value} ({bmi.category})
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                              <Target className="size-3" />
                              Goal: {fitnessGoalLabel(m.goal)}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                              Physique: {bType?.label || 'Mesomorph'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Trainer Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 lg:self-center">
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={Dumbbell}
                          onClick={() => setPlanDialog({ kind: 'workout', member: m })}
                        >
                          {m.workoutPlanName ? 'Change Workout' : 'Assign Workout'}
                        </Button>

                        <Button
                          size="sm"
                          variant="secondary"
                          icon={Salad}
                          onClick={() => setPlanDialog({ kind: 'diet', member: m })}
                        >
                          {m.dietPlanName ? 'Change Diet' : 'Assign Diet'}
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          icon={Scale}
                          onClick={() => openMetrics(m)}
                        >
                          Update Metrics
                        </Button>

                        {m.phone && (
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={MessageCircle}
                            href={whatsappLink(m.phone, `Hello ${m.fullName?.split(' ')[0]}, your personal trainer ${trainer?.name} here from ${gymName}. How is your workout routine going today?`)}
                            title="Chat on WhatsApp"
                          >
                            WhatsApp
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Company Credit */}
        <footer className="mt-10 pt-6 pb-4 border-t border-zinc-200/80 text-center text-xs text-zinc-500">
          <p>
            Crafted By{' '}
            <a
              href="https://www.legendaryone.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-yellow-500 hover:text-yellow-600 transition-colors underline decoration-yellow-500/40"
            >
              Legendary One
            </a>
          </p>
        </footer>
      </main>

      {/* Workout & Diet Assignment Dialog */}
      {planDialog && (
        <AssignPlanDialog
          kind={planDialog.kind}
          trainee={planDialog.member}
          open={Boolean(planDialog)}
          onClose={() => setPlanDialog(null)}
          onDone={loadData}
        />
      )}

      {/* Body Metrics Update Modal */}
      {metricsDialog && (
        <Modal
          open={Boolean(metricsDialog)}
          onClose={() => setMetricsDialog(null)}
          as="form"
          onSubmit={saveMetrics}
          size="md"
          title={`Update Metrics: ${metricsDialog.fullName}`}
          description="Update your client's weight, body frame, and fitness targets based on their recent assessments."
          footer={
            <>
              <Button variant="secondary" onClick={() => setMetricsDialog(null)} disabled={savingMetrics}>
                Cancel
              </Button>
              <Button type="submit" loading={savingMetrics}>
                Save Metrics
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Weight (kg)"
                required
                name="weight"
                type="number"
                step="0.1"
                placeholder="e.g. 74.5"
                value={metricsForm.weight}
                onChange={(e) => setMetricsForm((f) => ({ ...f, weight: e.target.value }))}
              />
              <TextField
                label="Height (cm)"
                required
                name="height"
                type="number"
                placeholder="e.g. 175"
                value={metricsForm.height}
                onChange={(e) => setMetricsForm((f) => ({ ...f, height: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Age (years)"
                optional
                name="age"
                type="number"
                placeholder="e.g. 25"
                value={metricsForm.age}
                onChange={(e) => setMetricsForm((f) => ({ ...f, age: e.target.value }))}
              />
              <SelectField
                label="Primary Goal"
                name="goal"
                options={FITNESS_GOALS.map((g) => ({ value: g.value, label: g.label }))}
                value={metricsForm.goal}
                onChange={(e) => setMetricsForm((f) => ({ ...f, goal: e.target.value }))}
              />
            </div>

            <BodyTypeSelector
              gender={metricsForm.gender}
              value={metricsForm.bodyType}
              onChange={(val) => setMetricsForm((f) => ({ ...f, bodyType: val }))}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
