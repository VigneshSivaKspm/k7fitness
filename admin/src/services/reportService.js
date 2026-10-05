import {
  collection,
  getAggregateFromServer,
  getCountFromServer,
  query,
  sum,
  Timestamp,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { addDays, addMonths, endOfDay, startOfDay, startOfMonth } from '../utils/dates';

/**
 * Dashboard & report numbers use server-side aggregation (count / sum), so
 * they cost a handful of reads regardless of how many members exist.
 */

const ts = (d) => Timestamp.fromDate(d);
const trainees = () => collection(db, 'trainees');
const payments = () => collection(db, 'payments');

const count = async (q) => (await getCountFromServer(q)).data().count;
const total = async (q, field) => (await getAggregateFromServer(q, { total: sum(field) })).data().total || 0;

export async function getDashboardStats(alertDays) {
  const today = startOfDay();
  const alertEnd = endOfDay(addDays(today, alertDays));
  const monthStart = startOfMonth();

  const [totalTrainees, inactive, activeMembers, expiringSoon, expired, newThisMonth, collectedThisMonth, outstanding] =
    await Promise.all([
      count(trainees()),
      count(query(trainees(), where('status', '==', 'inactive'))),
      count(query(trainees(), where('status', '==', 'active'), where('membershipExpiry', '>=', ts(today)))),
      count(
        query(
          trainees(),
          where('status', '==', 'active'),
          where('membershipExpiry', '>=', ts(today)),
          where('membershipExpiry', '<=', ts(alertEnd)),
        ),
      ),
      count(query(trainees(), where('status', '==', 'active'), where('membershipExpiry', '<', ts(today)))),
      count(query(trainees(), where('joiningDate', '>=', ts(monthStart)))),
      total(query(payments(), where('status', '==', 'valid'), where('paymentDate', '>=', ts(monthStart))), 'amount'),
      total(query(trainees(), where('pendingAmount', '>', 0)), 'pendingAmount'),
    ]);

  return {
    totalTrainees,
    activeMembers,
    inactive,
    expiringSoon,
    expired,
    newThisMonth,
    collectedThisMonth,
    outstanding,
  };
}

/** Month buckets ending with the current month: [{ start, end }] */
export function monthBuckets(n) {
  const current = startOfMonth();
  return Array.from({ length: n }, (_, i) => {
    const start = addMonths(current, i - (n - 1));
    const end = new Date(addMonths(start, 1).getTime() - 1);
    return { start, end };
  });
}

export async function getMonthlyCollections(months = 6) {
  const buckets = monthBuckets(months);
  const values = await Promise.all(
    buckets.map((b) =>
      total(
        query(payments(), where('status', '==', 'valid'), where('paymentDate', '>=', ts(b.start)), where('paymentDate', '<=', ts(b.end))),
        'amount',
      ),
    ),
  );
  return buckets.map((b, i) => ({ date: b.start, value: values[i] }));
}

export async function getMonthlyNewMembers(months = 6) {
  const buckets = monthBuckets(months);
  const values = await Promise.all(
    buckets.map((b) => count(query(trainees(), where('joiningDate', '>=', ts(b.start)), where('joiningDate', '<=', ts(b.end))))),
  );
  return buckets.map((b, i) => ({ date: b.start, value: values[i] }));
}

/** Active (non-expired) members per plan. */
export async function getPlanDistribution(plans) {
  const today = ts(startOfDay());
  const values = await Promise.all(
    plans.map((p) =>
      count(
        query(trainees(), where('status', '==', 'active'), where('currentPlanId', '==', p.id), where('membershipExpiry', '>=', today)),
      ),
    ),
  );
  return plans.map((p, i) => ({ label: p.name, value: values[i] })).filter((r) => r.value > 0);
}

export async function getMethodBreakdown(from, to, methods) {
  const values = await Promise.all(
    methods.map((m) =>
      total(
        query(
          payments(),
          where('status', '==', 'valid'),
          where('method', '==', m.value),
          where('paymentDate', '>=', ts(from)),
          where('paymentDate', '<=', ts(to)),
        ),
        'amount',
      ),
    ),
  );
  return methods.map((m, i) => ({ label: m.label, value: values[i] }));
}

export async function getCollectedBetween(from, to) {
  return total(
    query(payments(), where('status', '==', 'valid'), where('paymentDate', '>=', ts(from)), where('paymentDate', '<=', ts(to))),
    'amount',
  );
}

/** Active members whose expiry falls in [from, to] (from = null → everything up to `to`). */
export async function countByExpiry({ from, to }) {
  const parts = [where('status', '==', 'active')];
  if (from) parts.push(where('membershipExpiry', '>=', ts(from)));
  parts.push(where('membershipExpiry', '<=', ts(to)));
  return count(query(trainees(), ...parts));
}
