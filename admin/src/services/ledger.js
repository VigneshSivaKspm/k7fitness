import { doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { addDays, startOfDay, toDate } from '../utils/dates';
import { roundMoney } from '../utils/format';

/**
 * Shared bookkeeping used inside Firestore transactions.
 *
 * Source of truth: `memberships` (fee, paidAmount) and `payments` (immutable,
 * voidable). The trainee document carries derived running totals so lists,
 * filters and dashboards never need to scan payment history. Every write that
 * changes money goes through a transaction that updates both sides at once.
 */

export const counterRef = (name) => doc(db, 'counters', name);

/** Reads the next value of a counter inside a transaction (call before any writes). */
export async function readCounter(tx, name) {
  const snap = await tx.get(counterRef(name));
  return (snap.exists() ? Number(snap.data().value) || 0 : 0) + 1;
}

export function writeCounter(tx, name, value) {
  tx.set(counterRef(name), { value });
}

export const formatMemberId = (prefix, n) => `${(prefix || 'K7').toUpperCase()}-${String(n).padStart(4, '0')}`;
export const formatReceiptNo = (n) => `RCPT-${String(n).padStart(6, '0')}`;

/** Fee due date for a membership: start date + grace days. */
export function dueDateFor(startDate, graceDays) {
  return Timestamp.fromDate(addDays(startOfDay(toDate(startDate)), Number(graceDays) || 0));
}

/**
 * Recomputes the trainee's derived money fields after a fee/payment change.
 * @param {object} trainee current trainee data (from the transaction read)
 * @param {object} change
 * @param {number} change.feeDelta    change in total billed amount
 * @param {number} change.paidDelta   change in total paid amount
 * @param {Timestamp} change.dueCandidate due date to use if dues are newly created
 * @param {boolean} change.partial    whether the affected membership has some payment
 */
export function computeTotals(trainee, { feeDelta = 0, paidDelta = 0, dueCandidate = null, partial = false }) {
  const totalFee = roundMoney((Number(trainee.totalFee) || 0) + feeDelta);
  const totalPaid = roundMoney((Number(trainee.totalPaid) || 0) + paidDelta);
  const pendingAmount = roundMoney(Math.max(0, totalFee - totalPaid));
  const hasDues = pendingAmount > 0;
  let feeDueDate = null;
  if (hasDues) {
    // Keep the earliest outstanding due date so overdue status is never hidden by a newer bill.
    const existing = trainee.hasDues && trainee.feeDueDate ? trainee.feeDueDate : null;
    feeDueDate = existing && (!dueCandidate || existing.toMillis() <= dueCandidate.toMillis()) ? existing : dueCandidate || Timestamp.now();
  }
  return {
    totalFee,
    totalPaid,
    pendingAmount,
    hasDues,
    feeDueDate,
    paymentStatus: !hasDues ? 'paid' : partial ? 'partial' : 'pending',
  };
}
