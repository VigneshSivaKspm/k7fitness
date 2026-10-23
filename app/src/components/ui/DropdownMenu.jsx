import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';
import { EllipsisVertical } from 'lucide-react';
import { pushBackHandler } from '../../native/backStack';

/**
 * Row action menu. Rendered in a portal with fixed positioning so it never
 * gets clipped by scrolling tables; flips upward near the viewport bottom.
 *
 * items: [{ label, icon, onClick?, to?, href?, tone?: 'danger', hidden?, divider? }]
 */
export default function DropdownMenu({ items, label = 'More actions', trigger, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const visible = items.filter((i) => !i.hidden);

  const close = useCallback(() => setOpen(false), []);

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const menuH = menuRef.current?.offsetHeight || visible.length * 46 + 12;
    // Keep clear of the mobile tab bar.
    const bottomLimit = window.innerHeight - (window.innerWidth < 1024 ? 88 : 0);
    const up = r.bottom + menuH + 8 > bottomLimit && r.top > menuH;
    setPos({
      top: up ? r.top - menuH - 6 : r.bottom + 6,
      left: align === 'right' ? Math.max(8, r.right - 208) : Math.min(r.left, window.innerWidth - 216),
    });
  }, [open, align, visible.length]);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (!menuRef.current?.contains(e.target) && !btnRef.current?.contains(e.target)) close();
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        close();
        btnRef.current?.focus();
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const nodes = [...(menuRef.current?.querySelectorAll('[role="menuitem"]') || [])];
        const idx = nodes.indexOf(document.activeElement);
        const next = e.key === 'ArrowDown' ? (idx + 1) % nodes.length : (idx - 1 + nodes.length) % nodes.length;
        nodes[next]?.focus();
      }
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('touchstart', onDoc, { passive: true });
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    const t = setTimeout(() => menuRef.current?.querySelector('[role="menuitem"]')?.focus(), 10);
    const popBack = pushBackHandler(close);
    return () => {
      popBack();
      clearTimeout(t);
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('touchstart', onDoc);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open, close]);

  const run = (item) => (e) => {
    e.stopPropagation();
    close();
    if (item.to) navigate(item.to);
    else if (item.href) window.open(item.href, item.href.startsWith('http') ? '_blank' : '_self', 'noopener');
    else item.onClick?.();
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={trigger ? '' : 'flex size-10 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900'}
      >
        {trigger || <EllipsisVertical className="size-4.5" />}
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="animate-pop-in fixed z-[75] w-52 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1.5 shadow-pop"
            style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999 }}
          >
            {visible.map((item, i) =>
              item.divider ? (
                <div key={`d${i}`} className="my-1.5 h-px bg-zinc-100" role="separator" />
              ) : (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  onClick={run(item)}
                  className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm outline-none max-lg:py-3 transition focus:bg-zinc-100 ${
                    item.tone === 'danger' ? 'text-red-600 hover:bg-red-50 focus:bg-red-50' : 'text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  {item.icon && <item.icon className="size-4 shrink-0 opacity-80" />}
                  {item.label}
                </button>
              ),
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
