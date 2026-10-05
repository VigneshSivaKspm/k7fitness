import { CalendarRange } from 'lucide-react';
import { MoneyField, SelectField, TextField } from '../ui/Field';
import { calculateExpiry, formatDate, parseDateInput } from '../../utils/dates';
import { durationLabel } from '../../utils/format';
import { v } from '../../utils/validation';

export function validateMembership(m, plans) {
  const errors = {};
  if (!m.planId || !plans.find((p) => p.id === m.planId)) errors.planId = 'Choose a membership plan.';
  if (!m.startDate || !parseDateInput(m.startDate)) errors.startDate = 'Start date is required.';
  const feeErr = v.required('Fee')(m.fee) || v.number('Fee', { min: 0 })(m.fee);
  if (feeErr) errors.fee = feeErr;
  return errors;
}

/** Plan + start date + fee, with a live expiry preview. */
export default function MembershipFields({ value, onChange, plans, errors = {}, symbol, money }) {
  const plan = plans.find((p) => p.id === value.planId);
  const start = parseDateInput(value.startDate);
  const expiry = plan && start ? calculateExpiry(start, plan.duration, plan.durationUnit) : null;

  const onPlan = (e) => {
    const p = plans.find((x) => x.id === e.target.value);
    onChange({ ...value, planId: e.target.value, fee: p ? String(p.price) : value.fee });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <SelectField
        label="Membership plan"
        required
        name="planId"
        className="sm:col-span-2"
        placeholder={plans.length ? 'Select a plan' : 'No active plans — create one in Memberships'}
        options={plans.map((p) => ({ value: p.id, label: `${p.name} · ${durationLabel(p.duration, p.durationUnit)} · ${money(p.price)}` }))}
        value={value.planId}
        onChange={onPlan}
        error={errors.planId}
      />
      <TextField
        label="Start date"
        required
        name="startDate"
        type="date"
        value={value.startDate}
        onChange={(e) => onChange({ ...value, startDate: e.target.value })}
        error={errors.startDate}
      />
      <MoneyField
        label="Membership fee"
        required
        name="fee"
        symbol={symbol}
        value={value.fee}
        onChange={(e) => onChange({ ...value, fee: e.target.value })}
        error={errors.fee}
        hint={plan && Number(value.fee) !== Number(plan.price) ? `Plan price is ${money(plan.price)}` : undefined}
      />
      {expiry && (
        <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-3 text-sm ring-1 ring-zinc-100 sm:col-span-2">
          <CalendarRange className="size-5 shrink-0 text-brand" />
          <span className="text-zinc-600">
            Valid <strong className="text-zinc-900">{formatDate(start)}</strong> to <strong className="text-zinc-900">{formatDate(expiry)}</strong>{' '}
            ({durationLabel(plan.duration, plan.durationUnit)})
          </span>
        </div>
      )}
    </div>
  );
}
