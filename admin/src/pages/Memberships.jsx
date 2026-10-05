import { useEffect, useState } from 'react';
import { ExternalLink, Globe, IdCard, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/ui/Layout';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Switch from '../components/ui/Switch';
import ListEditor from '../components/ui/ListEditor';
import DropdownMenu from '../components/ui/DropdownMenu';
import ReorderButtons, { moveItem } from '../components/ui/ReorderButtons';
import { EmptyState, ErrorState, SkeletonRows } from '../components/ui/Feedback';
import { MoneyField, SelectField, TextArea, TextField } from '../components/ui/Field';
import { createItem, reorderItems, setItemFields, updateItem, deleteItem } from '../services/websiteService';
import { countMembersOnPlan } from '../services/membershipService';
import { usePlans } from '../hooks/usePlans';
import { useDocumentTitle } from '../hooks/useAsync';
import { useSettings } from '../context/SettingsContext';
import { useConfirm } from '../context/ConfirmContext';
import { useToast } from '../context/ToastContext';
import { DURATION_UNITS } from '../constants/options';
import { durationLabel } from '../utils/format';
import { collectErrors, focusFirstError, v } from '../utils/validation';
import { friendlyError } from '../utils/errors';

const EMPTY = { name: '', duration: '1', durationUnit: 'months', price: '', description: '', features: [], active: true, showOnWebsite: true, recommended: false };

const SCHEMA = {
  name: [v.required('Plan name'), v.minLength('Plan name', 2), v.maxLength('Plan name', 60)],
  duration: [v.required('Duration'), v.number('Duration', { integer: true, positive: true, max: 3650 })],
  price: [v.required('Price'), v.number('Price', { min: 0, max: 10000000 })],
  description: [v.maxLength('Description', 200)],
};

const toForm = (plan) =>
  plan ? { ...EMPTY, ...plan, duration: String(plan.duration), price: String(plan.price), features: plan.features || [] } : EMPTY;

function PlanDialog({ plan, open, onClose, onSaved, nextOrder }) {
  const { symbol } = useSettings();
  const toast = useToast();
  const [form, setForm] = useState(() => toForm(plan));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(toForm(plan));
  }, [open, plan]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }));

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const errs = collectErrors(form, SCHEMA);
    setErrors(errs);
    if (Object.keys(errs).length) return focusFirstError(errs);
    setBusy(true);
    const data = {
      name: form.name.trim(),
      duration: Number(form.duration),
      durationUnit: form.durationUnit,
      price: Number(form.price),
      description: form.description.trim(),
      features: form.features,
      active: form.active,
      showOnWebsite: form.showOnWebsite,
      recommended: form.recommended,
    };
    try {
      if (plan) await updateItem('membershipPlans', plan.id, data);
      else await createItem('membershipPlans', data, nextOrder);
      toast.success(plan ? 'Membership plan updated.' : 'Membership plan created.');
      onSaved();
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
      title={plan ? 'Edit membership plan' : 'New membership plan'}
      description="Used for member sign-ups and renewals, and shown on the website when enabled."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            {plan ? 'Save plan' : 'Create plan'}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Plan name" required name="name" className="sm:col-span-2" placeholder="e.g. Quarterly" value={form.name} onChange={set('name')} error={errors.name} />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Duration" required name="duration" type="number" inputMode="numeric" min="1" value={form.duration} onChange={set('duration')} error={errors.duration} />
          <SelectField label="Unit" name="durationUnit" options={DURATION_UNITS} value={form.durationUnit} onChange={set('durationUnit')} />
        </div>
        <MoneyField label="Price" required name="price" symbol={symbol} value={form.price} onChange={set('price')} error={errors.price} />
        <TextArea label="Short description" optional name="description" className="sm:col-span-2" rows={2} value={form.description} onChange={set('description')} error={errors.description} />
        <div className="sm:col-span-2">
          <ListEditor label="Features" items={form.features} onChange={set('features')} placeholder="e.g. Full gym access" hint="Shown as a checklist on the website pricing card." />
        </div>
        <div className="space-y-4 rounded-xl border border-zinc-200 p-4 sm:col-span-2">
          <Switch checked={form.active} onChange={set('active')} label="Active" description="Inactive plans can't be used for new memberships or renewals." />
          <Switch checked={form.showOnWebsite} onChange={set('showOnWebsite')} label="Show on website" description="Display this plan in the website’s pricing section." />
          <Switch checked={form.recommended} onChange={set('recommended')} label="Recommended" description="Highlights the plan with a “Popular” badge." />
        </div>
      </div>
    </Modal>
  );
}

/** Membership plans. The same collection powers the CRM and the public website (no duplicates). */
export default function Memberships({ website = false }) {
  useDocumentTitle('Membership plans');
  const { money } = useSettings();
  const confirm = useConfirm();
  const toast = useToast();
  const { plans, loading, error, reload } = usePlans();
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [order, setOrder] = useState(null);
  const list = order || plans;

  useEffect(() => setOrder(null), [plans]);

  const toggle = async (plan, field) => {
    try {
      await setItemFields('membershipPlans', plan.id, { [field]: !plan[field] });
      toast.success(field === 'showOnWebsite' ? 'Website content updated successfully.' : 'Plan updated.');
      reload();
    } catch (err) {
      toast.error(friendlyError(err));
    }
  };

  const move = async (index, dir) => {
    const next = moveItem(list, index, dir);
    setOrder(next);
    try {
      await reorderItems('membershipPlans', next);
    } catch (err) {
      toast.error(friendlyError(err));
      setOrder(null);
    }
  };

  const remove = async (plan) => {
    let members = 0;
    try {
      members = await countMembersOnPlan(plan.id);
    } catch (err) {
      return toast.error(friendlyError(err));
    }
    if (members > 0) {
      return confirm({
        title: 'Plan is in use',
        message: `${members} active member${members === 1 ? ' is' : 's are'} on “${plan.name}”. Disable the plan instead. Existing memberships keep working and the plan can't be chosen for new ones.`,
        confirmText: 'Disable plan',
        tone: 'primary',
        onConfirm: async () => {
          await setItemFields('membershipPlans', plan.id, { active: false, showOnWebsite: false });
          toast.success('Plan disabled.');
          reload();
        },
      });
    }
    return confirm({
      title: 'Delete plan?',
      message: `“${plan.name}” will be removed. Past memberships keep their plan name in history.`,
      confirmText: 'Delete plan',
      onConfirm: async () => {
        await deleteItem('membershipPlans', plan);
        toast.success('Plan deleted.');
        reload();
      },
    });
  };

  return (
    <>
      <PageHeader
        title={website ? 'Website: membership plans' : 'Memberships'}
        description={
          website
            ? 'Choose which plans appear on the website. These are the same plans used for member sign-ups.'
            : 'Plans used for new members and renewals. Toggle “Website” to show a plan publicly.'
        }
        actions={
          <Button icon={Plus} onClick={() => setCreating(true)}>
            Add plan
          </Button>
        }
      />

      <div className="card overflow-hidden">
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading && !plans.length ? (
          <SkeletonRows rows={4} />
        ) : !list.length ? (
          <EmptyState
            icon={IdCard}
            title="No membership plans yet"
            description="Create plans like Monthly, Quarterly or Yearly. They’ll be available for members and on your website."
            action={
              <Button icon={Plus} onClick={() => setCreating(true)}>
                Create first plan
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-zinc-100">
            {list.map((plan, i) => (
              <li key={plan.id} className={`flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5 ${plan.active ? '' : 'bg-zinc-50/60'}`}>
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <ReorderButtons index={i} count={list.length} onMove={move} label={plan.name} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={`font-semibold ${plan.active ? 'text-zinc-900' : 'text-zinc-500'}`}>{plan.name}</p>
                      {plan.recommended && (
                        <Badge tone="brand">
                          <Star className="size-3" /> Popular
                        </Badge>
                      )}
                      {!plan.active && <Badge>Inactive</Badge>}
                    </div>
                    <p className="text-sm text-zinc-500">
                      <span className="tabular font-semibold text-zinc-800">{money(plan.price)}</span> · {durationLabel(plan.duration, plan.durationUnit)}
                      {plan.features?.length ? ` · ${plan.features.length} features` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-5 pl-14 sm:pl-0">
                  <Switch size="sm" checked={plan.showOnWebsite} onChange={() => toggle(plan, 'showOnWebsite')} label={<span className="text-xs text-zinc-500">Website</span>} disabled={!plan.active} />
                  <Switch size="sm" checked={plan.active} onChange={() => toggle(plan, 'active')} label={<span className="text-xs text-zinc-500">Active</span>} />
                  <DropdownMenu
                    items={[
                      { label: 'Edit plan', icon: Pencil, onClick: () => setEditing(plan) },
                      { label: plan.recommended ? 'Remove “Popular”' : 'Mark as popular', icon: Star, onClick: () => toggle(plan, 'recommended') },
                      { divider: true },
                      { label: 'Delete', icon: Trash2, tone: 'danger', onClick: () => remove(plan) },
                    ]}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {website && import.meta.env.VITE_WEBSITE_URL && (
        <p className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
          <Globe className="size-4" /> Changes appear on the website immediately.
          <a href={`${import.meta.env.VITE_WEBSITE_URL}#membership`} target="_blank" rel="noreferrer" className="link inline-flex items-center gap-1">
            Preview <ExternalLink className="size-3.5" />
          </a>
        </p>
      )}

      <PlanDialog
        key={editing?.id || (creating ? 'new' : 'closed')}
        plan={editing}
        open={creating || Boolean(editing)}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSaved={reload}
        nextOrder={plans.reduce((m, p) => Math.max(m, (p.displayOrder ?? 0) + 1), 0)}
      />
    </>
  );
}
