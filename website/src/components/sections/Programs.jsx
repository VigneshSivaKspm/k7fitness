import { Clock, Dumbbell } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import Reveal from '../ui/Reveal';
import MobileCarousel from '../ui/MobileCarousel';
import { useContent } from '../../context/ContentContext';

export default function Programs() {
  const { programs } = useContent();
  if (!programs.length) return null;

  return (
    <section id="programs" aria-labelledby="programs-title" className="bg-ink py-24 sm:py-28">
      <div className="container-k7">
        <SectionHeading
          id="programs-title"
          eyebrow="Training programs"
          title="Programs built for results"
          description="Structured coaching for every goal and every level, from your first session to your next personal best."
        />
        <MobileCarousel label="Training programs" gridClass={`sm:grid sm:grid-cols-2 sm:gap-5 ${programs.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
          {programs.map((p, i) => (
            <Reveal
              as="article"
              key={p.id}
              delay={(i % 3) * 80}
              className="group clip-angle relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-2xl border border-line bg-ink-card"
            >
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105"
                />
              ) : (
                <Dumbbell className="absolute top-8 right-8 size-24 text-white/5" aria-hidden="true" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/10" />
              <div className="relative p-7">
                {p.duration && (
                  <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs font-semibold text-silver backdrop-blur">
                    <Clock className="size-3" /> {p.duration}
                  </span>
                )}
                <h3 className="font-display text-3xl tracking-wide uppercase">{p.name}</h3>
                <span className="mt-3 block h-0.5 w-12 bg-brand transition-all duration-500 group-hover:w-20" />
                {p.description && <p className="mt-4 text-sm leading-relaxed text-silver">{p.description}</p>}
                {p.benefits?.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {p.benefits.slice(0, 4).map((b) => (
                      <li key={b} className="rounded-md bg-white/8 px-2.5 py-1 text-xs text-silver">
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>
          ))}
        </MobileCarousel>
      </div>
    </section>
  );
}
