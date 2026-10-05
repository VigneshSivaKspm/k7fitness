import { Children, useEffect, useRef, useState } from 'react';

/**
 * Phones (< 640px): a swipeable, snap-scrolling carousel with position dots,
 * so long sections don't make the page endless.
 * Tablet / desktop: the children render in the normal grid given by `gridClass`.
 *
 * gridClass   classes applied from `sm:` up, e.g. "sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-5"
 * itemClass   mobile width of each slide (default 84% so the next card peeks in)
 */
export default function MobileCarousel({ children, gridClass = '', itemClass = 'w-[84%]', label = 'Carousel' }) {
  const items = Children.toArray(children);
  const track = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return undefined;
    const onScroll = () => {
      const slides = [...el.children];
      const left = el.scrollLeft + el.clientWidth * 0.3;
      let idx = 0;
      slides.forEach((s, i) => {
        if (s.offsetLeft - el.offsetLeft <= left) idx = i;
      });
      setActive(idx);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const goTo = (i) => {
    const el = track.current;
    const slide = el?.children[i];
    if (slide) el.scrollTo({ left: slide.offsetLeft - el.offsetLeft - 16, behavior: 'smooth' });
  };

  return (
    <div>
      <div
        ref={track}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        className={`no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-1 sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0 ${gridClass}`}
      >
        {items.map((child, i) => (
          <div key={child.key ?? i} className={`flex shrink-0 snap-start sm:w-auto sm:shrink [&>*]:w-full ${itemClass}`}>
            {child}
          </div>
        ))}
      </div>
      {items.length > 1 && (
        <div className="mt-5 flex justify-center gap-2 sm:hidden">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1} of ${items.length}`}
              aria-current={active === i ? 'true' : undefined}
              className={`h-1.5 rounded-full transition-all ${active === i ? 'w-6 bg-brand' : 'w-1.5 bg-white/25'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
