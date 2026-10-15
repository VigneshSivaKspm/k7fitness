import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
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
import { addDays, startOfDay, toDate, toDateInput, todayInput } from '../utils/dates';
import { AppError } from '../utils/errors';

/**
 * Daily attendance with Check-in and Check-out tracking.
 * Keyed `{traineeId}_{YYYY-MM-DD}`.
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
  const now = new Date();

  const created = await runTransaction(db, async (tx) => {
    const [aSnap, tSnap] = [await tx.get(aRef), await tx.get(tRef)];
    if (!tSnap.exists()) throw new AppError('This member no longer exists.');
    if (aSnap.exists()) {
      const data = aSnap.data();
      // If already marked, toggle or re-check in
      if (data.status === 'checked_out') {
        tx.update(aRef, {
          status: 'checked_in',
          checkOutTime: null,
          durationMinutes: null,
          updatedAt: serverTimestamp(),
        });
        return true;
      }
      return false;
    }

    const t = tSnap.data();
    const dayTs = Timestamp.fromDate(day);
    const checkInTs = Timestamp.fromDate(now);

    tx.set(aRef, {
      traineeId: trainee.id,
      memberId: t.memberId,
      traineeName: t.fullName,
      date: toDateInput(day),
      day: dayTs,
      status: 'checked_in',
      checkInTime: checkInTs,
      checkOutTime: null,
      durationMinutes: null,
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

export async function checkOutTrainee(trainee, date = new Date()) {
  const day = startOfDay(date);
  const aRef = doc(db, 'attendance', attendanceId(trainee.id, day));
  const actor = getActor();
  const now = new Date();

  await runTransaction(db, async (tx) => {
    const aSnap = await tx.get(aRef);
    if (!aSnap.exists()) throw new AppError('No check-in record found for this day.');
    const data = aSnap.data();
    const checkInDate = data.checkInTime?.toDate?.() || toDate(data.checkInTime) || day;
    const durationMinutes = Math.max(1, Math.round((now.getTime() - checkInDate.getTime()) / 60000));

    tx.update(aRef, {
      status: 'checked_out',
      checkOutTime: Timestamp.fromDate(now),
      durationMinutes,
      checkOutBy: actor.uid,
      checkOutByName: actor.name,
      updatedAt: serverTimestamp(),
    });
  });

  logActivity('Checked out trainee', 'trainee', trainee.id, `${trainee.fullName} · ${toDateInput(day)}`);
}

/** Check in directly by member from Member Portal */
export async function memberCheckIn(trainee) {
  const day = startOfDay();
  const aRef = doc(db, 'attendance', attendanceId(trainee.id, day));
  const tRef = doc(db, 'trainees', trainee.id);
  const now = new Date();

  return await runTransaction(db, async (tx) => {
    const [aSnap, tSnap] = [await tx.get(aRef), await tx.get(tRef)];
    if (!tSnap.exists()) throw new AppError('Member account not found.');
    if (aSnap.exists()) {
      const existing = aSnap.data();
      if (existing.status === 'checked_in') {
        return { alreadyCheckedIn: true, data: existing };
      }
      // Re-check-in after checkout
      tx.update(aRef, {
        status: 'checked_in',
        checkInTime: Timestamp.fromDate(now),
        checkOutTime: null,
        durationMinutes: null,
        updatedAt: serverTimestamp(),
      });
      return { success: true, recheckIn: true };
    }

    const t = tSnap.data();
    const dayTs = Timestamp.fromDate(day);
    const checkInTs = Timestamp.fromDate(now);

    tx.set(aRef, {
      traineeId: trainee.id,
      memberId: t.memberId,
      traineeName: t.fullName,
      date: toDateInput(day),
      day: dayTs,
      status: 'checked_in',
      checkInTime: checkInTs,
      checkOutTime: null,
      durationMinutes: null,
      markedAt: serverTimestamp(),
      markedBy: 'member',
      markedByName: t.fullName,
    });

    const last = t.lastAttendance?.toMillis?.() || 0;
    tx.update(tRef, {
      attendanceCount: increment(1),
      ...(dayTs.toMillis() > last ? { lastAttendance: dayTs } : {}),
    });

    return { success: true };
  });
}

/** Check out directly by member from Member Portal */
export async function memberCheckOut(trainee) {
  const day = startOfDay();
  const aRef = doc(db, 'attendance', attendanceId(trainee.id, day));
  const now = new Date();

  return await runTransaction(db, async (tx) => {
    const aSnap = await tx.get(aRef);
    if (!aSnap.exists()) {
      throw new AppError('You have not checked in yet today.');
    }
    const data = aSnap.data();
    const checkInDate = data.checkInTime?.toDate?.() || toDate(data.checkInTime) || day;
    const durationMinutes = Math.max(1, Math.round((now.getTime() - checkInDate.getTime()) / 60000));

    tx.update(aRef, {
      status: 'checked_out',
      checkOutTime: Timestamp.fromDate(now),
      durationMinutes,
      checkOutBy: 'member',
      checkOutByName: trainee.fullName,
      updatedAt: serverTimestamp(),
    });

    return { success: true, durationMinutes };
  });
}

/** Get today's attendance document for a trainee */
export async function getTodayAttendance(traineeId) {
  const day = startOfDay();
  const snap = await getDoc(doc(db, 'attendance', attendanceId(traineeId, day)));
  return snap.exists() ? mapDoc(snap) : null;
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

/** Fetch recent attendance records across all members for reports/export */
export async function listAllRecentAttendance(max = 1000) {
  try {
    const snap = await getDocs(query(col(), orderBy('day', 'desc'), limit(max)));
    return snap.docs.map(mapDoc);
  } catch (err) {
    const snap = await getDocs(query(col(), limit(max)));
    return snap.docs.map(mapDoc);
  }
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
