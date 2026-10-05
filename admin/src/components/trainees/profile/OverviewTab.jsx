import { CalendarRange, Dumbbell, Salad, Wallet } from 'lucide-react';
import { Card, DetailList } from '../../ui/Layout';
import { useSettings } from '../../../context/SettingsContext';
import { ageFrom, daysUntil, formatDate } from '../../../utils/dates';
import { formatPhone } from '../../../utils/format';
import { GENDERS } from '../../../constants/options';
import { PaymentBadge } from '../TraineeCells';

function Summary({ icon: Icon, title, children, onClick, cta }) {
  return (
    <div className="card flex flex-col p-4">
      <div className="flex items-center gap-2 text-[0.8rem] font-medium text-zinc-500">
        <Icon className="size-4 text-brand" /> {title}
      </div>
      <div className="mt-2 flex-1">{children}</div>
      {onClick && (
        <button type="button" onClick={onClick} className="mt-3 self-start text-[0.8rem] font-semibold text-brand hover:underline">
          {cta}
        </button>
      )}
    </div>
  );
}

export default function OverviewTab({ trainee: t, onTab }) {
  const { money } = useSettings();
  const days = t.membershipExpiry ? daysUntil(t.membershipExpiry) : null;
  const age = ageFrom(t.dob);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Summary icon={CalendarRange} title="Membership" onClick={() => onTab('membership')} cta="View history">
          {t.currentPlanName ? (
            <>
              <p className="font-semibold text-zinc-900">{t.currentPlanName}</p>
              <p className="text-sm text-zinc-500">
                {formatDate(t.membershipStart)} – {formatDate(t.membershipExpiry)}
              </p>
              <p className={`mt-1 text-sm font-semibold ${days < 0 ? 'text-red-600' : days <= 7 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {days < 0 ? `Expired ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago` : days === 0 ? 'Expires today' : `${days} day${days === 1 ? '' : 's'} remaining`}
              </p>
            </>
          ) : (
            <p className="text-sm text-zinc-500">No active membership.</p>
          )}
        </Summary>
        <Summary icon={Wallet} title="Fees" onClick={() => onTab('fees')} cta="Payment history">
          <div className="flex items-baseline justify-between gap-2">
            <p className="tabular text-xl font-bold text-zinc-900">{money(t.pendingAmount)}</p>
            <PaymentBadge trainee={t} />
          </div>
          <p className="text-sm text-zinc-500">outstanding</p>
          <p className="tabular mt-1 text-xs text-zinc-500">
            Paid {money(t.totalPaid)} of {money(t.totalFee)}
          </p>
        </Summary>
        <Summary icon={Dumbbell} title="Workout plan" onClick={() => onTab('workout')} cta={t.workoutPlanName ? 'View plan' : 'Assign plan'}>
          <p className={t.workoutPlanName ? 'font-semibold text-zinc-900' : 'text-sm text-zinc-500'}>{t.workoutPlanName || 'Not assigned'}</p>
        </Summary>
        <Summary icon={Salad} title="Diet plan" onClick={() => onTab('diet')} cta={t.dietPlanName ? 'View plan' : 'Assign plan'}>
          <p className={t.dietPlanName ? 'font-semibold text-zinc-900' : 'text-sm text-zinc-500'}>{t.dietPlanName || 'Not assigned'}</p>
        </Summary>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Personal details">
          <DetailList
            items={[
              { label: 'Phone', value: formatPhone(t.phone) },
              { label: 'Alternative phone', value: formatPhone(t.altPhone) },
              { label: 'Email', value: t.email },
              { label: 'Gender', value: GENDERS.find((g) => g.value === t.gender)?.label },
              { label: 'Date of birth', value: t.dob ? `${formatDate(t.dob)}${age !== null ? ` (${age} yrs)` : ''}` : '' },
              { label: 'Joined', value: formatDate(t.joiningDate) },
              { label: 'Address', value: t.address, full: true },
              { label: 'Emergency contact', value: [t.emergencyName, formatPhone(t.emergencyPhone)].filter(Boolean).join(' · '), full: true },
            ]}
          />
        </Card>
        <Card title="Notes">
          <DetailList
            columns={1}
            items={[
              { label: 'Medical notes', value: t.medicalNotes },
              { label: 'Trainer notes', value: t.trainerNotes },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
