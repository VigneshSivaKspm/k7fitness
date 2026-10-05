import { ArrowRight, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import { useContent } from '../../context/ContentContext';

/** Renders the heading with the configured highlight phrase in crimson. */
function HeroHeading({ heading, highlight }) {
  const text = String(heading || '');
  const idx = highlight ? text.toLowerCase().indexOf(highlight.toLowerCase()) : -1;
  const parts = idx >= 0 ? [text.slice(0, idx), text.slice(idx, idx + highlight.length), text.slice(idx + highlight.length)] : [text];
  return (
    <h1 className="display-title text-[3.6rem] whitespace-pre-line sm:text-8xl lg:text-[7.5rem]">
      {parts[0]}
      {parts[1] && <span className="text-brand-bright">{parts[1]}</span>}
      {parts[2]}
    </h1>
  );
}

export default function Hero() {
  const { hero, offers } = useContent();
  const badge = hero.showBadge && hero.badgeText ? hero.badgeText : offers[0]?.title;

  return (
    <section id="home" className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-ink pt-24 pb-16">
      {/* Background: uploaded image with cinematic dark treatment, or K7 geometric composition */}
      {hero.imageUrl ? (
        <>
          <img
            src={hero.imageUrl}
            alt=""
            className="absolute inset-0 -z-20 size-full object-cover object-[72%_center] opacity-90 lg:object-center"
            fetchPriority="high"
            decoding="async"
          />
          {/* Phones: text sits over the athlete, so darken evenly; desktop: darken the left text side only */}
          <div className="absolute inset-0 -z-10 bg-ink/60 lg:bg-transparent lg:bg-gradient-to-r lg:from-ink lg:via-ink/70 lg:to-transparent" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-transparent to-ink/50" />
        </>
      ) : (
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_40%,rgb(161_8_37/0.28),transparent_55%)]" />
          <svg
            viewBox="0 0 128 120"
            className="absolute top-1/2 right-[-18%] h-[85%] -translate-y-1/2 opacity-[0.07] sm:right-[-6%] lg:right-[2%]"
          >
            <polygon points="8,16 27,16 27,104 8,104" fill="#fff" />
            <polygon points="27,58 56,16 77,16 41,68" fill="#fff" />
            <polygon points="39,62 52,52 78,104 57,104" fill="#fff" />
            <polygon points="74,16 124,16 124,30 98,104 78,104 102,32 70,32" fill="#d20a35" />
          </svg>
        </div>
      )}
      <div className="grain pointer-events-none absolute inset-0 -z-10 opacity-[0.06] mix-blend-overlay" aria-hidden="true" />
      {/* Diagonal red cut */}
      <div className="absolute bottom-0 left-0 -z-10 h-1 w-2/3 origin-left -skew-x-12 bg-gradient-to-r from-brand to-transparent" />

      <div className="container-k7">
        <div className="max-w-3xl">
          {badge && (
            <a
              href="#offers"
              className="animate-fade-up mb-7 flex w-fit max-w-full items-center gap-2 rounded-full border border-brand/40 bg-brand/15 py-1.5 pr-4 pl-1.5 text-xs font-bold tracking-wide text-white uppercase backdrop-blur transition hover:border-brand-bright"
            >
              <span className="flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[0.65rem]">
                <Sparkles className="size-3" /> Offer
              </span>
              <span className="truncate">{badge}</span>
            </a>
          )}
          <p className="eyebrow animate-fade-up">{hero.eyebrow}</p>
          <div className="animate-fade-up mt-5 [animation-delay:80ms]">
            <HeroHeading heading={hero.heading} highlight={hero.highlight} />
          </div>
          <p className="animate-fade-up mt-6 max-w-xl text-base leading-relaxed text-silver sm:text-lg [animation-delay:160ms]">
            {hero.subtitle}
          </p>
          <div className="animate-fade-up mt-9 flex flex-col gap-3 sm:flex-row [animation-delay:240ms]">
            <Button href={hero.primaryCtaLink}>
              {hero.primaryCtaText} <ArrowRight className="size-4" />
            </Button>
            {hero.secondaryCtaText && (
              <Button href={hero.secondaryCtaLink} variant="outline">
                {hero.secondaryCtaText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
