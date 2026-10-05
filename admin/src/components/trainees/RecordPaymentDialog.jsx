import { useEffect, useMemo, useState } from 'react';
import { CircleCheck, Receipt } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Spinner } from '../ui/Feedback';
import PaymentFields, { emptyPayment, validatePayment } from './PaymentFields';
import { listTraineeMemberships } from '../../services/membershipService';
import { recordPayment } from '../../services/paymentService';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/dates';
import { roundMoney } from '../../utils/format';
import { friendlyError } from '../../utils/errors';
import { focusFirstError } from '../../utils/validation';

/**
 * Records a payment against one of the trainee's memberships with dues.
 * Defaults to the oldest outstanding membership.
 */
export default function RecordPaymentDialog({ trainee, open, onClose, onDone }) {
  const { settings, money, symbol } = useSettings();
  const toast = useToast();
  const [memberships, setMemberships] = useState(null);
  const [membershipId, setMembershipId] = useState('');
  const [payment, setPayment] = useState(emptyPayment());
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!open || !trainee) return;
    setDone(null);
    setErrors({});
    setMemberships(null);
    setLoadError('');
    listTraineeMemberships(trainee.id)
      .then((all) => {
        const due = all.filter((m) => roundMoney(m.fee - m.paidAmount) > 0).reverse(); // oldest first
        setMemberships(due);
        const first = due[0];
        setMembershipId(first?.id || '');
        setPayment(emptyPayment(first ? String(roundMoney(first.fee - first.paidAmount)) : ''));
      })
      .catch((err) => setLoadError(friendlyError(err)));
    // Keyed on the id: the parent refreshes the trainee object after a payment,
    // which must not reset the success screen.
  }, [open, trainee?.id]);

  const selected = useMemo(() => memberships?.find((m) => m.id === membershipId), [memberships, membershipId]);
  const outstanding = selected ? roundMoney(selected.fee - selected.paidAmount) : 0;

  const submit = async (e) => {
    e.preventDefault();
    if (busy || !selected) return;
    const errs = validatePayment(payment, outstanding);
    setErrors(errs);
    if (Object.keys(errs).length) return focusFirstError(errs);
    setBusy(true);
    try {
      const res = await recordPayment(trainee.id, selected.id, payment, settings);
      toast.success('Payment recorded successfully.');
      setDone(res);
      onDone?.();
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <Modal open={open} onClose={onClose} size="sm">
        <div className="pt-6 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CircleCheck className="size-7" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-zinc-900">Payment recorded</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {money(payment.amount)} received from {trainee.fullName}. Receipt {done.receiptNo}.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button variant="secondary" onClick={onClose}>
              Done
            </Button>
            <Button icon={Receipt} to={`/fees/receipts/${done.id}`}>
              View receipt
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      as="form"
      onSubmit={submit}
      title="Record payment"
      description={trainee ? `${trainee.fullName} · ${trainee.memberId}` : ''}
      footer={
        memberships?.length ? (
          <>
            <Button variant="secondary" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" loading={busy}>
              Record {payment.amount ? money(payment.amount) : 'payment'}
            </Button>
          </>
        ) : null
      }
    >
      {loadError ? (
        <p className="py-6 text-center text-sm text-red-600">{loadError}</p>
      ) : !memberships ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : !memberships.length ? (
        <div className="py-8 text-center">
          <CircleCheck className="mx-auto size-8 text-emerald-500" />
          <p className="mt-3 font-semibold text-zinc-900">No outstanding fees</p>
          <p className="mt-1 text-sm text-zinc-500">All memberships for this trainee are fully paid.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {memberships.length > 1 && (
            <fieldset>
              <legend className="label">Apply payment to</legend>
              <div className="space-y-2">
                {memberships.map((m) => (
                  <label
                    key={m.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                      membershipId === m.id ? 'border-brand bg-brand-50/50 ring-1 ring-brand' : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="membership"
                      className="accent-brand"
                      checked={membershipId === m.id}
                      onChange={() => {
                        setMembershipId(m.id);
                        setPayment((p) => ({ ...p, amount: String(roundMoney(m.fee - m.paidAmount)) }));
                      }}
                    />
                    <span className="min-w-0 flex-1 text-sm">
                      <span className="block font-semibold text-zinc-900">{m.planName}</span>
                      <span className="text-zinc-500">
                        {formatDate(m.startDate)} – {formatDate(m.expiryDate)}
                      </span>
                    </span>
                    <span className="tabular text-sm font-semibold text-red-600">{money(m.fee - m.paidAmount)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {selected && (
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-zinc-50 p-3 text-center ring-1 ring-zinc-100">
              <div>
                <p className="text-[0.7rem] font-medium tracking-wide text-zinc-500 uppercase">Fee</p>
                <p className="tabular text-sm font-semibold text-zinc-900">{money(selected.fee)}</p>
              </div>
              <div>
                <p className="text-[0.7rem] font-medium tracking-wide text-zinc-500 uppercase">Paid</p>
                <p className="tabular text-sm font-semibold text-emerald-700">{money(selected.paidAmount)}</p>
              </div>
              <div>
                <p className="text-[0.7rem] font-medium tracking-wide text-zinc-500 uppercase">Due</p>
                <p className="tabular text-sm font-semibold text-red-600">{money(outstanding)}</p>
              </div>
            </div>
          )}

          <PaymentFields value={payment} onChange={setPayment} errors={errors} symbol={symbol} />
        </div>
      )}
    </Modal>
  );
}
