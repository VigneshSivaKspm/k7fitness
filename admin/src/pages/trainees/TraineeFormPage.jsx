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
import { usePlans } from '../../hooks/usePlans';
import { useDocumentTitle } from '../../hooks/useAsync';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { GENDERS } from '../../constants/options';
import { todayInput, toDateInput, parseDateInput } from '../../utils/dates';
import { collectErrors, focusFirstError, v } from '../../utils/validation';
import { friendlyError } from '../../utils/errors';

const EMPTY = {
  fullName: '',
  phone: '',
  altPhone: '',
  email: '',
  gender: '',
  dob: '',
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
    fullName: t.fullName || '',
    phone: t.phone || '',
    altPhone: t.altPhone || '',
    email: t.email || '',
    gender: t.gender || '',
    dob: toDateInput(t.dob),
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
  useDocumentTitle(editing ? 'Edit trainee' : 'Add trainee');
  const navigate = useNavigate();
  const toast = useToast();
  const { settings, money, symbol } = useSettings();
  const { plans } = usePlans({ activeOnly: true });

  const location = useLocation();
  // Prefill from an enquiry ("Add as trainee").
  const [form, setForm] = useState(() => ({ ...EMPTY, ...(editing ? {} : location.state?.prefill) }));
  const [loadState, setLoadState] = useState({ loading: editing, error: '' });
  const [withMembership, setWithMembership] = useState(true);
  const [membership, setMembership] = useState({ planId: '', startDate: todayInput(), fee: '' });
  const [withPayment, setWithPayment] = useState(false);
  const [payment, setPayment] = useState(emptyPayment());
  const [errors, setErrors] = useState({});
  const [duplicate, setDuplicate] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editing) return;
    getTrainee(id)
      .then((t) => {
        if (!t) setLoadState({ loading: false, error: 'This trainee could not be found.' });
        else {
          setForm(fromTrainee(t));
          setLoadState({ loading: false, error: '' });
        }
      })
      .catch((err) => setLoadState({ loading: false, error: friendlyError(err) }));
  }, [editing, id]);

  const set = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((f) => ({ ...f, [key]: value }));
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
    if (next.fee !== membership.fee) setPayment((p) => ({ ...p, amount: next.fee }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const errs = collectErrors(form, SCHEMA);
    const joining = parseDateInput(form.joiningDate);
    if (joining && joining > new Date()) errs.joiningDate = 'Joining date cannot be in the future.';
    if (!editing && withMembership) {
      Object.assign(errs, validateMembership(membership, plans));
      if (withPayment) Object.assign(errs, validatePayment(payment, Number(membership.fee) || 0));
    }
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error('Please fix the highlighted fields.');
      return focusFirstError(errs);
    }

    setBusy(true);
    try {
      if (editing) {
        await updateTrainee(id, form);
        toast.success('Trainee updated successfully.');
        navigate(`/trainees/${id}`);
      } else {
        const plan = plans.find((p) => p.id === membership.planId);
        const res = await createTrainee(form, {
          membership: withMembership ? { plan, startDate: membership.startDate, fee: Number(membership.fee) } : null,
          payment: withMembership && withPayment && Number(payment.amount) > 0 ? payment : null,
          settings,
        });
        toast.success(`Trainee added successfully. Member ID ${res.memberId}.`);
        navigate(`/trainees/${res.id}`, { replace: true });
      }
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  if (loadState.loading) return <PageLoader />;
  if (loadState.error) return <ErrorState message={loadState.error} />;

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-4xl">
      <PageHeader
        back={{ to: editing ? `/trainees/${id}` : '/trainees', label: editing ? 'Back to profile' : 'Trainees' }}
        title={editing ? `Edit ${form.fullName || 'trainee'}` : 'Add trainee'}
        description={editing ? 'Update personal details. Use Renew or Adjust on the profile to change memberships.' : 'A member ID is generated automatically.'}
      />

      <div className="space-y-5">
        <Card title="Personal details">
          <div className="grid gap-5 md:grid-cols-[auto_1fr]">
            <ImageUpload value={form.photo} onChange={set('photo')} folder="private/trainees" round maxSize={600} label="Photo" />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Full name" required name="fullName" autoComplete="off" className="sm:col-span-2" value={form.fullName} onChange={set('fullName')} error={errors.fullName} />
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
                    <a href={`/trainees/${duplicate.id}`} target="_blank" rel="noreferrer" className="font-semibold underline">
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

        <Card title="Address & emergency contact">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextArea label="Address" optional name="address" className="sm:col-span-2" rows={2} value={form.address} onChange={set('address')} error={errors.address} />
            <TextField label="Emergency contact name" optional name="emergencyName" value={form.emergencyName} onChange={set('emergencyName')} />
            <TextField label="Emergency contact phone" optional name="emergencyPhone" type="tel" inputMode="tel" value={form.emergencyPhone} onChange={set('emergencyPhone')} error={errors.emergencyPhone} />
          </div>
        </Card>

        {!editing && (
          <Card
            title="Membership"
            actions={<Switch size="sm" checked={withMembership} onChange={setWithMembership} label={<span className="sr-only">Assign membership now</span>} />}
          >
            {withMembership ? (
              <div className="space-y-5">
                <MembershipFields value={membership} onChange={onMembershipChange} plans={plans} errors={errors} symbol={symbol} money={money} />
                <div className="rounded-xl border border-zinc-200 p-4">
                  <Switch checked={withPayment} onChange={setWithPayment} label="Record a payment now" description="Collect the first payment while adding the member." />
                  {withPayment && (
                    <div className="mt-4">
                      <PaymentFields value={payment} onChange={setPayment} errors={errors} symbol={symbol} showNotes={false} />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No membership will be assigned. You can start one later from the trainee’s profile.</p>
            )}
          </Card>
        )}

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
          {editing ? 'Save changes' : 'Add trainee'}
        </Button>
      </FormActions>
    </form>
  );
}
