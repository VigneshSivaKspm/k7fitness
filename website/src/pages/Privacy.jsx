import { useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { telLink } from '../utils/format';

/** Plain-language privacy notice for data collected by the enquiry form. */
export default function Privacy() {
  const { contact } = useContent();
  const name = contact.gymName;

  useEffect(() => {
    document.title = `Privacy policy | ${name}`;
    window.scrollTo(0, 0);
  }, [name]);

  return (
    <main className="bg-ink pt-28 pb-24">
      <article className="container-k7 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-white">
          <ArrowLeft className="size-4" /> Back to home
        </Link>
        <p className="eyebrow mt-8">Legal</p>
        <h1 className="display-title mt-4 text-5xl sm:text-6xl">Privacy policy</h1>

        <div className="mt-10 space-y-8 text-[0.95rem] leading-relaxed text-silver [&_h2]:font-display [&_h2]:text-3xl [&_h2]:tracking-wide [&_li]:ml-5 [&_li]:list-disc">
          <section>
            <h2>What we collect</h2>
            <p className="mt-3">
              When you send an enquiry through this website, {name} collects the details you provide: your name, mobile number and,
              optionally, your email address, the membership or program you are interested in and your message.
            </p>
          </section>
          <section>
            <h2>How we use it</h2>
            <ul className="mt-3 space-y-1.5">
              <li>To contact you about your enquiry by phone, WhatsApp or email.</li>
              <li>To help you choose a membership, program or trial visit.</li>
            </ul>
            <p className="mt-3">We do not sell or share your details with third parties for marketing.</p>
          </section>
          <section>
            <h2>Storage & security</h2>
            <p className="mt-3">
              Enquiries are stored securely with Google Firebase and can only be accessed by authorised gym staff. We keep enquiries
              only as long as needed to respond and follow up.
            </p>
          </section>
          <section>
            <h2>Your choices</h2>
            <p className="mt-3">
              You can ask us at any time to update or delete the details you shared.
              {contact.phone || contact.email ? ' Contact us at ' : ''}
              {contact.phone && (
                <a href={telLink(contact.phone)} className="font-semibold text-white underline-offset-4 hover:underline">
                  {contact.phone}
                </a>
              )}
              {contact.phone && contact.email ? ' or ' : ''}
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="font-semibold text-white underline-offset-4 hover:underline">
                  {contact.email}
                </a>
              )}
              {contact.phone || contact.email ? '.' : ''}
            </p>
          </section>
          <section>
            <h2>Cookies</h2>
            <p className="mt-3">This website does not use advertising or tracking cookies.</p>
          </section>
        </div>
      </article>
    </main>
  );
}
