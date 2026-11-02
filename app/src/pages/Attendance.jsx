import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  CalendarCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  LogIn,
  LogOut,
  RotateCcw,
  Timer,
  UserCheck,
  UserRoundX,
  Users,
} from 'lucide-react';
import { Card, PageHeader } from '../components/ui/Layout';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import Tabs from '../components/ui/Tabs';
import SearchInput from '../components/ui/SearchInput';
import BarChart from '../components/ui/BarChart';
import { EmptyState, ErrorState, SkeletonRows } from '../components/ui/Feedback';
import { MembershipBadge, TraineeIdentity } from '../components/trainees/TraineeCells';
import {
  checkOutTrainee,
  daysSinceVisit,
  getDailyCounts,
  listDay,
  listRollCall,
  markPresent,
  unmarkPresent,
} from '../services/attendanceService';
import { useAsync, useDocumentTitle } from '../hooks/useAsync';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import {
  addDays,
  formatDate,
  formatDuration,
  formatShortDate,
  formatTime,
  parseDateInput,
  startOfDay,
  toDate,
  toDateInput,
  todayInput,
} from '../utils/dates';
import { formatNumber, phoneDigits } from '../utils/format';
import { getMembershipStatus } from '../utils/status';
import { friendlyError } from '../utils/errors';
import { downloadCsv } from '../utils/csv';

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
  return (
    t.fullName?.toLowerCase().includes(q) ||
    t.memberId?.toLowerCase().includes(q) ||
    (digits.length >= 3 && t.phone?.includes(digits))
  );
}

export default function Attendance() {
  useDocumentTitle('Attendance');
  const toast = useToast();
  const { settings } = useSettings();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState({});

  const dateStr =
    parseDateInput(params.get('date')) && params.get('date') <= todayInput()
      ? params.get('date')
      : todayInput();
  const date = parseDateInput(dateStr);
  const isToday = dateStr === todayInput();
  const filter = ['all', 'in_gym', 'present', 'absent', 'missing'].includes(params.get('show'))
    ? params.get('show')
    : 'all';

  const setParam = (key, value, fallback) =>
    setParams(
      (p) => {
        const next = new URLSearchParams(p);
        if (value === fallback) next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true }
    );
  const goTo = (d) => setParam('date', toDateInput(d), todayInput());

  const members = useAsync(() => listRollCall(), []);
  const day = useAsync(() => listDay(date), [dateStr]);
  const trend = useAsync(() => getDailyCounts(14), []);

  const dayMap = useMemo(() => new Map((day.data || []).map((a) => [a.traineeId, a])), [day.data]);
  const presentIds = useMemo(() => new Set((day.data || []).map((a) => a.traineeId)), [day.data]);
  const roster = members.data || [];

  const inGymIds = useMemo(() => {
    const s = new Set();
    (day.data || []).forEach((a) => {
      if (a.status === 'checked_in' && !a.checkOutTime) s.add(a.traineeId);
    });
    return s;
  }, [day.data]);

  const missing = (t) => {
    const d = daysSinceVisit(t);
    return d === null || d >= MISSING_DAYS;
  };

  const counts = {
    all: roster.length,
    inGym: inGymIds.size,
    present: roster.filter((t) => presentIds.has(t.id)).length,
    absent: roster.filter((t) => !presentIds.has(t.id)).length,
    missing: roster.filter(missing).length,
  };
  const rate = counts.all ? Math.round((counts.present / counts.all) * 100) : 0;

  const rows = roster.filter((t) => {
    if (!matches(t, search)) return false;
    if (filter === 'in_gym') return inGymIds.has(t.id);
    if (filter === 'present') return presentIds.has(t.id);
    if (filter === 'absent') return !presentIds.has(t.id);
    if (filter === 'missing') return missing(t);
    return true;
  });

  const handleCheckIn = async (t) => {
    setBusy((b) => ({ ...b, [t.id]: true }));
    try {
      await markPresent(t, date);
      day.reload({ silent: true });
      const newer = !t.lastAttendance || startOfDay(date) > startOfDay(toDate(t.lastAttendance));
      members.setData((list) =>
        list.map((m) =>
          m.id === t.id
            ? { ...m, attendanceCount: (m.attendanceCount || 0) + 1, ...(newer ? { lastAttendance: date } : {}) }
            : m
        )
      );
      if (isToday) trend.reload({ silent: true });
      toast.success(`${t.fullName} checked in.`);
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy((b) => ({ ...b, [t.id]: false }));
    }
  };

  const handleCheckOut = async (t) => {
    setBusy((b) => ({ ...b, [t.id]: true }));
    try {
      await checkOutTrainee(t, date);
      day.reload({ silent: true });
      toast.success(`${t.fullName} checked out.`);
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy((b) => ({ ...b, [t.id]: false }));
    }
  };

  const handleUnmark = async (t) => {
    setBusy((b) => ({ ...b, [t.id]: true }));
    try {
      await unmarkPresent(t, date);
      day.reload({ silent: true });
      members.reload({ silent: true });
      if (isToday) trend.reload({ silent: true });
      toast.success(`Removed attendance for ${t.fullName}.`);
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy((b) => ({ ...b, [t.id]: false }));
    }
  };

  const exportCsv = async () => {
    try {
      await downloadCsv(
        `attendance-${dateStr}.csv`,
        [
          { header: 'Date', value: () => dateStr },
          { header: 'Member ID', value: (t) => t.memberId },
          { header: 'Name', value: (t) => t.fullName },
          { header: 'Phone', value: (t) => t.phone },
          { header: 'Status', value: (t) => (presentIds.has(t.id) ? (inGymIds.has(t.id) ? 'In Gym' : 'Checked Out') : 'Absent') },
          { header: 'Check In Time', value: (t) => formatTime(dayMap.get(t.id)?.checkInTime) },
          { header: 'Check Out Time', value: (t) => formatTime(dayMap.get(t.id)?.checkOutTime) },
          { header: 'Duration', value: (t) => formatDuration(dayMap.get(t.id)?.durationMinutes) },
          { header: 'Total visits', value: (t) => t.attendanceCount || 0 },
        ],
        roster
      );
      toast.success('Attendance exported.');
    } catch (err) {
      toast.error(friendlyError(err));
    }
  };

  const loading = (members.loading && !members.data) || (day.loading && !day.data);
  const error = members.error || day.error;

  const tabs = [
    { value: 'all', label: 'All', count: counts.all },
    { value: 'in_gym', label: 'In Gym Now', count: counts.inGym },
    { value: 'present', label: 'Present Today', count: counts.present },
    { value: 'absent', label: 'Absent', count: counts.absent },
    { value: 'missing', label: `Not seen ${MISSING_DAYS}+ days`, count: counts.missing },
  ];

  return (
    <>
      <PageHeader
        title="Attendance & Check-ins"
        description="Monitor active members in the gym, track check-in/out times, and spot irregular members."
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

      {/* Stat Cards */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="In Gym Now"
          value={formatNumber(counts.inGym)}
          icon={Timer}
          tone="brand"
          hint="Currently checked in"
          loading={loading}
        />
        <StatCard
          label={isToday ? 'Present today' : 'Present'}
          value={formatNumber(counts.present)}
          icon={CalendarCheck}
          tone="success"
          loading={loading}
        />
        <StatCard label="Attendance rate" value={`${rate}%`} icon={UserCheck} hint={formatDate(date)} loading={loading} />
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
              icon={filter === 'in_gym' ? Timer : filter === 'present' ? CalendarCheck : Users}
              title={
                search
                  ? 'No matching members'
                  : filter === 'in_gym'
                  ? 'No members currently in the gym'
                  : filter === 'present'
                  ? 'Nobody checked in yet'
                  : filter === 'missing'
                  ? 'Everyone is coming regularly'
                  : 'No members here'
              }
              description={search ? 'Try a different name, phone number or member ID.' : roster.length ? '' : 'Add members first, then mark their attendance here.'}
            />
          ) : (
            <ul className="divide-y divide-zinc-100">
              {rows.map((t) => {
                const att = dayMap.get(t.id);
                const isPresent = Boolean(att);
                const isInGym = isPresent && att.status === 'checked_in' && !att.checkOutTime;
                const isCheckedOut = isPresent && Boolean(att.checkOutTime);
                const status = getMembershipStatus(t, settings.expiryAlertDays);
                const isBusy = busy[t.id];

                return (
                  <li
                    key={t.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3.5 transition ${
                      isInGym ? 'bg-emerald-50/60' : isPresent ? 'bg-zinc-50/80' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Link to={`/members/${t.id}?tab=attendance`} className="min-w-0 flex-1">
                        <TraineeIdentity trainee={t} size="sm" showPhone={false} />

                        {/* Timing and visit details */}
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 pl-11 text-xs">
                          {isInGym && (
                            <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                              <span className="size-1.5 rounded-full bg-emerald-600 animate-ping" />
                              In Gym · Checked in {formatTime(att.checkInTime)}
                            </span>
                          )}

                          {isCheckedOut && (
                            <span className="text-zinc-600 font-medium">
                              In: {formatTime(att.checkInTime)} · Out: {formatTime(att.checkOutTime)}
                              {att.durationMinutes && <span className="text-emerald-700 font-semibold"> ({formatDuration(att.durationMinutes)})</span>}
                            </span>
                          )}

                          {!isPresent && (
                            <span className={daysSinceVisit(t) >= MISSING_DAYS ? 'text-red-600 font-medium' : 'text-zinc-500'}>
                              {lastVisitLabel(t)}
                            </span>
                          )}
                        </div>
                      </Link>

                      {status === 'expired' && <MembershipBadge trainee={t} alertDays={settings.expiryAlertDays} />}
                    </div>

                    {/* Check In / Check Out Action Buttons */}
                    <div className="flex items-center gap-2 pl-11 sm:pl-0 shrink-0">
                      {!isPresent && (
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={LogIn}
                          loading={isBusy}
                          onClick={() => handleCheckIn(t)}
                        >
                          Check In
                        </Button>
                      )}

                      {isInGym && (
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="primary"
                            icon={LogOut}
                            loading={isBusy}
                            onClick={() => handleCheckOut(t)}
                          >
                            Check Out
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Undo check in"
                            loading={isBusy}
                            onClick={() => handleUnmark(t)}
                          >
                            <RotateCcw className="size-3.5 text-zinc-400 hover:text-zinc-700" />
                          </Button>
                        </div>
                      )}

                      {isCheckedOut && (
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600">
                            Completed
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Re-check in or remove"
                            loading={isBusy}
                            onClick={() => handleUnmark(t)}
                          >
                            <RotateCcw className="size-3.5 text-zinc-400 hover:text-zinc-700" />
                          </Button>
                        </div>
                      )}
                    </div>
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
            <BarChart
              data={(trend.data || []).map((d) => ({ label: formatShortDate(d.date), value: d.value }))}
              format={formatNumber}
              height={160}
            />
          )}
        </Card>
      </div>
    </>
  );
}
