import { useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { CalendarClock, Eye, IndianRupee, MessageCircle, Pencil, Phone, Plus, SlidersHorizontal, Users } from 'lucide-react';
import { PageHeader } from '../../components/ui/Layout';
import Button from '../../components/ui/Button';
import SearchInput from '../../components/ui/SearchInput';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import DropdownMenu from '../../components/ui/DropdownMenu';
import Tabs from '../../components/ui/Tabs';
import { EmptyState, ErrorState } from '../../components/ui/Feedback';
import { ExpiryCell, MembershipBadge, PaymentBadge, TraineeIdentity } from '../../components/trainees/TraineeCells';
import RecordPaymentDialog from '../../components/trainees/RecordPaymentDialog';
import RenewMembershipDialog from '../../components/trainees/RenewMembershipDialog';
import { listTrainees, searchTrainees } from '../../services/traineeService';
import { usePagedList } from '../../hooks/usePagedList';
import { usePlans } from '../../hooks/usePlans';
import { useReminders } from '../../hooks/useReminders';
import { useDocumentTitle } from '../../hooks/useAsync';
import { useSettings } from '../../context/SettingsContext';
import { getMembershipStatus, getPaymentStatus } from '../../utils/status';
import { telLink } from '../../utils/format';

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'expiring', label: 'Expiring soon' },
  { value: 'expired', label: 'Expired' },
  { value: 'inactive', label: 'Inactive' },
];

const PAGE_SIZE = 20;

export default function TraineeList() {
  useDocumentTitle('Trainees');
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { settings, money } = useSettings();
  const { plans } = usePlans();
  const reminders = useReminders();
  const [showFilters, setShowFilters] = useState(Boolean(params.get('plan') || params.get('payment')));
  const [paymentFor, setPaymentFor] = useState(null);
  const [renewFor, setRenewFor] = useState(null);

  const status = params.get('status') || 'all';
  const planId = params.get('plan') || '';
  const payment = params.get('payment') || 'all';
  const sort = params.get('sort') || 'recent';
  const q = params.get('q') || '';

  const setParam = useCallback(
    (key, value, fallback) =>
      setParams(
        (p) => {
          const next = new URLSearchParams(p);
          if (!value || value === fallback) next.delete(key);
          else next.set(key, value);
          return next;
        },
        { replace: true },
      ),
    [setParams],
  );

  const fetchPage = useCallback(
    async ({ cursor }) => {
      if (q.trim()) {
        // Search returns the best matches; other filters are applied on the results.
        const results = await searchTrainees(q, 50);
        const items = results.filter(
          (t) =>
            (status === 'all' || getMembershipStatus(t, settings.expiryAlertDays) === status || (status === 'active' && getMembershipStatus(t, settings.expiryAlertDays) === 'expiring')) &&
            (!planId || t.currentPlanId === planId) &&
            (payment === 'all' || getPaymentStatus(t) === payment),
        );
        return { items, cursor: null, hasMore: false };
      }
      return listTrainees({ filters: { status, planId, payment }, sort, pageSize: PAGE_SIZE, cursor, alertDays: settings.expiryAlertDays });
    },
    [q, status, planId, payment, sort, settings.expiryAlertDays],
  );

  const list = usePagedList(fetchPage, [fetchPage]);
  const filtersActive = Boolean(planId || payment !== 'all' || sort !== 'recent');
  const anyFilter = filtersActive || status !== 'all' || q;

  const actions = (t) => [
    { label: 'View profile', icon: Eye, to: `/trainees/${t.id}` },
    { label: 'Record payment', icon: IndianRupee, onClick: () => setPaymentFor(t) },
    { label: 'Renew membership', icon: CalendarClock, onClick: () => setRenewFor(t) },
    { label: 'Edit details', icon: Pencil, to: `/trainees/${t.id}/edit` },
    { divider: true },
    { label: 'Call', icon: Phone, href: telLink(t.phone), hidden: !t.phone },
    { label: 'WhatsApp', icon: MessageCircle, href: reminders.chat(t.phone), hidden: !t.phone },
  ];

  const columns = [
    { key: 'name', header: 'Member', render: (t) => <TraineeIdentity trainee={t} /> },
    { key: 'plan', header: 'Plan', render: (t) => <span className="whitespace-nowrap">{t.currentPlanName || <span className="text-zinc-400">—</span>}</span> },
    { key: 'expiry', header: 'Expiry', render: (t) => <ExpiryCell trainee={t} /> },
    { key: 'status', header: 'Status', render: (t) => <MembershipBadge trainee={t} alertDays={settings.expiryAlertDays} /> },
    {
      key: 'fees',
      header: 'Fees',
      render: (t) => (
        <div className="flex flex-col items-start gap-1">
          <PaymentBadge trainee={t} />
          {t.pendingAmount > 0 && <span className="tabular text-xs font-medium text-red-600">{money(t.pendingAmount)} due</span>}
        </div>
      ),
    },
    { key: 'actions', header: <span className="sr-only">Actions</span>, align: 'right', stopPropagation: true, render: (t) => <DropdownMenu items={actions(t)} /> },
  ];

  const renderCard = (t) => (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <TraineeIdentity trainee={t} />
        <div className="mt-2 flex flex-wrap items-center gap-1.5 pl-[3.25rem]">
          <MembershipBadge trainee={t} alertDays={settings.expiryAlertDays} />
          <PaymentBadge trainee={t} />
          {t.pendingAmount > 0 && <span className="tabular text-xs font-semibold text-red-600">{money(t.pendingAmount)}</span>}
        </div>
      </div>
      <div onClick={(e) => e.stopPropagation()} role="presentation">
        <DropdownMenu items={actions(t)} />
      </div>
    </div>
  );

  return (
    <>
      <PageHeader
        title="Trainees"
        description="Search, filter and manage all members."
        actions={
          <Button to="/trainees/new" icon={Plus}>
            Add trainee
          </Button>
        }
      />

      <div className="card overflow-hidden">
        <div className="space-y-3 border-b border-zinc-100 p-4 sm:p-5">
          <div className="flex gap-2">
            <SearchInput className="flex-1" value={q} onSearch={(v) => setParam('q', v.trim())} placeholder="Search name, phone or member ID" />
            <Button
              variant={filtersActive ? 'dark' : 'secondary'}
              icon={SlidersHorizontal}
              onClick={() => setShowFilters((s) => !s)}
              aria-expanded={showFilters}
              className="max-sm:!px-3"
            >
              <span className="max-sm:sr-only">Filters</span>
            </Button>
          </div>
          {showFilters && (
            <div className="grid gap-3 sm:grid-cols-3">
              <select className="input" aria-label="Membership plan" value={planId} onChange={(e) => setParam('plan', e.target.value)}>
                <option value="">All plans</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <select className="input" aria-label="Payment status" value={payment} onChange={(e) => setParam('payment', e.target.value, 'all')}>
                <option value="all">All payment statuses</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
              <select className="input" aria-label="Sort by" value={sort} onChange={(e) => setParam('sort', e.target.value, 'recent')} disabled={status !== 'all' && status !== 'inactive'}>
                <option value="recent">Newest joined first</option>
                <option value="name">Name (A–Z)</option>
                <option value="expiry">Expiry date (soonest)</option>
              </select>
            </div>
          )}
          <Tabs variant="pill" tabs={STATUS_TABS} value={status} onChange={(v) => setParam('status', v, 'all')} />
        </div>

        {list.error ? (
          <ErrorState message={list.error} onRetry={list.reload} />
        ) : (
          <DataTable
            columns={columns}
            rows={list.items}
            loading={list.loading}
            onRowClick={(t) => navigate(`/trainees/${t.id}`)}
            renderCard={renderCard}
            empty={
              anyFilter ? (
                <EmptyState icon={Users} title="No matching trainees" description="Try a different search or clear the filters." action={<Button variant="secondary" onClick={() => setParams({}, { replace: true })}>Clear filters</Button>} />
              ) : (
                <EmptyState
                  icon={Users}
                  title="No trainees have been added yet"
                  description="Add your first trainee to start managing memberships."
                  action={
                    <Button to="/trainees/new" icon={Plus}>
                      Add trainee
                    </Button>
                  }
                />
              )
            }
          />
        )}
        <Pagination page={list.page} hasPrev={list.hasPrev} hasNext={list.hasMore} onPrev={list.prev} onNext={list.next} loading={list.loading} count={list.items.length} />
      </div>

      <RecordPaymentDialog trainee={paymentFor} open={Boolean(paymentFor)} onClose={() => setPaymentFor(null)} onDone={list.reload} />
      <RenewMembershipDialog trainee={renewFor} open={Boolean(renewFor)} onClose={() => setRenewFor(null)} onDone={list.reload} />
    </>
  );
}
