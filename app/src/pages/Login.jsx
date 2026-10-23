import { useEffect, useState } from 'react';
import { Navigate, useLocation, useSearchParams } from 'react-router';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Dumbbell,
  Eye,
  EyeOff,
  IdCard,
  KeyRound,
  LockKeyhole,
  Mail,
  MailCheck,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  UserCheck,
  Users,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Logo from '../components/layout/Logo';
import { assetUrl } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { findMemberById } from '../services/memberAuthService';
import { findTrainerByIdentifier, listAllTrainers } from '../services/trainerAuthService';
import { friendlyError } from '../utils/errors';
import { useDocumentTitle } from '../hooks/useAsync';
import { isDemo } from '../firebase/config';

// Offline demo build: built-in accounts
const DEMO_STAFF = isDemo ? { email: 'demo@k7fitness.app', password: 'demo1234' } : null;

function BrandPanel({ portal }) {
  const subtitle =
    portal === 'member'
      ? 'Member Portal'
      : portal === 'trainer'
      ? 'Personal Trainer Portal'
      : 'Admin Management System';

  return (
    <div className="relative hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_100%,rgb(161_8_37/0.35),transparent_55%)]" aria-hidden="true" />
      <svg viewBox="0 0 128 120" className="absolute -right-24 -bottom-10 h-[80%] opacity-[0.06]" aria-hidden="true">
        <polygon points="8,16 27,16 27,104 8,104" fill="#fff" />
        <polygon points="27,58 56,16 77,16 41,68" fill="#fff" />
        <polygon points="74,16 124,16 124,30 98,104 78,104 102,32 70,32" fill="#d20a35" />
      </svg>
      <img
        src={assetUrl('icons/banner.png')}
        alt=""
        className="pointer-events-none absolute -right-24 bottom-12 w-[85%] max-w-xl opacity-15 select-none object-contain"
        aria-hidden="true"
      />
      <div className="absolute top-0 left-12 h-1 w-24 bg-brand" aria-hidden="true" />
      <div className="relative">
        <Logo subtitle={subtitle} />
      </div>
      <div className="relative max-w-md">
        <p className="text-xs font-semibold tracking-[0.3em] text-brand-bright uppercase">
          {subtitle}
        </p>
        <h2 className="mt-4 font-display text-5xl leading-[0.95] tracking-wide text-white">
          {portal === 'member' ? (
            <>
              Your fitness.
              <br />
              <span className="text-brand-bright">Your progress.</span>
            </>
          ) : portal === 'trainer' ? (
            <>
              Train clients.
              <br />
              <span className="text-brand-bright">Track results.</span>
            </>
          ) : (
            <>
              Run your gym.
              <br />
              <span className="text-brand-bright">Not paperwork.</span>
            </>
          )}
        </h2>
        <p className="mt-5 text-[0.95rem] leading-relaxed text-zinc-400">
          {portal === 'member'
            ? 'Access your daily workout routine, custom nutrition plan, attendance records, and membership validity right on your phone.'
            : portal === 'trainer'
            ? 'Manage your assigned Personal Training members, assign workout & diet routines, log body measurements, and track client attendance.'
            : 'Members, memberships, fees, renewals, workout and diet plans, and your website. All in one place, right from your phone.'}
        </p>
      </div>
      <p className="relative text-xs text-zinc-600">
        {portal === 'member'
          ? 'K7 Fitness Studio & Gym Member Access.'
          : portal === 'trainer'
          ? 'K7 Fitness Certified Trainer Portal.'
          : 'Authorised staff only. All activity is logged.'}
      </p>
    </div>
  );
}

export default function Login() {
  const [searchParams, setSearchParams] = useSearchParams();
  const portalParam = searchParams.get('portal');
  const [portal, setPortal] = useState(() => (portalParam === 'staff' ? 'staff' : portalParam === 'trainer' ? 'trainer' : 'member'));

  useEffect(() => {
    const p = searchParams.get('portal');
    if (p === 'staff' || p === 'member' || p === 'trainer') {
      setPortal(p);
    }
  }, [searchParams]);

  useDocumentTitle(
    portal === 'member'
      ? 'Member Login · K7 Fitness'
      : portal === 'trainer'
      ? 'Trainer Login · K7 Fitness'
      : 'Staff Sign in · K7 Fitness'
  );

  const {
    status,
    role,
    user,
    admin,
    member,
    trainer,
    login,
    memberLogin,
    memberSetupPassword,
    trainerLogin,
    trainerSetupPassword,
    resetPassword,
    error: authError,
    clearError,
    devBypass,
  } = useAuth();
  const location = useLocation();

  // Staff login state
  const [mode, setMode] = useState('login'); // 'login' | 'reset'
  const [email, setEmail] = useState(import.meta.env.VITE_DEV_ADMIN_EMAIL || 'admin@k7fitness.com');
  const [password, setPassword] = useState(import.meta.env.VITE_DEV_ADMIN_PASSWORD || 'AdminPassword123!');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Member login state
  const [memberStep, setMemberStep] = useState('id'); // 'id' | 'first-time' | 'password'
  const [memberIdInput, setMemberIdInput] = useState('');
  const [foundMember, setFoundMember] = useState(null);
  const [memberPassword, setMemberPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showMemberPass, setShowMemberPass] = useState(false);
  const [preferredInTime, setPreferredInTime] = useState('06:00 AM');
  const [preferredOutTime, setPreferredOutTime] = useState('07:30 AM');

  // Trainer login state
  const [trainerStep, setTrainerStep] = useState('lookup'); // 'lookup' | 'first-time' | 'password'
  const [trainerInput, setTrainerInput] = useState('');
  const [foundTrainer, setFoundTrainer] = useState(null);
  const [trainerPassword, setTrainerPassword] = useState('');
  const [trainerNewPassword, setTrainerNewPassword] = useState('');
  const [trainerConfirmPassword, setTrainerConfirmPassword] = useState('');
  const [showTrainerPass, setShowTrainerPass] = useState(false);
  const [allTrainersList, setAllTrainersList] = useState([]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Load registered trainers on mount for quick selection
  useEffect(() => {
    listAllTrainers().then(setAllTrainersList).catch(() => {});
  }, []);

  // Only auto-redirect if already signed into the specific portal requested
  if (status === 'signedIn') {
    const fromPath = location.state?.from;
    const isSafeFrom = fromPath && fromPath !== '/login' && fromPath !== '/';

    if (role === 'member' && portal === 'member') {
      return <Navigate to={isSafeFrom ? fromPath : '/member'} replace />;
    }
    if (role === 'trainer' && portal === 'trainer') {
      return <Navigate to={isSafeFrom ? fromPath : '/trainer'} replace />;
    }
    if (role === 'staff' && portal === 'staff') {
      return <Navigate to={isSafeFrom ? fromPath : '/dashboard'} replace />;
    }
  }

  const shownError = error || authError;

  // ── Member login step 1: check Member ID ──────────────────────────────────
  const onCheckMemberId = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    clearError();

    const id = memberIdInput.trim();
    if (!id) {
      setError('Please enter your Member ID (e.g. K7-001).');
      return;
    }

    setBusy(true);
    try {
      const trainee = await findMemberById(id);
      if (!trainee) {
        setError(`No member found with ID "${id}". Please verify your Member ID with gym reception.`);
        return;
      }

      if (trainee.status === 'inactive') {
        setError('This membership is inactive. Please contact gym reception.');
        return;
      }

      setFoundMember(trainee);

      // First time login condition
      if (!trainee.firstLoginDone || !trainee.hasPassword || !trainee.passwordHash) {
        setMemberStep('first-time');
      } else {
        setMemberStep('password');
      }
    } catch (err) {
      setError(friendlyError(err, 'Failed to verify Member ID.'));
    } finally {
      setBusy(false);
    }
  };

  // ── Member login step 2A: First-time setup password ──────────────────────
  const onFirstTimeSetup = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setBusy(true);
    try {
      await memberSetupPassword(foundMember.id, newPassword, {
        preferredInTime: preferredInTime || '06:00 AM',
        preferredOutTime: preferredOutTime || '07:30 AM',
      });
      // Navigation is handled automatically by auth status change!
    } catch (err) {
      setError(friendlyError(err, 'Could not set password and timing.'));
    } finally {
      setBusy(false);
    }
  };

  // ── Member login step 2B: Returning member login ─────────────────────────
  const onMemberSignIn = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError('');

    if (!memberPassword) {
      setError('Please enter your password.');
      return;
    }

    setBusy(true);
    try {
      await memberLogin(foundMember.memberId, memberPassword);
    } catch (err) {
      setError(friendlyError(err, 'Incorrect password. Ask gym reception to reset it.'));
    } finally {
      setBusy(false);
    }
  };

  // ── Staff login handlers ─────────────────────────────────────────────────
  const onStaffLogin = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    clearError();
    if (!email.trim() || !password) {
      setError('Enter your email address and password.');
      return;
    }
    setBusy(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(friendlyError(err, 'Could not sign in. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  const onReset = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError('Enter the email address you use to sign in.');
      return;
    }
    setBusy(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err) {
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-email') setResetSent(true);
      else setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const resetMemberFlow = () => {
    setMemberStep('id');
    setFoundMember(null);
    setMemberPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPreferredInTime('06:00 AM');
    setPreferredOutTime('07:30 AM');
    setError('');
  };

  // ── Trainer login handlers ───────────────────────────────────────────────
  const onCheckTrainer = async (e, directTrainer = null) => {
    if (e) e.preventDefault();
    if (busy) return;
    setError('');
    clearError();

    const target = directTrainer || null;
    const identifier = target ? target.name : trainerInput.trim();
    if (!identifier) {
      setError('Please enter your Trainer Name, ID or Phone number.');
      return;
    }

    setBusy(true);
    try {
      const coach = target || (await findTrainerByIdentifier(identifier));
      setFoundTrainer(coach);

      // First time trainer login condition
      if (!coach.firstLoginDone || !coach.hasPassword || !coach.passwordHash) {
        setTrainerStep('first-time');
      } else {
        setTrainerStep('password');
      }
    } catch (err) {
      setError(friendlyError(err, 'Failed to find trainer profile.'));
    } finally {
      setBusy(false);
    }
  };

  const onTrainerFirstTimeSetup = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError('');

    if (trainerNewPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (trainerNewPassword !== trainerConfirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setBusy(true);
    try {
      await trainerSetupPassword(foundTrainer.id, trainerNewPassword);
    } catch (err) {
      setError(friendlyError(err, 'Could not set password.'));
    } finally {
      setBusy(false);
    }
  };

  const onTrainerSignIn = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError('');

    if (!trainerPassword) {
      setError('Please enter your password.');
      return;
    }

    setBusy(true);
    try {
      await trainerLogin(foundTrainer.id, trainerPassword);
    } catch (err) {
      setError(friendlyError(err, 'Incorrect password. Ask gym admin if you need a reset.'));
    } finally {
      setBusy(false);
    }
  };

  const resetTrainerFlow = () => {
    setTrainerStep('lookup');
    setFoundTrainer(null);
    setTrainerPassword('');
    setTrainerNewPassword('');
    setTrainerConfirmPassword('');
    setError('');
  };

  return (
    <div className="grid min-h-svh bg-white lg:grid-cols-[1.05fr_1fr]">
      <BrandPanel portal={portal} />

      <div className="flex flex-col">
        <div className="flex items-center justify-center bg-ink px-6 pt-[calc(1.5rem+var(--sa-top))] pb-6 lg:hidden">
          <Logo
            subtitle={
              portal === 'member'
                ? 'Member Portal'
                : portal === 'trainer'
                ? 'Personal Trainer Portal'
                : 'Admin Management System'
            }
          />
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-10">
          <div className="w-full max-w-sm">
            {/* Top Switcher Tab: Member Portal vs Trainer vs Staff Login */}
            <div className="mb-6 grid grid-cols-3 rounded-xl bg-zinc-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setPortal('member');
                  setSearchParams({ portal: 'member' }, { replace: true });
                  resetMemberFlow();
                }}
                className={`rounded-lg py-2 text-center text-xs font-bold tracking-wider uppercase transition-all ${
                  portal === 'member'
                    ? 'bg-brand text-white shadow-sm shadow-brand/20'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Member
              </button>
              <button
                type="button"
                onClick={() => {
                  setPortal('trainer');
                  setSearchParams({ portal: 'trainer' }, { replace: true });
                  resetTrainerFlow();
                }}
                className={`rounded-lg py-2 text-center text-xs font-bold tracking-wider uppercase transition-all ${
                  portal === 'trainer'
                    ? 'bg-brand text-white shadow-sm shadow-brand/20'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Trainer
              </button>
              <button
                type="button"
                onClick={() => {
                  setPortal('staff');
                  setSearchParams({ portal: 'staff' }, { replace: true });
                  setError('');
                }}
                className={`rounded-lg py-2 text-center text-xs font-bold tracking-wider uppercase transition-all ${
                  portal === 'staff'
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Admin
              </button>
            </div>

            {/* If currently signed into another portal, show quick return banner */}
            {status === 'signedIn' && role === 'staff' && portal !== 'staff' && (
              <div className="mb-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 flex items-center justify-between">
                <span>Staff session active ({admin?.name || user?.email})</span>
                <a href="/dashboard" className="font-bold text-brand hover:underline">
                  Go to Dashboard →
                </a>
              </div>
            )}
            {status === 'signedIn' && role === 'member' && portal !== 'member' && (
              <div className="mb-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 flex items-center justify-between">
                <span>Member session active ({member?.fullName})</span>
                <a href="/member" className="font-bold text-brand hover:underline">
                  Go to Member Portal →
                </a>
              </div>
            )}
            {status === 'signedIn' && role === 'trainer' && portal !== 'trainer' && (
              <div className="mb-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 flex items-center justify-between">
                <span>Trainer session active ({trainer?.name})</span>
                <a href="/trainer" className="font-bold text-brand hover:underline">
                  Go to Trainer Portal →
                </a>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                PORTAL: MEMBER LOGIN
                ══════════════════════════════════════════════════════════════════ */}
            {portal === 'member' && (
              <div>
                {/* STEP 1: Enter Member ID */}
                {memberStep === 'id' && (
                  <form onSubmit={onCheckMemberId} noValidate>
                    <span className="block h-1 w-10 rounded-full bg-brand" aria-hidden="true" />
                    <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">Member Sign In</h1>
                    <p className="mt-1 text-sm text-zinc-500">
                      Enter your Member ID assigned by K7 Fitness.
                    </p>

                    {shownError && (
                      <p className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                        <TriangleAlert className="mt-0.5 size-4 shrink-0" /> {shownError}
                      </p>
                    )}

                    <div className="mt-6">
                      <label htmlFor="memberId" className="label">
                        Member ID
                      </label>
                      <div className="relative">
                        <IdCard className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
                        <input
                          id="memberId"
                          type="text"
                          autoComplete="off"
                          className="input h-11 pl-10 uppercase font-mono font-semibold"
                          value={memberIdInput}
                          onChange={(e) => setMemberIdInput(e.target.value.toUpperCase())}
                          placeholder="e.g. K7-001"
                          autoFocus
                        />
                      </div>
                      <p className="mt-2 text-xs text-zinc-500">
                        First time logging in? No password required yet — simply enter your Member ID above to set up your account.
                      </p>
                    </div>

                    <Button type="submit" size="lg" className="mt-6 w-full" loading={busy}>
                      {busy ? 'Verifying…' : 'Continue'}
                    </Button>

                    {/* Demo Mode Quick Buttons */}
                    {isDemo && (
                      <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 text-xs text-zinc-600">
                        <p className="font-semibold text-zinc-800 mb-2">Try Demo Member Logins:</p>
                        <div className="flex flex-col gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setMemberIdInput('K7-001');
                              setError('');
                            }}
                            className="text-left font-mono rounded bg-white px-2 py-1 border border-zinc-200 hover:border-brand hover:text-brand transition"
                          >
                            <span className="font-bold text-zinc-900">K7-001</span> (First time login - no password)
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                )}

                {/* STEP 2A: First Time Login - Create Password */}
                {memberStep === 'first-time' && foundMember && (
                  <form onSubmit={onFirstTimeSetup} noValidate>
                    <button
                      type="button"
                      onClick={resetMemberFlow}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 mb-3"
                    >
                      <ArrowLeft className="size-3.5" /> Change Member ID
                    </button>

                    <div className="rounded-xl border border-brand/20 bg-brand/5 p-4 mb-5">
                      <div className="flex items-center gap-2">
                        <Sparkles className="size-4 text-brand-bright" />
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-bright">First Time Login</span>
                      </div>
                      <h2 className="mt-1 text-lg font-bold text-zinc-900">
                        Welcome, {foundMember.fullName}!
                      </h2>
                      <p className="text-xs font-mono text-zinc-600 mt-0.5">
                        Member ID: <strong className="text-zinc-900">{foundMember.memberId}</strong>
                      </p>
                      <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
                        No prior password is required to log in for the first time. Please choose a password to activate your account.
                      </p>
                    </div>

                    {shownError && (
                      <p className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                        <TriangleAlert className="mt-0.5 size-4 shrink-0" /> {shownError}
                      </p>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="label">Create Password (min 6 characters)</label>
                        <div className="relative">
                          <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
                          <input
                            type={showMemberPass ? 'text' : 'password'}
                            autoComplete="new-password"
                            className="input h-11 pr-11 pl-10"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => setShowMemberPass((s) => !s)}
                            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                          >
                            {showMemberPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="label">Confirm Password</label>
                        <div className="relative">
                          <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
                          <input
                            type={showMemberPass ? 'text' : 'password'}
                            autoComplete="new-password"
                            className="input h-11 pl-10"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      {/* Daily Workout Timings (Come-in and Out Timings) */}
                      <div className="rounded-xl border border-brand/20 bg-brand/5 p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Clock className="size-4 text-brand-bright" />
                          <label className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                            Preferred Gym Timings (Come-In & Out)
                          </label>
                        </div>
                        <p className="text-[0.75rem] text-zinc-600 leading-relaxed">
                          Select your regular gym workout slot. Our system automatically checks equipment traffic and peak busy hours to customize your experience!
                        </p>

                        {/* Quick Slot Preset Pills */}
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { label: 'Morning (6:00 – 7:30 AM)', inTime: '06:00 AM', outTime: '07:30 AM' },
                            { label: 'Mid-Morning (7:30 – 9:00 AM)', inTime: '07:30 AM', outTime: '09:00 AM' },
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
                                className={`rounded-lg px-2.5 py-1 text-[0.7rem] font-medium transition ${
                                  isSelected
                                    ? 'bg-brand text-white shadow-sm font-semibold'
                                    : 'bg-white border border-zinc-200 text-zinc-700 hover:border-brand/40'
                                }`}
                              >
                                {slot.label}
                              </button>
                            );
                          })}
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <label className="text-[0.7rem] font-semibold text-zinc-600">Come-in Time</label>
                            <input
                              type="text"
                              value={preferredInTime}
                              onChange={(e) => setPreferredInTime(e.target.value)}
                              placeholder="e.g. 06:00 AM"
                              className="input h-9 text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="text-[0.7rem] font-semibold text-zinc-600">Out Time</label>
                            <input
                              type="text"
                              value={preferredOutTime}
                              onChange={(e) => setPreferredOutTime(e.target.value)}
                              placeholder="e.g. 07:30 AM"
                              className="input h-9 text-xs font-semibold"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" size="lg" className="mt-6 w-full" loading={busy}>
                      {busy ? 'Setting Password & Timings…' : 'Activate Account & Enter Portal'}
                    </Button>
                  </form>
                )}

                {/* STEP 2B: Returning Member Login - Enter Password */}
                {memberStep === 'password' && foundMember && (
                  <form onSubmit={onMemberSignIn} noValidate>
                    <button
                      type="button"
                      onClick={resetMemberFlow}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 mb-3"
                    >
                      <ArrowLeft className="size-3.5" /> Use different Member ID
                    </button>

                    <span className="block h-1 w-10 rounded-full bg-brand" aria-hidden="true" />
                    <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">
                      Welcome back, {foundMember.fullName}!
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500">
                      Member ID: <span className="font-mono font-semibold text-zinc-800">{foundMember.memberId}</span>
                    </p>

                    {shownError && (
                      <p className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                        <TriangleAlert className="mt-0.5 size-4 shrink-0" /> {shownError}
                      </p>
                    )}

                    <div className="mt-6">
                      <label htmlFor="memberPass" className="label">
                        Enter your password
                      </label>
                      <div className="relative">
                        <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
                        <input
                          id="memberPass"
                          type={showMemberPass ? 'text' : 'password'}
                          autoComplete="current-password"
                          className="input h-11 pr-11 pl-10"
                          value={memberPassword}
                          onChange={(e) => setMemberPassword(e.target.value)}
                          placeholder="••••••••"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowMemberPass((s) => !s)}
                          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                        >
                          {showMemberPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-zinc-400">
                        Forgot your password? Ask gym reception or your trainer to reset your login.
                      </p>
                    </div>

                    <Button type="submit" size="lg" className="mt-6 w-full" loading={busy}>
                      {busy ? 'Signing in…' : 'Sign In to Portal'}
                    </Button>
                  </form>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                PORTAL: PERSONAL TRAINER LOGIN
                ══════════════════════════════════════════════════════════════════ */}
            {portal === 'trainer' && (
              <div>
                {/* STEP 1: Enter Trainer Identifier */}
                {trainerStep === 'lookup' && (
                  <form onSubmit={(e) => onCheckTrainer(e)} noValidate>
                    <span className="block h-1 w-10 rounded-full bg-brand" aria-hidden="true" />
                    <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">Personal Trainer Login</h1>
                    <p className="mt-1 text-sm text-zinc-500">
                      Sign in to manage your assigned Personal Training members.
                    </p>

                    {shownError && (
                      <p className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                        <TriangleAlert className="mt-0.5 size-4 shrink-0" /> {shownError}
                      </p>
                    )}

                    <div className="mt-6">
                      <label htmlFor="trainerInput" className="label">
                        Trainer Name, ID or Phone
                      </label>
                      <div className="relative">
                        <Dumbbell className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
                        <input
                          id="trainerInput"
                          type="text"
                          autoComplete="off"
                          className="input h-11 pl-10 font-semibold"
                          value={trainerInput}
                          onChange={(e) => setTrainerInput(e.target.value)}
                          placeholder="e.g. Coach Arun, Priya, or Phone"
                          autoFocus
                        />
                      </div>
                      <p className="mt-2 text-xs text-zinc-500">
                        Enter your trainer name registered by the gym management.
                      </p>
                    </div>

                    {allTrainersList.length > 0 && (
                      <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 text-xs">
                        <p className="font-semibold text-zinc-700 mb-2 flex items-center gap-1.5">
                          <Users className="size-3.5 text-brand" /> Registered Gym Trainers (Click to Sign In):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {allTrainersList.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                setTrainerInput(t.name);
                                onCheckTrainer(null, t);
                              }}
                              className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 font-medium text-zinc-800 shadow-sm hover:border-brand hover:text-brand transition flex items-center gap-1.5"
                            >
                              <Dumbbell className="size-3 text-brand" /> {t.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button type="submit" size="lg" className="mt-6 w-full" loading={busy}>
                      {busy ? 'Verifying Trainer…' : 'Continue'}
                    </Button>
                  </form>
                )}

                {/* STEP 2A: First Time Login - Set Trainer Password */}
                {trainerStep === 'first-time' && foundTrainer && (
                  <form onSubmit={onTrainerFirstTimeSetup} noValidate>
                    <button
                      type="button"
                      onClick={resetTrainerFlow}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 mb-3"
                    >
                      <ArrowLeft className="size-3.5" /> Back to Trainer search
                    </button>

                    <div className="rounded-xl border border-brand/20 bg-brand/5 p-4 mb-5">
                      <div className="flex items-center gap-2">
                        <Sparkles className="size-4 text-brand-bright" />
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-bright">First Time Trainer Activation</span>
                      </div>
                      <h2 className="mt-1 text-lg font-bold text-zinc-900">
                        Welcome, {foundTrainer.name}!
                      </h2>
                      <p className="text-xs text-zinc-600 mt-0.5">
                        Role: <strong className="text-zinc-900">{foundTrainer.role || 'Fitness Coach / Personal Trainer'}</strong>
                      </p>
                      <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
                        Please choose a secure password for your trainer portal to access and manage your assigned PT clients.
                      </p>
                    </div>

                    {shownError && (
                      <p className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                        <TriangleAlert className="mt-0.5 size-4 shrink-0" /> {shownError}
                      </p>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="label">Set Trainer Password (min 6 characters)</label>
                        <div className="relative">
                          <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
                          <input
                            type={showTrainerPass ? 'text' : 'password'}
                            autoComplete="new-password"
                            className="input h-11 pr-11 pl-10"
                            value={trainerNewPassword}
                            onChange={(e) => setTrainerNewPassword(e.target.value)}
                            placeholder="••••••••"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => setShowTrainerPass((s) => !s)}
                            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-zinc-400 hover:text-zinc-700"
                          >
                            {showTrainerPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="label">Confirm Password</label>
                        <div className="relative">
                          <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
                          <input
                            type={showTrainerPass ? 'text' : 'password'}
                            autoComplete="new-password"
                            className="input h-11 pl-10"
                            value={trainerConfirmPassword}
                            onChange={(e) => setTrainerConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                    </div>

                    <Button type="submit" size="lg" className="mt-6 w-full" loading={busy}>
                      {busy ? 'Activating…' : 'Activate & Enter Portal'}
                    </Button>
                  </form>
                )}

                {/* STEP 2B: Returning Trainer Login */}
                {trainerStep === 'password' && foundTrainer && (
                  <form onSubmit={onTrainerSignIn} noValidate>
                    <button
                      type="button"
                      onClick={resetTrainerFlow}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 mb-3"
                    >
                      <ArrowLeft className="size-3.5" /> Switch Trainer
                    </button>

                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 mb-5 flex items-center gap-3.5">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand text-white font-bold text-lg">
                        {foundTrainer.name?.charAt(0) || 'T'}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-base font-bold text-zinc-900 leading-tight truncate">
                          {foundTrainer.name}
                        </h2>
                        <p className="text-xs text-zinc-500 mt-0.5 truncate">
                          Personal Trainer · {foundTrainer.specialty || 'Fitness Coach'}
                        </p>
                      </div>
                    </div>

                    {shownError && (
                      <p className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                        <TriangleAlert className="mt-0.5 size-4 shrink-0" /> {shownError}
                      </p>
                    )}

                    <div>
                      <label className="label">Enter Password</label>
                      <div className="relative">
                        <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
                        <input
                          type={showTrainerPass ? 'text' : 'password'}
                          autoComplete="current-password"
                          className="input h-11 pr-11 pl-10"
                          value={trainerPassword}
                          onChange={(e) => setTrainerPassword(e.target.value)}
                          placeholder="••••••••"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowTrainerPass((s) => !s)}
                          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-zinc-400 hover:text-zinc-700"
                        >
                          {showTrainerPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" size="lg" className="mt-6 w-full" loading={busy}>
                      {busy ? 'Signing in…' : 'Sign in as Trainer'}
                    </Button>
                  </form>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                PORTAL: STAFF LOGIN
                ══════════════════════════════════════════════════════════════════ */}
            {portal === 'staff' && (
              <div>
                {mode === 'login' ? (
                  <form onSubmit={onStaffLogin} noValidate>
                    <span className="block h-1 w-10 rounded-full bg-zinc-900" aria-hidden="true" />
                    <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">Staff Portal</h1>
                    <p className="mt-1 text-sm text-zinc-500">Sign in with your staff credentials.</p>

                    {shownError && (
                      <p className="mt-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                        <TriangleAlert className="mt-0.5 size-4 shrink-0" /> {shownError}
                      </p>
                    )}

                    <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 text-xs text-zinc-600">
                      <p className="font-semibold text-zinc-900 mb-1.5 flex items-center gap-1.5">
                        <ShieldCheck className="size-4 text-emerald-600" /> Firebase Admin Account:
                      </p>
                      <div className="space-y-1 font-mono text-[0.75rem]">
                        <p>Email: <strong className="text-zinc-900 font-bold select-all">admin@k7fitness.com</strong></p>
                        <p>Password: <strong className="text-zinc-900 font-bold select-all">AdminPassword123!</strong></p>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div>
                        <label htmlFor="email" className="label">
                          Email address
                        </label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
                          <input
                            id="email"
                            type="email"
                            autoComplete="username"
                            inputMode="email"
                            className="input h-11 pl-10"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@k7fitness.in"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div>
                        <div className="mb-1.5 flex items-center justify-between">
                          <label htmlFor="password" className="label !mb-0">
                            Password
                          </label>
                          <button type="button" onClick={() => setMode('reset')} className="text-[0.8rem] font-semibold text-brand hover:underline">
                            Forgot password?
                          </button>
                        </div>
                        <div className="relative">
                          <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
                          <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            className="input h-11 pr-11 pl-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                          >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" size="lg" className="mt-6 w-full" loading={busy}>
                      {busy ? 'Signing in…' : 'Sign in to Admin'}
                    </Button>
                    {devBypass && (
                      <Button variant="secondary" size="lg" className="mt-3 w-full border-dashed" onClick={() => devBypass().catch((err) => setError(friendlyError(err)))}>
                        Continue without sign-in (dev only)
                      </Button>
                    )}
                  </form>
                ) : (
                  <form onSubmit={onReset} noValidate>
                    <button type="button" onClick={() => setMode('login')} className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900">
                      <ArrowLeft className="size-4" /> Back to sign in
                    </button>
                    {resetSent ? (
                      <div className="mt-8 text-center" role="status">
                        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                          <MailCheck className="size-7" />
                        </span>
                        <h1 className="mt-5 text-xl font-bold text-zinc-900">Check your inbox</h1>
                        <p className="mt-2 text-sm text-zinc-500">
                          If an account exists for <strong className="text-zinc-800">{email.trim()}</strong>, you will receive a reset link shortly.
                        </p>
                        <Button variant="secondary" className="mt-6 w-full" onClick={() => setMode('login')}>
                          Return to sign in
                        </Button>
                      </div>
                    ) : (
                      <>
                        <h1 className="mt-6 text-2xl font-bold tracking-tight text-zinc-900">Reset your password</h1>
                        <p className="mt-1 text-sm text-zinc-500">We’ll email you a secure link to set a new password.</p>
                        {error && (
                          <p className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                            <TriangleAlert className="mt-0.5 size-4 shrink-0" /> {error}
                          </p>
                        )}
                        <label htmlFor="reset-email" className="label mt-6">
                          Email address
                        </label>
                        <input
                          id="reset-email"
                          type="email"
                          autoComplete="username"
                          className="input h-11"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          autoFocus
                        />
                        <Button type="submit" size="lg" className="mt-5 w-full" loading={busy}>
                          Send reset link
                        </Button>
                      </>
                    )}
                  </form>
                )}
              </div>
            )}

            {/* Company Credit */}
            <div className="mt-8 pt-4 border-t border-zinc-100 text-center text-xs text-zinc-400">
              <p>
                Crafted By{' '}
                <a
                  href="https://www.legendaryone.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-yellow-500 hover:text-yellow-600 transition-colors underline decoration-yellow-500/40"
                >
                  Legendary One
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
