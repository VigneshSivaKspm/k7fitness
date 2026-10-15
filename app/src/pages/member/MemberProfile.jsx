import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  Activity,
  ArrowRight,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Flame,
  IndianRupee,
  KeyRound,
  LogOut,
  MessageCircle,
  Pencil,
  Save,
  Scale,
  Sparkles,
  Target,
  TriangleAlert,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { changeMemberPassword } from '../../services/memberAuthService';
import { updateMemberBodyMetrics } from '../../services/traineeService';
import { listTraineeAttendance } from '../../services/attendanceService';
import { useToast } from '../../context/ToastContext';
import { formatPhone, roundMoney } from '../../utils/format';
import { daysUntil, formatDate } from '../../utils/dates';
import { FITNESS_GOALS, fitnessGoalLabel } from '../../constants/options';
import { calculateBmi, cmToFeetInches } from '../../utils/fitness';

export default function MemberProfile() {
  const { member, logout, updateMemberSession } = useAuth();
  const toast = useToast();

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Fitness & Body Profile edit form state
  const [gender, setGender] = useState(member?.gender || 'male');
  const [age, setAge] = useState(member?.age != null ? String(member.age) : '');
  const [height, setHeight] = useState(member?.height != null ? String(member.height) : '');
  const [weight, setWeight] = useState(member?.weight != null ? String(member.weight) : '');
  const [bodyType, setBodyType] = useState(member?.bodyType || 'mesomorph');
  const [goal, setGoal] = useState(member?.goal || 'general_fitness');
  const [preferredInTime, setPreferredInTime] = useState(member?.preferredInTime || '06:00 AM');
  const [preferredOutTime, setPreferredOutTime] = useState(member?.preferredOutTime || '07:30 AM');
  const [metricsSaving, setMetricsSaving] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  if (!member) return null;

  // Read-only values from member record
  const savedBmi = calculateBmi(member.height, member.weight);
  const savedHeightFeet = cmToFeetInches(Number(member.height));
  const currentGoalObj = FITNESS_GOALS.find((g) => g.value === (member.goal || 'general_fitness'));

  const expiry = member?.membershipExpiry
    ? member.membershipExpiry.toDate
      ? member.membershipExpiry.toDate()
      : new Date(member.membershipExpiry)
    : null;
  const daysLeft = expiry ? daysUntil(expiry) : null;
  const isExpired = daysLeft !== null && daysLeft < 0;
  const isExpiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
  const isActive = daysLeft !== null && daysLeft >= 0;

  const [attendanceCount, setAttendanceCount] = useState(0);

  useEffect(() => {
    if (!member?.id) return;
    let cancelled = false;
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    listTraineeAttendance(member.id, firstDay, now)
      .then((att) => {
        if (!cancelled) setAttendanceCount(att.length);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [member?.id]);

  const whatsappMessage = encodeURIComponent(
    `Hello K7 Fitness, I am member ${member?.fullName} (${member?.memberId}). I have an enquiry.`
  );
  const whatsappUrl = `https://wa.me/919876543210?text=${whatsappMessage}`;

  // Live BMI in edit modal
  const liveBmi = calculateBmi(height, weight);

  const openEditModal = () => {
    setGender(member?.gender || 'male');
    setAge(member?.age != null ? String(member.age) : '');
    setHeight(member?.height != null ? String(member.height) : '');
    setWeight(member?.weight != null ? String(member.weight) : '');
    setBodyType(member?.bodyType || 'mesomorph');
    setGoal(member?.goal || 'general_fitness');
    setPreferredInTime(member?.preferredInTime || '06:00 AM');
    setPreferredOutTime(member?.preferredOutTime || '07:30 AM');
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    if (metricsSaving) return;
    setIsEditOpen(false);
  };

  const onSaveMetrics = async (e) => {
    e.preventDefault();
    if (metricsSaving) return;
    setMetricsSaving(true);
    try {
      const updated = await updateMemberBodyMetrics(member.id, {
        height,
        weight,
        age,
        gender,
        bodyType,
        goal,
        preferredInTime,
        preferredOutTime,
      });
      updateMemberSession(updated);
      toast.success('Your body profile and fitness targets were updated!');
      setIsEditOpen(false);
    } catch (err) {
      toast.error(err?.message || 'Could not save body profile.');
    } finally {
      setMetricsSaving(false);
    }
  };

  const onPasswordChange = async (e) => {
    e.preventDefault();
    if (passwordBusy) return;
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordBusy(true);
    try {
      await changeMemberPassword(member.id, currentPassword, newPassword);
      toast.success('Your password has been changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err?.message || 'Could not change password.');
    } finally {
      setPasswordBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-sm">
            <User className="size-4.5 text-red-500" />
          </div>
          <div>
            <h1 className="text-base font-black text-zinc-950">My Profile & Target</h1>
            <p className="text-[0.68rem] text-zinc-500">Body metrics and login settings</p>
          </div>
        </div>

        {/* Edit Button in Header */}
        <button
          type="button"
          onClick={openEditModal}
          className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/80 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 hover:border-red-300 active:scale-95 transition shadow-xs"
        >
          <Pencil className="size-3.5" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Hero Member Identity Card (Moved from Dashboard) */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950 text-white p-5 shadow-xl shadow-zinc-950/15 border border-zinc-900">
        <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-red-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 -bottom-10 size-36 rounded-full bg-red-600/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-3">
          {/* Top Status Badges */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600/25 px-3 py-1 text-[0.68rem] font-black tracking-wider text-red-400 uppercase ring-1 ring-red-500/40">
              <Sparkles className="size-3" /> {member.memberId || 'K7 MEMBER'}
            </span>

            {isActive && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[0.68rem] font-bold text-emerald-400 ring-1 ring-emerald-500/30">
                <CheckCircle2 className="size-3" /> Active Plan
              </span>
            )}
            {isExpired && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2.5 py-0.5 text-[0.68rem] font-bold text-red-400 ring-1 ring-red-500/30">
                <TriangleAlert className="size-3" /> Expired
              </span>
            )}
          </div>

          {/* Member Name */}
          <div>
            <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">
              Hello, {member.fullName} 👋
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              {member.currentPlanName || 'Standard Gym Membership'}
            </p>
          </div>

          {/* Daily Preferred Time Slot Pill & Desk Link */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/80 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Clock className="size-3.5 text-red-500 shrink-0" />
              <span className="text-[0.72rem]">
                Slot:{' '}
                <strong className="text-white font-mono font-bold">
                  {member?.preferredSlot || `${member?.preferredInTime || '06:00 AM'} - ${member?.preferredOutTime || '07:30 AM'}`}
                </strong>
              </span>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-xl bg-white/10 px-2.5 py-1 text-[0.68rem] font-bold text-zinc-200 hover:bg-white/20 transition"
            >
              <MessageCircle className="size-3 text-emerald-400" /> Help Desk
            </a>
          </div>
        </div>
      </div>

      {/* Attendance & Membership Validity Snapshot (2 Columns) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Attendance Streak */}
        <Link
          to="/member/attendance"
          className="rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-sm shadow-zinc-200/40 hover:border-zinc-300 transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-zinc-500">
              This Month
            </span>
            <div className="flex size-7 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100">
              <CalendarCheck className="size-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-zinc-950">{attendanceCount}</span>
            <span className="text-xs font-medium text-zinc-500 ml-1">days</span>
          </div>
          <span className="mt-2 text-[0.68rem] font-bold text-red-600 inline-flex items-center gap-0.5">
            View history <ArrowRight className="size-2.5" />
          </span>
        </Link>

        {/* Days Left in Membership */}
        <div className="rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-sm shadow-zinc-200/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-zinc-500">
              Validity
            </span>
            <div className="flex size-7 items-center justify-center rounded-xl bg-zinc-100 text-zinc-800 ring-1 ring-zinc-200">
              <Clock className="size-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span
              className={`text-2xl font-black ${
                isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : 'text-zinc-950'
              }`}
            >
              {daysLeft !== null ? (daysLeft < 0 ? '0' : daysLeft) : '—'}
            </span>
            <span className="text-xs font-medium text-zinc-500 ml-1">days left</span>
          </div>
          <span className="mt-2 text-[0.68rem] text-zinc-400 truncate">
            {expiry ? `Until ${formatDate(expiry)}` : 'No expiry set'}
          </span>
        </div>
      </div>

      {/* Fees & Dues Summary Card */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-sm shadow-zinc-200/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-900">
            <IndianRupee className="size-4.5" />
          </div>
          <div>
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-zinc-500 block">
              Fee Status
            </span>
            <span className="text-sm font-extrabold text-zinc-950">
              {Number(member.pendingAmount) > 0 ? (
                <span className="text-red-600">₹{roundMoney(member.pendingAmount)} Pending</span>
              ) : (
                <span className="text-emerald-600">Paid in Full</span>
              )}
            </span>
          </div>
        </div>
        <Link
          to="/member/fees"
          className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-bold text-zinc-800 hover:bg-zinc-100 transition"
        >
          Receipts →
        </Link>
      </div>

      {/* Body Metrics & Goals Card (READ ONLY VIEW) */}
      <div className="rounded-3xl border border-zinc-200/90 bg-white p-4 sm:p-5 shadow-sm shadow-zinc-200/40 space-y-4">
        <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="size-4 text-red-600" />
            <h2 className="text-xs font-black uppercase tracking-wider text-zinc-950">
              Body Stats & Goal
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[0.68rem] font-medium text-zinc-400">Trainer Sync</span>
            <button
              type="button"
              onClick={openEditModal}
              className="flex items-center gap-1 rounded-xl bg-red-50 border border-red-200/80 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-100 transition active:scale-95"
            >
              <Pencil className="size-3" />
              Edit
            </button>
          </div>
        </div>

        {/* 4 Stat Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="rounded-2xl border border-zinc-150 bg-zinc-50/70 p-3">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
              Gender
            </span>
            <span className="text-xs font-extrabold text-zinc-900 capitalize">
              {member.gender || 'Not specified'}
            </span>
          </div>

          <div className="rounded-2xl border border-zinc-150 bg-zinc-50/70 p-3">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
              Age
            </span>
            <span className="text-xs font-extrabold text-zinc-900">
              {member.age ? `${member.age} yrs` : '—'}
            </span>
          </div>

          <div className="rounded-2xl border border-zinc-150 bg-zinc-50/70 p-3">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
              Height
            </span>
            <span className="text-xs font-extrabold text-zinc-900">
              {member.height ? `${member.height} cm` : '—'}
            </span>
            {savedHeightFeet && (
              <span className="text-[0.65rem] text-zinc-400 font-medium block">
                {savedHeightFeet}
              </span>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-150 bg-zinc-50/70 p-3">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
              Weight
            </span>
            <span className="text-xs font-extrabold text-zinc-900">
              {member.weight ? `${member.weight} kg` : '—'}
            </span>
          </div>
        </div>

        {/* Calculated BMI Badge */}
        {savedBmi ? (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`flex size-10 items-center justify-center rounded-xl font-black text-white text-sm shadow-sm ${
                  savedBmi.tone === 'success'
                    ? 'bg-emerald-600'
                    : savedBmi.tone === 'warning'
                    ? 'bg-amber-600'
                    : 'bg-red-600'
                }`}
              >
                {savedBmi.value}
              </div>
              <div>
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 block">
                  BMI Index
                </span>
                <span className="text-xs font-bold text-zinc-900">{savedBmi.category}</span>
              </div>
            </div>
            <span className="text-[0.68rem] text-zinc-500 font-medium">
              Ideal: {savedBmi.healthyRange}
            </span>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-3 text-center">
            <p className="text-xs text-zinc-500">
              Height & weight not set. Click{' '}
              <button
                type="button"
                onClick={openEditModal}
                className="font-bold text-red-600 underline hover:text-red-700"
              >
                Edit
              </button>{' '}
              to calculate your BMI.
            </p>
          </div>
        )}

        {/* Current Fitness Goal Display */}
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <Target className="size-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 block">
                Fitness Target
              </span>
              <span className="text-xs font-bold text-zinc-900 truncate block">
                {currentGoalObj?.label || fitnessGoalLabel(member.goal)}
              </span>
            </div>
          </div>
          {currentGoalObj?.description && (
            <span className="text-[0.68rem] text-zinc-500 hidden sm:block text-right">
              {currentGoalObj.description}
            </span>
          )}
        </div>

        {/* Daily Gym Timings Display */}
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white">
              <Clock className="size-4 text-red-400" />
            </div>
            <div className="min-w-0">
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 block">
                Daily Workout Slot
              </span>
              <span className="text-xs font-bold text-zinc-900 font-mono">
                {member.preferredInTime && member.preferredOutTime
                  ? `${member.preferredInTime} – ${member.preferredOutTime}`
                  : '06:00 AM – 07:30 AM'}
              </span>
            </div>
          </div>
          <span className="rounded-full bg-zinc-200/80 px-2 py-0.5 text-[0.65rem] font-bold text-zinc-700">
            Preferred
          </span>
        </div>

        {/* Trigger to open editing window */}
        <button
          type="button"
          onClick={openEditModal}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-red-300 bg-red-50/40 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition active:scale-[0.99]"
        >
          <Pencil className="size-3.5" />
          Update Body Stats & Goals
        </button>
      </div>

      {/* Security & Password Card */}
      <div className="rounded-3xl border border-zinc-200/90 bg-white p-4 sm:p-5 shadow-sm shadow-zinc-200/40 space-y-3">
        <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
          <KeyRound className="size-4 text-zinc-900" />
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-950">
            Change Password
          </h2>
        </div>

        <form onSubmit={onPasswordChange} className="space-y-3 text-xs">
          {passwordError && (
            <p className="rounded-xl bg-red-50 border border-red-200 p-2 text-xs font-bold text-red-600">
              {passwordError}
            </p>
          )}

          <div>
            <label className="block text-[0.65rem] font-bold uppercase text-zinc-500 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:border-red-500 focus:bg-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
              >
                {showCurrent ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[0.65rem] font-bold uppercase text-zinc-500 mb-1">
              New Password (min 6 chars)
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:border-red-500 focus:bg-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
              >
                {showNew ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[0.65rem] font-bold uppercase text-zinc-500 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:border-red-500 focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={passwordBusy}
            className="w-full rounded-2xl bg-zinc-950 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-zinc-900 transition disabled:opacity-50"
          >
            {passwordBusy ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Sign Out Card */}
      <button
        type="button"
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50/50 py-3 text-xs font-bold text-red-600 hover:bg-red-100/60 active:scale-[0.98] transition"
      >
        <LogOut className="size-4" /> Sign Out of Member Portal
      </button>

      {/* ======================================================== */}
      {/* EDITING WINDOW (MODAL DIALOG / BOTTOM SHEET ON MOBILE)   */}
      {/* ======================================================== */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div
            className="w-full sm:max-w-lg max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl border border-zinc-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 bg-zinc-50/50">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <Pencil className="size-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-zinc-950">Edit Body Stats & Goal</h2>
                  <p className="text-[0.68rem] text-zinc-500">
                    Syncs with your trainer for workout & diet customisation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="flex size-8 items-center justify-center rounded-xl border border-zinc-200 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body / Scrollable Form */}
            <form onSubmit={onSaveMetrics} className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Gender */}
              <div>
                <label className="block text-[0.68rem] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`flex items-center justify-center gap-2 rounded-2xl border py-2.5 text-xs font-bold transition ${
                      gender === 'male'
                        ? 'border-red-600 bg-red-50 text-red-600 ring-1 ring-red-200'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    {gender === 'male' && <Check className="size-3.5 text-red-600" />} Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`flex items-center justify-center gap-2 rounded-2xl border py-2.5 text-xs font-bold transition ${
                      gender === 'female'
                        ? 'border-red-600 bg-red-50 text-red-600 ring-1 ring-red-200'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    {gender === 'female' && <Check className="size-3.5 text-red-600" />} Female
                  </button>
                </div>
              </div>

              {/* Age, Height & Weight in 3 Columns */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[0.65rem] font-bold uppercase text-zinc-500 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="25"
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold text-zinc-900 placeholder-zinc-400 focus:border-red-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold uppercase text-zinc-500 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="250"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="175"
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold text-zinc-900 placeholder-zinc-400 focus:border-red-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold uppercase text-zinc-500 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="20"
                    max="250"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="70"
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold text-zinc-900 placeholder-zinc-400 focus:border-red-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Real-time Calculated BMI in Modal */}
              {liveBmi && (
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex size-10 items-center justify-center rounded-xl font-black text-white text-sm shadow-sm ${
                        liveBmi.tone === 'success'
                          ? 'bg-emerald-600'
                          : liveBmi.tone === 'warning'
                          ? 'bg-amber-600'
                          : 'bg-red-600'
                      }`}
                    >
                      {liveBmi.value}
                    </div>
                    <div>
                      <span className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 block">
                        BMI Index
                      </span>
                      <span className="text-xs font-bold text-zinc-900">{liveBmi.category}</span>
                    </div>
                  </div>
                  <span className="text-[0.68rem] text-zinc-500">
                    Ideal: {liveBmi.healthyRange}
                  </span>
                </div>
              )}

              {/* Goal Selector */}
              <div>
                <label className="block text-[0.68rem] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Fitness Goal
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {FITNESS_GOALS.map((g) => {
                    const selected = goal === g.value;
                    return (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => setGoal(g.value)}
                        className={`flex items-start gap-2 rounded-2xl border p-2.5 text-left transition ${
                          selected
                            ? 'border-red-600 bg-red-50 ring-1 ring-red-200 text-red-950 font-bold'
                            : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        <div
                          className={`mt-0.5 rounded-full p-0.5 shrink-0 ${
                            selected ? 'bg-red-600 text-white' : 'border border-zinc-300 text-transparent'
                          }`}
                        >
                          <Check className="size-2.5 stroke-[3]" />
                        </div>
                        <span className="text-xs font-bold truncate leading-tight">{g.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Daily Preferred Gym Timing Slot */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <Clock className="size-4 text-red-600" />
                  <label className="text-xs font-bold text-zinc-950">
                    My Daily Gym Timings
                  </label>
                </div>
                <p className="text-[0.68rem] text-zinc-500 leading-tight">
                  Helps calculate equipment rush so you get zero queue waiting.
                </p>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Morning (6:00 – 7:30 AM)', inTime: '06:00 AM', outTime: '07:30 AM' },
                    { label: 'Evening (5:00 – 6:30 PM)', inTime: '05:00 PM', outTime: '06:30 PM' },
                    { label: 'Prime Rush (6:30 – 8:00 PM)', inTime: '06:30 PM', outTime: '08:00 PM' },
                    { label: 'Night Owl (8:00 – 9:30 PM)', inTime: '08:00 PM', outTime: '09:30 PM' },
                  ].map((slot) => {
                    const isSelected = preferredInTime === slot.inTime && preferredOutTime === slot.outTime;
                    return (
                      <button
                        key={slot.label}
                        type="button"
                        onClick={() => {
                          setPreferredInTime(slot.inTime);
                          setPreferredOutTime(slot.outTime);
                        }}
                        className={`rounded-xl px-2 py-1 text-[0.68rem] font-bold transition ${
                          isSelected
                            ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                            : 'bg-white border border-zinc-200 text-zinc-700 hover:border-zinc-300'
                        }`}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[0.65rem] font-bold text-zinc-500 block">Come-in</label>
                    <input
                      type="text"
                      value={preferredInTime}
                      onChange={(e) => setPreferredInTime(e.target.value)}
                      placeholder="06:00 AM"
                      className="mt-0.5 w-full rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-mono font-bold text-zinc-900 focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[0.65rem] font-bold text-zinc-500 block">Out</label>
                    <input
                      type="text"
                      value={preferredOutTime}
                      onChange={(e) => setPreferredOutTime(e.target.value)}
                      placeholder="07:30 AM"
                      className="mt-0.5 w-full rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-mono font-bold text-zinc-900 focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={metricsSaving}
                  className="rounded-2xl border border-zinc-200 px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={metricsSaving}
                  className="flex items-center gap-1.5 rounded-2xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-red-600/30 hover:bg-red-500 transition disabled:opacity-50 active:scale-95"
                >
                  <Save className="size-4" />
                  {metricsSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
