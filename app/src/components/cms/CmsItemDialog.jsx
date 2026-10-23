import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Switch from '../ui/Switch';
import ImageUpload from '../ui/ImageUpload';
import ListEditor from '../ui/ListEditor';
import { TextArea, TextField } from '../ui/Field';
import { createItem, updateItem } from '../../services/websiteService';
import { useToast } from '../../context/ToastContext';
import { parseDateInput, startOfDay, toDateInput, todayInput, addDays, toTimestamp } from '../../utils/dates';
import { focusFirstError, v } from '../../utils/validation';
import { friendlyError } from '../../utils/errors';

function initialValues(config, item) {
  const values = { active: item ? item.active !== false : true };
  for (const f of config.fields) {
    if (f.type === 'image') values[f.key] = item?.[f.urlKey] ? { url: item[f.urlKey], path: item[f.pathKey] || '' } : null;
    else if (f.type === 'list') values[f.key] = item?.[f.key] || [];
    else if (f.type === 'date') values[f.key] = item?.[f.key] ? toDateInput(item[f.key]) : f.key === 'endDate' ? toDateInput(addDays(new Date(), 30)) : todayInput();
    else if (f.type === 'rating') values[f.key] = item?.[f.key] ?? f.defaultValue ?? 5;
    else values[f.key] = item?.[f.key] ?? '';
  }
  return values;
}

function validate(config, values) {
  const errors = {};
  for (const f of config.fields) {
    const val = values[f.key];
    let msg = '';
    if (f.required && f.type !== 'image') msg = v.required(f.label)(val);
    if (!msg && f.max) msg = v.maxLength(f.label, f.max)(val);
    if (!msg && f.type === 'url') msg = v.url(f.label)(val);
    if (!msg && f.type === 'link') msg = v.link(f.label)(val);
    if (!msg && f.type === 'date') msg = v.date(f.label)(val);
    if (!msg && f.after && parseDateInput(val) && parseDateInput(values[f.after]) && parseDateInput(val) < parseDateInput(values[f.after])) {
      msg = `${f.label} cannot be before the start date.`;
    }
    if (msg) errors[f.key] = msg;
  }
  return errors;
}

function toDoc(config, values) {
  const data = { active: values.active };
  for (const f of config.fields) {
    const val = values[f.key];
    if (f.type === 'image') {
      data[f.urlKey] = val?.url || '';
      data[f.pathKey] = val?.path || '';
    } else if (f.type === 'date') data[f.key] = toTimestamp(startOfDay(parseDateInput(val)));
    else if (f.type === 'rating') data[f.key] = Number(val) || 5;
    else if (f.type === 'list') data[f.key] = val;
    else data[f.key] = String(val || '').trim();
  }
  return data;
}

function RatingInput({ value, onChange }) {
  return (
    <div>
      <p className="label">Rating</p>
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => onChange(n)} className="rounded p-1 transition hover:scale-110">
            <Star className={`size-7 ${n <= value ? 'fill-brand text-brand' : 'text-zinc-300'}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CmsItemDialog({ config, item, open, onClose, onSaved, nextOrder }) {
  const toast = useToast();
  const [values, setValues] = useState(() => initialValues(config, item));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(initialValues(config, item));
      setErrors({});
    }
  }, [open, item, config]);

  const set = (k) => (e) => setValues((s) => ({ ...s, [k]: e?.target ? e.target.value : e }));
  const imageField = config.fields.find((f) => f.type === 'image');
  const otherFields = config.fields.filter((f) => f.type !== 'image');

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const errs = validate(config, values);
    setErrors(errs);
    if (Object.keys(errs).length) return focusFirstError(errs);
    setBusy(true);
    try {
      const data = toDoc(config, values);
      if (item) await updateItem(config.collection, item.id, data, { previousImagePath: imageField ? item[imageField.pathKey] : undefined });
      else await createItem(config.collection, data, nextOrder);
      toast.success('Website content updated successfully.');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const renderField = (f) => {
    const common = { label: f.label, name: f.key, required: f.required, error: errors[f.key], placeholder: f.placeholder };
    switch (f.type) {
      case 'textarea':
        return <TextArea key={f.key} {...common} rows={3} maxLength={f.max} value={values[f.key]} onChange={set(f.key)} className="sm:col-span-2" />;
      case 'list':
        return (
          <div key={f.key} className="sm:col-span-2">
            <ListEditor label={f.label} items={values[f.key]} onChange={set(f.key)} placeholder={f.placeholder} />
          </div>
        );
      case 'rating':
        return <RatingInput key={f.key} value={Number(values[f.key])} onChange={set(f.key)} />;
      case 'date':
        return <TextField key={f.key} {...common} type="date" value={values[f.key]} onChange={set(f.key)} />;
      case 'url':
      case 'link':
        return <TextField key={f.key} {...common} type={f.type === 'url' ? 'url' : 'text'} inputMode="url" value={values[f.key]} onChange={set(f.key)} className="sm:col-span-2" />;
      default:
        return <TextField key={f.key} {...common} maxLength={f.max} value={values[f.key]} onChange={set(f.key)} className={f.key === config.titleKey ? 'sm:col-span-2' : ''} />;
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      as="form"
      onSubmit={submit}
      size="lg"
      title={item ? `Edit ${config.singular}` : `Add ${config.singular}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            {item ? 'Save changes' : `Add ${config.singular}`}
          </Button>
        </>
      }
    >
      <div className={`grid gap-5 ${imageField ? 'md:grid-cols-[220px_1fr]' : ''}`}>
        {imageField && (
          <ImageUpload
            label={`${imageField.label}${imageField.optional ? ' (optional)' : ''}`}
            value={values[imageField.key]}
            onChange={set(imageField.key)}
            folder={imageField.folder}
            aspect={imageField.aspect}
            maxSize={imageField.maxSize}
          />
        )}
        <div className="grid content-start gap-4 sm:grid-cols-2">
          {otherFields.map(renderField)}
          <Switch className="sm:col-span-2" checked={values.active} onChange={set('active')} label="Show on website" description="Turn off to hide without deleting." />
        </div>
      </div>
    </Modal>
  );
}
