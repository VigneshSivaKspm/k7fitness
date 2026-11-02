import { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Switch from '../ui/Switch';
import { TextField } from '../ui/Field';
import MembershipFields, { validateMembership } from './MembershipFields';
import PaymentFields, { emptyPayment, validatePayment } from './PaymentFields';
import { usePlans } from '../../hooks/usePlans';
import { renewMembership } from '../../services/membershipService';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { addDays, daysUntil, todayInput, toDateInput } from '../../utils/dates';
import { friendlyError } from '../../utils/errors';
import { focusFirstError } from '../../utils/validation';

/** Default start: the day after the current expiry if still active, otherwise today. */
function defaultStart(trainee) {
  if (trainee?.membershipExpiry && daysUntil(trainee.membershipExpiry) >= 0) {
    return toDateInput(addDays(trainee.membershipExpiry.toDate(), 1));
  }
  return todayInput();
}

export default function RenewMembershipDialog({ trainee, open, onClose, onDone }) {
  const { plans } = usePlans({ activeOnly: true });
  const { settings, money, symbol } = useSettings();
  const toast = useToast();
  const [membership, setMembership] = useState({ planId: '', startDate: '', fee: '' });
  const [collect, setCollect] = useState(true);
  const [payment, setPayment] = useState(emptyPayment());
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || !trainee) return;
    const current = plans.find((p) => p.id === trainee.currentPlanId);
    setMembership({ planId: current?.id || '', startDate: defaultStart(trainee), fee: current ? String(current.price) : '' });
    setPayment(emptyPayment(current ? String(current.price) : ''));
    setCollect(true);
    setNotes('');
    setErrors({});
  }, [open, trainee, plans]);

  const onMembershipChange = (next) => {
    setMembership(next);
    if (next.fee !== membership.fee) setPayment((p) => ({ ...p, amount: next.fee }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const errs = validateMembership(membership, plans);
    if (collect) Object.assign(errs, validatePayment(payment, Number(membership.fee) || 0));
    setErrors(errs);
    if (Object.keys(errs).length) return focusFirstError(errs);
    setBusy(true);
    try {
      await renewMembership(
        trainee.id,
        {
          plan: plans.find((p) => p.id === membership.planId),
          startDate: membership.startDate,
          fee: Number(membership.fee),
          payment: collect && Number(payment.amount) > 0 ? payment : null,
          notes,
        },
        settings,
      );
      toast.success('Membership renewed successfully.');
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
      size="lg"
      title={trainee?.currentMembershipId ? 'Renew membership' : 'Start membership'}
      description={trainee ? `${trainee.fullName} · ${trainee.memberId}. Previous memberships stay in history.` : ''}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            {trainee?.currentMembershipId ? 'Renew membership' : 'Start membership'}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <MembershipFields value={membership} onChange={onMembershipChange} plans={plans} errors={errors} symbol={symbol} money={money} />
        <div className="rounded-xl border border-zinc-200 p-4">
          <Switch checked={collect} onChange={setCollect} label="Collect payment now" description="Record a payment against this membership." />
          {collect && (
            <div className="mt-4">
              <PaymentFields value={payment} onChange={setPayment} errors={errors} symbol={symbol} showNotes={false} />
            </div>
          )}
        </div>
        <TextField label="Notes" optional name="notes" value={notes} maxLength={200} onChange={(e) => setNotes(e.target.value)} />
      </div>
    </Modal>
  );
}
