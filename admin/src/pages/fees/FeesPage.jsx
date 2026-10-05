import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Ban, Download, Eye, IndianRupee, MessageCircle, Receipt, Wallet } from 'lucide-react';
import { PageHeader } from '../../components/ui/Layout';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Tabs from '../../components/ui/Tabs';
import SearchInput from '../../components/ui/SearchInput';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import DropdownMenu from '../../components/ui/DropdownMenu';
import { EmptyState, ErrorState } from '../../components/ui/Feedback';
import { PaymentBadge, TraineeIdentity } from '../../components/trainees/TraineeCells';
import RecordPaymentDialog from '../../components/trainees/RecordPaymentDialog';
import { VoidPaymentDialog } from '../../components/trainees/profile/FeesTab';
import { listTrainees, searchTrainees } from '../../services/traineeService';
import { fetchPaymentsInRange, listPayments } from '../../services/paymentService';
import { getCollectedBetween } from '../../services/reportService';
import { usePagedList } from '../../hooks/usePagedList';
import { useAsync, useDocumentTitle } from '../../hooks/useAsync';
import { useReminders } from '../../hooks/useReminders';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { paymentMethodLabel } from '../../constants/options';
import { endOfDay, formatDate, parseDateInput, startOfDay, startOfMonth, startOfWeek, todayInput, toDateInput } from '../../utils/dates';
import { getPaymentStatus } from '../../utils/status';
import { downloadCsv } from '../../utils/csv';
import { friendlyError } from '../../utils/errors';

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'partial', label: 'Partial' },
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' },
];

const RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'custom', label: 'Custom range' },
];

function resolveRange(range, from, to) {
  const now = new Date();
  if (range === 'today') return { from: startOfDay(now), to: endOfDay(now) };
  if (range === 'week') return { from: startOfWeek(now), to: endOfDay(now) };
  if (range === 'custom') {
    const f = parseDateInput(from);
    const t = parseDateInput(to);
    if (f && t && t >= f) return { from: startOfDay(f), to: endOfDay(t) };
  }
  return { from: startOfMonth(now), to: endOfDay(now) };
}

function Balances() {
  const navigate = useNavigate();
  const { money } = useSettings();
  const reminders = useReminders();
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [paying, setPaying] = useState(null);

  const fetchPage = useCallback(
    async ({ cursor }) => {
      if (q.trim()) {
        const items = (await searchTrainees(q, 50)).filter((t) => status === 'all' || getPaymentStatus(t) === status);
        return { items, cursor: null, hasMore: false };
      }
      return listTrainees({ filters: { payment: status }, sort: 'recent', pageSize: 20, cursor });
    },
    [q, status],
  );
  const list = usePagedList(fetchPage, [fetchPage]);

  const columns = [
    { key: 'member', header: 'Member', render: (t) => <TraineeIdentity trainee={t} /> },
    { key: 'plan', header: 'Plan', render: (t) => t.currentPlanName || <span className="text-zinc-400">—</span> },
    { key: 'fee', header: 'Total fee', align: 'right', render: (t) => <span className="tabular">{money(t.totalFee)}</span> },
    { key: 'paid', header: 'Paid', align: 'right', render: (t) => <span className="tabular text-emerald-700">{money(t.totalPaid)}</span> },
    { key: 'due', header: 'Pending', align: 'right', render: (t) => <span className={`tabular font-semibold ${t.pendingAmount > 0 ? 'text-red-600' : 'text-zinc-400'}`}>{money(t.pendingAmount)}</span> },
    { key: 'status', header: 'Status', render: (t) => <PaymentBadge trainee={t} /> },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      stopPropagation: true,
      render: (t) => (
        <div className="flex justify-end gap-1">
          {t.pendingAmount > 0 && (
            <Button size="sm" variant="secondary" icon={IndianRupee} onClick={() => setPaying(t)}>
              Collect
            </Button>
          )}
          <DropdownMenu
            items={[
              { label: 'View member', icon: Eye, to: `/trainees/${t.id}?tab=fees` },
              { label: 'Send payment reminder', icon: MessageCircle, href: reminders.payment(t), hidden: !(t.pendingAmount > 0) || !t.phone },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="card overflow-hidden">
      <div className="space-y-3 border-b border-zinc-100 p-4 sm:p-5">
        <SearchInput value={q} onSearch={setQ} placeholder="Search by member name, member ID or phone" />
        <Tabs variant="pill" tabs={STATUS_TABS} value={status} onChange={setStatus} />
      </div>
      {list.error ? (
        <ErrorState message={list.error} onRetry={list.reload} />
      ) : (
        <DataTable
          columns={columns}
          rows={list.items}
          loading={list.loading}
          onRowClick={(t) => navigate(`/trainees/${t.id}?tab=fees`)}
          renderCard={(t) => (
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <TraineeIdentity trainee={t} showPhone={false} />
                <div className="mt-1.5 flex items-center gap-2 pl-[3.25rem] text-xs">
                  <PaymentBadge trainee={t} />
                  <span className="tabular text-zinc-500">
                    Paid {money(t.totalPaid)} / {money(t.totalFee)}
                  </span>
                </div>
              </div>
              {t.pendingAmount > 0 ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPaying(t);
                  }}
                  className="tabular shrink-0 rounded-lg bg-brand-50 px-3 py-2 text-sm font-bold text-brand ring-1 ring-brand-100"
                >
                  {money(t.pendingAmount)}
                </button>
              ) : (
                <span className="tabular text-sm font-semibold text-emerald-700">Paid</span>
              )}
            </div>
          )}
          empty={<EmptyState icon={Wallet} title={q || status !== 'all' ? 'No matching members' : 'No members yet'} description={status === 'overdue' ? 'No overdue fees. Great work!' : undefined} />}
        />
      )}
      <Pagination page={list.page} hasPrev={list.hasPrev} hasNext={list.hasMore} onPrev={list.prev} onNext={list.next} loading={list.loading} />
      <RecordPaymentDialog trainee={paying} open={Boolean(paying)} onClose={() => setPaying(null)} onDone={list.reload} />
    </div>
  );
}

function Payments() {
  const navigate = useNavigate();
  const { money } = useSettings();
  const toast = useToast();
  const [range, setRange] = useState('month');
  const [from, setFrom] = useState(toDateInput(startOfMonth()));
  const [to, setTo] = useState(todayInput());
  const [q, setQ] = useState('');
  const [voiding, setVoiding] = useState(null);
  const [exporting, setExporting] = useState(false);

  const bounds = useMemo(() => resolveRange(range, from, to), [range, from, to]);
  const fetchPage = useCallback(({ cursor }) => listPayments({ ...bounds, search: q, pageSize: 20, cursor }), [bounds, q]);
  const list = usePagedList(fetchPage, [fetchPage]);
  const total = useAsync(() => getCollectedBetween(bounds.from, bounds.to), [bounds]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const rows = await fetchPaymentsInRange(bounds.from, bounds.to);
      await downloadCsv(`payments-${toDateInput(bounds.from)}-to-${toDateInput(bounds.to)}.csv`, [
        { header: 'Receipt No', value: (p) => p.receiptNo },
        { header: 'Date', value: (p) => toDateInput(p.paymentDate) },
        { header: 'Member ID', value: (p) => p.memberId },
        { header: 'Member', value: (p) => p.traineeName },
        { header: 'Phone', value: (p) => p.traineePhone },
        { header: 'Membership', value: (p) => p.planName },
        { header: 'Amount', value: (p) => p.amount },
        { header: 'Method', value: (p) => paymentMethodLabel(p.method) },
        { header: 'Reference', value: (p) => p.reference },
        { header: 'Status', value: (p) => p.status },
        { header: 'Received By', value: (p) => p.receivedByName },
        { header: 'Notes', value: (p) => p.notes },
      ], rows);
      toast.success(`Exported ${rows.length} payment${rows.length === 1 ? '' : 's'}.`);
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setExporting(false);
    }
  };

  const columns = [
    { key: 'date', header: 'Date', render: (p) => <span className="whitespace-nowrap">{formatDate(p.paymentDate)}</span> },
    { key: 'receipt', header: 'Receipt', render: (p) => <span className="font-mono text-xs">{p.receiptNo}</span> },
    {
      key: 'member',
      header: 'Member',
      render: (p) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-zinc-900">{p.traineeName}</p>
          <p className="text-xs text-zinc-500">{p.memberId}</p>
        </div>
      ),
    },
    { key: 'plan', header: 'Membership', render: (p) => p.planName },
    { key: 'method', header: 'Method', render: (p) => paymentMethodLabel(p.method) },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (p) => (
        <span className={`tabular font-semibold ${p.status === 'void' ? 'text-zinc-400 line-through' : 'text-zinc-900'}`}>{money(p.amount)}</span>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      stopPropagation: true,
      render: (p) => (
        <DropdownMenu
          items={[
            { label: 'View receipt', icon: Receipt, to: `/fees/receipts/${p.id}` },
            { label: 'View member', icon: Eye, to: `/trainees/${p.traineeId}?tab=fees` },
            { label: 'Void payment', icon: Ban, tone: 'danger', onClick: () => setVoiding(p), hidden: p.status === 'void' },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="card overflow-hidden">
      <div className="space-y-3 border-b border-zinc-100 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs variant="pill" tabs={RANGES} value={range} onChange={setRange} />
          <Button variant="secondary" size="sm" icon={Download} onClick={exportCsv} loading={exporting}>
            Export CSV
          </Button>
        </div>
        {range === 'custom' && (
          <div className="grid grid-cols-2 gap-3 sm:max-w-md">
            <input type="date" className="input" value={from} max={to} onChange={(e) => setFrom(e.target.value)} aria-label="From date" />
            <input type="date" className="input" value={to} min={from} max={todayInput()} onChange={(e) => setTo(e.target.value)} aria-label="To date" />
          </div>
        )}
        <SearchInput value={q} onSearch={setQ} placeholder="Search member name, ID, phone or receipt no." />
        <p className="text-sm text-zinc-600">
          Collected {formatDate(bounds.from)} – {formatDate(bounds.to)}:{' '}
          <strong className="tabular text-zinc-900">{total.loading ? '…' : money(total.data || 0)}</strong>
          <span className="text-zinc-400"> (excludes voided payments)</span>
        </p>
      </div>
      {list.error ? (
        <ErrorState message={list.error} onRetry={list.reload} />
      ) : (
        <DataTable
          columns={columns}
          rows={list.items}
          loading={list.loading}
          onRowClick={(p) => navigate(`/fees/receipts/${p.id}`)}
          renderCard={(p) => (
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-zinc-900">{p.traineeName}</p>
                <p className="truncate text-xs text-zinc-500">
                  {formatDate(p.paymentDate)} · {paymentMethodLabel(p.method)} · {p.receiptNo}
                </p>
              </div>
              <div className="text-right">
                <p className={`tabular font-bold ${p.status === 'void' ? 'text-zinc-400 line-through' : 'text-zinc-900'}`}>{money(p.amount)}</p>
                {p.status === 'void' && <Badge tone="danger">Void</Badge>}
              </div>
            </div>
          )}
          empty={<EmptyState icon={Receipt} title="No payments in this period" description="Recorded payments will appear here with printable receipts." />}
        />
      )}
      <Pagination page={list.page} hasPrev={list.hasPrev} hasNext={list.hasMore} onPrev={list.prev} onNext={list.next} loading={list.loading} />
      <VoidPaymentDialog
        payment={voiding}
        open={Boolean(voiding)}
        onClose={() => setVoiding(null)}
        onDone={() => {
          list.reload();
          total.reload({ silent: true });
        }}
      />
    </div>
  );
}

export default function FeesPage() {
  useDocumentTitle('Fees');
  const [params, setParams] = useSearchParams();
  const view = params.get('view') === 'payments' ? 'payments' : 'balances';
  return (
    <>
      <PageHeader title="Fees" description="Track balances, collect dues and review every payment." />
      <Tabs
        className="mb-5"
        tabs={[
          { value: 'balances', label: 'Member balances' },
          { value: 'payments', label: 'Payment history' },
        ]}
        value={view}
        onChange={(v) => setParams(v === 'balances' ? {} : { view: v }, { replace: true })}
      />
      {view === 'balances' ? <Balances /> : <Payments />}
    </>
  );
}
