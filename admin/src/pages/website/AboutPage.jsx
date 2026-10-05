import { Plus, Trash2 } from 'lucide-react';
import { Card } from '../../components/ui/Layout';
import Button from '../../components/ui/Button';
import Switch from '../../components/ui/Switch';
import ImageUpload from '../../components/ui/ImageUpload';
import ListEditor from '../../components/ui/ListEditor';
import ReorderButtons, { moveItem } from '../../components/ui/ReorderButtons';
import { TextArea, TextField } from '../../components/ui/Field';
import SectionShell from '../../components/cms/SectionShell';
import { useSectionForm } from '../../hooks/useSectionForm';
import { useDocumentTitle } from '../../hooks/useAsync';
import { FACILITY_ICONS } from '../../constants/icons';
import { uid } from '../../utils/format';
import { collectErrors, v } from '../../utils/validation';

const DEFAULTS = {
  eyebrow: 'About K7',
  heading: 'Built for people who show up',
  description: '',
  mission: '',
  vision: '',
  images: [{ url: '/images/about-main.webp', path: '' }, { url: '/images/about-detail.webp', path: '' }],
  stats: [],
  benefits: [],
  facilities: [],
};

const SCHEMA = {
  heading: [v.required('Heading'), v.maxLength('Heading', 80)],
  description: [v.maxLength('Description', 1500)],
  mission: [v.maxLength('Mission', 400)],
  vision: [v.maxLength('Vision', 400)],
};

function validate(form) {
  const errors = collectErrors(form, SCHEMA);
  form.stats.forEach((s, i) => {
    if (!s.label.trim() || !String(s.value).trim()) errors[`stat-${i}`] = 'Each statistic needs a label and a value.';
  });
  form.facilities.forEach((f) => {
    if (!f.title.trim()) errors[`facility-${f.id}`] = 'Facility title is required.';
  });
  return errors;
}

function IconPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Icon">
      {FACILITY_ICONS.map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={value === key}
          aria-label={label}
          title={label}
          onClick={() => onChange(key)}
          className={`flex size-9 items-center justify-center rounded-lg transition ${value === key ? 'bg-brand text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
        >
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  );
}

export default function AboutPage() {
  useDocumentTitle('Website: About');
  const section = useSectionForm('about', {
    defaults: DEFAULTS,
    toForm: (d) => ({
      ...d,
      image1: d.images?.[0]?.url ? d.images[0] : null,
      image2: d.images?.[1]?.url ? d.images[1] : null,
      stats: (d.stats || []).map((s) => ({ label: s.label || '', value: String(s.value ?? ''), suffix: s.suffix || '' })),
      facilities: (d.facilities || []).map((f) => ({ id: f.id || uid(), title: f.title || '', description: f.description || '', icon: f.icon || 'dumbbell', active: f.active !== false })),
      benefits: d.benefits || [],
    }),
    toDoc: (f) => ({
      eyebrow: f.eyebrow.trim(),
      heading: f.heading.trim(),
      description: f.description.trim(),
      mission: f.mission.trim(),
      vision: f.vision.trim(),
      images: [f.image1, f.image2].filter((i) => i?.url).map((i) => ({ url: i.url, path: i.path || '' })),
      stats: f.stats.map((s) => ({ label: s.label.trim(), value: String(s.value).trim(), suffix: s.suffix.trim() })),
      benefits: f.benefits,
      facilities: f.facilities.map((x) => ({ ...x, title: x.title.trim(), description: x.description.trim() })),
    }),
    validate,
    imagePaths: (d) => (d.images || []).map((i) => i.path),
  });
  const { form, setForm, set, errors } = section;

  const setStat = (i, key, value) => setForm((f) => ({ ...f, stats: f.stats.map((s, j) => (j === i ? { ...s, [key]: value } : s)) }));
  const setFacility = (id, patch) => setForm((f) => ({ ...f, facilities: f.facilities.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));

  return (
    <SectionShell title="About section" description="Your story, statistics and facilities." anchor="about" section={section}>
      {form && (
        <>
          <Card title="Introduction">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Small heading" name="eyebrow" value={form.eyebrow} onChange={set('eyebrow')} />
              <TextField label="Heading" required name="heading" value={form.heading} onChange={set('heading')} error={errors.heading} />
              <TextArea label="Gym introduction" name="description" className="sm:col-span-2" rows={5} value={form.description} onChange={set('description')} error={errors.description} hint="The About section appears on the website once this, statistics or facilities are filled in." />
              <TextArea label="Mission" optional name="mission" rows={3} value={form.mission} onChange={set('mission')} error={errors.mission} />
              <TextArea label="Vision" optional name="vision" rows={3} value={form.vision} onChange={set('vision')} error={errors.vision} />
            </div>
          </Card>

          <Card title="Images">
            <div className="grid gap-4 sm:grid-cols-2">
              <ImageUpload label="Main image" value={form.image1} onChange={set('image1')} folder="public/about" aspect="aspect-[4/3]" />
              <ImageUpload label="Secondary image (optional)" value={form.image2} onChange={set('image2')} folder="public/about" aspect="aspect-[4/3]" maxSize={1000} />
            </div>
          </Card>

          <Card
            title="Statistics"
            description="Up to 4 numbers, e.g. 500+ Members, 8 Trainers, 10 Years."
            actions={
              form.stats.length < 4 && (
                <Button size="sm" variant="secondary" icon={Plus} onClick={() => setForm((f) => ({ ...f, stats: [...f.stats, { label: '', value: '', suffix: '' }] }))}>
                  Add statistic
                </Button>
              )
            }
          >
            {!form.stats.length ? (
              <p className="text-sm text-zinc-500">No statistics yet.</p>
            ) : (
              <div className="space-y-3">
                {form.stats.map((s, i) => (
                  <div key={i}>
                    <div className="grid grid-cols-[1fr_5rem_4rem_auto] items-center gap-2">
                      <input className="input" name={`stat-${i}`} placeholder="Label (e.g. Members)" value={s.label} onChange={(e) => setStat(i, 'label', e.target.value)} aria-label="Statistic label" />
                      <input className="input" placeholder="500" value={s.value} onChange={(e) => setStat(i, 'value', e.target.value)} aria-label="Statistic value" />
                      <input className="input" placeholder="+" maxLength={4} value={s.suffix} onChange={(e) => setStat(i, 'suffix', e.target.value)} aria-label="Suffix" />
                      <Button size="icon-sm" variant="danger-ghost" icon={Trash2} aria-label="Remove statistic" onClick={() => setForm((f) => ({ ...f, stats: f.stats.filter((_, j) => j !== i) }))} />
                    </div>
                    {errors[`stat-${i}`] && <p className="mt-1 text-xs text-red-600">{errors[`stat-${i}`]}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Benefits" description="Short checklist shown next to the introduction.">
            <ListEditor items={form.benefits} onChange={set('benefits')} placeholder="e.g. Certified trainers" max={10} />
          </Card>

          <Card
            title="Facilities"
            description="e.g. Strength Training, Cardio, Personal Training, Functional Training."
            actions={
              <Button
                size="sm"
                variant="secondary"
                icon={Plus}
                onClick={() => setForm((f) => ({ ...f, facilities: [...f.facilities, { id: uid(), title: '', description: '', icon: 'dumbbell', active: true }] }))}
              >
                Add facility
              </Button>
            }
          >
            {!form.facilities.length ? (
              <p className="text-sm text-zinc-500">No facilities yet.</p>
            ) : (
              <div className="space-y-3">
                {form.facilities.map((fac, i) => (
                  <div key={fac.id} className={`rounded-xl border border-zinc-200 p-4 ${fac.active ? '' : 'bg-zinc-50 opacity-70'}`}>
                    <div className="flex items-start gap-2">
                      <div className="grid min-w-0 flex-1 gap-3">
                        <input
                          className="input font-semibold"
                          name={`facility-${fac.id}`}
                          placeholder="Title (e.g. Cardio Zone)"
                          value={fac.title}
                          onChange={(e) => setFacility(fac.id, { title: e.target.value })}
                          aria-label="Facility title"
                          aria-invalid={Boolean(errors[`facility-${fac.id}`])}
                        />
                        <textarea className="input min-h-16" rows={2} placeholder="Short description" value={fac.description} maxLength={200} onChange={(e) => setFacility(fac.id, { description: e.target.value })} aria-label="Facility description" />
                        <IconPicker value={fac.icon} onChange={(icon) => setFacility(fac.id, { icon })} />
                        {errors[`facility-${fac.id}`] && <p className="text-xs text-red-600">{errors[`facility-${fac.id}`]}</p>}
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <ReorderButtons index={i} count={form.facilities.length} onMove={(idx, dir) => setForm((f) => ({ ...f, facilities: moveItem(f.facilities, idx, dir) }))} label="facility" />
                        <Switch size="sm" checked={fac.active} onChange={(active) => setFacility(fac.id, { active })} label={<span className="sr-only">Show</span>} />
                        <Button size="icon-sm" variant="danger-ghost" icon={Trash2} aria-label="Remove facility" onClick={() => setForm((f) => ({ ...f, facilities: f.facilities.filter((x) => x.id !== fac.id) }))} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </SectionShell>
  );
}
