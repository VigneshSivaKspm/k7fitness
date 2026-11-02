import { useContent } from '../../context/ContentContext';

/**
 * K7 brand lockup. Uses the logo uploaded in Admin → Website → Contact when
 * available, otherwise the bundled K7 mark (public/brand/k7-mark.svg).
 */
export default function Logo({ size = 'md', showText = true, className = '' }) {
  const { contact } = useContent();
  const heights = { sm: 'h-8', md: 'h-10', lg: 'h-14' };
  const h = heights[size] || heights.md;

  if (contact.logoUrl) {
    return (
      <img
        src={contact.logoUrl}
        alt={contact.gymName}
        className={`${h} w-auto object-contain ${className}`}
        decoding="async"
      />
    );
  }

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <img src="/brand/k7-mark.svg" alt="" aria-hidden="true" className={`${h} w-auto`} />
      {showText && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-2xl tracking-wider text-snow">
            <span className="text-brand-bright">Fitness</span>
          </span>
          <span className="mt-0.5 text-[0.6rem] font-bold uppercase tracking-[0.3em] text-muted">
            Studio &amp; Gym
          </span>
        </span>
      )}
      <span className="sr-only">{contact.gymName}</span>
    </span>
  );
}
