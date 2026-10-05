import { Check, Eye, Target } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import Reveal from '../ui/Reveal';
import { useContent } from '../../context/ContentContext';
import { getFacilityIcon } from '../../constants/icons';

function Stats({ stats }) {
  if (!stats?.length) return null;
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
      {stats.slice(0, 4).map((s, i) => (
        <Reveal key={`${s.label}-${i}`} delay={i * 70} className="bg-ink-card p-6 sm:p-8">
          <dt className="text-xs font-bold tracking-[0.2em] text-muted uppercase">{s.label}</dt>
          <dd className="mt-2 font-display text-5xl text-white sm:text-6xl">
            {s.value}
            <span className="text-brand-bright">{s.suffix}</span>
          </dd>
        </Reveal>
      ))}
    </dl>
  );
}

function Facilities({ facilities }) {
  const items = (facilities || []).filter((f) => f.active !== false);
  if (!items.length) return null;
  return (
    <div className="mt-20">
      <SectionHeading eyebrow="Facilities" title="Everything you need to train" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((f, i) => {
          const Icon = getFacilityIcon(f.icon);
          return (
            <Reveal key={f.id || i} delay={(i % 4) * 70} className="card-k7 card-k7-hover group p-6">
              <span className="flex size-12 items-center justify-center rounded-xl bg-brand/12 text-brand-bright transition group-hover:bg-brand group-hover:text-white">
                <Icon className="size-6" />
              </span>
              <h3 className="mt-5 font-display text-2xl tracking-wide">{f.title}</h3>
              {f.description && <p className="mt-2 text-sm leading-relaxed text-muted">{f.description}</p>}
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

export default function About() {
  const { about } = useContent();
  const images = (about.images || []).filter((img) => img?.url);

  return (
    <section id="about" aria-labelledby="about-title" className="bg-ink-soft py-24 sm:py-28">
      <div className="container-k7">
        <div className={`grid items-center gap-12 lg:gap-16 ${images.length ? 'lg:grid-cols-2' : ''}`}>
          <div>
            <SectionHeading id="about-title" eyebrow={about.eyebrow} title={about.heading} />
            <Reveal>
              {about.description && (
                <p className="-mt-4 text-base leading-relaxed whitespace-pre-line text-silver sm:text-lg">{about.description}</p>
              )}
              {about.benefits?.length > 0 && (
                <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                  {about.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-sm text-silver">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          </div>

          {images.length > 0 ? (
            <Reveal className="relative">
              <div className="clip-angle overflow-hidden rounded-2xl">
                <img
                  src={images[0].url}
                  alt={`Inside ${about.heading}`}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              {images[1] && (
                <img
                  src={images[1].url}
                  alt=""
                  loading="lazy"
                  className="absolute -bottom-8 -left-4 hidden aspect-square w-40 rounded-2xl border-4 border-ink-soft object-cover shadow-2xl sm:block lg:-left-10 lg:w-48"
                />
              )}
              <div className="absolute -top-3 -right-3 -z-0 h-24 w-24 border-t-4 border-r-4 border-brand" aria-hidden="true" />
            </Reveal>
          ) : null}
        </div>

        {(about.mission || about.vision) && (
          <div className="mt-16 grid gap-4 md:grid-cols-2">
            {about.mission && (
              <Reveal className="card-k7 p-7">
                <Target className="size-6 text-brand-bright" />
                <h3 className="mt-4 font-display text-3xl tracking-wide">Our mission</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{about.mission}</p>
              </Reveal>
            )}
            {about.vision && (
              <Reveal delay={80} className="card-k7 p-7">
                <Eye className="size-6 text-brand-bright" />
                <h3 className="mt-4 font-display text-3xl tracking-wide">Our vision</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{about.vision}</p>
              </Reveal>
            )}
          </div>
        )}

        {about.stats?.length > 0 && (
          <div className="mt-16">
            <Stats stats={about.stats} />
          </div>
        )}

        <Facilities facilities={about.facilities} />
      </div>
    </section>
  );
}
