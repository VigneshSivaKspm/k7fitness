import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router';
import {
  CalendarCheck,
  Dumbbell,
  Flame,
  LayoutDashboard,
  LogOut,
  Receipt,
  Salad,
  Sparkles,
  User,
  ShieldCheck,
  Headphones,
  ExternalLink,
  PlayCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/ui/Avatar';

const BOTTOM_NAV_ITEMS = [
  { to: '/member', end: true, label: 'Home', icon: LayoutDashboard },
  { to: '/member/workout', label: 'Workout', icon: Dumbbell },
  { to: '/member/diet', label: 'Diet', icon: Salad },
  { to: '/member/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/member/profile', label: 'Profile', icon: User },
];

export default function MemberLayout() {
  const { member, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const onLogout = async () => {
    await logout();
    navigate('/login?portal=member', { replace: true });
  };

  if (!member) return null;

  return (
    <div className="min-h-svh bg-zinc-100 text-zinc-900 antialiased flex flex-col items-center justify-start selection:bg-red-500 selection:text-white">
      {/* Mobile Shell Frame: Native app feel on phone, centered flagship mobile chassis on desktop */}
      <div className="w-full max-w-md min-h-svh bg-zinc-50 flex flex-col relative sm:my-3 sm:rounded-[40px] sm:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.18)] sm:border sm:border-zinc-200/90 sm:overflow-hidden sm:min-h-[94vh]">
        
        {/* Top Mobile App Header */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-4 py-3 flex items-center justify-between transition-all">
          {/* Brand Mark */}
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-950 to-zinc-900 text-white shadow-md shadow-zinc-950/20 ring-1 ring-black">
              <span className="font-black text-sm tracking-tighter flex items-center">
                K<span className="text-red-500">7</span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-zinc-950">
                  K7 FITNESS
                </span>
                <span className="inline-block size-1.5 rounded-full bg-red-600 animate-pulse" />
              </div>
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-red-600 block leading-none">
                Member Club
              </span>
            </div>
          </div>

          {/* Member Profile Avatar & Quick Menu */}
          <div className="flex items-center gap-2">
            <div className="text-right hidden xs:block">
              <p className="text-xs font-bold text-zinc-900 truncate max-w-[120px] leading-tight">
                {member.fullName}
              </p>
              <p className="text-[0.65rem] font-mono font-bold text-zinc-500">
                {member.memberId || 'MEMBER'}
              </p>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((o) => !o)}
                className="relative rounded-full ring-2 ring-red-500/30 hover:ring-red-500 transition focus:outline-none"
                aria-label="Account Menu"
              >
                <Avatar name={member.fullName} src={member.photoUrl} size="sm" className="size-8" />
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </button>

              {/* Quick Popup Dropdown */}
              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xl z-50 text-xs animate-in fade-in-50 zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-zinc-100">
                      <p className="font-bold text-zinc-900 truncate">{member.fullName}</p>
                      <p className="text-[0.68rem] font-mono text-red-600 font-semibold">{member.memberId}</p>
                    </div>

                    <div className="py-1">
                      <NavLink
                        to="/member/profile"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-zinc-700 hover:bg-zinc-100 font-medium transition"
                      >
                        <User className="size-4 text-zinc-500" /> My Profile & Slot
                      </NavLink>
                      <NavLink
                        to="/member/equipment"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-zinc-700 hover:bg-zinc-100 font-medium transition"
                      >
                        <PlayCircle className="size-4 text-red-600" /> Machine Demos
                      </NavLink>
                      <NavLink
                        to="/member/instructions"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-zinc-700 hover:bg-zinc-100 font-medium transition"
                      >
                        <ShieldCheck className="size-4 text-zinc-600" /> Gym Rules & Guide
                      </NavLink>
                      <NavLink
                        to="/member/fees"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-zinc-700 hover:bg-zinc-100 font-medium transition"
                      >
                        <Receipt className="size-4 text-zinc-500" /> Fees & Receipts
                      </NavLink>
                      <a
                        href="https://wa.me/919876543210"
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-zinc-700 hover:bg-zinc-100 font-medium transition"
                      >
                        <Headphones className="size-4 text-emerald-600" /> Gym Help Desk
                      </a>
                    </div>

                    <div className="border-t border-zinc-100 pt-1">
                      <button
                        type="button"
                        onClick={onLogout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-red-600 hover:bg-red-50 font-bold transition"
                      >
                        <LogOut className="size-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Main Application Content Area */}
        <main className="flex-1 w-full p-3.5 pb-28 space-y-4 overflow-y-auto">
          <Outlet />
        </main>

        {/* Modern Mobile Bottom Navigation Bar (Docked at Bottom) */}
        <nav
          className="fixed sm:absolute bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-zinc-200/90 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] px-2 py-1.5 transition-all max-w-md mx-auto"
          aria-label="Member Navigation"
        >
          <div className="grid grid-cols-5 items-center justify-around gap-1">
            {BOTTOM_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `group relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 select-none ${
                      isActive
                        ? 'text-red-600 font-bold'
                        : 'text-zinc-600 hover:text-zinc-900 font-medium'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active indicator bar at top of icon */}
                      {isActive && (
                        <span className="absolute -top-1.5 h-1 w-6 rounded-full bg-red-600 shadow-sm shadow-red-500/40" />
                      )}

                      <div
                        className={`flex items-center justify-center size-7 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-red-50 text-red-600 scale-105 shadow-sm shadow-red-500/20'
                            : 'group-hover:bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        <Icon className="size-4.5" />
                      </div>

                      <span
                        className={`text-[0.66rem] tracking-tight mt-0.5 ${
                          isActive ? 'text-zinc-950 font-extrabold' : 'text-zinc-600 font-medium'
                        }`}
                      >
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
