import { ENQUIRY_STATUS, MEMBERSHIP_RECORD_STATUS, MEMBERSHIP_STATUS, PAYMENT_STATUS } from '../../constants/options';

const TONES = {
  neutral: 'bg-zinc-100 text-zinc-700 ring-zinc-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  brand: 'bg-brand-50 text-brand ring-brand-100',
  dark: 'bg-ink text-white ring-ink',
};

const DOTS = {
  neutral: 'bg-zinc-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  brand: 'bg-brand',
  dark: 'bg-white',
};

export default function Badge({ tone = 'neutral', dot = false, className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset ${TONES[tone]} ${className}`}
    >
      {dot && <span className={`size-1.5 rounded-full ${DOTS[tone]}`} />}
      {children}
    </span>
  );
}

const MAPS = {
  membership: MEMBERSHIP_STATUS,
  payment: PAYMENT_STATUS,
  record: MEMBERSHIP_RECORD_STATUS,
  enquiry: ENQUIRY_STATUS,
};

export function StatusBadge({ kind, status, className }) {
  const cfg = MAPS[kind]?.[status] || { label: status, tone: 'neutral' };
  return (
    <Badge tone={cfg.tone} dot className={className}>
      {cfg.label}
    </Badge>
  );
}
