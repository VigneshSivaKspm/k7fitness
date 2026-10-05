import { isExternal, safeUrl } from '../../utils/format';

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold uppercase tracking-[0.12em] transition duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60';

const variants = {
  primary: 'bg-brand text-white shadow-[0_10px_30px_-12px_rgb(161_8_37/0.8)] hover:bg-brand-bright',
  outline: 'border border-white/70 text-white hover:border-brand-bright hover:shadow-[0_0_0_4px_rgb(161_8_37/0.15)]',
  ghost: 'text-silver hover:text-white',
  dark: 'bg-white text-ink hover:bg-off-white',
};

/** Renders an <a> when `href` is given, otherwise a <button>. */
export default function Button({ href, variant = 'primary', className = '', children, ...props }) {
  const cls = `${base} ${variants[variant]} ${className}`;
  if (href) {
    const url = safeUrl(href);
    const external = isExternal(url);
    return (
      <a href={url} className={cls} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...props}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={cls} {...props}>
      {children}
    </button>
  );
}
