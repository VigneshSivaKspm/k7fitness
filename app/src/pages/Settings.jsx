import { useEffect, useState } from 'react';
import { History, KeyRound, ShieldCheck } from 'lucide-react';
import { Card, FormActions, PageHeader } from '../components/ui/Layout';
import Button from '../components/ui/Button';
import Tabs from '../components/ui/Tabs';
import Badge from '../components/ui/Badge';
import Switch from '../components/ui/Switch';
import Avatar from '../components/ui/Avatar';
import Pagination from '../components/ui/Pagination';
import ImageUpload from '../components/ui/ImageUpload';
import { EmptyState, ErrorState, SkeletonRows } from '../components/ui/Feedback';
import { SelectField, TextArea, TextField } from '../components/ui/Field';
import { saveGeneralSettings, listAdmins, updateAdmin } from '../services/settingsService';
import { saveSection } from '../services/websiteService';
import { listActivity } from '../services/activityService';
import { deleteFile } from '../services/storageService';
import { usePagedList } from '../hooks/usePagedList';
import { useAsync, useDocumentTitle } from '../hooks/useAsync';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { ADMIN_ROLES, CURRENCIES } from '../constants/options';
import { formatDateTime } from '../utils/dates';
import { normalizePhone } from '../utils/format';
import { collectErrors, focusFirstError, v } from '../utils/validation';
import { friendlyError } from '../utils/errors';

const PLACEHOLDERS = '{name} {fullName} {memberId} {plan} {expiryDate} {amount} {gymName}';

function GeneralSettings() {
  const { settings, business, reload } = useSettings();
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm({
      gymName: business.gymName || '',
      logo: business.logoUrl ? { url: business.logoUrl, path: business.logoPath } : null,
      phone: business.phone || '',
      whatsapp: business.whatsapp || '',
      email: business.email || '',
      address: business.address || '',
      currency: settings.currency,
      memberIdPrefix: settings.memberIdPrefix,
      expiryAlertDays: String(settings.expiryAlertDays),
      feeDueDays: String(settings.feeDueDays),
      receiptFooter: settings.receiptFooter || '',
      renewalTemplate: settings.renewalTemplate || '',
      paymentReminderTemplate: settings.paymentReminderTemplate || '',
      enquiryTemplate: settings.enquiryTemplate || '',
    });
  }, [settings, business]);

  if (!form) return null;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }));

  const save = async (e) => {
    e.preventDefault();
    if (busy) return;
    const errs = collectErrors(form, {
      gymName: [v.required('Gym name'), v.maxLength('Gym name', 80)],
      phone: [v.phone()],
      whatsapp: [v.phone('WhatsApp number')],
      email: [v.email()],
      memberIdPrefix: [v.required('Member ID prefix'), (x) => (/^[A-Za-z0-9]{1,6}$/.test(x) ? '' : 'Use 1–6 letters or numbers.')],
      expiryAlertDays: [v.required('Alert days'), v.number('Alert days', { integer: true, min: 1, max: 60 })],
      feeDueDays: [v.required('Fee due days'), v.number('Fee due days', { integer: true, min: 0, max: 90 })],
      receiptFooter: [v.maxLength('Receipt footer', 300)],
    });
    setErrors(errs);
    if (Object.keys(errs).length) return focusFirstError(errs);
    setBusy(true);
    try {
      const previousLogo = business.logoPath;
      await Promise.all([
        saveSection('contact', {
          gymName: form.gymName.trim(),
          logoUrl: form.logo?.url || '',
          logoPath: form.logo?.path || '',
          phone: form.phone.trim(),
          whatsapp: normalizePhone(form.whatsapp),
          email: form.email.trim(),
          address: form.address.trim(),
        }),
        saveGeneralSettings({
          currency: form.currency,
          memberIdPrefix: form.memberIdPrefix.toUpperCase(),
          expiryAlertDays: Number(form.expiryAlertDays),
          feeDueDays: Number(form.feeDueDays),
          receiptFooter: form.receiptFooter.trim(),
          renewalTemplate: form.renewalTemplate,
          paymentReminderTemplate: form.paymentReminderTemplate,
          enquiryTemplate: form.enquiryTemplate,
        }),
      ]);
      if (previousLogo && previousLogo !== form.logo?.path) {
        deleteFile(previousLogo).catch(() => {});
      }
      await reload();
      toast.success('Settings saved.');
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} noValidate className="space-y-5">
      <Card title="Business profile" description="Shown on receipts, printed charts and the public website.">
        <div className="grid gap-5 md:grid-cols-[200px_1fr]">
          <ImageUpload label="Logo" value={form.logo} onChange={set('logo')} folder="public/brand" aspect="aspect-square" maxSize={512} hint="Square PNG/WebP on a dark background works best." />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Gym name" required name="gymName" className="sm:col-span-2" value={form.gymName} onChange={set('gymName')} error={errors.gymName} />
            <TextField label="Phone" name="phone" type="tel" value={form.phone} onChange={set('phone')} error={errors.phone} />
            <TextField label="WhatsApp number" name="whatsapp" type="tel" value={form.whatsapp} onChange={set('whatsapp')} error={errors.whatsapp} />
            <TextField label="Email" name="email" type="email" className="sm:col-span-2" value={form.email} onChange={set('email')} error={errors.email} />
            <TextArea label="Business address" name="address" className="sm:col-span-2" rows={2} value={form.address} onChange={set('address')} />
          </div>
        </div>
      </Card>

      <Card title="Memberships & fees">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SelectField label="Currency" name="currency" options={CURRENCIES} value={form.currency} onChange={set('currency')} />
          <TextField label="Member ID prefix" name="memberIdPrefix" maxLength={6} value={form.memberIdPrefix} onChange={set('memberIdPrefix')} error={errors.memberIdPrefix} hint={`New IDs: ${(form.memberIdPrefix || 'K7').toUpperCase()}-0001`} />
          <TextField label="“Expiring soon” alert (days)" name="expiryAlertDays" type="number" min="1" value={form.expiryAlertDays} onChange={set('expiryAlertDays')} error={errors.expiryAlertDays} />
          <TextField label="Fee overdue after (days)" name="feeDueDays" type="number" min="0" value={form.feeDueDays} onChange={set('feeDueDays')} error={errors.feeDueDays} hint="Days after membership start" />
          <TextArea label="Receipt footer" name="receiptFooter" className="sm:col-span-2 lg:col-span-4" rows={2} value={form.receiptFooter} onChange={set('receiptFooter')} error={errors.receiptFooter} />
        </div>
      </Card>

      <Card title="WhatsApp message templates" description={`Placeholders: ${PLACEHOLDERS}`}>
        <div className="grid gap-4 lg:grid-cols-3">
          <TextArea label="Renewal reminder" rows={7} value={form.renewalTemplate} onChange={set('renewalTemplate')} />
          <TextArea label="Payment reminder" rows={7} value={form.paymentReminderTemplate} onChange={set('paymentReminderTemplate')} />
          <TextArea label="Enquiry follow-up" rows={7} value={form.enquiryTemplate} onChange={set('enquiryTemplate')} />
        </div>
      </Card>

      <FormActions>
        <Button type="submit" loading={busy}>
          Save settings
        </Button>
      </FormActions>
    </form>
  );
}

function AdminAccounts() {
  const { admin, isOwner, resetPassword } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const { data, loading, error, reload } = useAsync(() => listAdmins(), []);
  const [name, setName] = useState(admin?.name || '');
  const [savingName, setSavingName] = useState(false);

  const saveName = async () => {
    if (name.trim().length < 2) return toast.error('Please enter your name.');
    setSavingName(true);
    try {
      await updateAdmin(admin.uid, { name: name.trim() });
      toast.success('Your name has been updated. It will show after your next sign-in.');
      reload({ silent: true });
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setSavingName(false);
    }
  };

  const sendReset = async () => {
    try {
      await resetPassword(admin.email);
      toast.success(`Password reset link sent to ${admin.email}.`);
    } catch (err) {
      toast.error(friendlyError(err));
    }
  };

  const toggleActive = (a) =>
    confirm({
      title: a.active ? 'Disable this admin?' : 'Enable this admin?',
      message: a.active ? `${a.name || a.email} will be signed out and unable to access the admin panel.` : `${a.name || a.email} will regain access.`,
      confirmText: a.active ? 'Disable access' : 'Enable access',
      tone: a.active ? 'danger' : 'primary',
      onConfirm: async () => {
        await updateAdmin(a.uid, { active: !a.active });
        toast.success('Admin access updated.');
        reload({ silent: true });
      },
    });

  return (
    <div className="space-y-5">
      <Card title="Your account">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <TextField label="Display name" value={name} onChange={(e) => setName(e.target.value)} hint={admin?.email} />
          <Button variant="secondary" onClick={saveName} loading={savingName}>
            Save name
          </Button>
        </div>
        <div className="mt-5 flex flex-col gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-sm text-zinc-600">
            <KeyRound className="size-5 text-zinc-400" /> Change your password via a secure email link.
          </div>
          <Button variant="secondary" onClick={sendReset}>
            Send password reset email
          </Button>
        </div>
      </Card>

      <Card title="Admin accounts" description="Staff who can sign in to this panel." bodyClassName="">
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading && !data ? (
          <SkeletonRows rows={2} />
        ) : (
          <ul className="divide-y divide-zinc-100">
            {(data || []).map((a) => (
              <li key={a.uid} className="flex items-center gap-3 px-5 py-3.5">
                <Avatar name={a.name || a.email} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {a.name || '—'} {a.uid === admin.uid && <span className="font-normal text-zinc-400">(you)</span>}
                  </p>
                  <p className="truncate text-xs text-zinc-500">{a.email}</p>
                </div>
                <Badge tone={a.role === 'owner' ? 'dark' : 'neutral'}>{ADMIN_ROLES[a.role] || a.role}</Badge>
                {isOwner && a.uid !== admin.uid && <Switch size="sm" checked={a.active} onChange={() => toggleActive(a)} label={<span className="sr-only">Access</span>} />}
              </li>
            ))}
          </ul>
        )}
        <p className="flex items-start gap-2 border-t border-zinc-100 px-5 py-4 text-xs text-zinc-500">
          <ShieldCheck className="size-4 shrink-0 text-zinc-400" />
          For security, new admin accounts are created by the owner using the setup script described in the README. There is no public sign-up.
        </p>
      </Card>
    </div>
  );
}

function ActivityLog() {
  const list = usePagedList(({ cursor }) => listActivity({ cursor, pageSize: 25 }), []);
  return (
    <Card title="Activity log" description="Recent actions by staff (append-only)." bodyClassName="">
      {list.error ? (
        <ErrorState message={list.error} onRetry={list.reload} />
      ) : list.loading && !list.items.length ? (
        <SkeletonRows rows={5} />
      ) : !list.items.length ? (
        <EmptyState icon={History} title="No activity yet" />
      ) : (
        <ul className="divide-y divide-zinc-100">
          {list.items.map((log) => (
            <li key={log.id} className="flex flex-col gap-0.5 px-5 py-3 sm:flex-row sm:items-center sm:gap-4">
              <p className="min-w-0 flex-1 text-sm">
                <span className="font-semibold text-zinc-900">{log.adminName}</span> <span className="text-zinc-600">{log.action.toLowerCase()}</span>
                {log.details && <span className="text-zinc-500"> · {log.details}</span>}
              </p>
              <p className="shrink-0 text-xs text-zinc-400">{formatDateTime(log.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
      <Pagination page={list.page} hasPrev={list.hasPrev} hasNext={list.hasMore} onPrev={list.prev} onNext={list.next} loading={list.loading} />
    </Card>
  );
}

export default function Settings() {
  useDocumentTitle('Settings');
  const [tab, setTab] = useState('general');
  return (
    <>
      <PageHeader title="Settings" description="Business details, membership rules, message templates and staff access." />
      <Tabs
        className="mb-5"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'general', label: 'General' },
          { value: 'admins', label: 'Account & admins' },
          { value: 'activity', label: 'Activity log' },
        ]}
      />
      {tab === 'general' && <GeneralSettings />}
      {tab === 'admins' && <AdminAccounts />}
      {tab === 'activity' && <ActivityLog />}
    </>
  );
}
