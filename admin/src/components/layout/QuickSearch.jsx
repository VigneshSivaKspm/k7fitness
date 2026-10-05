import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { LoaderCircle, Search, UserRound } from 'lucide-react';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import { StatusBadge } from '../ui/Badge';
import { searchTrainees } from '../../services/traineeService';
import { useSettings } from '../../context/SettingsContext';
import { getMembershipStatus } from '../../utils/status';
import { formatPhone } from '../../utils/format';
import { friendlyError } from '../../utils/errors';

/**
 * Global "find a member" search — name, phone or member ID — reachable from
 * every screen (Ctrl/⌘ + K on desktop, search icon on mobile).
 */
export default function QuickSearch({ open, onClose }) {
  const [term, setTerm] = useState('');
  const [state, setState] = useState({ loading: false, results: [], error: '' });
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const { settings } = useSettings();
  const req = useRef(0);

  useEffect(() => {
    if (!open) {
      setTerm('');
      setState({ loading: false, results: [], error: '' });
    }
  }, [open]);

  useEffect(() => {
    const t = term.trim();
    if (t.length < 2) {
      setState({ loading: false, results: [], error: '' });
      return undefined;
    }
    const id = ++req.current;
    setState((s) => ({ ...s, loading: true }));
    const timer = setTimeout(async () => {
      try {
        const results = await searchTrainees(t, 8);
        if (id === req.current) {
          setState({ loading: false, results, error: '' });
          setActive(0);
        }
      } catch (err) {
        if (id === req.current) setState({ loading: false, results: [], error: friendlyError(err) });
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [term]);

  const go = (t) => {
    onClose();
    navigate(`/trainees/${t.id}`);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, state.results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && state.results[active]) {
      e.preventDefault();
      go(state.results[active]);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <div className="pt-4 sm:pt-5">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-zinc-400" />
          <input
            data-autofocus
            type="search"
            enterKeyHint="go"
            className="input h-12 pr-10 pl-11 text-base"
            placeholder="Search members by name, phone or member ID"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Search members"
            role="combobox"
            aria-expanded={state.results.length > 0}
            aria-controls="quick-search-results"
          />
          {state.loading && <LoaderCircle className="absolute top-1/2 right-3.5 size-4 -translate-y-1/2 animate-spin text-brand" />}
        </div>

        <ul id="quick-search-results" role="listbox" className="mt-3 max-h-[55svh] overflow-y-auto">
          {state.results.map((t, i) => (
            <li key={t.id} role="option" aria-selected={i === active}>
              <button
                type="button"
                onClick={() => go(t)}
                onMouseEnter={() => setActive(i)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${i === active ? 'bg-brand-50' : ''}`}
              >
                <Avatar name={t.fullName} src={t.photoUrl} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-zinc-900">{t.fullName}</span>
                  <span className="block truncate text-xs text-zinc-500">
                    {t.memberId} · {formatPhone(t.phone)}
                  </span>
                </span>
                <StatusBadge kind="membership" status={getMembershipStatus(t, settings.expiryAlertDays)} />
              </button>
            </li>
          ))}
        </ul>

        {!state.loading && term.trim().length >= 2 && !state.results.length && !state.error && (
          <div className="flex flex-col items-center py-8 text-center text-sm text-zinc-500">
            <UserRound className="mb-2 size-6 text-zinc-300" />
            No members match “{term.trim()}”.
          </div>
        )}
        {state.error && <p className="py-6 text-center text-sm text-red-600">{state.error}</p>}
        {term.trim().length < 2 && (
          <p className="py-6 text-center text-sm text-zinc-500">
            Type at least 2 characters. Try a name, the last 4 digits of a phone, or a member ID like <span className="kbd">K7-0012</span>.
          </p>
        )}
      </div>
    </Modal>
  );
}
