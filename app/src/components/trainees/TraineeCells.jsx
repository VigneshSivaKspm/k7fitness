import Avatar from '../ui/Avatar';
import { StatusBadge } from '../ui/Badge';
import { formatDate, relativeDays, daysUntil } from '../../utils/dates';
import { formatPhone } from '../../utils/format';
import { getMembershipStatus, getPaymentStatus } from '../../utils/status';

export function TraineeIdentity({ trainee, size = 'md', showPhone = true }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar name={trainee.fullName} src={trainee.photoUrl} size={size} />
      <div className="min-w-0">
        <p className="truncate font-semibold text-zinc-900">{trainee.fullName}</p>
        <p className="truncate text-xs text-zinc-500">
          <span className="font-medium text-zinc-600">{trainee.memberId}</span>
          {showPhone && trainee.phone && <> · {formatPhone(trainee.phone)}</>}
        </p>
      </div>
    </div>
  );
}

export function ExpiryCell({ trainee }) {
  if (!trainee.membershipExpiry) return <span className="text-zinc-400">—</span>;
  const days = daysUntil(trainee.membershipExpiry);
  const tone = days < 0 ? 'text-red-600' : days <= 7 ? 'text-amber-700' : 'text-zinc-500';
  return (
    <div className="whitespace-nowrap">
      <p className="text-zinc-800">{formatDate(trainee.membershipExpiry)}</p>
      <p className={`text-xs ${tone}`}>{relativeDays(trainee.membershipExpiry)}</p>
    </div>
  );
}

export function MembershipBadge({ trainee, alertDays }) {
  return <StatusBadge kind="membership" status={getMembershipStatus(trainee, alertDays)} />;
}

export function PaymentBadge({ trainee }) {
  return <StatusBadge kind="payment" status={getPaymentStatus(trainee)} />;
}
