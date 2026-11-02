import { Plus, Trash2 } from 'lucide-react';
import { Card } from '../../components/ui/Layout';
import Button from '../../components/ui/Button';
import ImageUpload from '../../components/ui/ImageUpload';
import { TextArea, TextField } from '../../components/ui/Field';
import SectionShell from '../../components/cms/SectionShell';
import { useSectionForm } from '../../hooks/useSectionForm';
import { useDocumentTitle } from '../../hooks/useAsync';
import { useSettings } from '../../context/SettingsContext';
import { normalizePhone } from '../../utils/format';
import { collectErrors, v } from '../../utils/validation';

const DEFAULTS = {
  gymName: 'K7 Fitness Studio & Gym',
  logoUrl: '',
  logoPath: '',
  phone: '',
  whatsapp: '',
  whatsappMessage: 'Hi K7 Fitness! I would like to know more about your memberships.',
  email: '',
  address: '',
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3910.3783877580004!2d77.44881127482853!3d11.452590688740303!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba93d736421928f%3A0x6222318f060d2f45!2sK7%20Fitness%20Studio!5e0!3m2!1sen!2sin!4v1791198399976!5m2!1sen!2sin',
  mapLink: 'https://www.google.com/maps/dir/?api=1&destination=11.4525907,77.4488113',
  instagram: '',
  facebook: '',
  youtube: '',
  openingHours: [
    { label: 'Monday – Saturday', hours: '5:30 AM – 10:00 PM' },
    { label: 'Sunday', hours: '6:00 AM – 12:00 PM' },
  ],
  footerText: '',
};

const SCHEMA = {
  gymName: [v.required('Gym name'), v.maxLength('Gym name', 80)],
  phone: [v.phone()],
  whatsapp: [v.phone('WhatsApp number')],
  email: [v.email()],
  address: [v.maxLength('Address', 300)],
  mapEmbedUrl: [
    (x) => {
      const raw = String(x || '').trim();
      if (!raw) return '';
      const src = raw.match(/src="([^"]+)"/)?.[1] || raw;
      return /^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/i.test(src) ? '' : 'Paste the Google Maps “Embed a map” link or <iframe> code.';
    },
  ],
  mapLink: [v.url('Directions link')],
  instagram: [v.url('Instagram URL')],
  facebook: [v.url('Facebook URL')],
  youtube: [v.url('YouTube URL')],
  whatsappMessage: [v.maxLength('WhatsApp message', 300)],
  footerText: [v.maxLength('Footer text', 300)],
};

export default function ContactPage() {
  useDocumentTitle('Website: Contact');
  const { reload } = useSettings();
  const section = useSectionForm('contact', {
    defaults: DEFAULTS,
    toForm: (d) => ({ ...d, logo: d.logoUrl ? { url: d.logoUrl, path: d.logoPath } : null, openingHours: d.openingHours || [] }),
    toDoc: ({ logo, ...f }) => {
      const embed = String(f.mapEmbedUrl || '').trim();
      return {
        gymName: f.gymName.trim(),
        logoUrl: logo?.url || '',
        logoPath: logo?.path || '',
        phone: f.phone.trim(),
        whatsapp: normalizePhone(f.whatsapp),
        whatsappMessage: f.whatsappMessage.trim(),
        email: f.email.trim(),
        address: f.address.trim(),
        mapEmbedUrl: embed.match(/src="([^"]+)"/)?.[1] || embed,
        mapLink: f.mapLink.trim(),
        instagram: f.instagram.trim(),
        facebook: f.facebook.trim(),
        youtube: f.youtube.trim(),
        openingHours: f.openingHours.filter((h) => h.label.trim() || h.hours.trim()).map((h) => ({ label: h.label.trim(), hours: h.hours.trim() })),
        footerText: f.footerText.trim(),
      };
    },
    validate: (f) => collectErrors(f, SCHEMA),
    imagePaths: (d) => [d.logoPath],
    onSaved: () => reload(),
  });
  const { form, setForm, set, errors } = section;
  const setHours = (i, key, value) => setForm((f) => ({ ...f, openingHours: f.openingHours.map((h, j) => (j === i ? { ...h, [key]: value } : h)) }));

  return (
    <SectionShell title="Contact information" description="Used on the website, receipts and printed charts." anchor="contact" section={section}>
      {form && (
        <>
          <Card title="Business">
            <div className="grid gap-5 md:grid-cols-[180px_1fr]">
              <ImageUpload label="Logo" value={form.logo} onChange={set('logo')} folder="public/brand" aspect="aspect-square" maxSize={512} />
              <div className="grid content-start gap-4 sm:grid-cols-2">
                <TextField label="Gym name" required name="gymName" className="sm:col-span-2" value={form.gymName} onChange={set('gymName')} error={errors.gymName} />
                <TextField label="Phone" name="phone" type="tel" value={form.phone} onChange={set('phone')} error={errors.phone} />
                <TextField label="WhatsApp number" name="whatsapp" type="tel" value={form.whatsapp} onChange={set('whatsapp')} error={errors.whatsapp} />
                <TextField label="Email" name="email" type="email" className="sm:col-span-2" value={form.email} onChange={set('email')} error={errors.email} />
                <TextArea label="WhatsApp greeting" name="whatsappMessage" className="sm:col-span-2" rows={2} value={form.whatsappMessage} onChange={set('whatsappMessage')} error={errors.whatsappMessage} hint="Pre-filled message when visitors tap the WhatsApp button." />
              </div>
            </div>
          </Card>

          <Card title="Location">
            <div className="grid gap-4">
              <TextArea label="Address" name="address" rows={2} value={form.address} onChange={set('address')} error={errors.address} />
              <TextArea
                label="Google Maps embed"
                name="mapEmbedUrl"
                rows={2}
                value={form.mapEmbedUrl}
                onChange={set('mapEmbedUrl')}
                error={errors.mapEmbedUrl}
                hint="Google Maps → Share → Embed a map → copy HTML, then paste it here."
              />
              <TextField label="Directions link" optional name="mapLink" value={form.mapLink} onChange={set('mapLink')} error={errors.mapLink} hint="Google Maps share link. If empty, directions use the address." />
            </div>
          </Card>

          <Card
            title="Opening hours"
            actions={
              <Button size="sm" variant="secondary" icon={Plus} onClick={() => setForm((f) => ({ ...f, openingHours: [...f.openingHours, { label: '', hours: '' }] }))}>
                Add row
              </Button>
            }
          >
            <div className="space-y-2">
              {form.openingHours.map((h, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <input className="input" placeholder="Days (e.g. Monday – Saturday)" value={h.label} onChange={(e) => setHours(i, 'label', e.target.value)} aria-label="Days" />
                  <input className="input" placeholder="Hours (e.g. 5 AM – 10 PM)" value={h.hours} onChange={(e) => setHours(i, 'hours', e.target.value)} aria-label="Hours" />
                  <Button size="icon" variant="danger-ghost" icon={Trash2} aria-label="Remove row" onClick={() => setForm((f) => ({ ...f, openingHours: f.openingHours.filter((_, j) => j !== i) }))} />
                </div>
              ))}
              {!form.openingHours.length && <p className="text-sm text-zinc-500">No opening hours added.</p>}
            </div>
          </Card>

          <Card title="Social media & footer">
            <div className="grid gap-4 sm:grid-cols-3">
              <TextField label="Instagram" optional name="instagram" placeholder="https://instagram.com/…" value={form.instagram} onChange={set('instagram')} error={errors.instagram} />
              <TextField label="Facebook" optional name="facebook" placeholder="https://facebook.com/…" value={form.facebook} onChange={set('facebook')} error={errors.facebook} />
              <TextField label="YouTube" optional name="youtube" placeholder="https://youtube.com/…" value={form.youtube} onChange={set('youtube')} error={errors.youtube} />
              <TextArea label="Footer text" optional name="footerText" className="sm:col-span-3" rows={2} value={form.footerText} onChange={set('footerText')} error={errors.footerText} />
            </div>
          </Card>
        </>
      )}
    </SectionShell>
  );
}
