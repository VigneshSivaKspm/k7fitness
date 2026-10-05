import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  startAfter,
  Timestamp,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { getActor } from './session';
import { logActivity } from './activityService';
import { computeTotals, dueDateFor, formatReceiptNo, readCounter, writeCounter } from './ledger';
import { buildPaymentDoc, searchTrainees } from './traineeService';
import { roundMoney } from '../utils/format';
import { AppError } from '../utils/errors';

const col = () => collection(db, 'payments');
const mapDoc = (d) => ({ id: d.id, ...d.data() });

/**
 * Records a payment against a specific membership. The payment, the
 * membership's paid amount and the trainee's running totals are updated
 * atomically — balances can never drift from the transaction history.
 */
export async function recordPayment(traineeId, membershipId, payment, settings) {
  const paymentRef = doc(col());
  const tRef = doc(db, 'trainees', traineeId);
  const mRef = doc(db, 'memberships', membershipId);

  const res = await runTransaction(db, async (tx) => {
    const [tSnap, mSnap] = [await tx.get(tRef), await tx.get(mRef)];
    if (!tSnap.exists() || !mSnap.exists()) throw new AppError('This trainee or membership no longer exists.');
    const receiptN = await readCounter(tx, 'receipts');
    const trainee = tSnap.data();
    const m = mSnap.data();
    if (m.traineeId !== traineeId) throw new AppError('This membership belongs to a different trainee.');

    const amount = roundMoney(payment.amount);
    const due = roundMoney(m.fee - m.paidAmount);
    if (amount <= 0) throw new AppError('Payment amount must be greater than 0.');
    if (amount > due) {
      throw new AppError(due > 0 ? `Payment cannot be more than the outstanding ${due} for this membership.` : 'This membership is already fully paid.');
    }

    const receiptNo = formatReceiptNo(receiptN);
    tx.set(paymentRef, buildPaymentDoc({ receiptNo, trainee, traineeId, membershipId, planName: m.planName, payment }));
    writeCounter(tx, 'receipts', receiptN);
    tx.update(mRef, { paidAmount: roundMoney(m.paidAmount + amount), updatedAt: serverTimestamp() });
    tx.update(tRef, {
      ...computeTotals(trainee, {
        paidDelta: amount,
        dueCandidate: dueDateFor(m.startDate, settings.feeDueDays),
        partial: true,
      }),
      updatedAt: serverTimestamp(),
      updatedBy: getActor().uid,
    });
    return { id: paymentRef.id, receiptNo, name: trainee.fullName };
  });

  logActivity('Recorded payment', 'trainee', traineeId, `${res.receiptNo} · ${payment.amount} via ${payment.method}`);
  return res;
}

/**
 * Payments are never deleted. Voiding keeps the record for audit and
 * reverses its effect on the membership and trainee balances.
 */
export async function voidPayment(paymentId, reason, settings) {
  const pRef = doc(db, 'payments', paymentId);
  let info = null;
  await runTransaction(db, async (tx) => {
    const pSnap = await tx.get(pRef);
    if (!pSnap.exists()) throw new AppError('This payment no longer exists.');
    const p = pSnap.data();
    if (p.status === 'void') throw new AppError('This payment has already been voided.');
    const mRef = doc(db, 'memberships', p.membershipId);
    const tRef = doc(db, 'trainees', p.traineeId);
    const [mSnap, tSnap] = [await tx.get(mRef), await tx.get(tRef)];
    const m = mSnap.data();
    const trainee = tSnap.data();
    const newPaid = roundMoney(Math.max(0, m.paidAmount - p.amount));
    const actor = getActor();

    tx.update(pRef, { status: 'void', voidReason: reason, voidedAt: serverTimestamp(), voidedBy: actor.uid, voidedByName: actor.name });
    tx.update(mRef, {
      paidAmount: newPaid,
      // A cancelled membership's fee equals what was paid; keep it consistent.
      ...(m.status === 'cancelled' ? { fee: newPaid } : {}),
      updatedAt: serverTimestamp(),
    });
    tx.update(tRef, {
      ...computeTotals(trainee, {
        paidDelta: -p.amount,
        feeDelta: m.status === 'cancelled' ? -p.amount : 0,
        dueCandidate: dueDateFor(m.startDate, settings.feeDueDays),
        partial: newPaid > 0,
      }),
      updatedAt: serverTimestamp(),
      updatedBy: actor.uid,
    });
    info = p;
  });
  logActivity('Voided payment', 'trainee', info.traineeId, `${info.receiptNo} · ${reason}`);
}

export async function getPayment(id) {
  const snap = await getDoc(doc(db, 'payments', id));
  return snap.exists() ? mapDoc(snap) : null;
}

export async function listTraineePayments(traineeId, max = 50) {
  const snap = await getDocs(query(col(), where('traineeId', '==', traineeId), orderBy('paymentDate', 'desc'), limit(max)));
  return snap.docs.map(mapDoc);
}

export async function recentPayments(max = 6) {
  const snap = await getDocs(query(col(), orderBy('createdAt', 'desc'), limit(max)));
  return snap.docs.map(mapDoc);
}

/**
 * Payment history with date range and member search.
 * Search matches trainees (name / phone / member ID) or an exact receipt number.
 */
export async function listPayments({ from, to, search = '', pageSize = 20, cursor = null }) {
  const parts = [];
  const term = search.trim();
  if (term) {
    if (/^rcpt-?\d+$/i.test(term)) {
      const n = term.replace(/\D/g, '');
      const snap = await getDocs(query(col(), where('receiptNo', '==', formatReceiptNo(Number(n))), limit(1)));
      return { items: snap.docs.map(mapDoc), cursor: null, hasMore: false };
    }
    const trainees = await searchTrainees(term, 10);
    if (!trainees.length) return { items: [], cursor: null, hasMore: false };
    parts.push(where('traineeId', 'in', trainees.map((t) => t.id)));
  }
  if (from) parts.push(where('paymentDate', '>=', Timestamp.fromDate(from)));
  if (to) parts.push(where('paymentDate', '<=', Timestamp.fromDate(to)));
  parts.push(orderBy('paymentDate', 'desc'));
  if (cursor) parts.push(startAfter(cursor));
  parts.push(limit(pageSize + 1));
  const snap = await getDocs(query(col(), ...parts));
  const docs = snap.docs.slice(0, pageSize);
  return { items: docs.map(mapDoc), cursor: docs[docs.length - 1] || null, hasMore: snap.docs.length > pageSize };
}

/** All payments in a range — for explicit CSV export only. */
export async function fetchPaymentsInRange(from, to) {
  const all = [];
  let cursor = null;
  for (;;) {
    const parts = [where('paymentDate', '>=', Timestamp.fromDate(from)), where('paymentDate', '<=', Timestamp.fromDate(to)), orderBy('paymentDate')];
    if (cursor) parts.push(startAfter(cursor));
    parts.push(limit(500));
    const snap = await getDocs(query(col(), ...parts));
    all.push(...snap.docs.map(mapDoc));
    if (snap.docs.length < 500) break;
    cursor = snap.docs[snap.docs.length - 1];
  }
  return all;
}
