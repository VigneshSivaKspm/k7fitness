import { ArrowRight, Phone } from 'lucide-react';
import Button from '../ui/Button';
import Reveal from '../ui/Reveal';
import { useContent } from '../../context/ContentContext';
import { telLink } from '../../utils/format';

export default function CtaBand() {
  const { contact } = useContent();
  return (
    <section aria-label="Join K7" className="relative overflow-hidden bg-brand-dark">
      <div className="absolute inset-0 bg-[linear-gradient(115deg,var(--color-brand)_0%,var(--color-brand-dark)_55%,#2a0710_100%)]" aria-hidden="true" />
      <div className="absolute top-0 right-[18%] h-full w-24 -skew-x-[20deg] bg-white/5" aria-hidden="true" />
      <div className="absolute top-0 right-[10%] h-full w-8 -skew-x-[20deg] bg-white/5" aria-hidden="true" />
      <Reveal className="container-k7 relative flex flex-col items-start justify-between gap-8 py-16 md:flex-row md:items-center">
        <div>
          <h2 className="display-title text-5xl sm:text-6xl">No excuses. Just results.</h2>
          <p className="mt-3 max-w-xl text-white/80">Your first visit is on us. Meet the coaches, see the floor, and start training the right way.</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button href="#contact" variant="dark">
            Join now <ArrowRight className="size-4" />
          </Button>
          {contact.phone && (
            <Button href={telLink(contact.phone)} variant="outline">
              <Phone className="size-4" /> Call now
            </Button>
          )}
        </div>
      </Reveal>
    </section>
  );
}
