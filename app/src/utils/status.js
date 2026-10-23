import { daysUntil } from './dates';

/**
 * Membership status is derived from data, never stored, so it can't go stale.
 * active | expiring | expired | inactive | none
 */
export function getMembershipStatus(trainee, alertDays = 7) {
  if (!trainee) return 'none';
  if (trainee.status === 'inactive') return 'inactive';
  if (!trainee.membershipExpiry) return 'none';
  const days = daysUntil(trainee.membershipExpiry);
  if (days < 0) return 'expired';
  if (days <= alertDays) return 'expiring';
  return 'active';
}

/**
 * paid | partial | pending | overdue
 * `paymentStatus` (paid/partial/pending) is stored for querying; "overdue" is
 * derived from the due date at read time.
 */
export function getPaymentStatus(record) {
  if (!record) return 'paid';
  const pending = Number(record.pendingAmount ?? 0);
  if (pending <= 0) return 'paid';
  if (record.feeDueDate && daysUntil(record.feeDueDate) < 0) return 'overdue';
  return Number(record.totalPaid ?? 0) > 0 ? 'partial' : 'pending';
}

export function getMembershipRecordStatus(membership) {
  if (membership.status === 'cancelled') return 'cancelled';
  const days = daysUntil(membership.expiryDate);
  if (daysUntil(membership.startDate) > 0) return 'upcoming';
  if (days < 0) return 'completed';
  return 'current';
}
