import { CalendarRange } from 'lucide-react';
import { MoneyField, SelectField, TextField } from '../ui/Field';
import { calculateExpiry, formatDate, parseDateInput, toDateInput } from '../../utils/dates';
import { durationLabel } from '../../utils/format';
import { v } from '../../utils/validation';

export function validateMembership(m, plans) {
  const errors = {};
  if (!m.planId) errors.planId = 'Choose a membership plan.';
  if (!m.startDate || !parseDateInput(m.startDate)) errors.startDate = 'Start date is required.';
  const feeErr = v.required('Fee')(m.fee) || v.number('Fee', { min: 0 })(m.fee);
  if (feeErr) errors.fee = feeErr;
  return errors;
}

/** Plan + start date + fee, with a live expiry preview and optional custom expiry date. */
export default function MembershipFields({ value, onChange, plans = [], errors = {}, symbol, money, currentPlanInfo = null }) {
  // Synthesize or preserve current plan if not in active plans
  const planOptions = [...plans];
  if (value.planId && !planOptions.some((p) => p.id === value.planId)) {
    planOptions.unshift({
      id: value.planId,
      name: currentPlanInfo?.planName || 'Current Plan',
      planType: 'general_training',
      duration: 1,
      durationUnit: 'months',
      price: Number(value.fee) || 0,
    });
  }

  const plan = planOptions.find((p) => p.id === value.planId);
  const start = parseDateInput(value.startDate);
  const autoExpiry = plan && start && plan.duration ? calculateExpiry(start, plan.duration, plan.durationUnit) : null;
  const expiry = value.expiryDate ? parseDateInput(value.expiryDate) : autoExpiry;

  const onPlan = (e) => {
    const selectedId = e.target.value;
    const p = planOptions.find((x) => x.id === selectedId);
    const newStart = value.startDate ? parseDateInput(value.startDate) : new Date();
    const newAutoExpiry = p && newStart && p.duration ? calculateExpiry(newStart, p.duration, p.durationUnit) : null;
    onChange({
      ...value,
      planId: selectedId,
      fee: p && p.price != null ? String(p.price) : value.fee,
      expiryDate: newAutoExpiry ? toDateInput(newAutoExpiry) : value.expiryDate,
    });
  };

  const onStartChange = (e) => {
    const val = e.target.value;
    const s = parseDateInput(val);
    const newAutoExpiry = plan && s && plan.duration ? calculateExpiry(s, plan.duration, plan.durationUnit) : null;
    onChange({
      ...value,
      startDate: val,
      expiryDate: newAutoExpiry ? toDateInput(newAutoExpiry) : value.expiryDate,
    });
  };

  return (
    <div className="space-y-4">
      {currentPlanInfo && (
        <div className="rounded-xl border border-brand/20 bg-brand/5 p-3.5 text-xs flex items-center justify-between gap-3">
          <div>
            <span className="font-bold text-zinc-900 block">Current Active Membership:</span>
            <span className="text-zinc-600">
              {currentPlanInfo.planName || 'Active Plan'} · {currentPlanInfo.expiry ? `Valid until ${formatDate(currentPlanInfo.expiry)}` : 'Active'}
            </span>
          </div>
          <span className="rounded-md bg-brand text-white text-[0.65rem] font-bold px-2 py-0.5 uppercase tracking-wider">
            Active
          </span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Membership plan"
          required
          name="planId"
          className="sm:col-span-2"
          placeholder={planOptions.length ? 'Select a plan' : 'No plans available — create one in Memberships'}
          options={planOptions.map((p) => ({
            value: p.id,
            label: `${p.name} [${p.planType === 'personal_training' ? 'Personal Training' : 'General'}] · ${p.duration ? durationLabel(p.duration, p.durationUnit) : ''} · ${money(p.price)}`,
          }))}
          value={value.planId || ''}
          onChange={onPlan}
          error={errors.planId}
        />

        <TextField
          label="Start date"
          required
          name="startDate"
          type="date"
          value={value.startDate}
          onChange={onStartChange}
          error={errors.startDate}
        />

        <TextField
          label="Expiry date"
          name="expiryDate"
          type="date"
          value={value.expiryDate || (autoExpiry ? toDateInput(autoExpiry) : '')}
          onChange={(e) => onChange({ ...value, expiryDate: e.target.value })}
          error={errors.expiryDate}
          hint={plan ? `Auto-calculated for ${durationLabel(plan.duration, plan.durationUnit)}` : undefined}
        />

        <MoneyField
          label="Membership fee"
          required
          name="fee"
          className="sm:col-span-2"
          symbol={symbol}
          value={value.fee}
          onChange={(e) => onChange({ ...value, fee: e.target.value })}
          error={errors.fee}
          hint={plan && Number(value.fee) !== Number(plan.price) ? `Standard plan price is ${money(plan.price)}` : undefined}
        />

        {expiry && start && (
          <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-3 text-sm ring-1 ring-zinc-200/80 sm:col-span-2">
            <CalendarRange className="size-5 shrink-0 text-brand" />
            <span className="text-zinc-600 text-xs">
              Valid from <strong className="text-zinc-900">{formatDate(start)}</strong> to <strong className="text-zinc-900">{formatDate(expiry)}</strong>
              {plan ? ` (${durationLabel(plan.duration, plan.durationUnit)})` : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
