import { Link } from 'react-router';
import { LoaderCircle } from 'lucide-react';

const base =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap transition duration-150 select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55';

const variants = {
  primary: 'bg-brand text-white shadow-[0_1px_2px_rgb(121_15_31/0.3),inset_0_1px_0_rgb(255_255_255/0.12)] hover:bg-brand-dark',
  secondary: 'border border-zinc-300 bg-white text-zinc-800 shadow-[0_1px_2px_rgb(0_0_0/0.04)] hover:bg-zinc-50 hover:border-zinc-400',
  ghost: 'text-zinc-700 hover:bg-zinc-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  'danger-ghost': 'text-red-600 hover:bg-red-50',
  dark: 'bg-ink text-white hover:bg-ink-3',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
};

const sizes = {
  sm: 'h-8 px-3 text-[0.8rem]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-[0.95rem]',
  icon: 'size-10',
  'icon-sm': 'size-8',
};

/**
 * <Button to="/x"> renders a router Link, <Button href> an anchor, otherwise a button.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  to,
  href,
  className = '',
  children,
  type = 'button',
  disabled,
  ...props
}) {
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  const content = (
    <>
      {loading ? <LoaderCircle className="size-4 animate-spin" /> : Icon ? <Icon className="size-4" /> : null}
      {children}
    </>
  );
  if (to) {
    return (
      <Link to={to} className={cls} {...props}>
        {content}
      </Link>
    );
  }
  if (href) {
    const external = /^https?:/i.test(href);
    return (
      <a href={href} className={cls} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...props}>
        {content}
      </a>
    );
  }
  return (
    <button type={type} className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {content}
    </button>
  );
}
