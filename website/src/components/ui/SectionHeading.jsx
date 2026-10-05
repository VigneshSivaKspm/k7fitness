import Reveal from './Reveal';

export default function SectionHeading({ eyebrow, title, description, align = 'left', id }) {
  const centered = align === 'center';
  return (
    <Reveal className={`mb-12 max-w-2xl ${centered ? 'mx-auto text-center' : ''}`}>
      {eyebrow && <p className={`eyebrow ${centered ? 'justify-center' : ''}`}>{eyebrow}</p>}
      <h2 id={id} className="display-title mt-4 text-5xl sm:text-6xl">
        {title}
      </h2>
      {description && <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{description}</p>}
    </Reveal>
  );
}
