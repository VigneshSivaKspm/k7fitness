import { useState } from 'react';
import { Ban, IndianRupee, Receipt, Wallet } from 'lucide-react';
import { Card } from '../../ui/Layout';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import DropdownMenu from '../../ui/DropdownMenu';
import Modal from '../../ui/Modal';
import { TextField } from '../../ui/Field';
import { EmptyState, ErrorState, SkeletonRows } from '../../ui/Feedback';
import { useAsync } from '../../../hooks/useAsync';
import { listTraineePayments, voidPayment } from '../../../services/paymentService';
import { useSettings } from '../../../context/SettingsContext';
import { useToast } from '../../../context/ToastContext';
import { paymentMethodLabel } from '../../../constants/options';
import { formatDate } from '../../../utils/dates';
import { friendlyError } from '../../../utils/errors';
import { PaymentBadge } from '../TraineeCells';

export function VoidPaymentDialog({ payment, open, onClose, onDone }) {
  const { settings, money } = useSettings();
  const toast = useToast();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (reason.trim().length < 3) return setError('Please give a short reason (e.g. "Entered twice").');
    setBusy(true);
    try {
      await voidPayment(payment.id, reason.trim(), settings);
      toast.success('Payment voided. Balances have been updated.');
      setReason('');
      onDone?.();
      onClose();
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      as="form"
      onSubmit={submit}
      size="sm"
      title="Void payment?"
      description={payment ? `${payment.receiptNo} · ${money(payment.amount)} on ${formatDate(payment.paymentDate)}` : ''}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Keep payment
          </Button>
          <Button type="submit" variant="danger" loading={busy}>
            Void payment
          </Button>
        </>
      }
    >
      <p className="mb-4 text-sm text-zinc-600">
        The payment stays in history marked as void, and the amount is added back to the member’s outstanding balance.
      </p>
      <TextField label="Reason" required name="reason" value={reason} maxLength={150} onChange={(e) => (setReason(e.target.value), setError(''))} error={error} />
    </Modal>
  );
}

export default function FeesTab({ trainee, onPayment, onChanged }) {
  const { money } = useSettings();
  const { data, loading, error, reload } = useAsync(() => listTraineePayments(trainee.id), [trainee.id, trainee.updatedAt?.toMillis?.()]);
  const [voiding, setVoiding] = useState(null);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total fee', value: trainee.totalFee, cls: 'text-zinc-900' },
          { label: 'Paid', value: trainee.totalPaid, cls: 'text-emerald-700' },
          { label: 'Outstanding', value: trainee.pendingAmount, cls: trainee.pendingAmount > 0 ? 'text-red-600' : 'text-zinc-900' },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-[0.8rem] font-medium text-zinc-500">{s.label}</p>
            <p className={`tabular mt-1 text-lg font-bold sm:text-2xl ${s.cls}`}>{money(s.value)}</p>
          </div>
        ))}
      </div>

      <Card
        title="Payment history"
        bodyClassName=""
        actions={
          <>
            <PaymentBadge trainee={trainee} />
            <Button size="sm" icon={IndianRupee} onClick={onPayment} disabled={trainee.pendingAmount <= 0}>
              Record payment
            </Button>
          </>
        }
      >
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading && !data ? (
          <SkeletonRows rows={3} />
        ) : !data?.length ? (
          <EmptyState icon={Wallet} title="No payments recorded" description="Payments you record will appear here with printable receipts." />
        ) : (
          <ul className="divide-y divide-zinc-100">
            {data.map((p) => (
              <li key={p.id} className={`flex items-center gap-3 px-5 py-3.5 ${p.status === 'void' ? 'opacity-60' : ''}`}>
                <span className="hidden size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 sm:flex">
                  <Receipt className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-zinc-900">
                    <span className={p.status === 'void' ? 'line-through' : ''}>{money(p.amount)}</span>
                    <span className="font-normal text-zinc-500">via {paymentMethodLabel(p.method)}</span>
                    {p.status === 'void' && <Badge tone="danger">Void</Badge>}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {formatDate(p.paymentDate)} · {p.receiptNo} · {p.planName}
                    {p.reference && ` · Ref ${p.reference}`}
                  </p>
                  {p.status === 'void' && p.voidReason && <p className="text-xs text-red-600">Voided: {p.voidReason}</p>}
                </div>
                <DropdownMenu
                  items={[
                    { label: 'View receipt', icon: Receipt, to: `/fees/receipts/${p.id}` },
                    { label: 'Void payment', icon: Ban, tone: 'danger', onClick: () => setVoiding(p), hidden: p.status === 'void' },
                  ]}
                />
              </li>
            ))}
          </ul>
        )}
      </Card>
      <VoidPaymentDialog
        payment={voiding}
        open={Boolean(voiding)}
        onClose={() => setVoiding(null)}
        onDone={() => {
          reload();
          onChanged();
        }}
      />
    </div>
  );
}
