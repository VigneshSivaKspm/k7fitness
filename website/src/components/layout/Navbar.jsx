import { useEffect, useRef, useState } from 'react';
import { Menu, Phone, X } from 'lucide-react';
import Logo from '../ui/Logo';
import Button from '../ui/Button';
import { useSectionHref, useSections } from '../../hooks/useSections';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import { useContent } from '../../context/ContentContext';
import { telLink } from '../../utils/format';

export default function Navbar() {
  const { nav } = useSections();
  const { contact } = useContent();
  const href = useSectionHref();
  const active = useScrollSpy(nav.map((n) => n.id));
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const closeRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    const toggle = toggleRef.current;
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
      toggle?.focus();
    };
  }, [open]);

  const linkCls = (id) =>
    `relative py-2 text-[0.8rem] font-bold uppercase tracking-[0.14em] transition-colors ${
      active === id ? 'text-white' : 'text-silver/80 hover:text-white'
    }`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-white/5 bg-ink/85 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <nav className="container-k7 flex h-18 items-center justify-between gap-6 py-3" aria-label="Main">
        <a href={href('home')} className="shrink-0" aria-label="K7 Fitness — back to top">
          <Logo />
        </a>

        <ul className="hidden items-center gap-6 xl:flex">
          {nav.map((item) => (
            <li key={item.id}>
              <a href={href(item.id)} className={linkCls(item.id)} aria-current={active === item.id ? 'true' : undefined}>
                {item.label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-0.5 bg-brand transition-all duration-300 ${
                    active === item.id ? 'w-full' : 'w-0'
                  }`}
                />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {contact.phone && (
            <a
              href={telLink(contact.phone)}
              className="hidden size-11 items-center justify-center rounded-xl border border-white/10 text-silver transition hover:border-brand hover:text-white sm:flex xl:hidden"
              aria-label="Call us"
            >
              <Phone className="size-4.5" />
            </a>
          )}
          <Button href={href('contact')} className="hidden !px-5 !py-3 sm:inline-flex">
            Join now
          </Button>
          <button
            ref={toggleRef}
            type="button"
            className="flex size-11 items-center justify-center rounded-xl border border-white/10 text-white xl:hidden"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-5" />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 xl:hidden ${open ? 'visible' : 'invisible'}`}
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        <div
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setOpen(false)}
        />
        <aside
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={`absolute inset-y-0 right-0 flex w-[min(86vw,360px)] flex-col border-l border-white/5 bg-ink-soft transition-transform duration-300 ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
            <Logo size="sm" />
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              className="flex size-11 items-center justify-center rounded-xl border border-white/10 text-white"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
          </div>
          <ul className="flex-1 overflow-y-auto px-3 py-4">
            {nav.map((item) => (
              <li key={item.id}>
                <a
                  href={href(item.id)}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3.5 font-display text-2xl tracking-wider transition ${
                    active === item.id ? 'bg-brand/15 text-white' : 'text-silver hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.label}
                  {active === item.id && <span className="h-0.5 w-6 bg-brand" />}
                </a>
              </li>
            ))}
          </ul>
          <div className="space-y-3 border-t border-white/5 p-5">
            <Button href={href('contact')} className="w-full" onClick={() => setOpen(false)}>
              Join now
            </Button>
            {contact.phone && (
              <Button href={telLink(contact.phone)} variant="outline" className="w-full">
                <Phone className="size-4" /> Call now
              </Button>
            )}
          </div>
        </aside>
      </div>
    </header>
  );
}
