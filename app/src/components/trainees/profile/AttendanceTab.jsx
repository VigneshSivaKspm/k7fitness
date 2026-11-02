import { useMemo, useState } from 'react';
import { CalendarCheck, Check, ChevronLeft, ChevronRight, UserCheck } from 'lucide-react';
import { Card } from '../../ui/Layout';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import { ErrorState, SkeletonRows } from '../../ui/Feedback';
import { daysSinceVisit, listTraineeAttendance, markPresent, regularity, unmarkPresent } from '../../../services/attendanceService';
import { useAsync } from '../../../hooks/useAsync';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { addDays, addMonths, formatDate, startOfDay, startOfMonth, startOfWeek, toDateInput } from '../../../utils/dates';
import { formatNumber } from '../../../utils/format';
import { friendlyError } from '../../../utils/errors';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const REGULARITY_TONE = { regular: 'success', occasional: 'warning', irregular: 'danger' };
const monthTitle = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' });

function Stat({ label, value, hint }) {
  return (
    <div className="card p-4">
      <p className="text-[0.8rem] font-medium text-zinc-500">{label}</p>
      <p className="tabular mt-1 text-xl font-bold text-zinc-900">{value}</p>
      {hint && <p className="mt-0.5 truncate text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

/**
 * A trainee's attendance: regularity, streaks and a month calendar.
 * Tapping a past day toggles presence, so missed check-ins can be filled in.
 */
export default function AttendanceTab({ trainee: t, onChanged }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [month, setMonth] = useState(() => startOfMonth());
  const [busyDay, setBusyDay] = useState('');

  const today = startOfDay();
  const monthEnd = addDays(addMonths(month, 1), -1);
  const last30From = addDays(today, -29);
  const from = month < last30From ? month : last30From;
  const to = monthEnd > today ? monthEnd : today;

  const { data, loading, error, reload, setData } = useAsync(
    () => listTraineeAttendance(t.id, from, to),
    [t.id, toDateInput(from), toDateInput(to)],
  );

  const visited = useMemo(() => new Set((data || []).map((a) => a.date)), [data]);
  const inMonth = (data || []).filter((a) => a.date.slice(0, 7) === toDateInput(month).slice(0, 7)).length;
  const last30 = (data || []).filter((a) => a.date >= toDateInput(last30From)).length;
  const reg = regularity(last30);

  // Current streak: consecutive days up to today (or yesterday, if today is not marked yet).
  let streak = 0;
  for (let d = visited.has(toDateInput(today)) ? today : addDays(today, -1); visited.has(toDateInput(d)); d = addDays(d, -1)) streak++;

  const presentToday = visited.has(toDateInput(today));
  const since = daysSinceVisit(t);

  const toggle = async (day) => {
    const key = toDateInput(day);
    const present = visited.has(key);
    const run = async () => {
      setBusyDay(key);
      try {
        if (present) await unmarkPresent(t, day);
        else await markPresent(t, day);
        setData((list) => (present ? list.filter((a) => a.date !== key) : [...(list || []), { id: key, date: key }]));
        if (!present) toast.success(`Marked present for ${formatDate(day)}.`);
        onChanged?.();
      } catch (err) {
        toast.error(friendlyError(err));
      } finally {
        setBusyDay('');
      }
    };
    if (present) {
      confirm({
        title: 'Remove this check-in?',
        message: `${t.fullName} will be marked absent on ${formatDate(day)}.`,
        confirmText: 'Remove',
        onConfirm: run,
      });
    } else run();
  };

  // Calendar grid: Monday-first weeks covering the month.
  const gridStart = startOfWeek(month);
  const weeks = Math.ceil(((monthEnd - gridStart) / 86_400_000 + 1) / 7);
  const cells = Array.from({ length: weeks * 7 }, (_, i) => addDays(gridStart, i));
  const isCurrentMonth = toDateInput(month) === toDateInput(startOfMonth());

  return (
    <div className="space-y-5">
      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${presentToday ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-500'}`}>
            <CalendarCheck className="size-5" />
          </span>
          <div>
            <p className="font-semibold text-zinc-900">{presentToday ? 'Checked in today' : 'Not checked in today'}</p>
            <p className="text-sm text-zinc-500">
              {since === null ? 'No visits recorded yet' : since === 0 ? 'Last visit: today' : `Last visit: ${formatDate(t.lastAttendance)} (${since} day${since === 1 ? '' : 's'} ago)`}
            </p>
          </div>
        </div>
        <Button
          variant={presentToday ? 'success' : 'primary'}
          icon={presentToday ? Check : UserCheck}
          loading={busyDay === toDateInput(today)}
          onClick={() => toggle(today)}
          disabled={loading && !data}
        >
          {presentToday ? 'Present today' : 'Mark present today'}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="card p-4">
          <p className="text-[0.8rem] font-medium text-zinc-500">Regularity</p>
          <div className="mt-1.5">
            <Badge tone={REGULARITY_TONE[reg.level]} dot>
              {reg.label}
            </Badge>
          </div>
          <p className="tabular mt-1.5 text-xs text-zinc-500">{reg.perWeek.toFixed(1)} visits / week</p>
        </div>
        <Stat label="Last 30 days" value={formatNumber(last30)} hint={`${Math.round((last30 / 30) * 100)}% of days`} />
        <Stat label="Current streak" value={`${streak} day${streak === 1 ? '' : 's'}`} />
        <Stat label="Total visits" value={formatNumber(t.attendanceCount || 0)} hint={t.joiningDate ? `Since ${formatDate(t.joiningDate)}` : ''} />
      </div>

      <Card
        title={monthTitle.format(month)}
        description={`${inMonth} visit${inMonth === 1 ? '' : 's'} this month · tap a day to mark or undo`}
        actions={
          <div className="flex gap-1">
            <Button variant="ghost" size="icon-sm" icon={ChevronLeft} onClick={() => setMonth((m) => addMonths(m, -1))} aria-label="Previous month" />
            <Button variant="ghost" size="icon-sm" icon={ChevronRight} onClick={() => setMonth((m) => addMonths(m, 1))} disabled={isCurrentMonth} aria-label="Next month" />
          </div>
        }
      >
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading && !data ? (
          <SkeletonRows rows={4} />
        ) : (
          <div className="mx-auto max-w-md">
            <div className="mb-1 grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-zinc-400">
              {WEEKDAYS.map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {cells.map((d) => {
                const key = toDateInput(d);
                const outside = d.getMonth() !== month.getMonth();
                const future = d > today;
                const present = visited.has(key);
                const isToday = key === toDateInput(today);
                if (outside) return <span key={key} aria-hidden="true" />;
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={future || Boolean(busyDay)}
                    onClick={() => toggle(d)}
                    aria-pressed={present}
                    aria-label={`${formatDate(d)}: ${present ? 'present' : 'absent'}`}
                    className={`tabular flex aspect-square items-center justify-center rounded-lg text-sm font-semibold transition ${
                      present
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : future
                          ? 'text-zinc-300'
                          : 'bg-zinc-50 text-zinc-700 ring-1 ring-zinc-200 ring-inset hover:bg-zinc-100'
                    } ${isToday ? 'outline-2 outline-offset-1 outline-brand' : ''} ${busyDay === key ? 'animate-pulse' : ''}`}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded bg-emerald-600" /> Present
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded bg-zinc-50 ring-1 ring-zinc-200" /> Absent
              </span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
