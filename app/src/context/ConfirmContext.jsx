import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { useToast } from './ToastContext';
import { friendlyError } from '../utils/errors';

const ConfirmContext = createContext(null);

/**
 * const confirm = useConfirm();
 * await confirm({ title, message, confirmText, tone: 'danger', onConfirm: async () => {...} })
 * Resolves true when confirmed (and onConfirm succeeded), false otherwise.
 */
export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const [busy, setBusy] = useState(false);
  const resolver = useRef(null);
  const toast = useToast();

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setDialog({ tone: 'danger', confirmText: 'Confirm', cancelText: 'Cancel', ...options });
      }),
    [],
  );

  const close = (result) => {
    if (busy) return;
    resolver.current?.(result);
    resolver.current = null;
    setDialog(null);
  };

  const onConfirm = async () => {
    if (!dialog.onConfirm) return close(true);
    setBusy(true);
    try {
      await dialog.onConfirm();
      setBusy(false);
      resolver.current?.(true);
      resolver.current = null;
      setDialog(null);
    } catch (err) {
      setBusy(false);
      toast.error(friendlyError(err));
    }
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={Boolean(dialog)}
        onClose={() => close(false)}
        size="sm"
        title={dialog?.title}
        icon={
          dialog?.tone === 'danger' ? (
            <span className="flex size-10 items-center justify-center rounded-full bg-red-50 text-red-600">
              <TriangleAlert className="size-5" />
            </span>
          ) : null
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => close(false)} disabled={busy}>
              {dialog?.cancelText}
            </Button>
            <Button variant={dialog?.tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={busy}>
              {dialog?.confirmText}
            </Button>
          </>
        }
      >
        {dialog?.message && <div className="text-sm leading-relaxed text-zinc-600">{dialog.message}</div>}
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside ConfirmProvider');
  return ctx;
}
