import { Link } from 'react-router';
import {
  ArrowRight,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  IndianRupee,
  Inbox,
  Receipt,
  TrendingUp,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react';
import { Card } from '../components/ui/Layout';
import StatCard from '../components/ui/StatCard';
import BarChart, { ShareBars } from '../components/ui/BarChart';
import Button from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { ErrorState, SkeletonRows } from '../components/ui/Feedback';
import { TraineeIdentity } from '../components/trainees/TraineeCells';
import { getDashboardStats, getMonthlyCollections, getMonthlyNewMembers, getPlanDistribution } from '../services/reportService';
import { listByExpiry, listWithDues, recentTrainees } from '../services/traineeService';
import { recentPayments } from '../services/paymentService';
import { recentEnquiries } from '../services/enquiryService';
import { listPlans } from '../services/membershipService';
import { getDailyCounts } from '../services/attendanceService';
import { useAsync, useDocumentTitle } from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { addDays, endOfDay, formatDate, formatMonth, formatShortDate, relativeDays, startOfDay, timeAgo } from '../utils/dates';
import { formatNumber } from '../utils/format';
import { paymentMethodLabel } from '../constants/options';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function ListCard({ title, to, linkLabel = 'View all', state, empty, children }) {
  return (
    <Card
      title={title}
      bodyClassName=""
      actions={
        to && (
          <Link to={to} className="inline-flex items-center gap-1 text-[0.8rem] font-semibold text-brand hover:underline">
            {linkLabel} <ArrowRight className="size-3.5" />
          </Link>
        )
      }
    >
      {state.error ? (
        <ErrorState message={state.error} onRetry={state.reload} className="!py-8" />
      ) : state.loading && !state.data ? (
        <SkeletonRows rows={4} />
      ) : !state.data?.length ? (
        <p className="px-5 py-10 text-center text-sm text-zinc-500">{empty}</p>
      ) : (
        <ul className="divide-y divide-zinc-100">{children(state.data)}</ul>
      )}
    </Card>
  );
}

export default function Dashboard() {
  useDocumentTitle('Dashboard');
  const { admin } = useAuth();
  const { settings, money } = useSettings();
  const alertDays = settings.expiryAlertDays;

  const stats = useAsync(() => getDashboardStats(alertDays), [alertDays]);
  const collections = useAsync(() => getMonthlyCollections(6), []);
  const growth = useAsync(() => getMonthlyNewMembers(6), []);
  const distribution = useAsync(async () => getPlanDistribution(await listPlans()), []);
  const renewals = useAsync(
    async () => (await listByExpiry({ from: startOfDay(), to: endOfDay(addDays(new Date(), alertDays)), max: 6 })).items,
    [alertDays],
  );
  const dues = useAsync(() => listWithDues(6), []);
  const payments = useAsync(() => recentPayments(6), []);
  const members = useAsync(() => recentTrainees(5), []);
  const enquiries = useAsync(() => recentEnquiries(5), []);
  const attendance = useAsync(() => getDailyCounts(14), []);
  const presentToday = attendance.data?.at(-1)?.value;

  const s = stats.data || {};
  const kpis = [
    { label: 'Total trainees', value: formatNumber(s.totalTrainees), icon: Users, to: '/trainees' },
    { label: 'Active members', value: formatNumber(s.activeMembers), icon: UserCheck, tone: 'success', to: '/trainees?status=active' },
    { label: 'Inactive members', value: formatNumber(s.inactive), icon: UserMinus, tone: 'neutral', to: '/trainees?status=inactive' },
    { label: 'Expiring soon', value: formatNumber(s.expiringSoon), icon: CalendarClock, tone: 'warning', hint: `Within ${alertDays} days`, to: '/renewals' },
    { label: 'Expired memberships', value: formatNumber(s.expired), icon: CalendarX, tone: 'danger', to: '/renewals?within=expired' },
    { label: 'Collected this month', value: money(s.collectedThisMonth), icon: IndianRupee, tone: 'success', to: '/fees?view=payments' },
    { label: 'Outstanding fees', value: money(s.outstanding), icon: Wallet, tone: 'danger', to: '/fees' },
    { label: 'New this month', value: formatNumber(s.newThisMonth), icon: UserPlus, to: '/trainees' },
  ];

  const chartData = (state) => (state.data || []).map((d) => ({ label: formatMonth(d.date), value: d.value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-zinc-500">{formatDate(new Date())}</p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-[1.65rem]">
            {greeting()}, {admin?.name?.split(' ')[0] || 'there'}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={CalendarClock} to="/renewals" className="flex-1 sm:flex-none">
            Renewals
          </Button>
          <Button icon={UserPlus} to="/trainees/new" className="flex-1 sm:flex-none">
            Add trainee
          </Button>
        </div>
      </div>

      {stats.error ? (
        <div className="card">
          <ErrorState message={stats.error} onRetry={stats.reload} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {kpis.map((k) => (
            <StatCard key={k.label} {...k} loading={stats.loading} />
          ))}
        </div>
      )}

      <Card
        title="Attendance"
        description={presentToday === undefined ? 'Check-ins, last 14 days' : `${formatNumber(presentToday)} checked in today · last 14 days`}
        actions={
          <Link to="/attendance" className="inline-flex items-center gap-1 text-[0.8rem] font-semibold text-brand hover:underline">
            <CalendarCheck className="size-3.5" /> Mark attendance
          </Link>
        }
      >
        {attendance.error ? (
          <ErrorState message={attendance.error} onRetry={attendance.reload} />
        ) : attendance.loading ? (
          <SkeletonRows rows={2} />
        ) : (
          <BarChart data={attendance.data.map((d) => ({ label: formatShortDate(d.date), value: d.value }))} format={formatNumber} height={140} />
        )}
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 [&>*]:min-w-0">
        <ListCard title="Upcoming renewals" to="/renewals" state={renewals} empty={`No memberships expire in the next ${alertDays} days.`}>
          {(rows) =>
            rows.map((t) => (
              <li key={t.id}>
                <Link to={`/trainees/${t.id}`} className="flex items-center justify-between gap-3 px-5 py-3 transition hover:bg-zinc-50">
                  <TraineeIdentity trainee={t} size="sm" showPhone={false} />
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-amber-700">{relativeDays(t.membershipExpiry)}</p>
                    <p className="text-xs text-zinc-500">{t.currentPlanName}</p>
                  </div>
                </Link>
              </li>
            ))
          }
        </ListCard>

        <ListCard title="Pending fees" to="/fees?view=balances" state={dues} empty="No outstanding fees. Everyone is paid up.">
          {(rows) =>
            rows.map((t) => (
              <li key={t.id}>
                <Link to={`/trainees/${t.id}?tab=fees`} className="flex items-center justify-between gap-3 px-5 py-3 transition hover:bg-zinc-50">
                  <TraineeIdentity trainee={t} size="sm" showPhone={false} />
                  <span className="tabular shrink-0 text-sm font-bold text-red-600">{money(t.pendingAmount)}</span>
                </Link>
              </li>
            ))
          }
        </ListCard>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr] [&>*]:min-w-0">
        <Card title="Monthly collections" description="Valid payments received, last 6 months" actions={<TrendingUp className="size-4 text-brand" />}>
          {collections.error ? (
            <ErrorState message={collections.error} onRetry={collections.reload} />
          ) : collections.loading ? (
            <SkeletonRows rows={3} />
          ) : (
            <BarChart data={chartData(collections)} format={money} />
          )}
        </Card>
        <Card title="Active members by plan" description="Members with a valid membership">
          {distribution.error ? (
            <ErrorState message={distribution.error} onRetry={distribution.reload} />
          ) : distribution.loading ? (
            <SkeletonRows rows={3} />
          ) : !distribution.data?.length ? (
            <p className="py-8 text-center text-sm text-zinc-500">No active memberships yet.</p>
          ) : (
            <ShareBars data={distribution.data} format={formatNumber} />
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 [&>*]:min-w-0">
        <ListCard title="Recent payments" to="/fees?view=payments" state={payments} empty="No payments recorded yet.">
          {(rows) =>
            rows.map((p) => (
              <li key={p.id}>
                <Link to={`/fees/receipts/${p.id}`} className="flex items-center gap-3 px-5 py-3 transition hover:bg-zinc-50">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Receipt className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-zinc-900">{p.traineeName}</span>
                    <span className="text-xs text-zinc-500">
                      {formatDate(p.paymentDate)} · {paymentMethodLabel(p.method)}
                    </span>
                  </span>
                  <span className={`tabular text-sm font-semibold ${p.status === 'void' ? 'text-zinc-400 line-through' : 'text-zinc-900'}`}>{money(p.amount)}</span>
                </Link>
              </li>
            ))
          }
        </ListCard>

        <ListCard title="Recent members" to="/trainees" state={members} empty="No members yet.">
          {(rows) =>
            rows.map((t) => (
              <li key={t.id}>
                <Link to={`/trainees/${t.id}`} className="flex items-center justify-between gap-3 px-5 py-3 transition hover:bg-zinc-50">
                  <TraineeIdentity trainee={t} size="sm" showPhone={false} />
                  <span className="shrink-0 text-xs text-zinc-500">{formatDate(t.joiningDate)}</span>
                </Link>
              </li>
            ))
          }
        </ListCard>

        <ListCard title="Recent enquiries" to="/enquiries" state={enquiries} empty="No website enquiries yet.">
          {(rows) =>
            rows.map((e) => (
              <li key={e.id}>
                <Link to={`/enquiries${e.status === 'new' ? '?status=new' : ''}`} className="flex items-center justify-between gap-3 px-5 py-3 transition hover:bg-zinc-50">
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand">
                      <Inbox className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-zinc-900">{e.name}</span>
                      <span className="block truncate text-xs text-zinc-500">{e.interest || 'General enquiry'} · {timeAgo(e.createdAt)}</span>
                    </span>
                  </span>
                  <StatusBadge kind="enquiry" status={e.status} />
                </Link>
              </li>
            ))
          }
        </ListCard>
      </div>

      <Card title="New members" description="Joined per month, last 6 months">
        {growth.error ? (
          <ErrorState message={growth.error} onRetry={growth.reload} />
        ) : growth.loading ? (
          <SkeletonRows rows={2} />
        ) : (
          <BarChart data={chartData(growth)} format={formatNumber} height={140} />
        )}
      </Card>
    </div>
  );
}
