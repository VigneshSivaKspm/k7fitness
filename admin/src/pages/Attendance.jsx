import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { CalendarCheck, Check, ChevronLeft, ChevronRight, Download, UserCheck, UserRoundX, Users } from 'lucide-react';
import { Card, PageHeader } from '../components/ui/Layout';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import Tabs from '../components/ui/Tabs';
import SearchInput from '../components/ui/SearchInput';
import BarChart from '../components/ui/BarChart';
import { EmptyState, ErrorState, SkeletonRows } from '../components/ui/Feedback';
import { MembershipBadge, TraineeIdentity } from '../components/trainees/TraineeCells';
import { daysSinceVisit, getDailyCounts, listDay, listRollCall, markPresent, unmarkPresent } from '../services/attendanceService';
import { useAsync, useDocumentTitle } from '../hooks/useAsync';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { addDays, formatDate, formatShortDate, parseDateInput, startOfDay, toDate, toDateInput, todayInput } from '../utils/dates';
import { formatNumber, phoneDigits } from '../utils/format';
import { getMembershipStatus } from '../utils/status';
import { friendlyError } from '../utils/errors';
import { downloadCsv } from '../utils/csv';

/** Members not seen for this many days are flagged as "missing". */
const MISSING_DAYS = 7;

function lastVisitLabel(trainee) {
  const d = daysSinceVisit(trainee);
  if (d === null) return 'Never checked in';
  if (d === 0) return 'Last visit today';
  if (d === 1) return 'Last visit yesterday';
  return `Last visit ${d} days ago`;
}

function matches(t, term) {
  if (!term) return true;
  const q = term.toLowerCase();
  const digits = phoneDigits(term);
  return t.fullName?.toLowerCase().includes(q) || t.memberId?.toLowerCase().includes(q) || (digits.length >= 3 && t.phone?.includes(digits));
}

function PresenceButton({ present, busy, onClick, name }) {
  return (
    <Button
      size="sm"
      variant={present ? 'success' : 'secondary'}
      icon={present ? Check : UserCheck}
      loading={busy}
      onClick={onClick}
      aria-pressed={present}
      aria-label={present ? `${name} is present. Tap to undo.` : `Mark ${name} present`}
      className="min-w-[6.5rem]"
    >
      {present ? 'Present' : 'Mark'}
    </Button>
  );
}

export default function Attendance() {
  useDocumentTitle('Attendance');
  const toast = useToast();
  const { settings } = useSettings();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState({});

  const dateStr = parseDateInput(params.get('date')) && params.get('date') <= todayInput() ? params.get('date') : todayInput();
  const date = parseDateInput(dateStr);
  const isToday = dateStr === todayInput();
  const filter = ['all', 'present', 'absent', 'missing'].includes(params.get('show')) ? params.get('show') : 'all';

  const setParam = (key, value, fallback) =>
    setParams(
      (p) => {
        const next = new URLSearchParams(p);
        if (value === fallback) next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true },
    );
  const goTo = (d) => setParam('date', toDateInput(d), todayInput());

  const members = useAsync(() => listRollCall(), []);
  const day = useAsync(() => listDay(date), [dateStr]);
  const trend = useAsync(() => getDailyCounts(14), []);

  const presentIds = useMemo(() => new Set((day.data || []).map((a) => a.traineeId)), [day.data]);
  const roster = members.data || [];
  const missing = (t) => {
    const d = daysSinceVisit(t);
    return d === null || d >= MISSING_DAYS;
  };

  const counts = {
    all: roster.length,
    present: roster.filter((t) => presentIds.has(t.id)).length,
    absent: roster.filter((t) => !presentIds.has(t.id)).length,
    missing: roster.filter(missing).length,
  };
  const rate = counts.all ? Math.round((counts.present / counts.all) * 100) : 0;

  const rows = roster.filter((t) => {
    if (!matches(t, search)) return false;
    if (filter === 'present') return presentIds.has(t.id);
    if (filter === 'absent') return !presentIds.has(t.id);
    if (filter === 'missing') return missing(t);
    return true;
  });

  const toggle = async (t) => {
    const present = presentIds.has(t.id);
    setBusy((b) => ({ ...b, [t.id]: true }));
    try {
      if (present) await unmarkPresent(t, date);
      else await markPresent(t, date);
      // Patch local state instead of refetching the whole roster.
      day.setData((list) => (present ? (list || []).filter((a) => a.traineeId !== t.id) : [...(list || []), { traineeId: t.id }]));
      if (present) {
        // Undoing may move "last visit" back to an earlier day — re-read it.
        members.reload({ silent: true });
      } else {
        const newer = !t.lastAttendance || startOfDay(date) > startOfDay(toDate(t.lastAttendance));
        members.setData((list) =>
          list.map((m) => (m.id === t.id ? { ...m, attendanceCount: (m.attendanceCount || 0) + 1, ...(newer ? { lastAttendance: date } : {}) } : m)),
        );
      }
      if (isToday) trend.reload({ silent: true });
      if (!present) toast.success(`${t.fullName} marked present.`);
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy((b) => ({ ...b, [t.id]: false }));
    }
  };

  const exportCsv = async () => {
    try {
      await downloadCsv(`attendance-${dateStr}.csv`, [
        { header: 'Date', value: () => dateStr },
        { header: 'Member ID', value: (t) => t.memberId },
        { header: 'Name', value: (t) => t.fullName },
        { header: 'Phone', value: (t) => t.phone },
        { header: 'Status', value: (t) => (presentIds.has(t.id) ? 'Present' : 'Absent') },
        { header: 'Last visit', value: (t) => toDateInput(t.lastAttendance) },
        { header: 'Total visits', value: (t) => t.attendanceCount || 0 },
      ], roster);
      toast.success('Attendance exported.');
    } catch (err) {
      toast.error(friendlyError(err));
    }
  };

  const loading = (members.loading && !members.data) || (day.loading && !day.data);
  const error = members.error || day.error;

  const tabs = [
    { value: 'all', label: 'All', count: counts.all },
    { value: 'present', label: 'Present', count: counts.present },
    { value: 'absent', label: 'Absent', count: counts.absent },
    { value: 'missing', label: `Not seen ${MISSING_DAYS}+ days`, count: counts.missing },
  ];

  return (
    <>
      <PageHeader
        title="Attendance"
        description="Mark daily check-ins and spot members who have stopped coming."
        actions={
          roster.length > 0 && (
            <Button variant="secondary" icon={Download} onClick={exportCsv}>
              Export day
            </Button>
          )
        }
      />

      {/* Day picker */}
      <div className="card mb-5 flex items-center gap-2 p-2 sm:p-3">
        <Button variant="ghost" size="icon" icon={ChevronLeft} onClick={() => goTo(addDays(date, -1))} aria-label="Previous day" />
        <div className="flex min-w-0 flex-1 flex-col items-center sm:flex-row sm:justify-center sm:gap-3">
          <p className="text-sm font-semibold text-zinc-900 sm:text-base">{isToday ? 'Today' : formatDate(date)}</p>
          <input
            type="date"
            className="input h-9 w-auto py-1 text-sm"
            value={dateStr}
            max={todayInput()}
            onChange={(e) => e.target.value && goTo(parseDateInput(e.target.value))}
            aria-label="Attendance date"
          />
        </div>
        {!isToday && (
          <Button variant="secondary" size="sm" onClick={() => goTo(new Date())}>
            Today
          </Button>
        )}
        <Button variant="ghost" size="icon" icon={ChevronRight} onClick={() => goTo(addDays(date, 1))} disabled={isToday} aria-label="Next day" />
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label={isToday ? 'Present today' : 'Present'} value={formatNumber(counts.present)} icon={CalendarCheck} tone="success" loading={loading} />
        <StatCard label="Active members" value={formatNumber(counts.all)} icon={Users} loading={loading} />
        <StatCard label="Attendance rate" value={`${rate}%`} icon={UserCheck} tone="brand" hint={formatDate(date)} loading={loading} />
        <StatCard label={`Not seen ${MISSING_DAYS}+ days`} value={formatNumber(counts.missing)} icon={UserRoundX} tone="danger" loading={loading} />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_22rem] [&>*]:min-w-0">
        <div className="card overflow-hidden">
          <div className="space-y-3 border-b border-zinc-100 p-4">
            <SearchInput value={search} onSearch={setSearch} delay={150} placeholder="Search name, phone or member ID" />
            <Tabs variant="pill" tabs={tabs} value={filter} onChange={(v) => setParam('show', v, 'all')} />
          </div>
          {error ? (
            <ErrorState
              message={error}
              onRetry={() => {
                members.reload();
                day.reload();
              }}
            />
          ) : loading ? (
            <SkeletonRows rows={6} />
          ) : !rows.length ? (
            <EmptyState
              icon={filter === 'present' ? CalendarCheck : Users}
              title={search ? 'No matching members' : filter === 'present' ? 'Nobody checked in yet' : filter === 'missing' ? 'Everyone is coming regularly' : 'No members here'}
              description={search ? 'Try a different name, phone number or member ID.' : roster.length ? '' : 'Add trainees first, then mark their attendance here.'}
            />
          ) : (
            <ul className="divide-y divide-zinc-100">
              {rows.map((t) => {
                const present = presentIds.has(t.id);
                const status = getMembershipStatus(t, settings.expiryAlertDays);
                const gone = daysSinceVisit(t);
                return (
                  <li key={t.id} className={`flex items-center gap-3 px-4 py-3 ${present ? 'bg-emerald-50/50' : ''}`}>
                    <Link to={`/trainees/${t.id}?tab=attendance`} className="min-w-0 flex-1">
                      <TraineeIdentity trainee={t} size="sm" showPhone={false} />
                      <p className={`mt-1 truncate pl-11 text-xs ${gone === null || gone >= MISSING_DAYS ? 'text-red-600' : 'text-zinc-500'}`}>
                        {lastVisitLabel(t)}
                        {t.attendanceCount > 0 && <span className="text-zinc-400"> · {formatNumber(t.attendanceCount)} visits</span>}
                      </p>
                    </Link>
                    {status === 'expired' && <MembershipBadge trainee={t} alertDays={settings.expiryAlertDays} />}
                    <PresenceButton present={present} busy={busy[t.id]} onClick={() => toggle(t)} name={t.fullName} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <Card title="Check-ins" description="Members present per day, last 14 days">
          {trend.error ? (
            <ErrorState message={trend.error} onRetry={trend.reload} />
          ) : trend.loading && !trend.data ? (
            <SkeletonRows rows={3} />
          ) : (
            <BarChart data={(trend.data || []).map((d) => ({ label: formatShortDate(d.date), value: d.value }))} format={formatNumber} height={160} />
          )}
        </Card>
      </div>
    </>
  );
}
