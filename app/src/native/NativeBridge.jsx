import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { initSystemBars, isNative } from './platform';
import { runBackHandler } from './backStack';

const EXIT_PATHS = new Set(['/', '/dashboard', '/login']);
const TEXT_INPUT = /^(text|search|tel|email|number|password|url)$/;

/**
 * App-shell glue rendered once inside the router:
 *  • Android back button: closes the top overlay → goes back → minimises on Home.
 *  • Flags <html data-keyboard="open"> while typing so the tab bar gets out of the way.
 */
export default function NativeBridge() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  useEffect(() => {
    const isTyping = (el) =>
      el?.tagName === 'TEXTAREA' || (el?.tagName === 'INPUT' && TEXT_INPUT.test(el.type || 'text')) || el?.isContentEditable;
    const sync = () => {
      // Defer so focus moving between two fields does not flicker the tab bar.
      setTimeout(() => {
        document.documentElement.dataset.keyboard = isTyping(document.activeElement) ? 'open' : 'closed';
      }, 50);
    };
    document.addEventListener('focusin', sync);
    document.addEventListener('focusout', sync);
    return () => {
      document.removeEventListener('focusin', sync);
      document.removeEventListener('focusout', sync);
    };
  }, []);

  useEffect(() => {
    if (!isNative) return undefined;
    initSystemBars();
    let remove;
    let cancelled = false;
    import('@capacitor/app').then(({ App }) => {
      if (cancelled) return;
      App.addListener('backButton', () => {
        if (document.activeElement?.blur && document.documentElement.dataset.keyboard === 'open') document.activeElement.blur();
        if (runBackHandler()) return;
        if (EXIT_PATHS.has(pathRef.current)) App.minimizeApp();
        else if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
        else navigate('/dashboard', { replace: true });
      }).then((h) => {
        if (cancelled) h.remove();
        else remove = () => h.remove();
      });
    });
    return () => {
      cancelled = true;
      remove?.();
    };
  }, [navigate]);

  return null;
}
