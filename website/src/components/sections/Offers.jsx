import { ArrowRight, CalendarClock, Megaphone } from 'lucide-react';
import Button from '../ui/Button';
import Reveal from '../ui/Reveal';
import { useContent } from '../../context/ContentContext';
import { formatDate } from '../../utils/format';

export default function Offers() {
  const { offers } = useContent();
  if (!offers.length) return null;

  return (
    <section id="offers" aria-labelledby="offers-title" className="relative bg-ink-soft py-14">
      <h2 id="offers-title" className="sr-only">
        Current offers
      </h2>
      <div className="container-k7 grid gap-5">
        {offers.map((offer, i) => (
          <Reveal key={offer.id} delay={i * 80}>
            <article className="clip-angle relative grid overflow-hidden rounded-2xl border border-brand/30 bg-gradient-to-r from-brand-dark/50 via-ink-card to-ink-card md:grid-cols-[1fr_auto]">
              <div className="flex gap-5 p-6 sm:p-8">
                {offer.imageUrl ? (
                  <img
                    src={offer.imageUrl}
                    alt=""
                    loading="lazy"
                    className="hidden size-24 shrink-0 rounded-xl object-cover sm:block"
                  />
                ) : (
                  <span className="hidden size-14 shrink-0 items-center justify-center rounded-xl bg-brand text-white sm:flex">
                    <Megaphone className="size-6" />
                  </span>
                )}
                <div>
                  <p className="text-xs font-bold tracking-[0.25em] text-brand-bright uppercase">Limited offer</p>
                  <h3 className="mt-2 font-display text-3xl tracking-wide sm:text-4xl">{offer.title}</h3>
                  {offer.description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-silver">{offer.description}</p>}
                  {offer.endDate && (
                    <p className="mt-3 inline-flex items-center gap-2 text-xs text-muted">
                      <CalendarClock className="size-3.5" /> Valid till {formatDate(offer.endDate)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center px-6 pb-6 md:px-8 md:pb-0">
                <Button href={offer.ctaLink || '#contact'} className="w-full md:w-auto">
                  {offer.ctaText || 'Claim offer'} <ArrowRight className="size-4" />
                </Button>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
