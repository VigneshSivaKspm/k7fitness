import { Check } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import Reveal from '../ui/Reveal';
import MobileCarousel from '../ui/MobileCarousel';
import Button from '../ui/Button';
import { useContent } from '../../context/ContentContext';
import { formatCurrency, formatDuration } from '../../utils/format';
import { selectInterest } from '../../utils/interest';

export default function Membership() {
  const { plans } = useContent();
  if (!plans.length) return null;

  const cols = plans.length >= 4 ? 'lg:grid-cols-4' : plans.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2';

  return (
    <section id="membership" aria-labelledby="membership-title" className="relative overflow-hidden bg-ink-card py-24 sm:py-28">
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="container-k7 relative">
        <SectionHeading
          id="membership-title"
          align="center"
          eyebrow="Membership"
          title="Choose your plan"
          description="Simple, transparent pricing. No hidden charges. Walk in and start training."
        />
        <MobileCarousel label="Membership plans" gridClass={`pt-3 sm:grid sm:grid-cols-2 sm:gap-5 sm:pt-0 ${cols}`}>
          {plans.map((plan, i) => {
            const featured = plan.recommended;
            return (
              <Reveal
                as="article"
                key={plan.id}
                delay={(i % 4) * 80}
                className={`relative flex flex-col rounded-2xl border p-7 transition duration-300 hover:-translate-y-1 ${
                  featured
                    ? 'border-brand bg-ink shadow-[0_24px_60px_-28px_rgb(161_8_37/0.7)]'
                    : 'border-line bg-ink-soft hover:border-white/20'
                }`}
              >
                {featured && (
                  <span className="absolute -top-3 left-7 rounded-md bg-brand px-3 py-1 text-[0.65rem] font-extrabold tracking-[0.2em] text-white uppercase">
                    Popular
                  </span>
                )}
                <h3 className="font-display text-3xl tracking-wide">{plan.name}</h3>
                {plan.description && <p className="mt-2 text-sm text-muted">{plan.description}</p>}
                <p className="mt-6 flex items-baseline gap-1.5">
                  <span className="font-display text-6xl text-white">{formatCurrency(plan.price)}</span>
                  <span className="text-sm text-muted">/ {formatDuration(plan.duration, plan.durationUnit)}</span>
                </p>
                <span className={`my-6 block h-px ${featured ? 'bg-brand/50' : 'bg-white/8'}`} />
                <ul className="flex-1 space-y-3">
                  {(plan.features || []).map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-silver">
                      <Check className={`mt-0.5 size-4 shrink-0 ${featured ? 'text-brand-bright' : 'text-muted'}`} strokeWidth={3} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button href="#contact" variant={featured ? 'primary' : 'outline'} className="mt-8 w-full" onClick={() => selectInterest(plan.name)}>
                  Get started
                </Button>
              </Reveal>
            );
          })}
        </MobileCarousel>
      </div>
    </section>
  );
}
