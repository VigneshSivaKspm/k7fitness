import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { TriangleAlert } from 'lucide-react';
import { Card, FormActions, PageHeader } from '../../components/ui/Layout';
import Button from '../../components/ui/Button';
import Switch from '../../components/ui/Switch';
import ImageUpload from '../../components/ui/ImageUpload';
import { PageLoader, ErrorState } from '../../components/ui/Feedback';
import { SelectField, TextArea, TextField } from '../../components/ui/Field';
import MembershipFields, { validateMembership } from '../../components/trainees/MembershipFields';
import PaymentFields, { emptyPayment, validatePayment } from '../../components/trainees/PaymentFields';
import { createTrainee, findByPhone, getTrainee, updateTrainee } from '../../services/traineeService';
import { changeMemberMembership } from '../../services/membershipService';
import { usePlans } from '../../hooks/usePlans';
import { useDocumentTitle } from '../../hooks/useAsync';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { GENDERS, FITNESS_GOALS, PLAN_TYPES } from '../../constants/options';
import { listItems } from '../../services/websiteService';
import BodyTypeSelector from '../../components/fitness/BodyTypeSelector';
import { calculateBmi, cmToFeetInches } from '../../utils/fitness';
import { todayInput, toDateInput, parseDateInput } from '../../utils/dates';
import { collectErrors, focusFirstError, v } from '../../utils/validation';
import { friendlyError } from '../../utils/errors';

function calcAgeFromDob(dobString) {
  if (!dobString) return '';
  const birth = new Date(dobString);
  if (isNaN(birth.getTime())) return '';
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age > 0 ? String(age) : '';
}

const EMPTY = {
  memberId: '',
  fullName: '',
  phone: '',
  altPhone: '',
  email: '',
  gender: '',
  dob: '',
  age: '',
  height: '',
  weight: '',
  bodyType: '',
  goal: '',
  planType: 'general_training',
  assignedTrainerId: '',
  assignedTrainerName: '',
  preferredInTime: '06:00 AM',
  preferredOutTime: '07:30 AM',
  address: '',
  emergencyName: '',
  emergencyPhone: '',
  joiningDate: todayInput(),
  medicalNotes: '',
  trainerNotes: '',
  photo: null,
};

const SCHEMA = {
  fullName: [v.required('Full name'), v.minLength('Full name', 2), v.maxLength('Full name', 120)],
  phone: [v.required('Phone number'), v.phone()],
  altPhone: [v.phone('Alternative phone')],
  email: [v.email()],
  dob: [v.date('Date of birth'), v.notFuture('Date of birth')],
  emergencyPhone: [v.phone('Emergency contact phone')],
  joiningDate: [v.required('Joining date'), v.date('Joining date')],
  address: [v.maxLength('Address', 400)],
  medicalNotes: [v.maxLength('Medical notes', 1000)],
  trainerNotes: [v.maxLength('Trainer notes', 1000)],
};

function fromTrainee(t) {
  return {
    memberId: t.memberId || '',
    fullName: t.fullName || '',
    phone: t.phone || '',
    altPhone: t.altPhone || '',
    email: t.email || '',
    gender: t.gender || '',
    dob: toDateInput(t.dob),
    age: t.age != null && t.age !== '' ? String(t.age) : (t.dob ? calcAgeFromDob(toDateInput(t.dob)) : ''),
    height: t.height != null ? String(t.height) : '',
    weight: t.weight != null ? String(t.weight) : '',
    bodyType: t.bodyType || '',
    goal: t.goal || '',
    planType: t.planType || 'general_training',
    assignedTrainerId: t.assignedTrainerId || '',
    assignedTrainerName: t.assignedTrainerName || '',
    preferredInTime: t.preferredInTime || '06:00 AM',
    preferredOutTime: t.preferredOutTime || '07:30 AM',
    address: t.address || '',
    emergencyName: t.emergencyName || '',
    emergencyPhone: t.emergencyPhone || '',
    joiningDate: toDateInput(t.joiningDate),
    medicalNotes: t.medicalNotes || '',
    trainerNotes: t.trainerNotes || '',
    photo: t.photoUrl ? { url: t.photoUrl, path: t.photoPath } : null,
  };
}

export default function TraineeFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  useDocumentTitle(editing ? 'Edit member' : 'Add member');
  const navigate = useNavigate();
  const toast = useToast();
  const { settings, money, symbol } = useSettings();
  const { plans } = usePlans({ activeOnly: !editing });
  const [trainers, setTrainers] = useState([]);

  useEffect(() => {
    listItems('trainers').then(setTrainers).catch(() => {});
  }, []);

  const location = useLocation();
  // Prefill from an enquiry ("Add as member").
  const [form, setForm] = useState(() => ({ ...EMPTY, ...(editing ? {} : location.state?.prefill) }));
  const [rawTrainee, setRawTrainee] = useState(null);
  const [loadState, setLoadState] = useState({ loading: editing, error: '' });
  const [withMembership, setWithMembership] = useState(true);
  const [membership, setMembership] = useState({ planId: '', startDate: todayInput(), expiryDate: '', fee: '' });
  const [initialMembership, setInitialMembership] = useState(null);
  const [withPayment, setWithPayment] = useState(false);
  const [payment, setPayment] = useState(emptyPayment());
  const [errors, setErrors] = useState({});
  const [duplicate, setDuplicate] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editing) return;
    getTrainee(id)
      .then((t) => {
        if (!t) setLoadState({ loading: false, error: 'This member could not be found.' });
        else {
          setRawTrainee(t);
          setForm(fromTrainee(t));
          if (t.currentPlanId || t.currentPlanName || t.currentMembershipId) {
            setWithMembership(true);
            const initial = {
              planId: t.currentPlanId || '',
              startDate: t.membershipStart ? toDateInput(t.membershipStart) : todayInput(),
              expiryDate: t.membershipExpiry ? toDateInput(t.membershipExpiry) : '',
              fee: t.totalFee != null ? String(t.totalFee) : '',
            };
            setMembership(initial);
            setInitialMembership(initial);
          } else {
            setWithMembership(false);
          }
          setLoadState({ loading: false, error: '' });
        }
      })
      .catch((err) => setLoadState({ loading: false, error: friendlyError(err) }));
  }, [editing, id]);

  // Synchronize member's current plan once plans finish loading
  useEffect(() => {
    if (editing && rawTrainee && plans.length > 0) {
      if (!membership.planId && (rawTrainee.currentPlanId || rawTrainee.currentPlanName)) {
        const found = plans.find(
          (p) =>
            p.id === rawTrainee.currentPlanId ||
            (rawTrainee.currentPlanName &&
              p.name?.trim().toLowerCase() === rawTrainee.currentPlanName?.trim().toLowerCase())
        );
        if (found) {
          setMembership((prev) => ({
            ...prev,
            planId: found.id,
            fee: prev.fee || String(found.price),
          }));
          setInitialMembership((prev) => (prev ? { ...prev, planId: found.id } : prev));
        }
      }
    }
  }, [editing, rawTrainee, plans, membership.planId]);

  const set = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'dob' && value) {
        const computedAge = calcAgeFromDob(value);
        if (computedAge) next.age = computedAge;
      }
      return next;
    });
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
    // Keep the membership start date aligned with the joining date for new members.
    if (key === 'joiningDate' && !editing) setMembership((m) => ({ ...m, startDate: value }));
  };

  const checkDuplicate = async () => {
    if (form.phone.replace(/\D/g, '').length < 10) return setDuplicate(null);
    try {
      setDuplicate(await findByPhone(form.phone, id));
    } catch {
      setDuplicate(null);
    }
  };

  const onMembershipChange = (next) => {
    setMembership(next);
    if (errors.planId) setErrors((e) => ({ ...e, planId: undefined }));
    if (errors.startDate) setErrors((e) => ({ ...e, startDate: undefined }));
    if (errors.fee) setErrors((e) => ({ ...e, fee: undefined }));
    if (next.fee !== membership.fee) setPayment((p) => ({ ...p, amount: next.fee }));
    const chosenPlan = plans.find((p) => p.id === next.planId);
    if (chosenPlan?.planType) {
      setForm((f) => ({
        ...f,
        planType: chosenPlan.planType,
        ...(chosenPlan.planType !== 'personal_training' ? { assignedTrainerId: '', assignedTrainerName: '' } : {}),
      }));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const errs = collectErrors(form, SCHEMA);
    const joining = parseDateInput(form.joiningDate);
    if (joining && joining > new Date()) errs.joiningDate = 'Joining date cannot be in the future.';
    if (withMembership) {
      Object.assign(errs, validateMembership(membership, plans));
      if (!editing && withPayment) Object.assign(errs, validatePayment(payment, Number(membership.fee) || 0));
    }
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error('Please fix the highlighted fields.');
      return focusFirstError(errs);
    }

    setBusy(true);
    try {
      if (editing) {
        // If membership was enabled and changed
        if (withMembership && membership.planId) {
          const hasChanged =
            !initialMembership ||
            membership.planId !== initialMembership.planId ||
            membership.startDate !== initialMembership.startDate ||
            membership.expiryDate !== initialMembership.expiryDate ||
            membership.fee !== initialMembership.fee;

          if (hasChanged) {
            let chosenPlan = plans.find((p) => p.id === membership.planId);
            if (!chosenPlan && rawTrainee?.currentPlanName) {
              chosenPlan = {
                id: membership.planId,
                name: rawTrainee.currentPlanName,
                price: Number(membership.fee) || 0,
                duration: 1,
                durationUnit: 'months',
              };
            }
            if (chosenPlan) {
              await changeMemberMembership(
                id,
                {
                  plan: chosenPlan,
                  startDate: membership.startDate,
                  expiryDate: membership.expiryDate,
                  fee: Number(membership.fee),
                  notes: membership.notes || '',
                },
                settings
              );
            }
          }
        }
        await updateTrainee(id, form);
        toast.success('Member details and membership updated successfully.');
        navigate(`/members/${id}`);
      } else {
        const plan = plans.find((p) => p.id === membership.planId);
        const res = await createTrainee(form, {
          membership: withMembership ? { plan, startDate: membership.startDate, fee: Number(membership.fee) } : null,
          payment: withMembership && withPayment && Number(payment.amount) > 0 ? payment : null,
          settings,
        });
        toast.success(`Member added successfully. Member ID ${res.memberId}.`);
        navigate(`/members/${res.id}`, { replace: true });
      }
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  if (loadState.loading) return <PageLoader />;
  if (loadState.error) return <ErrorState message={loadState.error} />;

  const bmiData = calculateBmi(form.height, form.weight);
  const heightFeetInches = cmToFeetInches(Number(form.height));

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-4xl">
      <PageHeader
        back={{ to: editing ? `/members/${id}` : '/members', label: editing ? 'Back to profile' : 'Members' }}
        title={editing ? `Edit ${form.fullName || 'member'}` : 'Add member'}
        description={editing ? 'Update personal details, change or assign membership plans, and adjust fees.' : 'Assign a Member ID (e.g. K7-001) or leave blank to auto-generate.'}
      />

      <div className="space-y-5">
        <Card title="Personal details">
          <div className="grid gap-5 md:grid-cols-[auto_1fr]">
            <ImageUpload value={form.photo} onChange={set('photo')} folder="private/trainees" round maxSize={600} label="Photo" />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Member ID"
                optional
                name="memberId"
                placeholder="e.g. K7-001 (auto-assigned if blank)"
                value={form.memberId}
                onChange={(val) => {
                  const v = val?.target ? val.target.value : val;
                  setForm((f) => ({ ...f, memberId: (v || '').toUpperCase() }));
                }}
                error={errors.memberId}
                hint={editing ? 'Used by the member to log in' : 'Assign custom ID (like K7-001) or leave blank to auto-generate'}
              />
              <TextField label="Full name" required name="fullName" autoComplete="off" value={form.fullName} onChange={set('fullName')} error={errors.fullName} />
              <TextField
                label="Phone number"
                required
                name="phone"
                type="tel"
                inputMode="tel"
                placeholder="98765 43210"
                value={form.phone}
                onChange={set('phone')}
                onBlur={checkDuplicate}
                error={errors.phone}
              />
              <TextField label="Alternative phone" optional name="altPhone" type="tel" inputMode="tel" value={form.altPhone} onChange={set('altPhone')} error={errors.altPhone} />
              {duplicate && (
                <p className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-200 sm:col-span-2" role="status">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                  <span>
                    This number already belongs to{' '}
                    <a href={`${import.meta.env.BASE_URL}members/${duplicate.id}`} target="_blank" rel="noreferrer" className="font-semibold underline">
                      {duplicate.fullName} ({duplicate.memberId})
                    </a>
                    . You can still save if this is intentional.
                  </span>
                </p>
              )}
              <TextField label="Email" optional name="email" type="email" inputMode="email" value={form.email} onChange={set('email')} error={errors.email} />
              <SelectField label="Gender" optional name="gender" placeholder="Select" options={GENDERS} value={form.gender} onChange={set('gender')} />
              <TextField label="Date of birth" optional name="dob" type="date" max={todayInput()} value={form.dob} onChange={set('dob')} error={errors.dob} />
              <TextField label="Joining date" required name="joiningDate" type="date" max={todayInput()} value={form.joiningDate} onChange={set('joiningDate')} error={errors.joiningDate} />
            </div>
          </div>
        </Card>

        <Card title="Body Metrics & Fitness Goals" subtitle="Physical measurements, matching body type silhouette and fitness target">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-4">
              <TextField
                label="Height (cm)"
                optional
                name="height"
                type="number"
                placeholder="e.g. 175"
                value={form.height}
                onChange={set('height')}
                hint={heightFeetInches ? `Approx: ${heightFeetInches}` : 'Enter height in cm'}
              />
              <TextField
                label="Weight (kg)"
                optional
                name="weight"
                type="number"
                step="0.1"
                placeholder="e.g. 72"
                value={form.weight}
                onChange={set('weight')}
                hint={form.weight ? `Approx: ${(Number(form.weight) * 2.20462).toFixed(1)} lbs` : 'Enter weight in kg'}
              />
              <TextField
                label="Age (years)"
                optional
                name="age"
                type="number"
                placeholder="e.g. 24"
                value={form.age}
                onChange={set('age')}
                hint={form.dob ? 'Calculated from DOB' : 'Enter member age'}
              />
              <SelectField
                label="Primary Goal"
                optional
                name="goal"
                placeholder="Select goal"
                options={FITNESS_GOALS.map((g) => ({ value: g.value, label: g.label }))}
                value={form.goal}
                onChange={set('goal')}
              />
            </div>

            {bmiData && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex size-12 items-center justify-center rounded-xl font-bold text-white shadow-sm ${
                    bmiData.tone === 'success' ? 'bg-emerald-600' : bmiData.tone === 'warning' ? 'bg-amber-600' : 'bg-red-600'
                  }`}>
                    {bmiData.value}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">BMI Score</span>
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${
                        bmiData.tone === 'success'
                          ? 'bg-emerald-100 text-emerald-800'
                          : bmiData.tone === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {bmiData.category}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600">{bmiData.description} • Healthy range: <span className="font-semibold text-zinc-800">{bmiData.healthyRange}</span></p>
                  </div>
                </div>
              </div>
            )}

            <BodyTypeSelector
              gender={form.gender || 'male'}
              value={form.bodyType}
              onChange={(val) => setForm((f) => ({ ...f, bodyType: val }))}
            />
          </div>
        </Card>

        <Card title="Training Program & Personal Trainer" subtitle="Assign General Training (GT) or Personal Training (PT) with a dedicated coach">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Program Type"
              name="planType"
              options={PLAN_TYPES}
              value={form.planType || 'general_training'}
              onChange={(e) => {
                const pt = e.target.value;
                setForm((f) => ({
                  ...f,
                  planType: pt,
                  ...(pt !== 'personal_training' ? { assignedTrainerId: '', assignedTrainerName: '' } : {}),
                }));
              }}
            />
            {form.planType === 'personal_training' && (
              <SelectField
                label="Assigned Personal Trainer"
                name="assignedTrainerId"
                placeholder={trainers.length ? 'Select a Personal Trainer' : 'No trainers added yet'}
                options={trainers.map((tr) => ({ value: tr.id, label: `${tr.name} (${tr.specialization || 'Trainer'})` }))}
                value={form.assignedTrainerId}
                onChange={(e) => {
                  const trId = e.target.value;
                  const trObj = trainers.find((x) => x.id === trId);
                  setForm((f) => ({ ...f, assignedTrainerId: trId, assignedTrainerName: trObj?.name || '' }));
                }}
                hint="This trainer can log in and manage this member's workout and diet charts."
              />
            )}
            <TextField
              label="Daily Come-In Time"
              optional
              name="preferredInTime"
              placeholder="e.g. 06:00 AM"
              value={form.preferredInTime}
              onChange={set('preferredInTime')}
              hint="Member's expected gym entry time"
            />
            <TextField
              label="Daily Out Time"
              optional
              name="preferredOutTime"
              placeholder="e.g. 07:30 AM"
              value={form.preferredOutTime}
              onChange={set('preferredOutTime')}
              hint="Calculates equipment congestion & gym peak hours"
            />
          </div>
        </Card>

        <Card title="Address & emergency contact">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextArea label="Address" optional name="address" className="sm:col-span-2" rows={2} value={form.address} onChange={set('address')} error={errors.address} />
            <TextField label="Emergency contact name" optional name="emergencyName" value={form.emergencyName} onChange={set('emergencyName')} />
            <TextField label="Emergency contact phone" optional name="emergencyPhone" type="tel" inputMode="tel" value={form.emergencyPhone} onChange={set('emergencyPhone')} error={errors.emergencyPhone} />
          </div>
        </Card>

        <Card
          title={editing ? "Membership Plan" : "Membership"}
          actions={<Switch size="sm" checked={withMembership} onChange={setWithMembership} label={<span className="sr-only">Assign membership now</span>} />}
        >
          {withMembership ? (
            <div className="space-y-5">
              <MembershipFields
                value={membership}
                onChange={onMembershipChange}
                plans={plans}
                errors={errors}
                symbol={symbol}
                money={money}
                currentPlanInfo={
                  editing && rawTrainee?.currentPlanName
                    ? {
                        planName: rawTrainee.currentPlanName,
                        expiry: rawTrainee.membershipExpiry,
                      }
                    : null
                }
              />
              {!editing && (
                <div className="rounded-xl border border-zinc-200 p-4">
                  <Switch checked={withPayment} onChange={setWithPayment} label="Record a payment now" description="Collect the first payment while adding the member." />
                  {withPayment && (
                    <div className="mt-4">
                      <PaymentFields value={payment} onChange={setPayment} errors={errors} symbol={symbol} showNotes={false} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">
              {editing
                ? "No membership plan currently assigned. Toggle the switch above to assign an active plan to this member."
                : "No membership will be assigned. You can start one later from the member’s profile."}
            </p>
          )}
        </Card>

        <Card title="Notes">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextArea label="Medical notes" optional name="medicalNotes" hint="Injuries, conditions, allergies" value={form.medicalNotes} onChange={set('medicalNotes')} error={errors.medicalNotes} />
            <TextArea label="Trainer notes" optional name="trainerNotes" hint="Goals, preferences, progress" value={form.trainerNotes} onChange={set('trainerNotes')} error={errors.trainerNotes} />
          </div>
        </Card>
      </div>

      <FormActions>
        <Button variant="secondary" onClick={() => navigate(-1)} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" loading={busy}>
          {editing ? 'Save changes' : 'Add member'}
        </Button>
      </FormActions>
    </form>
  );
}
