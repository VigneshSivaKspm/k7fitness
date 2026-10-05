import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import {
  ArrowLeft,
  BellRing,
  CalendarClock,
  Dumbbell,
  IndianRupee,
  MessageCircle,
  Pencil,
  Phone,
  Salad,
  Trash2,
  UserCheck,
  UserX,
  Wallet,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Tabs from '../../components/ui/Tabs';
import DropdownMenu from '../../components/ui/DropdownMenu';
import { ErrorState, Skeleton } from '../../components/ui/Feedback';
import { ExpiryCell, MembershipBadge, PaymentBadge } from '../../components/trainees/TraineeCells';
import RecordPaymentDialog from '../../components/trainees/RecordPaymentDialog';
import RenewMembershipDialog from '../../components/trainees/RenewMembershipDialog';
import AssignPlanDialog from '../../components/trainees/AssignPlanDialog';
import OverviewTab from '../../components/trainees/profile/OverviewTab';
import MembershipTab from '../../components/trainees/profile/MembershipTab';
import FeesTab from '../../components/trainees/profile/FeesTab';
import PlanTab from '../../components/trainees/profile/PlanTab';
import HistoryTab from '../../components/trainees/profile/HistoryTab';
import { deleteTrainee, getTrainee, setTraineeStatus } from '../../services/traineeService';
import { useAsync, useDocumentTitle } from '../../hooks/useAsync';
import { useReminders } from '../../hooks/useReminders';
import { useSettings } from '../../context/SettingsContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import { formatPhone, telLink } from '../../utils/format';

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'membership', label: 'Membership' },
  { value: 'fees', label: 'Fees' },
  { value: 'workout', label: 'Workout' },
  { value: 'diet', label: 'Diet' },
  { value: 'history', label: 'History' },
];

function ProfileSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-4">
        <Skeleton className="size-20 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  );
}

export default function TraineeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.value === params.get('tab')) ? params.get('tab') : 'overview';
  const { settings, money } = useSettings();
  const reminders = useReminders();
  const confirm = useConfirm();
  const toast = useToast();
  const { data: t, loading, error, reload } = useAsync(() => getTrainee(id), [id]);
  const [dialog, setDialog] = useState(null);
  useDocumentTitle(t?.fullName || 'Trainee');

  const setTab = (v) => setParams(v === 'overview' ? {} : { tab: v }, { replace: true });
  const refresh = useCallback(() => reload({ silent: true }), [reload]);
  const close = () => setDialog(null);

  if (loading && !t) return <ProfileSkeleton />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!t) {
    return <ErrorState message="This trainee could not be found. They may have been deleted." />;
  }

  const inactive = t.status === 'inactive';

  const toggleStatus = () =>
    confirm({
      title: inactive ? 'Reactivate trainee?' : 'Deactivate trainee?',
      message: inactive
        ? `${t.fullName} will appear in active lists, renewals and dashboards again.`
        : `${t.fullName} will be hidden from renewals and active counts. All history, payments and plans are kept and you can reactivate at any time.`,
      confirmText: inactive ? 'Reactivate' : 'Deactivate',
      tone: inactive ? 'primary' : 'danger',
      onConfirm: async () => {
        await setTraineeStatus(t.id, inactive ? 'active' : 'inactive', t.fullName);
        toast.success(inactive ? 'Trainee reactivated.' : 'Trainee deactivated.');
        refresh();
      },
    });

  const remove = () =>
    confirm({
      title: 'Permanently delete trainee?',
      message: (
        <>
          <p>
            This permanently deletes <strong>{t.fullName}</strong> ({t.memberId}) with their membership and plan records. This cannot be undone.
          </p>
          <p className="mt-2">Only use this for duplicates or mistakes. Members with payment history cannot be deleted; deactivate them instead.</p>
        </>
      ),
      confirmText: 'Delete permanently',
      onConfirm: async () => {
        await deleteTrainee(t);
        toast.success('Trainee deleted.');
        navigate('/trainees', { replace: true });
      },
    });

  const moreItems = [
    { label: 'Edit details', icon: Pencil, to: `/trainees/${t.id}/edit` },
    { label: 'Assign workout', icon: Dumbbell, onClick: () => setDialog('workout') },
    { label: 'Assign diet', icon: Salad, onClick: () => setDialog('diet') },
    { divider: true },
    { label: 'Send renewal reminder', icon: BellRing, href: reminders.renewal(t), hidden: !t.phone || !t.membershipExpiry },
    { label: 'Send payment reminder', icon: Wallet, href: reminders.payment(t), hidden: !t.phone || !(t.pendingAmount > 0) },
    { divider: true },
    { label: inactive ? 'Reactivate' : 'Deactivate', icon: inactive ? UserCheck : UserX, onClick: toggleStatus, tone: inactive ? undefined : 'danger' },
    { label: 'Delete permanently', icon: Trash2, onClick: remove, tone: 'danger' },
  ];

  return (
    <>
      <Link to="/trainees" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900">
        <ArrowLeft className="size-4" /> Trainees
      </Link>

      {/* Header */}
      <section className="card relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-20 bg-ink sm:h-24" aria-hidden="true">
          <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-brand/40 to-transparent" />
          <div className="absolute right-[12%] bottom-0 h-full w-10 -skew-x-[20deg] bg-white/[0.04]" />
        </div>
        <div className="relative px-4 pt-10 pb-5 sm:px-6 sm:pt-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <Avatar name={t.fullName} src={t.photoUrl} size="xl" className="!ring-4" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">{t.fullName}</h1>
                <MembershipBadge trainee={t} alertDays={settings.expiryAlertDays} />
              </div>
              <p className="mt-0.5 text-sm text-zinc-500">
                <span className="font-semibold text-zinc-700">{t.memberId}</span>
                {t.phone && (
                  <>
                    {' · '}
                    <a href={telLink(t.phone)} className="hover:text-brand">
                      {formatPhone(t.phone)}
                    </a>
                  </>
                )}
              </p>
            </div>
            <div className="hidden gap-2 sm:flex">
              {t.phone && <Button variant="secondary" icon={Phone} href={telLink(t.phone)} aria-label="Call" size="icon" />}
              {t.phone && <Button variant="secondary" icon={MessageCircle} href={reminders.chat(t.phone)} aria-label="WhatsApp" size="icon" />}
              <Button variant="secondary" icon={Pencil} to={`/trainees/${t.id}/edit`}>
                Edit
              </Button>
              <DropdownMenu items={moreItems} trigger={<span className="flex h-10 items-center rounded-lg border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-50">More</span>} />
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-zinc-100 pt-4 sm:grid-cols-4">
            <div>
              <dt className="text-xs font-medium text-zinc-500">Plan</dt>
              <dd className="mt-0.5 truncate text-sm font-semibold text-zinc-900">{t.currentPlanName || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-zinc-500">Expiry</dt>
              <dd className="mt-0.5 text-sm font-semibold">
                <ExpiryCell trainee={t} />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-zinc-500">Fee status</dt>
              <dd className="mt-1">
                <PaymentBadge trainee={t} />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-zinc-500">Outstanding</dt>
              <dd className={`tabular mt-0.5 text-sm font-bold ${t.pendingAmount > 0 ? 'text-red-600' : 'text-zinc-900'}`}>{money(t.pendingAmount)}</dd>
            </div>
          </dl>

          {/* Primary actions — thumb-friendly on mobile */}
          <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Button icon={IndianRupee} onClick={() => setDialog('payment')} disabled={!(t.pendingAmount > 0)}>
              Record payment
            </Button>
            <Button variant="dark" icon={CalendarClock} onClick={() => setDialog('renew')}>
              {t.currentMembershipId ? 'Renew' : 'Start membership'}
            </Button>
            <Button variant="secondary" icon={Dumbbell} onClick={() => setDialog('workout')} className="max-sm:hidden">
              Assign workout
            </Button>
            <Button variant="secondary" icon={Salad} onClick={() => setDialog('diet')} className="max-sm:hidden">
              Assign diet
            </Button>
            <div className="col-span-2 flex gap-2 sm:hidden">
              {t.phone && <Button variant="secondary" icon={Phone} href={telLink(t.phone)} className="flex-1">Call</Button>}
              {t.phone && <Button variant="secondary" icon={MessageCircle} href={reminders.chat(t.phone)} className="flex-1">WhatsApp</Button>}
              <DropdownMenu items={moreItems} trigger={<span className="flex h-10 items-center rounded-lg border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-800">More</span>} />
            </div>
          </div>
        </div>
      </section>

      <Tabs tabs={TABS} value={tab} onChange={setTab} className="mt-5 mb-5" />

      {tab === 'overview' && <OverviewTab trainee={t} onTab={setTab} />}
      {tab === 'membership' && <MembershipTab trainee={t} onRenew={() => setDialog('renew')} onPayment={() => setDialog('payment')} onChanged={refresh} />}
      {tab === 'fees' && <FeesTab trainee={t} onPayment={() => setDialog('payment')} onChanged={refresh} />}
      {tab === 'workout' && <PlanTab kind="workout" trainee={t} onAssign={() => setDialog('workout')} onChanged={refresh} />}
      {tab === 'diet' && <PlanTab kind="diet" trainee={t} onAssign={() => setDialog('diet')} onChanged={refresh} />}
      {tab === 'history' && <HistoryTab trainee={t} />}

      <RecordPaymentDialog trainee={t} open={dialog === 'payment'} onClose={close} onDone={refresh} />
      <RenewMembershipDialog trainee={t} open={dialog === 'renew'} onClose={close} onDone={refresh} />
      <AssignPlanDialog kind="workout" trainee={t} open={dialog === 'workout'} onClose={close} onDone={refresh} />
      <AssignPlanDialog kind="diet" trainee={t} open={dialog === 'diet'} onClose={close} onDone={refresh} />
    </>
  );
}
