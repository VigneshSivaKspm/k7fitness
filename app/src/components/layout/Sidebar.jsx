import { useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { ChevronDown, LogOut } from 'lucide-react';
import Logo from './Logo';
import { NAV_ITEMS } from '../../constants/navigation';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import { ADMIN_ROLES } from '../../constants/options';

const itemCls = ({ isActive }) =>
  `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.875rem] font-medium transition max-lg:py-3 ${
    isActive ? 'bg-brand/15 text-white' : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
  }`;

function ActiveBar({ active }) {
  return <span className={`absolute top-1.5 bottom-1.5 left-0 w-[3px] rounded-r-full bg-brand transition ${active ? 'opacity-100' : 'opacity-0'}`} />;
}

function NavGroup({ item, onNavigate }) {
  const { pathname } = useLocation();
  const within = pathname.startsWith(item.to);
  const [open, setOpen] = useState(within);
  const expanded = open || within;
  const Icon = item.icon;

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={expanded}
        className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[0.875rem] font-medium transition max-lg:py-3 ${
          within ? 'text-white' : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
        }`}
      >
        <Icon className={`size-[1.1rem] shrink-0 ${within ? 'text-brand-bright' : ''}`} />
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown className={`size-4 transition ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && (
        <ul className="mt-0.5 mb-1 ml-[1.35rem] space-y-0.5 border-l border-white/10 pl-3">
          {item.children.map((c) => (
            <li key={c.to}>
              <NavLink
                to={c.to}
                end={c.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `block rounded-md px-2.5 py-1.5 text-[0.82rem] transition max-lg:py-2.5 max-lg:text-[0.875rem] ${isActive ? 'bg-brand/15 font-semibold text-white' : 'text-zinc-400 hover:text-white'}`
                }
              >
                {c.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default function Sidebar({ onNavigate, onLogout }) {
  const { newEnquiries, gymName } = useSettings();
  const { admin } = useAuth();
  const badges = { newEnquiries };

  return (
    <div className="flex h-full flex-col bg-ink text-white">
      <div className="flex h-16 shrink-0 items-center border-b border-white/[0.06] px-5">
        <Logo />
      </div>

      <nav className="no-scrollbar flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <NavGroup key={item.to} item={item} onNavigate={onNavigate} />
            ) : (
              <li key={item.to}>
                <NavLink to={item.to} className={itemCls} onClick={onNavigate}>
                  {({ isActive }) => (
                    <>
                      <ActiveBar active={isActive} />
                      <item.icon className={`size-[1.1rem] shrink-0 ${isActive ? 'text-brand-bright' : ''}`} />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && badges[item.badge] > 0 && (
                        <span className="rounded-full bg-brand px-1.5 py-px text-[0.7rem] font-bold text-white">{badges[item.badge]}</span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ),
          )}
        </ul>
      </nav>

      <div className="border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar name={admin?.name || admin?.email} size="sm" className="!ring-white/10" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{admin?.name || 'Admin'}</p>
            <p className="truncate text-xs text-zinc-500">{ADMIN_ROLES[admin?.role] || 'Admin'} · {gymName}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[0.875rem] font-medium text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
        >
          <LogOut className="size-[1.1rem]" /> Logout
        </button>
      </div>
    </div>
  );
}
