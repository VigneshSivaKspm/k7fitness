import { useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, MailCheck, TriangleAlert } from 'lucide-react';
import Button from '../components/ui/Button';
import Logo from '../components/layout/Logo';
import { useAuth } from '../context/AuthContext';
import { friendlyError } from '../utils/errors';
import { useDocumentTitle } from '../hooks/useAsync';
import { isDemo } from '../firebase/config';

// Offline demo build: one built-in account (see src/demo/auth.js).
const DEMO_LOGIN = isDemo ? { email: 'demo@k7fitness.app', password: 'demo1234' } : null;

function BrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_100%,rgb(161_8_37/0.35),transparent_55%)]" aria-hidden="true" />
      <svg viewBox="0 0 128 120" className="absolute -right-24 -bottom-10 h-[80%] opacity-[0.06]" aria-hidden="true">
        <polygon points="8,16 27,16 27,104 8,104" fill="#fff" />
        <polygon points="27,58 56,16 77,16 41,68" fill="#fff" />
        <polygon points="39,62 52,52 78,104 57,104" fill="#fff" />
        <polygon points="74,16 124,16 124,30 98,104 78,104 102,32 70,32" fill="#d20a35" />
      </svg>
      <div className="absolute top-0 left-12 h-1 w-24 bg-brand" aria-hidden="true" />
      <div className="relative">
        <Logo subtitle="Fitness Studio & Gym" />
      </div>
      <div className="relative max-w-md">
        <p className="text-xs font-semibold tracking-[0.3em] text-brand-bright uppercase">Admin Management System</p>
        <h2 className="mt-4 font-display text-6xl leading-[0.95] tracking-wide text-white">
          Run your gym.
          <br />
          <span className="text-brand-bright">Not paperwork.</span>
        </h2>
        <p className="mt-5 text-[0.95rem] leading-relaxed text-zinc-400">
          Members, memberships, fees, renewals, workout and diet plans, and your website. All in one place, right from your
          phone.
        </p>
      </div>
      <p className="relative text-xs text-zinc-600">Authorised staff only. All activity is logged.</p>
    </div>
  );
}

export default function Login() {
  useDocumentTitle('Sign in');
  const { status, login, resetPassword, error: authError, clearError, devBypass } = useAuth();
  const location = useLocation();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState(DEMO_LOGIN?.email || '');
  const [password, setPassword] = useState(DEMO_LOGIN?.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  if (status === 'signedIn') return <Navigate to={location.state?.from || '/dashboard'} replace />;

  const shownError = error || authError;

  const onLogin = async (e) => {
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
      // Don't reveal whether an account exists for this email.
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-email') setResetSent(true);
      else setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setResetSent(false);
  };

  return (
    <div className="grid min-h-svh bg-white lg:grid-cols-[1.05fr_1fr]">
      <BrandPanel />

      <div className="flex flex-col">
        <div className="flex items-center justify-center bg-ink px-6 pt-[calc(1.5rem+var(--sa-top))] pb-6 lg:hidden">
          <Logo subtitle="Admin Management System" />
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
          <div className="w-full max-w-sm">
            {mode === 'login' ? (
              <form onSubmit={onLogin} noValidate>
                <span className="block h-1 w-10 rounded-full bg-brand" aria-hidden="true" />
                <h1 className="mt-5 text-2xl font-bold tracking-tight text-zinc-900">Welcome back</h1>
                <p className="mt-1 text-sm text-zinc-500">Sign in to the K7 admin panel.</p>

                {shownError && (
                  <p className="mt-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0" /> {shownError}
                  </p>
                )}

                {DEMO_LOGIN && (
                  <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    <p className="font-semibold">Demo mode: sample data, stored only on this device</p>
                    <p className="mt-1 text-amber-800">
                      Email <strong>{DEMO_LOGIN.email}</strong> · Password <strong>{DEMO_LOGIN.password}</strong>
                    </p>
                  </div>
                )}

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
                      <button type="button" onClick={() => switchMode('reset')} className="text-[0.8rem] font-semibold text-brand hover:underline">
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
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        aria-pressed={showPassword}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <Button type="submit" size="lg" className="mt-6 w-full" loading={busy}>
                  {busy ? 'Signing in…' : 'Sign in'}
                </Button>
                {devBypass && (
                  <Button variant="secondary" size="lg" className="mt-3 w-full border-dashed" onClick={() => devBypass().catch((err) => setError(friendlyError(err)))}>
                    Continue without sign-in (dev only)
                  </Button>
                )}
                <p className="mt-6 text-center text-xs text-zinc-400">
                  Admin accounts are created by the gym owner. Contact them if you need access.
                </p>
              </form>
            ) : (
              <form onSubmit={onReset} noValidate>
                <button type="button" onClick={() => switchMode('login')} className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900">
                  <ArrowLeft className="size-4" /> Back to sign in
                </button>
                {resetSent ? (
                  <div className="mt-8 text-center" role="status">
                    <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <MailCheck className="size-7" />
                    </span>
                    <h1 className="mt-5 text-xl font-bold text-zinc-900">Check your inbox</h1>
                    <p className="mt-2 text-sm text-zinc-500">
                      If an admin account exists for <strong className="text-zinc-800">{email.trim()}</strong>, you’ll receive a password reset link
                      shortly.
                    </p>
                    <Button variant="secondary" className="mt-6 w-full" onClick={() => switchMode('login')}>
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
        </div>
      </div>
    </div>
  );
}
