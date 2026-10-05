import { useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  useEffect(() => {
    document.title = 'Page not found — K7 Fitness Studio & Gym';
  }, []);

  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-[9rem] leading-none text-brand">404</p>
      <h1 className="display-title text-4xl sm:text-5xl">This page skipped leg day</h1>
      <p className="mt-3 max-w-md text-muted">The page you’re looking for doesn’t exist or has moved.</p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-bold tracking-[0.12em] text-white uppercase transition hover:bg-brand-bright"
      >
        <ArrowLeft className="size-4" /> Back to home
      </Link>
    </main>
  );
}
