import { useEffect, useState } from 'react';
import { Calendar, CalendarCheck, CheckCircle2, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { listTraineeAttendance } from '../../services/attendanceService';
import { formatDate, toDateInput } from '../../utils/dates';

export default function MemberAttendance() {
  const { member } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());

  useEffect(() => {
    if (!member?.id) return;
    let cancelled = false;

    async function loadAttendance() {
      setLoading(true);
      try {
        const year = selectedMonth.getFullYear();
        const month = selectedMonth.getMonth();
        const from = new Date(year, month, 1);
        const to = new Date(year, month + 1, 0, 23, 59, 59);

        const data = await listTraineeAttendance(member.id, from, to);
        if (!cancelled) setRecords(data);
      } catch (err) {
        console.error('Failed to load attendance', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAttendance();
    return () => {
      cancelled = true;
    };
  }, [member?.id, selectedMonth]);

  const monthName = selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setSelectedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setSelectedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className="space-y-4">
      {/* Header & Month Selector */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-2xl bg-red-600 text-white shadow-sm shadow-red-600/30">
            <CalendarCheck className="size-4.5" />
          </div>
          <div>
            <h1 className="text-base font-black text-zinc-950">Attendance Log</h1>
            <p className="text-[0.68rem] text-zinc-500">Your gym check-ins</p>
          </div>
        </div>

        {/* Month Selector Carousel Controls */}
        <div className="flex items-center gap-1 rounded-2xl border border-zinc-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={prevMonth}
            className="flex size-7 items-center justify-center rounded-xl text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 transition"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-[0.7rem] font-black uppercase tracking-wider text-zinc-900 px-1 min-w-[80px] text-center truncate">
            {monthName}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="flex size-7 items-center justify-center rounded-xl text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 transition"
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Monthly Summary Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950 text-white p-5 shadow-lg border border-zinc-900">
        <div className="pointer-events-none absolute -right-6 -top-6 size-28 rounded-full bg-red-600/20 blur-2xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-red-400 block">
              Monthly Discipline
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-white">{records.length}</span>
              <span className="text-xs text-zinc-400">sessions completed</span>
            </div>
            <p className="mt-1 text-[0.7rem] text-zinc-400">
              Keep pushing forward! Consistency builds results.
            </p>
          </div>
          <div className="flex size-12 items-center justify-center rounded-2xl bg-red-600 text-white shadow-md shadow-red-600/30">
            <Flame className="size-6 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Daily Check-in List */}
      <div className="rounded-3xl border border-zinc-200/90 bg-white overflow-hidden shadow-sm shadow-zinc-200/40">
        <div className="border-b border-zinc-100 px-4 py-3 flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-950">
            Visit History
          </h2>
          <span className="text-[0.68rem] font-bold text-zinc-500">
            {records.length} {records.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-zinc-400 font-medium">
            Loading attendance records…
          </div>
        ) : records.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {records.map((r, i) => (
              <div
                key={r.id || i}
                className="flex items-center justify-between px-4 py-3.5 hover:bg-zinc-50/80 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100">
                    <Calendar className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900">
                      {formatDate(r.date || r.day?.toDate?.() || r.day)}
                    </p>
                    <p className="text-[0.68rem] text-zinc-400 font-mono">
                      {r.checkInTime ? `Checked in: ${new Date(r.checkInTime?.toDate?.() || r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : (r.date || toDateInput(r.day))}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[0.65rem] font-bold text-emerald-700 ring-1 ring-emerald-200">
                  <CheckCircle2 className="size-2.5" /> Present
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center px-4">
            <CalendarCheck className="mx-auto size-9 text-zinc-300" />
            <p className="mt-2 text-xs font-bold text-zinc-800">No visits recorded in {monthName}</p>
            <p className="text-[0.7rem] text-zinc-400 mt-0.5">
              Check in at the gym or tap Check In on the Home tab to log your attendance!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
