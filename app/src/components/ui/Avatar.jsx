import { initials } from '../../utils/format';

const SIZES = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-14 text-lg',
  xl: 'size-20 text-2xl',
};

export default function Avatar({ name, src, size = 'md', className = '' }) {
  if (src) {
    return <img src={src} alt="" className={`${SIZES[size]} shrink-0 rounded-full object-cover ring-2 ring-white ${className}`} loading="lazy" />;
  }
  return (
    <span
      className={`${SIZES[size]} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-800 to-ink font-semibold text-white ring-2 ring-white ${className}`}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
