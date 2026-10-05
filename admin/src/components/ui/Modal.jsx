import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const SIZES = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' };
const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog: focus trap, Esc to close, scroll lock, restores focus.
 * Renders as a bottom sheet on phones and a centred card on larger screens.
 */
export default function Modal({ open, onClose, title, description, icon, size = 'md', footer, children, as: As = 'div', onSubmit }) {
  const panelRef = useRef(null);
  const titleId = useId();
  const descId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      const panel = panelRef.current;
      // Never steal focus from a field the user has already started using.
      if (!panel || panel.contains(document.activeElement)) return;
      const target = panel.querySelector('[data-autofocus]') || panel.querySelector('input, select, textarea') || panel.querySelector(FOCUSABLE);
      (target || panel).focus({ preventScroll: true });
    }, 30);

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current?.();
      }
      if (e.key === 'Tab' && panelRef.current) {
        const nodes = [...panelRef.current.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null);
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4" role="presentation">
      <div className="animate-fade-in absolute inset-0 bg-zinc-950/55 backdrop-blur-[2px]" onClick={onClose} />
      <As
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        onSubmit={onSubmit}
        noValidate={As === 'form' ? true : undefined}
        className={`animate-slide-up sm:animate-pop-in relative flex max-h-[92svh] w-full flex-col rounded-t-2xl bg-white shadow-pop outline-none sm:rounded-2xl ${SIZES[size]}`}
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-zinc-200 sm:hidden" aria-hidden="true" />
        {(title || icon) && (
          <div className="flex items-start gap-3 px-5 pt-4 pb-3 sm:px-6 sm:pt-5">
            {icon}
            <div className="min-w-0 flex-1">
              {title && (
                <h2 id={titleId} className="text-lg font-semibold text-zinc-900">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descId} className="mt-0.5 text-sm text-zinc-500">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mt-1 -mr-2 rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
              aria-label="Close dialog"
            >
              <X className="size-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 pb-5 sm:px-6">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 bg-zinc-50/60 px-5 py-4 sm:flex-row sm:justify-end sm:rounded-b-2xl sm:px-6 [&>*]:w-full sm:[&>*]:w-auto">
            {footer}
          </div>
        )}
        <div style={{ height: 'env(safe-area-inset-bottom)' }} className="sm:hidden" />
      </As>
    </div>,
    document.body,
  );
}
