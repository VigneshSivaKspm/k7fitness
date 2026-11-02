import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import { useContent } from '../../context/ContentContext';

function Stars({ rating }) {
  const r = Math.max(0, Math.min(5, Number(rating) || 0));
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${r} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`size-4 ${n <= r ? 'fill-brand-bright text-brand-bright' : 'text-white/15'}`} />
      ))}
    </div>
  );
}

export default function Testimonials() {
  const { testimonials } = useContent();
  const track = useRef(null);
  if (!testimonials.length) return null;

  const scroll = (dir) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  return (
    <section id="testimonials" aria-labelledby="testimonials-title" className="bg-ink py-24 sm:py-28">
      <div className="container-k7">
        <div className="flex items-end justify-between gap-6">
          <SectionHeading id="testimonials-title" eyebrow="Testimonials" title="What our members say" />
          {testimonials.length > 1 && (
            <div className="mb-12 hidden gap-2 sm:flex">
              <button type="button" onClick={() => scroll(-1)} aria-label="Previous testimonials" className="flex size-12 items-center justify-center rounded-xl border border-white/10 text-white transition hover:border-brand hover:bg-brand">
                <ChevronLeft className="size-5" />
              </button>
              <button type="button" onClick={() => scroll(1)} aria-label="Next testimonials" className="flex size-12 items-center justify-center rounded-xl border border-white/10 text-white transition hover:border-brand hover:bg-brand">
                <ChevronRight className="size-5" />
              </button>
            </div>
          )}
        </div>

        <div
          ref={track}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 sm:mx-0 sm:px-0"
          tabIndex={0}
          aria-label="Testimonials, scroll horizontally"
        >
          {testimonials.map((t) => (
            <figure
              key={t.id}
              className="card-k7 relative flex w-[85%] shrink-0 snap-start flex-col p-7 sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.7rem)]"
            >
              <Quote className="absolute top-6 right-6 size-10 text-brand/25" aria-hidden="true" />
              <Stars rating={t.rating} />
              <blockquote className="mt-5 flex-1 text-[0.95rem] leading-relaxed text-silver">“{t.message}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-white/5 pt-5">
                {t.photoUrl ? (
                  <img src={t.photoUrl} alt="" loading="lazy" className="size-11 rounded-full object-cover" />
                ) : (
                  <span className="flex size-11 items-center justify-center rounded-full bg-brand/15 font-display text-xl text-brand-bright">
                    {String(t.name || '?').charAt(0)}
                  </span>
                )}
                <span className="font-bold text-white">{t.name}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
