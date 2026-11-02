import { Activity, CalendarRange, Dumbbell, Flame, Salad, Scale, Target, User, Wallet } from 'lucide-react';
import { Card, DetailList } from '../../ui/Layout';
import { useSettings } from '../../../context/SettingsContext';
import { ageFrom, daysUntil, formatDate } from '../../../utils/dates';
import { formatPhone } from '../../../utils/format';
import { GENDERS, fitnessGoalLabel } from '../../../constants/options';
import { PaymentBadge } from '../TraineeCells';
import { calculateBmi, cmToFeetInches, bodyTypeDetails } from '../../../utils/fitness';
import { BodyTypeSvg } from '../../fitness/BodyTypeArt';

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
  const age = t.age || ageFrom(t.dob);
  const bmiData = calculateBmi(t.height, t.weight);
  const heightFeetInches = cmToFeetInches(Number(t.height));
  const bType = bodyTypeDetails(t.bodyType, t.gender);

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

      {/* Body Profile & Fitness Metrics Card */}
      <Card title="Body Profile & Fitness Goals" subtitle="Current measurements, body physique frame and fitness objectives">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Key Metrics Columns */}
          <div className="space-y-4 md:col-span-2">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3">
                <span className="text-[0.7rem] font-bold uppercase tracking-wider text-zinc-500">Height</span>
                <p className="mt-1 text-base font-bold text-zinc-900">
                  {t.height ? `${t.height} cm` : '—'}
                </p>
                {heightFeetInches && <p className="text-xs text-zinc-500">{heightFeetInches}</p>}
              </div>

              <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3">
                <span className="text-[0.7rem] font-bold uppercase tracking-wider text-zinc-500">Weight</span>
                <p className="mt-1 text-base font-bold text-zinc-900">
                  {t.weight ? `${t.weight} kg` : '—'}
                </p>
                {t.weight && <p className="text-xs text-zinc-500">{(Number(t.weight) * 2.20462).toFixed(1)} lbs</p>}
              </div>

              <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3">
                <span className="text-[0.7rem] font-bold uppercase tracking-wider text-zinc-500">Age</span>
                <p className="mt-1 text-base font-bold text-zinc-900">
                  {age ? `${age} yrs` : '—'}
                </p>
                <p className="text-xs text-zinc-500">{t.gender || 'Member'}</p>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3">
                <span className="text-[0.7rem] font-bold uppercase tracking-wider text-zinc-500">BMI</span>
                <p className={`mt-1 text-base font-bold ${
                  bmiData?.tone === 'success' ? 'text-emerald-700' : bmiData?.tone === 'warning' ? 'text-amber-700' : 'text-zinc-900'
                }`}>
                  {bmiData ? bmiData.value : '—'}
                </p>
                {bmiData && (
                  <span className={`inline-block rounded px-1.5 py-0.2 text-[0.65rem] font-bold uppercase ${
                    bmiData.tone === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {bmiData.category}
                  </span>
                )}
              </div>
            </div>

            {/* Target Goal */}
            <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50/60 p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-red-600 text-white">
                <Target className="size-5" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-red-700">Fitness Goal</span>
                <p className="text-base font-bold text-zinc-900">{fitnessGoalLabel(t.goal)}</p>
              </div>
            </div>
          </div>

          {/* Physique Silhouette Art Preview */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 text-center">
            <div className="text-red-600">
              <BodyTypeSvg gender={t.gender || 'male'} type={bType?.id || 'mesomorph'} className="h-28 w-auto" />
            </div>
            <h5 className="mt-2 text-sm font-bold text-zinc-900">{bType?.label || 'Mesomorph'}</h5>
            <span className="text-xs font-semibold text-red-600">{bType?.subtitle || 'Athletic'}</span>
            <p className="mt-1 text-[0.7rem] text-zinc-500 line-clamp-2">{bType?.description}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Personal details">
          <DetailList
            items={[
              { label: 'Training program', value: t.planType === 'personal_training' ? 'Personal Training (PT)' : 'General Training (GT)' },
              { label: 'Assigned Trainer', value: t.assignedTrainerName || (t.planType === 'personal_training' ? 'Not assigned yet' : 'General Floor Staff') },
              { label: 'Daily Workout Slot', value: t.preferredSlot || (t.preferredInTime ? `${t.preferredInTime} – ${t.preferredOutTime}` : '06:00 AM – 07:30 AM') },
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
