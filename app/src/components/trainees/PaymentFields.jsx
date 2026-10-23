import { MoneyField, SelectField, TextField } from '../ui/Field';
import { PAYMENT_METHODS } from '../../constants/options';
import { v } from '../../utils/validation';
import { parseDateInput, todayInput } from '../../utils/dates';
import { roundMoney } from '../../utils/format';

export const emptyPayment = (amount = '') => ({ amount, date: todayInput(), method: 'cash', reference: '', notes: '' });

/** Validates a payment form against the maximum allowed amount. */
export function validatePayment(p, maxAmount) {
  const errors = {};
  const amountErr = v.required('Amount')(p.amount) || v.number('Amount', { positive: true })(p.amount);
  if (amountErr) errors.amount = amountErr;
  else if (roundMoney(p.amount) > roundMoney(maxAmount)) errors.amount = `Amount cannot be more than the outstanding ${maxAmount}.`;
  if (!p.date || !parseDateInput(p.date)) errors.date = 'Payment date is required.';
  else if (parseDateInput(p.date) > new Date()) errors.date = 'Payment date cannot be in the future.';
  if (!p.method) errors.method = 'Choose a payment method.';
  if (p.reference && p.reference.length > 80) errors.reference = 'Reference is too long.';
  return errors;
}

export default function PaymentFields({ value, onChange, errors = {}, symbol, showNotes = true }) {
  const set = (key) => (e) => onChange({ ...value, [key]: e.target.value });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <MoneyField label="Amount" required name="amount" symbol={symbol} value={value.amount} onChange={set('amount')} error={errors.amount} />
      <TextField label="Payment date" required name="date" type="date" max={todayInput()} value={value.date} onChange={set('date')} error={errors.date} />
      <SelectField label="Method" required name="method" options={PAYMENT_METHODS} value={value.method} onChange={set('method')} error={errors.method} />
      <TextField
        label="Reference"
        optional
        name="reference"
        placeholder={value.method === 'upi' ? 'UPI transaction ID' : 'Cheque / txn no.'}
        value={value.reference}
        onChange={set('reference')}
        error={errors.reference}
      />
      {showNotes && (
        <TextField label="Notes" optional name="notes" className="sm:col-span-2" maxLength={200} value={value.notes} onChange={set('notes')} />
      )}
    </div>
  );
}
