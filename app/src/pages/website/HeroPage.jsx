import { Card } from '../../components/ui/Layout';
import Switch from '../../components/ui/Switch';
import ImageUpload from '../../components/ui/ImageUpload';
import { TextArea, TextField } from '../../components/ui/Field';
import SectionShell from '../../components/cms/SectionShell';
import { useSectionForm } from '../../hooks/useSectionForm';
import { useDocumentTitle } from '../../hooks/useAsync';
import { collectErrors, v } from '../../utils/validation';
import { mediaUrl } from '../../utils/format';

const DEFAULTS = {
  eyebrow: 'K7 Fitness Studio & Gym',
  heading: 'Train hard.\nLive strong.',
  highlight: 'Live strong.',
  subtitle: 'Strength, conditioning and real coaching under one roof. Build your strongest self with programs designed around your goals.',
  primaryCtaText: 'Join now',
  primaryCtaLink: '#contact',
  secondaryCtaText: 'View memberships',
  secondaryCtaLink: '#membership',
  imageUrl: '/images/hero.webp',
  imagePath: '',
  showBadge: false,
  badgeText: '',
};

const SCHEMA = {
  heading: [v.required('Main heading'), v.maxLength('Main heading', 80)],
  highlight: [v.maxLength('Highlighted words', 40)],
  subtitle: [v.maxLength('Subtitle', 260)],
  primaryCtaText: [v.required('Button text'), v.maxLength('Button text', 30)],
  primaryCtaLink: [v.required('Button link'), v.link('Button link')],
  secondaryCtaText: [v.maxLength('Secondary button text', 30)],
  secondaryCtaLink: [v.link('Secondary button link')],
  badgeText: [(x, f) => (f.showBadge && !String(x || '').trim() ? 'Enter the badge text or turn the badge off.' : ''), v.maxLength('Badge text', 60)],
};

function Preview({ form }) {
  const heading = form.heading || '';
  const idx = form.highlight ? heading.toLowerCase().indexOf(form.highlight.toLowerCase()) : -1;
  return (
    <div className="relative overflow-hidden rounded-xl bg-[#050505] p-6 text-white">
      {form.image?.url && <img src={mediaUrl(form.image.url)} alt="" className="absolute inset-0 size-full object-cover opacity-40" />}
      <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent" />
      <div className="relative">
        {form.showBadge && form.badgeText && <span className="mb-3 inline-block rounded-full bg-brand px-2.5 py-0.5 text-[0.65rem] font-bold uppercase">{form.badgeText}</span>}
        <p className="text-[0.6rem] font-bold tracking-[0.25em] text-brand-bright uppercase">{form.eyebrow}</p>
        <p className="mt-2 font-display text-4xl leading-[0.95] tracking-wide whitespace-pre-line uppercase">
          {idx >= 0 ? (
            <>
              {heading.slice(0, idx)}
              <span className="text-brand-bright">{heading.slice(idx, idx + form.highlight.length)}</span>
              {heading.slice(idx + form.highlight.length)}
            </>
          ) : (
            heading
          )}
        </p>
        <p className="mt-2 max-w-sm text-xs text-zinc-300">{form.subtitle}</p>
        <div className="mt-4 flex gap-2">
          <span className="rounded-md bg-brand px-3 py-1.5 text-[0.65rem] font-bold uppercase">{form.primaryCtaText || 'Join now'}</span>
          {form.secondaryCtaText && <span className="rounded-md border border-white/60 px-3 py-1.5 text-[0.65rem] font-bold uppercase">{form.secondaryCtaText}</span>}
        </div>
      </div>
    </div>
  );
}

export default function HeroPage() {
  useDocumentTitle('Website: Hero');
  const section = useSectionForm('hero', {
    defaults: DEFAULTS,
    toForm: (d) => ({ ...d, image: d.imageUrl ? { url: d.imageUrl, path: d.imagePath } : null }),
    toDoc: ({ image, ...f }) => ({
      eyebrow: f.eyebrow.trim(),
      heading: f.heading.trim(),
      highlight: f.highlight.trim(),
      subtitle: f.subtitle.trim(),
      primaryCtaText: f.primaryCtaText.trim(),
      primaryCtaLink: f.primaryCtaLink.trim(),
      secondaryCtaText: f.secondaryCtaText.trim(),
      secondaryCtaLink: f.secondaryCtaLink.trim(),
      imageUrl: image?.url || '',
      imagePath: image?.path || '',
      showBadge: Boolean(f.showBadge),
      badgeText: f.badgeText.trim(),
    }),
    validate: (f) => collectErrors(f, SCHEMA),
    imagePaths: (d) => [d.imagePath],
  });
  const { form, set, errors } = section;

  return (
    <SectionShell title="Hero section" description="The first thing visitors see. Keep it short and powerful." anchor="home" section={section}>
      {form && (
        <>
          <Card title="Preview">
            <Preview form={form} />
          </Card>
          <Card title="Content">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Small heading" name="eyebrow" className="sm:col-span-2" value={form.eyebrow} onChange={set('eyebrow')} />
              <TextArea label="Main heading" required name="heading" rows={2} value={form.heading} onChange={set('heading')} error={errors.heading} hint="Press Enter for a new line." />
              <TextField label="Highlighted words (crimson)" name="highlight" value={form.highlight} onChange={set('highlight')} error={errors.highlight} hint="Must match part of the heading exactly." />
              <TextArea label="Supporting description" name="subtitle" className="sm:col-span-2" rows={2} value={form.subtitle} onChange={set('subtitle')} error={errors.subtitle} />
              <TextField label="Primary button text" required name="primaryCtaText" value={form.primaryCtaText} onChange={set('primaryCtaText')} error={errors.primaryCtaText} />
              <TextField label="Primary button link" required name="primaryCtaLink" value={form.primaryCtaLink} onChange={set('primaryCtaLink')} error={errors.primaryCtaLink} hint="#contact, #membership or a full URL" />
              <TextField label="Secondary button text" optional name="secondaryCtaText" value={form.secondaryCtaText} onChange={set('secondaryCtaText')} error={errors.secondaryCtaText} />
              <TextField label="Secondary button link" optional name="secondaryCtaLink" value={form.secondaryCtaLink} onChange={set('secondaryCtaLink')} error={errors.secondaryCtaLink} />
            </div>
          </Card>
          <Card title="Background image">
            <ImageUpload value={form.image} onChange={set('image')} folder="public/hero" maxSize={2400} aspect="aspect-[21/9]" hint="Landscape photo, at least 1920px wide. It’s darkened automatically for readable text." />
          </Card>
          <Card title="Offer badge">
            <Switch checked={form.showBadge} onChange={set('showBadge')} label="Show offer badge" description="If off, the website automatically shows the current active offer (if any)." />
            {form.showBadge && <TextField label="Badge text" name="badgeText" className="mt-4" value={form.badgeText} onChange={set('badgeText')} error={errors.badgeText} placeholder="e.g. 20% off yearly plans" />}
          </Card>
        </>
      )}
    </SectionShell>
  );
}
