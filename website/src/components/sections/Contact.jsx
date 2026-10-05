import { Clock, Mail, MapPin, Navigation, Phone } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import Reveal from '../ui/Reveal';
import Button from '../ui/Button';
import EnquiryForm from './EnquiryForm';
import { SocialLinks, WhatsappIcon } from '../ui/SocialIcons';
import { useContent } from '../../context/ContentContext';
import { telLink, whatsappLink } from '../../utils/format';

/** Only embed genuine Google Maps embed URLs. Accepts a pasted <iframe> snippet too. */
function mapEmbedSrc(value) {
  const raw = String(value || '');
  const fromIframe = raw.match(/src="([^"]+)"/)?.[1];
  const url = (fromIframe || raw).trim();
  return /^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/i.test(url) ? url : '';
}

function directionsUrl(contact) {
  if (/^https?:\/\//i.test(contact.mapLink || '')) return contact.mapLink;
  if (contact.address) return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(contact.address)}`;
  return '';
}

export default function Contact() {
  const { contact } = useContent();
  const embed = mapEmbedSrc(contact.mapEmbedUrl);
  const directions = directionsUrl(contact);
  const wa = whatsappLink(contact.whatsapp || contact.phone, contact.whatsappMessage);
  const hours = (contact.openingHours || []).filter((h) => h.label || h.hours);

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative bg-ink-soft py-24 sm:py-28">
      <div className="container-k7">
        <SectionHeading
          id="contact-title"
          eyebrow="Get in touch"
          title="Start your journey today"
          description="Drop by for a tour, call us, or send an enquiry. Your first step is the hardest, and we’ll make it easy."
        />

        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <Reveal className="space-y-5">
            <div className="card-k7 divide-y divide-white/5">
              {contact.address && (
                <div className="flex gap-4 p-6">
                  <MapPin className="mt-1 size-5 shrink-0 text-brand-bright" />
                  <div>
                    <h3 className="text-xs font-bold tracking-[0.18em] text-muted uppercase">Address</h3>
                    <p className="mt-1.5 whitespace-pre-line text-white">{contact.address}</p>
                  </div>
                </div>
              )}
              {(contact.phone || contact.email) && (
                <div className="grid gap-5 p-6 sm:grid-cols-2">
                  {contact.phone && (
                    <div className="flex gap-4">
                      <Phone className="mt-1 size-5 shrink-0 text-brand-bright" />
                      <div>
                        <h3 className="text-xs font-bold tracking-[0.18em] text-muted uppercase">Phone</h3>
                        <a href={telLink(contact.phone)} className="mt-1.5 block text-white hover:text-brand-bright">
                          {contact.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex min-w-0 gap-4">
                      <Mail className="mt-1 size-5 shrink-0 text-brand-bright" />
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold tracking-[0.18em] text-muted uppercase">Email</h3>
                        <a href={`mailto:${contact.email}`} className="mt-1.5 block break-all text-white hover:text-brand-bright">
                          {contact.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {hours.length > 0 && (
                <div className="flex gap-4 p-6">
                  <Clock className="mt-1 size-5 shrink-0 text-brand-bright" />
                  <div className="flex-1">
                    <h3 className="text-xs font-bold tracking-[0.18em] text-muted uppercase">Opening hours</h3>
                    <dl className="mt-2 space-y-1.5 text-sm">
                      {hours.map((h, i) => (
                        <div key={i} className="flex justify-between gap-4">
                          <dt className="text-silver">{h.label}</dt>
                          <dd className="text-right font-semibold text-white">{h.hours}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {contact.phone && (
                <Button href={telLink(contact.phone)} className="!px-4">
                  <Phone className="size-4" /> Call now
                </Button>
              )}
              {wa && (
                <Button href={wa} variant="outline" className="!px-4">
                  <WhatsappIcon className="size-4" /> WhatsApp
                </Button>
              )}
              {directions && (
                <Button href={directions} variant="outline" className="!px-4">
                  <Navigation className="size-4" /> Directions
                </Button>
              )}
            </div>

            {embed && (
              <div className="overflow-hidden rounded-2xl border border-line">
                <iframe
                  title={`Map showing ${contact.gymName}`}
                  src={embed}
                  className="h-72 w-full bg-white"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            )}

            <SocialLinks contact={contact} />
          </Reveal>

          <Reveal delay={100}>
            <EnquiryForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
