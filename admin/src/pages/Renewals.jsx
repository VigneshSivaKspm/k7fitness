import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { CalendarCheck, CalendarClock, Download, Eye, MessageCircle, Phone } from 'lucide-react';
import { PageHeader } from '../components/ui/Layout';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import Pagination from '../components/ui/Pagination';
import { EmptyState, ErrorState } from '../components/ui/Feedback';
import { TraineeIdentity } from '../components/trainees/TraineeCells';
import RenewMembershipDialog from '../components/trainees/RenewMembershipDialog';
import { listByExpiry } from '../services/traineeService';
import { countByExpiry } from '../services/reportService';
import { usePagedList } from '../hooks/usePagedList';
import { useAsync, useDocumentTitle } from '../hooks/useAsync';
import { useReminders } from '../hooks/useReminders';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { addDays, daysUntil, endOfDay, formatDate, startOfDay, toDateInput } from '../utils/dates';
import { formatPhone, telLink } from '../utils/format';
import { friendlyError } from '../utils/errors';
import { downloadCsv } from '../utils/csv';

const BUCKETS = [
  { value: 'today', label: 'Expiring today', days: 0 },
  { value: '3', label: 'Within 3 days', days: 3 },
  { value: '7', label: 'Within 7 days', days: 7 },
  { value: '15', label: 'Within 15 days', days: 15 },
  { value: '30', label: 'Within 30 days', days: 30 },
  { value: 'expired', label: 'Expired', days: null },
];

function bucketRange(bucket) {
  const today = startOfDay();
  if (bucket.value === 'expired') return { from: null, to: new Date(today.getTime() - 1) };
  return { from: today, to: endOfDay(addDays(today, bucket.days)) };
}

const countBucket = (bucket) => countByExpiry(bucketRange(bucket));

function DaysPill({ trainee }) {
  const d = daysUntil(trainee.membershipExpiry);
  const cls = d < 0 ? 'bg-red-50 text-red-700 ring-red-200' : d <= 3 ? 'bg-amber-50 text-amber-800 ring-amber-200' : 'bg-zinc-100 text-zinc-700 ring-zinc-200';
  const label = d < 0 ? `${Math.abs(d)}d overdue` : d === 0 ? 'Today' : `${d} day${d === 1 ? '' : 's'}`;
  return <span className={`tabular inline-flex rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset ${cls}`}>{label}</span>;
}

export default function Renewals() {
  useDocumentTitle('Renewals');
  const navigate = useNavigate();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const { money } = useSettings();
  const reminders = useReminders();
  const [renewing, setRenewing] = useState(null);

  const bucket = BUCKETS.find((b) => b.value === params.get('within')) || BUCKETS[2];
  const range = useMemo(() => bucketRange(bucket), [bucket]);
  const counts = useAsync(async () => {
    const values = await Promise.all(BUCKETS.map(countBucket));
    return Object.fromEntries(BUCKETS.map((b, i) => [b.value, values[i]]));
  }, []);

  const fetchPage = useCallback(({ cursor }) => listByExpiry({ ...range, max: 25, cursor }), [range]);
  const list = usePagedList(fetchPage, [fetchPage]);

  const refresh = () => {
    list.reload();
    counts.reload({ silent: true });
  };

  const exportCsv = async () => {
    try {
      await downloadCsv(`renewals-${bucket.value}-${toDateInput(new Date())}.csv`, [
        { header: 'Member ID', value: (t) => t.memberId },
        { header: 'Name', value: (t) => t.fullName },
        { header: 'Phone', value: (t) => t.phone },
        { header: 'Plan', value: (t) => t.currentPlanName },
        { header: 'Expiry', value: (t) => toDateInput(t.membershipExpiry) },
        { header: 'Days remaining', value: (t) => daysUntil(t.membershipExpiry) },
        { header: 'Outstanding', value: (t) => t.pendingAmount || 0 },
      ], list.items);
      toast.success('Renewal list exported.');
    } catch (err) {
      toast.error(friendlyError(err));
    }
  };

  const actions = (t) => (
    <div className="flex items-center justify-end gap-1">
      <Button size="icon-sm" variant="ghost" icon={Phone} href={telLink(t.phone)} aria-label={`Call ${t.fullName}`} />
      <Button size="icon-sm" variant="ghost" icon={MessageCircle} href={reminders.renewal(t)} aria-label={`Send renewal reminder to ${t.fullName} on WhatsApp`} />
      <Button size="icon-sm" variant="ghost" icon={Eye} to={`/trainees/${t.id}`} aria-label={`View ${t.fullName}`} />
      <Button size="sm" icon={CalendarClock} onClick={() => setRenewing(t)}>
        Renew
      </Button>
    </div>
  );

  const columns = [
    { key: 'member', header: 'Member', render: (t) => <TraineeIdentity trainee={t} showPhone={false} /> },
    { key: 'phone', header: 'Phone', render: (t) => <span className="whitespace-nowrap">{formatPhone(t.phone)}</span> },
    { key: 'plan', header: 'Current plan', render: (t) => t.currentPlanName || '—' },
    { key: 'expiry', header: 'Expiry', render: (t) => <span className="whitespace-nowrap">{formatDate(t.membershipExpiry)}</span> },
    { key: 'days', header: 'Days left', render: (t) => <DaysPill trainee={t} /> },
    { key: 'due', header: 'Outstanding', align: 'right', render: (t) => <span className={`tabular font-semibold ${t.pendingAmount > 0 ? 'text-red-600' : 'text-zinc-400'}`}>{money(t.pendingAmount || 0)}</span> },
    { key: 'actions', header: <span className="sr-only">Actions</span>, align: 'right', stopPropagation: true, render: actions },
  ];

  return (
    <>
      <PageHeader
        title="Renewals"
        description="Members whose memberships are about to expire or have expired. Remind, renew and collect in one place."
        actions={
          list.items.length > 0 && (
            <Button variant="secondary" icon={Download} onClick={exportCsv}>
              Export
            </Button>
          )
        }
      />

      <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-6">
        {BUCKETS.map((b) => {
          const active = b.value === bucket.value;
          return (
            <button
              key={b.value}
              type="button"
              onClick={() => setParams({ within: b.value }, { replace: true })}
              aria-pressed={active}
              className={`min-w-36 shrink-0 rounded-2xl border p-4 text-left transition sm:min-w-0 ${
                active ? 'border-ink bg-ink text-white shadow-pop' : 'border-zinc-200 bg-white hover:border-zinc-300'
              }`}
            >
              <p className={`text-xs font-medium ${active ? 'text-zinc-300' : 'text-zinc-500'}`}>{b.label}</p>
              <p className={`tabular mt-1 text-2xl font-bold ${active ? 'text-white' : b.value === 'expired' ? 'text-red-600' : 'text-zinc-900'}`}>
                {counts.data ? counts.data[b.value] : '–'}
              </p>
              {active && <span className="mt-2 block h-0.5 w-6 rounded-full bg-brand" />}
            </button>
          );
        })}
      </div>

      <div className="card overflow-hidden">
        <div className="card-header">
          <h2 className="card-title">{bucket.label}</h2>
          <p className="text-xs text-zinc-500">
            {bucket.value === 'expired' ? 'Most recently expired first' : `Up to ${formatDate(range.to)}`}
          </p>
        </div>
        {list.error ? (
          <ErrorState message={list.error} onRetry={list.reload} />
        ) : (
          <DataTable
            columns={columns}
            rows={list.items}
            loading={list.loading}
            onRowClick={(t) => navigate(`/trainees/${t.id}`)}
            renderCard={(t) => (
              <div>
                <div className="flex items-center justify-between gap-3">
                  <TraineeIdentity trainee={t} />
                  <DaysPill trainee={t} />
                </div>
                <div className="mt-2 flex items-center justify-between gap-2 pl-[3.25rem]">
                  <p className="truncate text-xs text-zinc-500">
                    {t.currentPlanName} · {formatDate(t.membershipExpiry)}
                    {t.pendingAmount > 0 && <span className="font-semibold text-red-600"> · {money(t.pendingAmount)} due</span>}
                  </p>
                </div>
                <div className="mt-2 flex justify-end" onClick={(e) => e.stopPropagation()} role="presentation">
                  {actions(t)}
                </div>
              </div>
            )}
            empty={
              <EmptyState
                icon={CalendarCheck}
                title={bucket.value === 'expired' ? 'No expired memberships' : 'No renewals due'}
                description={bucket.value === 'expired' ? 'Every active member has a valid membership.' : `No memberships expire ${bucket.value === 'today' ? 'today' : `in the next ${bucket.days} days`}.`}
              />
            }
          />
        )}
        <Pagination page={list.page} hasPrev={list.hasPrev} hasNext={list.hasMore} onPrev={list.prev} onNext={list.next} loading={list.loading} />
      </div>

      <RenewMembershipDialog trainee={renewing} open={Boolean(renewing)} onClose={() => setRenewing(null)} onDone={refresh} />
    </>
  );
}
