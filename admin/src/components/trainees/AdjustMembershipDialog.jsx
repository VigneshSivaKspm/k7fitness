import { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { MoneyField, TextField } from '../ui/Field';
import { adjustMembership } from '../../services/membershipService';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { parseDateInput, toDateInput } from '../../utils/dates';
import { roundMoney } from '../../utils/format';
import { friendlyError } from '../../utils/errors';
import { focusFirstError, v } from '../../utils/validation';

/** Correct a membership's fee (e.g. a discount) or its dates. */
export default function AdjustMembershipDialog({ membership, open, onClose, onDone }) {
  const { settings, money, symbol } = useSettings();
  const toast = useToast();
  const [form, setForm] = useState(() => ({
    fee: membership ? String(membership.fee) : '',
    startDate: toDateInput(membership?.startDate),
    expiryDate: toDateInput(membership?.expiryDate),
    notes: membership?.notes || '',
  }));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open && membership) {
      setForm({
        fee: String(membership.fee),
        startDate: toDateInput(membership.startDate),
        expiryDate: toDateInput(membership.expiryDate),
        notes: membership.notes || '',
      });
      setErrors({});
    }
  }, [open, membership]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const errs = {};
    const feeErr = v.required('Fee')(form.fee) || v.number('Fee', { min: 0 })(form.fee);
    if (feeErr) errs.fee = feeErr;
    else if (roundMoney(form.fee) < membership.paidAmount) errs.fee = `Fee cannot be lower than the ${money(membership.paidAmount)} already paid.`;
    const s = parseDateInput(form.startDate);
    const x = parseDateInput(form.expiryDate);
    if (!s) errs.startDate = 'Start date is required.';
    if (!x) errs.expiryDate = 'Expiry date is required.';
    else if (s && x < s) errs.expiryDate = 'Expiry date cannot be before the start date.';
    setErrors(errs);
    if (Object.keys(errs).length) return focusFirstError(errs);
    setBusy(true);
    try {
      await adjustMembership(membership.id, { ...form, fee: Number(form.fee) }, settings);
      toast.success('Membership updated successfully.');
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
      title="Adjust membership"
      description={membership ? `${membership.planName}. Use this to apply a discount or correct dates.` : ''}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyField
          label="Fee"
          required
          name="fee"
          className="sm:col-span-2"
          symbol={symbol}
          value={form.fee}
          onChange={set('fee')}
          error={errors.fee}
          hint={membership ? `Already paid: ${money(membership.paidAmount)}` : undefined}
        />
        <TextField label="Start date" required name="startDate" type="date" value={form.startDate} onChange={set('startDate')} error={errors.startDate} />
        <TextField label="Expiry date" required name="expiryDate" type="date" value={form.expiryDate} onChange={set('expiryDate')} error={errors.expiryDate} />
        <TextField label="Notes" optional name="notes" className="sm:col-span-2" value={form.notes} maxLength={200} onChange={set('notes')} />
      </div>
    </Modal>
  );
}
