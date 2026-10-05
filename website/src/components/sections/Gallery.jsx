import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import Reveal from '../ui/Reveal';
import { useContent } from '../../context/ContentContext';

function Lightbox({ items, index, onClose, onMove }) {
  const closeRef = useRef(null);
  const item = items[index];

  useEffect(() => {
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onMove(1);
      if (e.key === 'ArrowLeft') onMove(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, onMove]);

  if (!item) return null;
  const navBtn =
    'absolute top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-brand';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title || 'Gallery image'}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4"
      onClick={onClose}
    >
      <button ref={closeRef} type="button" aria-label="Close" className="absolute top-4 right-4 z-10 flex size-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-brand">
        <X className="size-5" />
      </button>
      {items.length > 1 && (
        <>
          <button type="button" aria-label="Previous image" className={`${navBtn} left-3`} onClick={(e) => (e.stopPropagation(), onMove(-1))}>
            <ChevronLeft className="size-6" />
          </button>
          <button type="button" aria-label="Next image" className={`${navBtn} right-3`} onClick={(e) => (e.stopPropagation(), onMove(1))}>
            <ChevronRight className="size-6" />
          </button>
        </>
      )}
      <figure className="max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <img src={item.imageUrl} alt={item.title || item.caption || 'Gallery image'} className="max-h-[80vh] w-auto rounded-xl object-contain" />
        {(item.title || item.caption) && (
          <figcaption className="mt-4 text-center">
            {item.title && <p className="font-display text-2xl tracking-wide text-white">{item.title}</p>}
            {item.caption && <p className="mt-1 text-sm text-muted">{item.caption}</p>}
          </figcaption>
        )}
      </figure>
    </div>
  );
}

export default function Gallery() {
  const { gallery } = useContent();
  const [category, setCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState(null);

  const categories = useMemo(
    () => ['All', ...new Set(gallery.map((g) => g.category).filter(Boolean))],
    [gallery],
  );
  const items = useMemo(
    () => (category === 'All' ? gallery : gallery.filter((g) => g.category === category)),
    [gallery, category],
  );

  const close = useCallback(() => setOpenIndex(null), []);
  const move = useCallback((dir) => setOpenIndex((i) => (i + dir + items.length) % items.length), [items.length]);

  if (!gallery.length) return null;

  return (
    <section id="gallery" aria-labelledby="gallery-title" className="bg-ink-soft py-24 sm:py-28">
      <div className="container-k7">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading id="gallery-title" eyebrow="Gallery" title="Inside K7" description="Real members. Real sweat. Real transformations." />
          {categories.length > 2 && (
            <div className="no-scrollbar -mx-4 mb-12 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0" role="tablist" aria-label="Filter gallery">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="tab"
                  aria-selected={category === c}
                  onClick={() => setCategory(c)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold tracking-wider uppercase transition ${
                    category === c ? 'border-brand bg-brand text-white' : 'border-white/10 text-silver hover:border-white/30'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="columns-2 gap-3 sm:gap-4 lg:columns-3 xl:columns-4">
          {items.map((g, i) => (
            <Reveal key={g.id} delay={(i % 4) * 60} className="mb-3 break-inside-avoid sm:mb-4">
              <button
                type="button"
                onClick={() => setOpenIndex(i)}
                className="group relative block w-full overflow-hidden rounded-xl bg-surface"
                aria-label={`Open image: ${g.title || g.caption || `photo ${i + 1}`}`}
              >
                <img
                  src={g.imageUrl}
                  alt={g.title || g.caption || 'K7 gym photo'}
                  loading="lazy"
                  decoding="async"
                  className="w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-transparent p-4 opacity-0 transition group-hover:opacity-100">
                  {g.title && <span className="font-display text-xl tracking-wide text-white">{g.title}</span>}
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
      {openIndex !== null && <Lightbox items={items} index={openIndex} onClose={close} onMove={move} />}
    </section>
  );
}
