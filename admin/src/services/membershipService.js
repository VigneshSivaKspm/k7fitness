import {
  collection,
  doc,
  getCountFromServer,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { getActor } from './session';
import { logActivity } from './activityService';
import { computeTotals, dueDateFor, formatReceiptNo, readCounter, writeCounter } from './ledger';
import { buildMembershipDoc, buildPaymentDoc } from './traineeService';
import { parseDateInput, startOfDay } from '../utils/dates';
import { roundMoney } from '../utils/format';
import { AppError } from '../utils/errors';

const mapDoc = (d) => ({ id: d.id, ...d.data() });

// ── Membership records (history) ───────────────────────────────────────────

export async function listTraineeMemberships(traineeId) {
  const snap = await getDocs(
    query(collection(db, 'memberships'), where('traineeId', '==', traineeId), orderBy('startDate', 'desc')),
  );
  return snap.docs.map(mapDoc);
}

/**
 * Renews a membership. The previous membership record is never modified,
 * so the full membership history is preserved. Optionally records a payment
 * against the new membership in the same transaction.
 */
export async function renewMembership(traineeId, { plan, startDate, fee, payment, notes }, settings) {
  const membershipRef = doc(collection(db, 'memberships'));
  const paymentRef = payment ? doc(collection(db, 'payments')) : null;
  const traineeRef = doc(db, 'trainees', traineeId);

  const res = await runTransaction(db, async (tx) => {
    const tSnap = await tx.get(traineeRef);
    if (!tSnap.exists()) throw new AppError('This trainee no longer exists.');
    const receiptN = payment ? await readCounter(tx, 'receipts') : null;
    const trainee = tSnap.data();

    const amount = payment ? roundMoney(payment.amount) : 0;
    if (amount > roundMoney(fee)) throw new AppError('Payment cannot be more than the membership fee.');

    const mDoc = buildMembershipDoc({
      traineeId,
      memberId: trainee.memberId,
      traineeName: trainee.fullName,
      plan,
      startDate,
      fee,
      paidAmount: amount,
      type: trainee.currentMembershipId ? 'renewal' : 'new',
      previousMembershipId: trainee.currentMembershipId,
      notes,
    });
    tx.set(membershipRef, mDoc);

    if (payment) {
      tx.set(
        paymentRef,
        buildPaymentDoc({
          receiptNo: formatReceiptNo(receiptN),
          trainee,
          traineeId,
          membershipId: membershipRef.id,
          planName: plan.name,
          payment,
        }),
      );
      writeCounter(tx, 'receipts', receiptN);
    }

    tx.update(traineeRef, {
      currentMembershipId: membershipRef.id,
      currentPlanId: plan.id,
      currentPlanName: plan.name,
      membershipStart: mDoc.startDate,
      membershipExpiry: mDoc.expiryDate,
      status: 'active',
      ...computeTotals(trainee, {
        feeDelta: mDoc.fee,
        paidDelta: amount,
        dueCandidate: dueDateFor(mDoc.startDate, settings.feeDueDays),
        partial: amount > 0,
      }),
      updatedAt: serverTimestamp(),
      updatedBy: getActor().uid,
    });
    return { membershipId: membershipRef.id, paymentId: paymentRef?.id, name: trainee.fullName };
  });

  logActivity('Renewed membership', 'trainee', traineeId, `${res.name} → ${plan.name}`);
  return res;
}

/** Corrects fee and/or dates of a membership. Fee can never drop below what was already paid. */
export async function adjustMembership(membershipId, { fee, startDate, expiryDate, notes }, settings) {
  const mRef = doc(db, 'memberships', membershipId);
  await runTransaction(db, async (tx) => {
    const mSnap = await tx.get(mRef);
    if (!mSnap.exists()) throw new AppError('This membership no longer exists.');
    const m = mSnap.data();
    const tRef = doc(db, 'trainees', m.traineeId);
    const tSnap = await tx.get(tRef);
    const trainee = tSnap.data();

    const newFee = roundMoney(fee);
    if (newFee < m.paidAmount) {
      throw new AppError(`Fee cannot be lower than the amount already paid for this membership.`);
    }
    const start = Timestamp.fromDate(startOfDay(parseDateInput(startDate)));
    const expiry = Timestamp.fromDate(startOfDay(parseDateInput(expiryDate)));
    if (expiry.toMillis() < start.toMillis()) throw new AppError('Expiry date cannot be before the start date.');

    tx.update(mRef, { fee: newFee, startDate: start, expiryDate: expiry, notes: notes ?? m.notes ?? '', updatedAt: serverTimestamp() });

    const traineeUpdate = {
      ...computeTotals(trainee, {
        feeDelta: newFee - m.fee,
        dueCandidate: dueDateFor(start, settings.feeDueDays),
        partial: m.paidAmount > 0,
      }),
      updatedAt: serverTimestamp(),
      updatedBy: getActor().uid,
    };
    if (trainee.currentMembershipId === membershipId) {
      traineeUpdate.membershipStart = start;
      traineeUpdate.membershipExpiry = expiry;
    }
    tx.update(tRef, traineeUpdate);
  });
  logActivity('Adjusted membership', 'membership', membershipId, `Fee ${fee}`);
}

/**
 * Cancels a membership: any unpaid balance on it is waived and, if it is the
 * current membership, the trainee is left without an active plan.
 */
export async function cancelMembership(membershipId, reason = '') {
  const mRef = doc(db, 'memberships', membershipId);
  let traineeId = '';
  await runTransaction(db, async (tx) => {
    const mSnap = await tx.get(mRef);
    if (!mSnap.exists()) throw new AppError('This membership no longer exists.');
    const m = mSnap.data();
    if (m.status === 'cancelled') throw new AppError('This membership is already cancelled.');
    traineeId = m.traineeId;
    const tRef = doc(db, 'trainees', m.traineeId);
    const trainee = (await tx.get(tRef)).data();

    tx.update(mRef, {
      status: 'cancelled',
      originalFee: m.fee,
      fee: m.paidAmount,
      cancelReason: reason,
      cancelledAt: serverTimestamp(),
      cancelledBy: getActor().uid,
      updatedAt: serverTimestamp(),
    });
    const update = {
      ...computeTotals(trainee, { feeDelta: m.paidAmount - m.fee, partial: trainee.paymentStatus === 'partial' }),
      updatedAt: serverTimestamp(),
      updatedBy: getActor().uid,
    };
    if (trainee.currentMembershipId === membershipId) {
      Object.assign(update, {
        currentMembershipId: null,
        currentPlanId: null,
        currentPlanName: '',
        membershipStart: null,
        membershipExpiry: null,
      });
    }
    tx.update(tRef, update);
  });
  logActivity('Cancelled membership', 'trainee', traineeId, reason);
}

// ── Membership plans (shared with the public website) ─────────────────────

export async function listPlans({ activeOnly = false } = {}) {
  const snap = await getDocs(query(collection(db, 'membershipPlans'), orderBy('displayOrder')));
  const plans = snap.docs.map(mapDoc);
  return activeOnly ? plans.filter((p) => p.active) : plans;
}

/** How many active trainees are currently on each plan. */
export async function countMembersOnPlan(planId) {
  const snap = await getCountFromServer(
    query(collection(db, 'trainees'), where('currentPlanId', '==', planId), where('status', '==', 'active')),
  );
  return snap.data().count;
}
