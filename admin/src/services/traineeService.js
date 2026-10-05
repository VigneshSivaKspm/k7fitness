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
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { getActor } from './session';
import { logActivity } from './activityService';
import { deleteFile } from './storageService';
import {
  computeTotals,
  dueDateFor,
  formatMemberId,
  formatReceiptNo,
  readCounter,
  writeCounter,
} from './ledger';
import { buildSearchTokens, normalizeSearchTerm } from '../utils/search';
import { normalizePhone, roundMoney } from '../utils/format';
import { addDays, calculateExpiry, endOfDay, parseDateInput, startOfDay } from '../utils/dates';
import { AppError } from '../utils/errors';

const col = () => collection(db, 'trainees');
const mapDoc = (d) => ({ id: d.id, ...d.data() });

/** Personal-profile fields editable from the trainee form. */
function profileFields(form) {
  return {
    fullName: form.fullName.trim(),
    nameLower: form.fullName.trim().toLowerCase(),
    phone: normalizePhone(form.phone),
    altPhone: normalizePhone(form.altPhone),
    email: form.email.trim().toLowerCase(),
    gender: form.gender || '',
    dob: form.dob ? Timestamp.fromDate(parseDateInput(form.dob)) : null,
    address: form.address.trim(),
    emergencyName: form.emergencyName.trim(),
    emergencyPhone: normalizePhone(form.emergencyPhone),
    joiningDate: Timestamp.fromDate(parseDateInput(form.joiningDate)),
    medicalNotes: form.medicalNotes.trim(),
    trainerNotes: form.trainerNotes.trim(),
    photoUrl: form.photo?.url || '',
    photoPath: form.photo?.path || '',
  };
}

export function buildMembershipDoc({ traineeId, memberId, traineeName, plan, startDate, fee, paidAmount, type, previousMembershipId, notes }) {
  const start = startOfDay(parseDateInput(startDate));
  const expiry = calculateExpiry(start, plan.duration, plan.durationUnit);
  const actor = getActor();
  return {
    traineeId,
    memberId,
    traineeName,
    planId: plan.id,
    planName: plan.name,
    duration: Number(plan.duration),
    durationUnit: plan.durationUnit,
    startDate: Timestamp.fromDate(start),
    expiryDate: Timestamp.fromDate(expiry),
    fee: roundMoney(fee),
    paidAmount: roundMoney(paidAmount),
    status: 'active',
    type,
    previousMembershipId: previousMembershipId || null,
    notes: notes || '',
    createdAt: serverTimestamp(),
    createdBy: actor.uid,
    updatedAt: serverTimestamp(),
  };
}

export function buildPaymentDoc({ receiptNo, trainee, traineeId, membershipId, planName, payment }) {
  const actor = getActor();
  return {
    receiptNo,
    traineeId,
    memberId: trainee.memberId,
    traineeName: trainee.fullName,
    traineePhone: trainee.phone,
    membershipId,
    planName,
    amount: roundMoney(payment.amount),
    paymentDate: Timestamp.fromDate(parseDateInput(payment.date)),
    method: payment.method,
    reference: (payment.reference || '').trim(),
    notes: (payment.notes || '').trim(),
    status: 'valid',
    receivedBy: actor.uid,
    receivedByName: actor.name,
    createdAt: serverTimestamp(),
  };
}

/**
 * Creates a trainee, their first membership and (optionally) an initial
 * payment in a single atomic transaction. Generates the member ID.
 */
export async function createTrainee(form, { membership, payment, settings }) {
  const actor = getActor();
  const traineeRef = doc(col());
  const membershipRef = membership ? doc(collection(db, 'memberships')) : null;
  const paymentRef = payment ? doc(collection(db, 'payments')) : null;

  const result = await runTransaction(db, async (tx) => {
    const memberNo = await readCounter(tx, 'trainees');
    const receiptN = payment ? await readCounter(tx, 'receipts') : null;
    const memberId = formatMemberId(settings.memberIdPrefix, memberNo);
    const profile = profileFields(form);

    let current = {
      currentMembershipId: null,
      currentPlanId: null,
      currentPlanName: '',
      membershipStart: null,
      membershipExpiry: null,
    };
    let totals = computeTotals({}, {});

    if (membership) {
      const fee = roundMoney(membership.fee);
      const paid = payment ? roundMoney(payment.amount) : 0;
      if (paid > fee) throw new AppError('Initial payment cannot be more than the membership fee.');
      const mDoc = buildMembershipDoc({
        traineeId: traineeRef.id,
        memberId,
        traineeName: profile.fullName,
        plan: membership.plan,
        startDate: membership.startDate,
        fee,
        paidAmount: paid,
        type: 'new',
      });
      tx.set(membershipRef, mDoc);
      current = {
        currentMembershipId: membershipRef.id,
        currentPlanId: membership.plan.id,
        currentPlanName: membership.plan.name,
        membershipStart: mDoc.startDate,
        membershipExpiry: mDoc.expiryDate,
      };
      totals = computeTotals({}, {
        feeDelta: fee,
        paidDelta: paid,
        dueCandidate: dueDateFor(mDoc.startDate, settings.feeDueDays),
        partial: paid > 0,
      });
      if (payment) {
        tx.set(
          paymentRef,
          buildPaymentDoc({
            receiptNo: formatReceiptNo(receiptN),
            trainee: { ...profile, memberId },
            traineeId: traineeRef.id,
            membershipId: membershipRef.id,
            planName: membership.plan.name,
            payment,
          }),
        );
        writeCounter(tx, 'receipts', receiptN);
      }
    }

    tx.set(traineeRef, {
      ...profile,
      memberNo,
      memberId,
      searchTokens: buildSearchTokens({ ...profile, memberId }),
      status: 'active',
      ...current,
      ...totals,
      workoutAssignmentId: null,
      workoutPlanName: '',
      dietAssignmentId: null,
      dietPlanName: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: actor.uid,
      updatedBy: actor.uid,
    });
    writeCounter(tx, 'trainees', memberNo);
    return { id: traineeRef.id, memberId };
  });

  logActivity('Created trainee', 'trainee', result.id, `${form.fullName} (${result.memberId})`);
  if (payment) logActivity('Recorded payment', 'trainee', result.id, `${payment.amount} via ${payment.method}`);
  return result;
}

export async function updateTrainee(id, form) {
  const snap = await getDoc(doc(db, 'trainees', id));
  if (!snap.exists()) throw new AppError('This trainee no longer exists.');
  const existing = snap.data();
  const profile = profileFields(form);
  await updateDoc(doc(db, 'trainees', id), {
    ...profile,
    searchTokens: buildSearchTokens({ ...profile, memberId: existing.memberId }),
    updatedAt: serverTimestamp(),
    updatedBy: getActor().uid,
  });
  if (existing.photoPath && existing.photoPath !== profile.photoPath) deleteFile(existing.photoPath).catch(() => {});
  logActivity('Updated trainee', 'trainee', id, profile.fullName);
}

export async function setTraineeStatus(id, status, name) {
  await updateDoc(doc(db, 'trainees', id), { status, updatedAt: serverTimestamp(), updatedBy: getActor().uid });
  logActivity(status === 'inactive' ? 'Deactivated trainee' : 'Reactivated trainee', 'trainee', id, name);
}

/**
 * Permanent deletion is only allowed for records without any payment
 * history (e.g. a duplicate created by mistake). Otherwise, deactivate.
 */
export async function deleteTrainee(trainee) {
  const payments = await getDocs(query(collection(db, 'payments'), where('traineeId', '==', trainee.id), limit(1)));
  if (!payments.empty) {
    throw new AppError('This trainee has payment history and cannot be deleted. Deactivate them instead to keep financial records intact.');
  }
  const related = await Promise.all(
    ['memberships', 'workoutAssignments', 'dietAssignments'].map((c) =>
      getDocs(query(collection(db, c), where('traineeId', '==', trainee.id))),
    ),
  );
  const batch = writeBatch(db);
  related.forEach((snap) => snap.docs.forEach((d) => batch.delete(d.ref)));
  batch.delete(doc(db, 'trainees', trainee.id));
  await batch.commit();
  if (trainee.photoPath) deleteFile(trainee.photoPath).catch(() => {});
  logActivity('Deleted trainee', 'trainee', trainee.id, `${trainee.fullName} (${trainee.memberId})`);
}

export async function getTrainee(id) {
  const snap = await getDoc(doc(db, 'trainees', id));
  return snap.exists() ? mapDoc(snap) : null;
}

export async function findByPhone(phone, excludeId) {
  const digits = normalizePhone(phone);
  if (digits.length < 10) return null;
  const snap = await getDocs(query(col(), where('phone', '==', digits), limit(2)));
  return snap.docs.map(mapDoc).find((t) => t.id !== excludeId) || null;
}

/** Case-insensitive search by name, phone or member ID. */
export async function searchTrainees(term, max = 20) {
  const token = normalizeSearchTerm(term);
  if (!token) return [];
  const snap = await getDocs(query(col(), where('searchTokens', 'array-contains', token), limit(max)));
  return snap.docs.map(mapDoc).sort((a, b) => a.fullName.localeCompare(b.fullName));
}

/**
 * Cursor-paginated trainee list.
 * filters: { status, planId, payment } · sort: recent | name | expiry
 */
export async function listTrainees({ filters = {}, sort = 'recent', pageSize = 20, cursor = null, alertDays = 7 }) {
  const parts = [];
  const today = startOfDay();
  let rangeField = null;
  let clientFilter = null;

  switch (filters.status) {
    case 'active':
      parts.push(where('status', '==', 'active'), where('membershipExpiry', '>=', Timestamp.fromDate(today)));
      rangeField = 'membershipExpiry';
      break;
    case 'expiring':
      parts.push(
        where('status', '==', 'active'),
        where('membershipExpiry', '>=', Timestamp.fromDate(today)),
        where('membershipExpiry', '<=', Timestamp.fromDate(endOfDay(addDays(today, alertDays)))),
      );
      rangeField = 'membershipExpiry';
      break;
    case 'expired':
      parts.push(where('status', '==', 'active'), where('membershipExpiry', '<', Timestamp.fromDate(today)));
      rangeField = 'membershipExpiry';
      break;
    case 'inactive':
      parts.push(where('status', '==', 'inactive'));
      break;
    default:
      break;
  }

  if (filters.planId) parts.push(where('currentPlanId', '==', filters.planId));

  if (filters.payment === 'overdue') {
    if (rangeField) {
      clientFilter = (t) => t.hasDues && t.feeDueDate && t.feeDueDate.toMillis() < today.getTime();
    } else {
      parts.push(where('hasDues', '==', true), where('feeDueDate', '<', Timestamp.fromDate(today)));
      rangeField = 'feeDueDate';
    }
  } else if (filters.payment && filters.payment !== 'all') {
    parts.push(where('paymentStatus', '==', filters.payment));
  }

  if (rangeField) parts.push(orderBy(rangeField, rangeField === 'membershipExpiry' && filters.status === 'expired' ? 'desc' : 'asc'));
  else if (sort === 'name') parts.push(orderBy('nameLower'));
  else if (sort === 'expiry') parts.push(orderBy('membershipExpiry'));
  else parts.push(orderBy('joiningDate', 'desc'));

  if (cursor) parts.push(startAfter(cursor));
  parts.push(limit(pageSize + 1));

  const snap = await getDocs(query(col(), ...parts));
  const docs = snap.docs.slice(0, pageSize);
  let items = docs.map(mapDoc);
  if (clientFilter) items = items.filter(clientFilter);
  return { items, cursor: docs[docs.length - 1] || null, hasMore: snap.docs.length > pageSize };
}

/** Members with outstanding dues, highest first. */
export async function listWithDues(max = 6) {
  const snap = await getDocs(query(col(), where('pendingAmount', '>', 0), orderBy('pendingAmount', 'desc'), limit(max)));
  return snap.docs.map(mapDoc);
}

export async function recentTrainees(max = 5) {
  const snap = await getDocs(query(col(), orderBy('createdAt', 'desc'), limit(max)));
  return snap.docs.map(mapDoc);
}

/** Active members whose membership expiry falls in [from, to]. */
export async function listByExpiry({ from, to, max = 100, cursor = null }) {
  const parts = [where('status', '==', 'active')];
  if (from) parts.push(where('membershipExpiry', '>=', Timestamp.fromDate(from)));
  if (to) parts.push(where('membershipExpiry', '<=', Timestamp.fromDate(to)));
  parts.push(orderBy('membershipExpiry', from ? 'asc' : 'desc'));
  if (cursor) parts.push(startAfter(cursor));
  parts.push(limit(max + 1));
  const snap = await getDocs(query(col(), ...parts));
  const docs = snap.docs.slice(0, max);
  return { items: docs.map(mapDoc), cursor: docs[docs.length - 1] || null, hasMore: snap.docs.length > max };
}

/** Streams every trainee in pages — used only for explicit CSV exports. */
export async function fetchAllTrainees() {
  const all = [];
  let cursor = null;
  for (;;) {
    const parts = [orderBy('memberNo')];
    if (cursor) parts.push(startAfter(cursor));
    parts.push(limit(500));
    const snap = await getDocs(query(col(), ...parts));
    all.push(...snap.docs.map(mapDoc));
    if (snap.docs.length < 500) break;
    cursor = snap.docs[snap.docs.length - 1];
  }
  return all;
}

