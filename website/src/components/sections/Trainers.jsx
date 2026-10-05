import { UserRound } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import Reveal from '../ui/Reveal';
import { InstagramIcon } from '../ui/SocialIcons';
import { useContent } from '../../context/ContentContext';

export default function Trainers() {
  const { trainers } = useContent();
  if (!trainers.length) return null;

  return (
    <section id="trainers" aria-labelledby="trainers-title" className="bg-ink py-24 sm:py-28">
      <div className="container-k7">
        <SectionHeading
          id="trainers-title"
          eyebrow="Our coaches"
          title="Train with the best"
          description="Certified, experienced coaches who will push you, correct you and keep you accountable."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {trainers.map((t, i) => (
            <Reveal as="article" key={t.id} delay={(i % 4) * 80} className="card-k7 card-k7-hover group overflow-hidden">
              <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                {t.photoUrl ? (
                  <img
                    src={t.photoUrl}
                    alt={`${t.name}, ${t.specialization || 'trainer'}`}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover object-top transition duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <UserRound className="size-20 text-white/10" aria-hidden="true" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink-card to-transparent" />
                {/^https?:\/\//i.test(t.instagram || '') && (
                  <a
                    href={t.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${t.name} on Instagram`}
                    className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-xl bg-black/50 text-white backdrop-blur transition hover:bg-brand"
                  >
                    <InstagramIcon className="size-4.5" />
                  </a>
                )}
              </div>
              <div className="p-6 pt-4">
                <h3 className="font-display text-3xl tracking-wide">{t.name}</h3>
                {t.specialization && (
                  <p className="mt-1 text-xs font-bold tracking-[0.18em] text-brand-bright uppercase">{t.specialization}</p>
                )}
                {t.experience && <p className="mt-3 text-sm font-semibold text-silver">{t.experience}</p>}
                {t.bio && <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-muted">{t.bio}</p>}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
