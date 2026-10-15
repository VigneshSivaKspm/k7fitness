import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  Activity,
  ArrowRight,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Dumbbell,
  ExternalLink,
  Flame,
  IndianRupee,
  LogIn,
  LogOut,
  MessageCircle,
  Phone,
  PlayCircle,
  Salad,
  ShieldCheck,
  Sparkles,
  Timer,
  TriangleAlert,
  User,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getTrainee } from '../../services/traineeService';
import { workoutService, dietService } from '../../services/planTemplateService';
import {
  getTodayAttendance,
  listTraineeAttendance,
  memberCheckIn,
  memberCheckOut,
} from '../../services/attendanceService';
import {
  daysUntil,
  formatDate,
  formatDuration,
  formatTime,
  toDate,
} from '../../utils/dates';
import { roundMoney } from '../../utils/format';
import DailyQuoteBanner from '../../components/ui/DailyQuoteBanner';

export default function MemberDashboard() {
  const { member } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState(member);
  const [workout, setWorkout] = useState(null);
  const [diet, setDiet] = useState(null);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attBusy, setAttBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  // Live timer for active workout
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  const loadAttendance = async (traineeId) => {
    try {
      const att = await getTodayAttendance(traineeId);
      setTodayAttendance(att);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (!member?.id) return;
    let cancelled = false;

    async function loadData() {
      try {
        const fresh = await getTrainee(member.id);
        if (!cancelled && fresh) {
          setProfile(fresh);

          // Load workout assignment
          if (fresh.workoutAssignmentId) {
            workoutService.getAssignment(fresh.workoutAssignmentId).then((w) => {
              if (!cancelled) setWorkout(w);
            }).catch(() => {});
          }

          // Load diet assignment
          if (fresh.dietAssignmentId) {
            dietService.getAssignment(fresh.dietAssignmentId).then((d) => {
              if (!cancelled) setDiet(d);
            }).catch(() => {});
          }

          // Load monthly attendance
          const now = new Date();
          const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
          listTraineeAttendance(member.id, firstDay, now).then((att) => {
            if (!cancelled) setAttendanceCount(att.length);
          }).catch(() => {});
        }

        // Load today's check-in / check-out status
        const todayAtt = await getTodayAttendance(member.id);
        if (!cancelled) setTodayAttendance(todayAtt);
      } catch (err) {
        console.error('Failed to load member dashboard', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [member?.id]);

  // Compute live elapsed workout time if checked in
  useEffect(() => {
    if (todayAttendance?.status === 'checked_in' && todayAttendance?.checkInTime) {
      const checkInDate = toDate(todayAttendance.checkInTime);
      const updateTimer = () => {
        if (checkInDate) {
          const diff = Math.max(0, Math.round((Date.now() - checkInDate.getTime()) / 60000));
          setElapsedMinutes(diff);
        }
      };
      updateTimer();
      const interval = setInterval(updateTimer, 30000);
      return () => clearInterval(interval);
    }
  }, [todayAttendance]);

  const p = profile || member;
  const expiry = p?.membershipExpiry ? (p.membershipExpiry.toDate ? p.membershipExpiry.toDate() : new Date(p.membershipExpiry)) : null;
  const daysLeft = expiry ? daysUntil(expiry) : null;
  const isExpired = daysLeft !== null && daysLeft < 0;
  const isExpiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
  const isActive = daysLeft !== null && daysLeft >= 0;

  const handleCheckIn = async () => {
    if (attBusy) return;
    setAttBusy(true);
    try {
      const res = await memberCheckIn(p);
      await loadAttendance(p.id);
      setAttendanceCount((c) => c + 1);
      toast.success('Checked in successfully! Have a great workout!');
    } catch (err) {
      toast.error(err?.message || 'Failed to check in.');
    } finally {
      setAttBusy(false);
    }
  };

  const handleCheckOut = async () => {
    if (attBusy) return;
    setAttBusy(true);
    try {
      const res = await memberCheckOut(p);
      await loadAttendance(p.id);
      toast.success(`Checked out successfully! Workout duration: ${formatDuration(res.durationMinutes)}.`);
    } catch (err) {
      toast.error(err?.message || 'Failed to check out.');
    } finally {
      setAttBusy(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello K7 Fitness, I am member ${p.fullName} (${p.memberId}). I have an enquiry.`
  );
  const whatsappUrl = `https://wa.me/919876543210?text=${whatsappMessage}`;

  const isCheckedIn = todayAttendance?.status === 'checked_in';
  const isCheckedOut = todayAttendance?.status === 'checked_out';

  return (
    <div className="space-y-4">
      {/* 1. Daily Motivational Quote (Light Theme with energetic black & red badge) */}
      <DailyQuoteBanner theme="light" />

      {/* 3. Daily Gym Visit Check-In / Check-Out Widget (Mobile-Native Touch Card) */}
      <div className="rounded-3xl border border-zinc-200/90 bg-white p-4 sm:p-5 shadow-sm shadow-zinc-200/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`flex size-8 items-center justify-center rounded-xl ${
                isCheckedIn
                  ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 animate-pulse'
                  : isCheckedOut
                  ? 'bg-zinc-100 text-zinc-900 ring-1 ring-zinc-200'
                  : 'bg-red-50 text-red-600 ring-1 ring-red-200'
              }`}
            >
              {isCheckedIn ? <Timer className="size-4.5" /> : isCheckedOut ? <CheckCircle2 className="size-4.5" /> : <LogIn className="size-4.5" />}
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-zinc-950">
                Daily Gym Check-In
              </h2>
              <p className="text-[0.7rem] text-zinc-500">
                {isCheckedIn
                  ? 'Live training session in progress'
                  : isCheckedOut
                  ? 'Today’s session completed'
                  : 'Record your arrival at K7 Studio'}
              </p>
            </div>
          </div>

          {/* Status Chip */}
          {isCheckedIn && (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[0.68rem] font-black text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-600 animate-ping" /> IN GYM
            </span>
          )}
          {isCheckedOut && (
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[0.68rem] font-bold text-zinc-700">
              DONE
            </span>
          )}
        </div>

        {/* Live Session Time if Checked In */}
        {isCheckedIn && (
          <div className="mb-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 p-3 flex items-center justify-between">
            <div>
              <span className="text-[0.68rem] font-bold uppercase tracking-wider text-zinc-500 block">
                Session Active
              </span>
              <span className="text-xs text-zinc-700 font-medium">
                Entered at {formatTime(todayAttendance.checkInTime)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-emerald-600 font-mono">
                {formatDuration(elapsedMinutes)}
              </span>
            </div>
          </div>
        )}

        {/* Checked Out Summary */}
        {isCheckedOut && (
          <div className="mb-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 p-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-[0.65rem] text-zinc-400 block font-bold uppercase">In Time</span>
              <span className="font-mono font-bold text-zinc-800">{formatTime(todayAttendance.checkInTime)}</span>
            </div>
            <div>
              <span className="text-[0.65rem] text-zinc-400 block font-bold uppercase">Out Time</span>
              <span className="font-mono font-bold text-zinc-800">{formatTime(todayAttendance.checkOutTime)}</span>
            </div>
            <div>
              <span className="text-[0.65rem] text-zinc-400 block font-bold uppercase">Total</span>
              <span className="font-mono font-black text-emerald-600">{formatDuration(todayAttendance.durationMinutes)}</span>
            </div>
          </div>
        )}

        {/* Primary Action Button (Touch-optimized) */}
        {!isCheckedIn && !isCheckedOut && (
          <button
            type="button"
            disabled={attBusy}
            onClick={handleCheckIn}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-red-600/25 hover:bg-red-500 active:scale-[0.98] transition disabled:opacity-50"
          >
            <LogIn className="size-4" /> Tap to Check In
          </button>
        )}

        {isCheckedIn && (
          <button
            type="button"
            disabled={attBusy}
            onClick={handleCheckOut}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-5 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-zinc-950/20 hover:bg-zinc-900 active:scale-[0.98] transition disabled:opacity-50"
          >
            <LogOut className="size-4 text-red-500" /> Complete Workout (Check Out)
          </button>
        )}

        {isCheckedOut && (
          <button
            type="button"
            disabled={attBusy}
            onClick={handleCheckIn}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 active:scale-[0.98] transition disabled:opacity-50"
          >
            <LogIn className="size-3.5 text-zinc-500" /> Check In Again Today
          </button>
        )}
      </div>


      {/* Realtime Machine Demos & Gym Instructions Hub */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/member/equipment"
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 to-zinc-900 p-3.5 text-white shadow-md shadow-zinc-950/20 hover:ring-2 hover:ring-red-500/50 transition flex flex-col justify-between min-h-[105px]"
        >
          <div className="flex items-center justify-between">
            <div className="flex size-7.5 items-center justify-center rounded-xl bg-red-600/20 text-red-400 ring-1 ring-red-500/30">
              <PlayCircle className="size-4" />
            </div>
            <span className="text-[0.6rem] font-black uppercase tracking-widest text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
              Demos
            </span>
          </div>
          <div className="mt-2">
            <h4 className="text-xs font-black uppercase tracking-wide text-white group-hover:text-red-400 transition">
              Machine Demos
            </h4>
            <p className="text-[0.65rem] text-zinc-400 line-clamp-1">
              Form cues & tempo guide
            </p>
          </div>
        </Link>

        <Link
          to="/member/instructions"
          className="group relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-white p-3.5 shadow-sm shadow-zinc-200/40 hover:border-zinc-400 transition flex flex-col justify-between min-h-[105px]"
        >
          <div className="flex items-center justify-between">
            <div className="flex size-7.5 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 ring-1 ring-zinc-200">
              <ShieldCheck className="size-4 text-zinc-800" />
            </div>
            <span className="text-[0.6rem] font-black uppercase tracking-widest text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
              Rules
            </span>
          </div>
          <div className="mt-2">
            <h4 className="text-xs font-black uppercase tracking-wide text-zinc-950 group-hover:text-red-600 transition">
              Gym Guidelines
            </h4>
            <p className="text-[0.65rem] text-zinc-500 line-clamp-1">
              Safety & etiquette
            </p>
          </div>
        </Link>
      </div>

      {/* 5. Assigned Workout Quick Preview Card */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-sm shadow-zinc-200/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm shadow-red-600/30">
              <Dumbbell className="size-4.5" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                Assigned Workout
              </h3>
              <p className="text-[0.68rem] text-zinc-500">
                Customized for your fitness goal
              </p>
            </div>
          </div>
          <Link
            to="/member/workout"
            className="rounded-xl bg-zinc-100 px-2.5 py-1 text-[0.68rem] font-bold text-zinc-800 hover:bg-zinc-200 transition"
          >
            Open Plan →
          </Link>
        </div>

        {workout ? (
          <div className="rounded-2xl bg-zinc-50 border border-zinc-100 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900">{workout.name}</span>
              <span className="rounded-md bg-red-50 text-red-600 text-[0.65rem] font-bold px-2 py-0.5">
                {workout.days?.length || 0} Days
              </span>
            </div>
            <div className="space-y-1">
              {workout.days?.slice(0, 2).map((d, i) => (
                <div key={d.id || i} className="flex items-center justify-between text-xs text-zinc-600">
                  <span className="truncate">{d.title}</span>
                  <span className="text-[0.7rem] text-zinc-400 font-mono">{d.exercises?.length || 0} ex</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-3">
            <p className="text-xs text-zinc-500">Standard general workout split active</p>
            <Link
              to="/member/workout"
              className="mt-1 text-xs font-bold text-red-600 hover:underline inline-block"
            >
              View Exercise Chart
            </Link>
          </div>
        )}
      </div>

      {/* 6. Assigned Nutrition Quick Preview Card */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-sm shadow-zinc-200/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-zinc-950 text-white">
              <Salad className="size-4.5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                Diet & Nutrition
              </h3>
              <p className="text-[0.68rem] text-zinc-500">
                Meal timings and daily macros
              </p>
            </div>
          </div>
          <Link
            to="/member/diet"
            className="rounded-xl bg-zinc-100 px-2.5 py-1 text-[0.68rem] font-bold text-zinc-800 hover:bg-zinc-200 transition"
          >
            Open Diet →
          </Link>
        </div>

        {diet ? (
          <div className="rounded-2xl bg-zinc-50 border border-zinc-100 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900">{diet.name}</span>
              {diet.calories && (
                <span className="rounded-md bg-emerald-50 text-emerald-700 text-[0.65rem] font-bold px-2 py-0.5">
                  {diet.calories} kcal
                </span>
              )}
            </div>
            <div className="space-y-1">
              {diet.meals?.slice(0, 2).map((m, i) => (
                <div key={m.id || i} className="flex items-center justify-between text-xs text-zinc-600">
                  <span className="truncate">{m.slot}</span>
                  <span className="text-[0.7rem] text-zinc-400 font-mono">{m.time || `${m.items?.length || 0} items`}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-3">
            <p className="text-xs text-zinc-500">Standard balanced gym nutrition active</p>
            <Link
              to="/member/diet"
              className="mt-1 text-xs font-bold text-red-600 hover:underline inline-block"
            >
              View Food Chart
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}
