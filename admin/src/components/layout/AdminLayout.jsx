import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { ArrowLeft, ChevronRight, ExternalLink, Menu, Plus, Search, X } from 'lucide-react';
import Sidebar from './Sidebar';
import Logo from './Logo';
import QuickSearch from './QuickSearch';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { MOBILE_TABS, NAV_ITEMS, QUICK_ACTIONS, sectionFor } from '../../constants/navigation';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useSettings } from '../../context/SettingsContext';
import { pushBackHandler } from '../../native/backStack';

const WEBSITE_URL = import.meta.env.VITE_WEBSITE_URL || '';
const ROOT_PATHS = new Set(NAV_ITEMS.map((i) => i.to));

export default function AdminLayout() {
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);
  const [quick, setQuick] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const confirm = useConfirm();
  const { newEnquiries } = useSettings();
  const badges = { newEnquiries };

  const section = sectionFor(pathname);
  const isRoot = ROOT_PATHS.has(pathname);
  const goBack = () => {
    // Only pop history when there is an in-app entry to go back to.
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
    else navigate(section && section.to !== pathname ? section.to : '/dashboard');
  };

  useEffect(() => {
    setDrawer(false);
    setQuick(false);
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
    const popBack = pushBackHandler(() => setDrawer(false));
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      popBack();
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

      <MobileDrawer open={drawer} onClose={() => setDrawer(false)} onLogout={onLogout} />

      <div className="lg:pl-64">
        {/* Mobile header (dark) — extends under the status bar */}
        <header className="no-print pt-safe sticky top-0 z-40 bg-ink text-white lg:hidden">
          <div className="flex h-14 items-center gap-1 px-2">
            {isRoot ? (
              <button type="button" onClick={() => setDrawer(true)} className="flex size-11 items-center justify-center rounded-xl active:bg-white/10" aria-label="Open menu" aria-expanded={drawer}>
                <Menu className="size-5" />
              </button>
            ) : (
              <button type="button" onClick={goBack} className="flex size-11 items-center justify-center rounded-xl active:bg-white/10" aria-label="Go back">
                <ArrowLeft className="size-5" />
              </button>
            )}
            <div className="min-w-0 flex-1 px-1">
              {pathname === '/dashboard' ? (
                <Logo compact />
              ) : (
                <p className="truncate text-[1.05rem] font-semibold tracking-tight">{section?.label || 'K7 Admin'}</p>
              )}
            </div>
            <button type="button" onClick={() => setSearch(true)} className="flex size-11 items-center justify-center rounded-xl active:bg-white/10" aria-label="Search members">
              <Search className="size-5" />
            </button>
          </div>
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

        <main className="mx-auto w-full max-w-[1400px] px-4 pt-4 pb-[calc(var(--tabbar-h)+var(--sa-bottom)+2rem)] sm:px-6 lg:px-8 lg:pt-7 lg:pb-12">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav
        className="mobile-tabbar no-print pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 shadow-[0_-6px_20px_-12px_rgb(0_0_0/0.18)] backdrop-blur lg:hidden"
        aria-label="Quick navigation"
      >
        <ul className="mx-auto grid h-16 max-w-lg grid-cols-5">
          {MOBILE_TABS.slice(0, 2).map((t) => (
            <TabLink key={t.label} {...t} />
          ))}
          <li className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => setQuick(true)}
              className="-mt-7 flex size-14 items-center justify-center rounded-2xl bg-brand text-white shadow-[0_10px_24px_-8px_rgb(161_8_37/0.7)] ring-4 ring-canvas transition active:scale-95"
              aria-label="Quick actions"
              aria-haspopup="dialog"
            >
              <Plus className={`size-6 transition-transform duration-200 ${quick ? 'rotate-45' : ''}`} />
            </button>
          </li>
          {MOBILE_TABS.slice(2).map((t) =>
            t.menu ? (
              <li key={t.label}>
                <button
                  type="button"
                  onClick={() => setDrawer(true)}
                  className="relative flex h-full w-full flex-col items-center justify-center gap-1 text-[0.68rem] font-semibold text-zinc-500 active:text-zinc-900"
                  aria-haspopup="dialog"
                >
                  <span className="relative">
                    <t.icon className="size-5" />
                    {badges[t.badge] > 0 && <span className="absolute -top-1 -right-1.5 size-2.5 rounded-full bg-brand ring-2 ring-white" />}
                  </span>
                  {t.label}
                </button>
              </li>
            ) : (
              <TabLink key={t.label} {...t} />
            ),
          )}
        </ul>
      </nav>

      <QuickActions open={quick} onClose={() => setQuick(false)} />
      <QuickSearch open={search} onClose={() => setSearch(false)} />
    </div>
  );
}

function TabLink({ to, label, icon: Icon }) {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `relative flex h-full flex-col items-center justify-center gap-1 text-[0.68rem] font-semibold transition ${isActive ? 'text-brand' : 'text-zinc-500 active:text-zinc-900'}`
        }
      >
        {({ isActive }) => (
          <>
            <span className={`absolute top-0 h-[3px] w-8 rounded-b-full bg-brand transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`} />
            <Icon className="size-5" strokeWidth={isActive ? 2.4 : 2} />
            {label}
          </>
        )}
      </NavLink>
    </li>
  );
}

/** Off-canvas navigation for phones/tablets. Swipe left (or tap outside) to close. */
function MobileDrawer({ open, onClose, onLogout }) {
  const panelRef = useRef(null);
  const drag = useRef(null);
  const [dx, setDx] = useState(0);

  const onTouchStart = (e) => {
    const t = e.touches[0];
    drag.current = { x: t.clientX, y: t.clientY, horizontal: null };
  };
  const onTouchMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const t = e.touches[0];
    const mx = t.clientX - d.x;
    const my = t.clientY - d.y;
    if (d.horizontal === null && Math.abs(mx) + Math.abs(my) > 8) d.horizontal = Math.abs(mx) > Math.abs(my);
    if (d.horizontal) setDx(Math.min(0, mx));
  };
  const onTouchEnd = () => {
    const width = panelRef.current?.offsetWidth || 300;
    if (dx < -width * 0.3) onClose();
    setDx(0);
    drag.current = null;
  };

  return (
    <div className={`no-print fixed inset-0 z-50 lg:hidden ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open} inert={!open ? true : undefined}>
      <div
        className="absolute inset-0 bg-black/60 transition-opacity duration-300"
        style={{ opacity: open ? 1 + dx / 400 : 0 }}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`pt-safe absolute inset-y-0 left-0 flex w-[min(84vw,300px)] flex-col bg-ink shadow-2xl ${dx ? '' : 'transition-transform duration-300 ease-out'}`}
        style={{ transform: open ? `translateX(${dx}px)` : 'translateX(-100%)' }}
      >
        <div className="relative min-h-0 flex-1">
          <Sidebar onNavigate={onClose} onLogout={onLogout} />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 flex size-10 items-center justify-center rounded-xl text-zinc-400 active:bg-white/10 active:text-white"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="pb-safe bg-ink" />
      </div>
    </div>
  );
}

/** Bottom sheet behind the centre "+" tab. */
function QuickActions({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Quick actions" description="Jump straight to the most common tasks." size="sm">
      <ul className="grid grid-cols-2 gap-2.5 pb-1">
        {QUICK_ACTIONS.map((a) => (
          <li key={a.to}>
            <NavLink
              to={a.to}
              onClick={onClose}
              className="flex h-full flex-col gap-2.5 rounded-2xl border border-zinc-200 bg-white p-3.5 transition active:scale-[0.98] active:bg-zinc-50"
            >
              <span className={`flex size-10 items-center justify-center rounded-xl ${a.tone}`}>
                <a.icon className="size-5" />
              </span>
              <span>
                <span className="flex items-center gap-1 text-sm font-semibold text-zinc-900">
                  {a.label} <ChevronRight className="size-3.5 text-zinc-400" />
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-zinc-500">{a.hint}</span>
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
