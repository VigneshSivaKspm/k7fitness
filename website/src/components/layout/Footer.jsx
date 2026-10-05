import { Link } from 'react-router';
import { Mail, MapPin, Phone } from 'lucide-react';
import Logo from '../ui/Logo';
import { SocialLinks } from '../ui/SocialIcons';
import { useContent } from '../../context/ContentContext';
import { useSectionHref, useSections } from '../../hooks/useSections';
import { telLink } from '../../utils/format';

export default function Footer() {
  const { contact } = useContent();
  const { nav } = useSections();
  const href = useSectionHref();
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/5 bg-ink pt-16">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent" />
      <div className="container-k7 grid gap-12 pb-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo size="lg" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
            {contact.footerText ||
              'Strength, discipline and performance. Expert coaching and a community that pushes you to be your strongest self.'}
          </p>
          <SocialLinks contact={contact} className="mt-6" />
        </div>

        <div>
          <h2 className="font-display text-xl tracking-wider">Explore</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
            {nav.map((n) => (
              <li key={n.id}>
                <a href={href(n.id)} className="text-muted transition hover:text-white">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {(contact.address || contact.phone || contact.email) && (
        <div>
          <h2 className="font-display text-xl tracking-wider">Visit us</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            {contact.address && (
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-bright" />
                <span className="whitespace-pre-line">{contact.address}</span>
              </li>
            )}
            {contact.phone && (
              <li>
                <a href={telLink(contact.phone)} className="flex gap-3 transition hover:text-white">
                  <Phone className="mt-0.5 size-4 shrink-0 text-brand-bright" />
                  {contact.phone}
                </a>
              </li>
            )}
            {contact.email && (
              <li>
                <a href={`mailto:${contact.email}`} className="flex gap-3 break-all transition hover:text-white">
                  <Mail className="mt-0.5 size-4 shrink-0 text-brand-bright" />
                  {contact.email}
                </a>
              </li>
            )}
          </ul>
        </div>
        )}
      </div>
      <div className="border-t border-white/5">
        <div className="container-k7 flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted sm:flex-row">
          <p>
            © {year} {contact.gymName}. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="transition hover:text-white">
              Privacy policy
            </Link>
            <p className="uppercase tracking-[0.2em]">Train hard · Live strong</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
