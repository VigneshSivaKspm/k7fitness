import {
  collection,
  doc,
  getCountFromServer,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { getActor } from './session';
import { logActivity } from './activityService';
import { addDays, startOfDay, toDate, toDateInput } from '../utils/dates';
import { AppError } from '../utils/errors';

/**
 * Daily attendance. One document per trainee per day, keyed
 * `{traineeId}_{YYYY-MM-DD}`, so marking twice is harmless.
 * The trainee document carries `attendanceCount` and `lastAttendance`
 * so lists can show "last visit" without reading attendance history.
 */

const col = () => collection(db, 'attendance');
const mapDoc = (d) => ({ id: d.id, ...d.data() });

export const attendanceId = (traineeId, date) => `${traineeId}_${toDateInput(date)}`;

export async function markPresent(trainee, date = new Date()) {
  const day = startOfDay(date);
  if (day > startOfDay()) throw new AppError('Attendance cannot be marked for a future date.');
  const aRef = doc(db, 'attendance', attendanceId(trainee.id, day));
  const tRef = doc(db, 'trainees', trainee.id);
  const actor = getActor();

  const created = await runTransaction(db, async (tx) => {
    const [aSnap, tSnap] = [await tx.get(aRef), await tx.get(tRef)];
    if (!tSnap.exists()) throw new AppError('This trainee no longer exists.');
    if (aSnap.exists()) return false;
    const t = tSnap.data();
    const dayTs = Timestamp.fromDate(day);
    tx.set(aRef, {
      traineeId: trainee.id,
      memberId: t.memberId,
      traineeName: t.fullName,
      date: toDateInput(day),
      day: dayTs,
      markedAt: serverTimestamp(),
      markedBy: actor.uid,
      markedByName: actor.name,
    });
    const last = t.lastAttendance?.toMillis?.() || 0;
    tx.update(tRef, {
      attendanceCount: increment(1),
      ...(dayTs.toMillis() > last ? { lastAttendance: dayTs } : {}),
    });
    return true;
  });

  if (created) logActivity('Marked attendance', 'trainee', trainee.id, `${trainee.fullName} · ${toDateInput(day)}`);
  return created;
}

export async function unmarkPresent(trainee, date = new Date()) {
  const day = startOfDay(date);
  const aRef = doc(db, 'attendance', attendanceId(trainee.id, day));
  const tRef = doc(db, 'trainees', trainee.id);

  const removed = await runTransaction(db, async (tx) => {
    const [aSnap, tSnap] = [await tx.get(aRef), await tx.get(tRef)];
    if (!aSnap.exists()) return null;
    tx.delete(aRef);
    if (tSnap.exists()) tx.update(tRef, { attendanceCount: increment(-1) });
    return tSnap.exists() ? tSnap.data() : null;
  });
  if (!removed) return false;

  // The removed visit was the latest one: fall back to the previous visit.
  if (removed.lastAttendance && toDateInput(removed.lastAttendance) === toDateInput(day)) {
    const prev = await getDocs(query(col(), where('traineeId', '==', trainee.id), orderBy('day', 'desc'), limit(1)));
    await updateDoc(tRef, { lastAttendance: prev.empty ? null : prev.docs[0].data().day });
  }
  logActivity('Removed attendance', 'trainee', trainee.id, `${trainee.fullName} · ${toDateInput(day)}`);
  return true;
}

/** Everyone checked in on a given day. */
export async function listDay(date = new Date()) {
  const snap = await getDocs(query(col(), where('date', '==', toDateInput(date))));
  return snap.docs.map(mapDoc);
}

export async function countDay(date = new Date()) {
  return (await getCountFromServer(query(col(), where('date', '==', toDateInput(date))))).data().count;
}

/** Check-ins per day for the last `days` days, oldest first. */
export async function getDailyCounts(days = 14) {
  const today = startOfDay();
  const dates = Array.from({ length: days }, (_, i) => addDays(today, i - (days - 1)));
  const values = await Promise.all(dates.map(countDay));
  return dates.map((date, i) => ({ date, value: values[i] }));
}

/** One trainee's visits in [from, to], oldest first. */
export async function listTraineeAttendance(traineeId, from, to) {
  const snap = await getDocs(
    query(
      col(),
      where('traineeId', '==', traineeId),
      where('day', '>=', Timestamp.fromDate(startOfDay(from))),
      where('day', '<=', Timestamp.fromDate(startOfDay(to))),
      orderBy('day'),
    ),
  );
  return snap.docs.map(mapDoc);
}

/** Members expected at the gym (status active), alphabetical — the roll-call list. */
export async function listRollCall(max = 500) {
  const snap = await getDocs(query(collection(db, 'trainees'), where('status', '==', 'active'), orderBy('nameLower'), limit(max)));
  return snap.docs.map(mapDoc);
}

/** Days since the trainee last attended (null if never). */
export function daysSinceVisit(trainee) {
  const last = toDate(trainee.lastAttendance);
  if (!last) return null;
  return Math.round((startOfDay() - startOfDay(last)) / 86_400_000);
}

/**
 * Regularity from visits in the last 30 days.
 * regular ≥ 3/week · occasional ≥ 1/week · irregular below that.
 */
export function regularity(visitsLast30) {
  const perWeek = (visitsLast30 * 7) / 30;
  if (perWeek >= 3) return { level: 'regular', label: 'Regular', perWeek };
  if (perWeek >= 1) return { level: 'occasional', label: 'Occasional', perWeek };
  return { level: 'irregular', label: 'Irregular', perWeek };
}
