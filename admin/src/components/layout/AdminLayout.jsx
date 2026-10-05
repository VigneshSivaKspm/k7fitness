import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';
import { ExternalLink, Menu, Plus, Search, X } from 'lucide-react';
import Sidebar from './Sidebar';
import Logo from './Logo';
import QuickSearch from './QuickSearch';
import Button from '../ui/Button';
import { MOBILE_TABS } from '../../constants/navigation';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmContext';

const WEBSITE_URL = import.meta.env.VITE_WEBSITE_URL || '';

export default function AdminLayout() {
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const confirm = useConfirm();

  useEffect(() => setDrawer(false), [pathname]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!drawer) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && setDrawer(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [drawer]);

  const onLogout = () =>
    confirm({
      title: 'Log out?',
      message: 'You will need to sign in again to access the admin panel.',
      confirmText: 'Log out',
      tone: 'primary',
      onConfirm: logout,
    });

  return (
    <div className="min-h-svh">
      {/* Desktop sidebar */}
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <Sidebar onLogout={onLogout} />
      </aside>

      {/* Mobile drawer */}
      <div className={`no-print fixed inset-0 z-50 lg:hidden ${drawer ? '' : 'pointer-events-none'}`} aria-hidden={!drawer} inert={!drawer ? true : undefined}>
        <div className={`absolute inset-0 bg-black/60 transition-opacity ${drawer ? 'opacity-100' : 'opacity-0'}`} onClick={() => setDrawer(false)} />
        <div className={`absolute inset-y-0 left-0 w-[min(84vw,300px)] shadow-2xl transition-transform duration-300 ${drawer ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar onNavigate={() => setDrawer(false)} onLogout={onLogout} />
          <button
            type="button"
            onClick={() => setDrawer(false)}
            className="absolute top-3.5 right-3 rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      <div className="lg:pl-64">
        {/* Mobile header (dark) */}
        <header className="no-print sticky top-0 z-40 flex h-14 items-center justify-between gap-2 bg-ink px-3 text-white lg:hidden" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <button type="button" onClick={() => setDrawer(true)} className="rounded-lg p-2 hover:bg-white/5" aria-label="Open menu" aria-expanded={drawer}>
            <Menu className="size-5" />
          </button>
          <Logo compact />
          <button type="button" onClick={() => setSearch(true)} className="rounded-lg p-2 hover:bg-white/5" aria-label="Search members">
            <Search className="size-5" />
          </button>
        </header>

        {/* Desktop top bar (light) */}
        <header className="no-print sticky top-0 z-20 hidden h-16 items-center justify-between gap-4 border-b border-zinc-200 bg-white/85 px-8 backdrop-blur lg:flex">
          <button
            type="button"
            onClick={() => setSearch(true)}
            className="flex h-10 w-full max-w-md items-center gap-2.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 text-sm text-zinc-500 transition hover:border-zinc-300 hover:bg-white"
          >
            <Search className="size-4" />
            <span className="flex-1 text-left">Search members by name, phone or ID…</span>
            <span className="kbd">Ctrl K</span>
          </button>
          <div className="flex items-center gap-2">
            {WEBSITE_URL && (
              <Button href={WEBSITE_URL} variant="ghost" size="sm" icon={ExternalLink}>
                View website
              </Button>
            )}
            <Button to="/trainees/new" size="sm" icon={Plus}>
              Add trainee
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-4 pt-5 pb-28 sm:px-6 lg:px-8 lg:pt-7 lg:pb-12">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav
        className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Quick navigation"
      >
        <ul className="grid h-16 grid-cols-5">
          {MOBILE_TABS.slice(0, 2).map((t) => (
            <TabLink key={t.to} {...t} />
          ))}
          <li className="flex items-center justify-center">
            <NavLink
              to="/trainees/new"
              className="-mt-6 flex size-13 items-center justify-center rounded-2xl bg-brand text-white shadow-[0_10px_24px_-8px_rgb(161_8_37/0.7)] ring-4 ring-canvas transition active:scale-95"
              aria-label="Add trainee"
            >
              <Plus className="size-6" />
            </NavLink>
          </li>
          {MOBILE_TABS.slice(2).map((t) => (
            <TabLink key={t.to} {...t} />
          ))}
        </ul>
      </nav>

      <QuickSearch open={search} onClose={() => setSearch(false)} />
    </div>
  );
}

function TabLink({ to, label, icon: Icon }) {
  return (
    <li>
      <NavLink
        to={to}
        end={to === '/trainees' ? false : undefined}
        className={({ isActive }) =>
          `flex h-full flex-col items-center justify-center gap-1 text-[0.68rem] font-semibold transition ${isActive ? 'text-brand' : 'text-zinc-500'}`
        }
      >
        <Icon className="size-5" />
        {label}
      </NavLink>
    </li>
  );
}
