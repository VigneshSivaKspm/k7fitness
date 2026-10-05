/**
 * DEMO BUILD ONLY — sample data generated on first launch of the demo APK.
 * Everything is relative to "today" so renewals, dues and attendance always
 * look current. A fixed random seed keeps the data the same on every device.
 */
import {
  DEFAULT_ABOUT,
  DEFAULT_CONTACT,
  DEFAULT_GALLERY,
  DEFAULT_HERO,
  DEFAULT_OFFERS,
  DEFAULT_PLANS,
  DEFAULT_PROGRAMS,
  DEFAULT_TESTIMONIALS,
  DEFAULT_TRAINERS,
} from '../../../website/src/constants/defaults.js';
import { DEFAULT_SETTINGS } from '../constants/options';
import { buildSearchTokens } from '../utils/search';
import { addDays, calculateExpiry, startOfDay, toDateInput } from '../utils/dates';
import { DEMO_EMAIL, DEMO_UID } from './auth';

const ACTOR = { uid: DEMO_UID, name: 'Demo Owner' };

const FIRST = {
  male: ['Arun', 'Karthik', 'Vignesh', 'Prakash', 'Suresh', 'Dinesh', 'Manoj', 'Rahul', 'Senthil', 'Gokul', 'Hari', 'Naveen', 'Ajith', 'Bala', 'Sathish', 'Vijay', 'Ramesh', 'Kishore', 'Mohan', 'Deepak'],
  female: ['Priya', 'Divya', 'Meena', 'Kavya', 'Anitha', 'Lakshmi', 'Swathi', 'Nandhini', 'Keerthana', 'Revathi', 'Sangeetha', 'Pooja', 'Harini', 'Janani'],
};
const LAST = ['Kumar', 'Raja', 'Murugan', 'Selvam', 'Krishnan', 'Subramani', 'Ganesan', 'Palani', 'Shankar', 'Ravi', 'Natarajan', 'Sundaram', 'Mani', 'Velu'];
const METHODS = ['cash', 'upi', 'upi', 'upi', 'card', 'bank'];

/** Small deterministic PRNG (mulberry32). */
function rng(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Website PNG photos are large; the demo bundles only the WebP set. */
const WEBP = {
  '/images/04-strength.png': '/images/program-strength.webp',
  '/images/05-cardio.png': '/images/program-fat-loss.webp',
  '/images/06-personal-training.png': '/images/program-personal-training.webp',
  '/images/07-transformation.png': '/images/program-transformation.webp',
};
const webp = (url) => WEBP[url] || url || '';

const WORKOUTS = [
  {
    name: 'Beginner Full Body',
    goal: 'General fitness',
    level: 'Beginner',
    description: 'Three full-body sessions a week to learn the basic lifts and build a routine.',
    days: [
      ['Day 1 · Full body A', [['Goblet squat', '3', '12'], ['Push-ups', '3', '10'], ['Lat pulldown', '3', '12'], ['Plank', '3', '30 sec']]],
      ['Day 2 · Full body B', [['Leg press', '3', '12'], ['Dumbbell bench press', '3', '10'], ['Seated row', '3', '12'], ['Bicycle crunch', '3', '15']]],
      ['Day 3 · Conditioning', [['Treadmill brisk walk', '1', '20 min'], ['Kettlebell swing', '3', '15'], ['Step-ups', '3', '10 each']]],
    ],
  },
  {
    name: 'Muscle Gain · Push Pull Legs',
    goal: 'Muscle gain',
    level: 'Intermediate',
    description: 'Six-day hypertrophy split. Progressive overload every week.',
    days: [
      ['Push', [['Barbell bench press', '4', '8'], ['Overhead press', '3', '10'], ['Incline dumbbell press', '3', '10'], ['Triceps pushdown', '3', '12']]],
      ['Pull', [['Deadlift', '4', '5'], ['Pull-ups', '3', '8'], ['Barbell row', '3', '10'], ['Barbell curl', '3', '12']]],
      ['Legs', [['Back squat', '4', '8'], ['Romanian deadlift', '3', '10'], ['Walking lunges', '3', '12 each'], ['Calf raise', '4', '15']]],
    ],
  },
];

const DIETS = [
  {
    name: 'Fat Loss · 1600 kcal (veg)',
    goal: 'Weight loss',
    description: 'South-Indian vegetarian plan with a moderate calorie deficit.',
    calories: 1600, protein: 95, carbs: 180, fat: 50,
    meals: [
      ['Early Morning', '6:00', [['Warm water with lemon', '1 glass'], ['Soaked almonds', '6']]],
      ['Breakfast', '8:30', [['Ragi dosa', '2'], ['Sambar', '1 cup']]],
      ['Lunch', '13:00', [['Brown rice', '1 cup'], ['Dal', '1 cup'], ['Vegetable poriyal', '1 cup'], ['Curd', '1 cup']]],
      ['Evening', '17:00', [['Sundal (chana)', '1 cup'], ['Green tea', '1 cup']]],
      ['Dinner', '20:00', [['Chapati', '2'], ['Paneer bhurji', '100 g']]],
    ],
  },
  {
    name: 'Muscle Gain · High Protein',
    goal: 'Muscle gain',
    description: 'Calorie surplus with 1.8 g protein per kg body weight.',
    calories: 2800, protein: 150, carbs: 340, fat: 80,
    meals: [
      ['Breakfast', '7:30', [['Oats with milk', '80 g'], ['Boiled eggs', '4'], ['Banana', '2']]],
      ['Lunch', '13:00', [['Rice', '1.5 cups'], ['Chicken curry', '200 g'], ['Rasam', '1 cup']]],
      ['Post-Workout', '18:30', [['Whey protein', '1 scoop'], ['Peanut butter toast', '2 slices']]],
      ['Dinner', '21:00', [['Chapati', '3'], ['Egg curry', '3 eggs'], ['Salad', '1 bowl']]],
    ],
  },
];

export function buildSeed(Timestamp) {
  const rand = rng(7);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const chance = (p) => rand() < p;
  const between = (a, b) => a + Math.floor(rand() * (b - a + 1));
  const ts = (d) => Timestamp.fromDate(d);
  const at = (day, h, m = 0) => {
    const d = new Date(day);
    d.setHours(h, m, 0, 0);
    return d;
  };

  const today = startOfDay();
  const now = Timestamp.now();
  const db = {};
  const put = (col, id, data) => {
    (db[col] ||= {})[id] = data;
  };
  let seq = 0;
  const nextId = (p) => `${p}${String(++seq).padStart(5, '0')}`;
  const log = (action, recordType, recordId, details, when) =>
    put('activityLogs', nextId('log'), { adminUid: ACTOR.uid, adminName: ACTOR.name, action, recordType, recordId, details, createdAt: ts(when) });

  // ── Admin, settings, website content ─────────────────────────────────────
  put('admins', DEMO_UID, { name: 'Demo Owner', email: DEMO_EMAIL, role: 'owner', active: true, createdAt: now, updatedAt: now });
  put('settings', 'general', { ...DEFAULT_SETTINGS, createdAt: now, updatedAt: now });

  const { id: _h, ...hero } = DEFAULT_HERO;
  put('websiteSettings', 'hero', { ...hero, imagePath: '', updatedAt: now });
  put('websiteSettings', 'about', { ...DEFAULT_ABOUT, images: DEFAULT_ABOUT.images.map((i) => ({ url: webp(i.url), path: '' })), updatedAt: now });
  put('websiteSettings', 'contact', { ...DEFAULT_CONTACT, logoPath: '', updatedAt: now });

  const plans = DEFAULT_PLANS.map(({ id, ...p }, i) => {
    put('membershipPlans', id, { ...p, active: true, showOnWebsite: true, displayOrder: i, createdAt: now, updatedAt: now });
    return { id, ...p };
  });
  DEFAULT_PROGRAMS.forEach(({ id, ...p }, i) => put('programs', id, { ...p, imageUrl: webp(p.imageUrl), imagePath: '', active: true, displayOrder: i, createdAt: now, updatedAt: now }));
  DEFAULT_TRAINERS.forEach(({ id, ...p }, i) => put('trainers', id, { ...p, photoUrl: webp(p.photoUrl), photoPath: '', active: true, displayOrder: i, createdAt: now, updatedAt: now }));
  DEFAULT_GALLERY.forEach(({ id, ...p }, i) => put('gallery', id, { ...p, imageUrl: webp(p.imageUrl), imagePath: '', active: true, displayOrder: i, createdAt: now, updatedAt: now }));
  DEFAULT_TESTIMONIALS.forEach(({ id, ...p }, i) => put('testimonials', id, { ...p, active: true, displayOrder: i, createdAt: now, updatedAt: now }));
  DEFAULT_OFFERS.forEach(({ id, ...p }, i) =>
    put('offers', id, { ...p, startDate: ts(addDays(today, -5)), endDate: ts(addDays(today, 25)), active: true, displayOrder: i, createdAt: now, updatedAt: now }),
  );

  // ── Workout & diet templates ──────────────────────────────────────────────
  const workoutTemplates = WORKOUTS.map((w) => {
    const id = nextId('wt');
    const days = w.days.map(([title, exercises]) => ({
      id: nextId('d'),
      title,
      notes: '',
      exercises: exercises.map(([name, sets, reps]) => ({ id: nextId('e'), name, sets, reps, weight: '', duration: '', rest: '60 sec', instructions: '' })),
    }));
    const doc = { name: w.name, nameLower: w.name.toLowerCase(), goal: w.goal, level: w.level, description: w.description, days, dayCount: days.length, createdAt: now, updatedAt: now, createdBy: ACTOR.uid, updatedBy: ACTOR.uid };
    put('workoutTemplates', id, doc);
    return { id, ...doc };
  });
  const dietTemplates = DIETS.map((d) => {
    const id = nextId('dt');
    const meals = d.meals.map(([slot, time, items]) => ({
      id: nextId('m'),
      slot,
      time,
      items: items.map(([food, quantity]) => ({ id: nextId('f'), food, quantity, notes: '', alternatives: '' })),
    }));
    const doc = { name: d.name, nameLower: d.name.toLowerCase(), goal: d.goal, description: d.description, calories: d.calories, protein: d.protein, carbs: d.carbs, fat: d.fat, meals, mealCount: meals.length, createdAt: now, updatedAt: now, createdBy: ACTOR.uid, updatedBy: ACTOR.uid };
    put('dietTemplates', id, doc);
    return { id, ...doc };
  });

  // ── Members, memberships, payments, attendance ────────────────────────────
  let memberNo = 0;
  let receiptNo = 0;
  const usedNames = new Set();
  const TOTAL = 36;

  for (let i = 0; i < TOTAL; i++) {
    const gender = chance(0.62) ? 'male' : 'female';
    let fullName;
    do fullName = `${pick(FIRST[gender])} ${pick(LAST)}`;
    while (usedNames.has(fullName));
    usedNames.add(fullName);

    memberNo++;
    const memberId = `K7-${String(memberNo).padStart(4, '0')}`;
    const tid = nextId('t');
    const phone = `9${between(100000000, 999999999)}`;
    // Spread joins over the last ~14 months, a few this month.
    const joinDate = addDays(today, -(i < 4 ? between(1, 20) : between(25, 420)));
    const lapses = chance(0.18);
    const inactive = chance(0.06);

    // Membership chain from the joining date.
    const memberships = [];
    let start = joinDate;
    let plan = pick(plans);
    for (;;) {
      const expiry = calculateExpiry(start, plan.duration, plan.durationUnit);
      memberships.push({ id: nextId('m'), plan, start, expiry });
      if (expiry >= today) break;
      if (lapses && memberships.length >= 1 && chance(0.6)) break;
      start = addDays(expiry, 1);
      if (start > today) break;
      if (chance(0.3)) plan = pick(plans);
    }

    let totalFee = 0;
    let totalPaid = 0;
    let feeDueDate = null;
    let partial = false;
    memberships.forEach((m, idx) => {
      const last = idx === memberships.length - 1;
      const fee = m.plan.price;
      const roll = rand();
      const paid = !last || roll < 0.7 ? fee : roll < 0.88 ? Math.round(fee / 2 / 100) * 100 : 0;
      totalFee += fee;
      totalPaid += paid;
      if (paid < fee && !feeDueDate) feeDueDate = ts(addDays(m.start, DEFAULT_SETTINGS.feeDueDays));
      if (paid < fee && paid > 0) partial = true;
      put('memberships', m.id, {
        traineeId: tid,
        memberId,
        traineeName: fullName,
        planId: m.plan.id,
        planName: m.plan.name,
        duration: m.plan.duration,
        durationUnit: m.plan.durationUnit,
        startDate: ts(m.start),
        expiryDate: ts(m.expiry),
        fee,
        paidAmount: paid,
        status: 'active',
        type: idx === 0 ? 'new' : 'renewal',
        previousMembershipId: idx === 0 ? null : memberships[idx - 1].id,
        notes: '',
        createdAt: ts(at(m.start, 10)),
        createdBy: ACTOR.uid,
        updatedAt: ts(at(m.start, 10)),
      });
      if (paid > 0) {
        receiptNo++;
        const pid = nextId('p');
        const payDate = m.start > today ? today : m.start;
        const method = pick(METHODS);
        put('payments', pid, {
          receiptNo: `RCPT-${String(receiptNo).padStart(6, '0')}`,
          traineeId: tid,
          memberId,
          traineeName: fullName,
          traineePhone: phone,
          membershipId: m.id,
          planName: m.plan.name,
          amount: paid,
          paymentDate: ts(payDate),
          method,
          reference: method === 'upi' ? `UPI${between(100000, 999999)}` : '',
          notes: '',
          status: 'valid',
          receivedBy: ACTOR.uid,
          receivedByName: ACTOR.name,
          createdAt: ts(at(payDate, between(7, 20), between(0, 59))),
        });
        log('Recorded payment', 'trainee', tid, `RCPT-${String(receiptNo).padStart(6, '0')} · ${paid} via ${method}`, at(payDate, 21));
      }
    });
    const pendingAmount = totalFee - totalPaid;
    const current = memberships[memberships.length - 1];

    // Attendance: each member has a habit; some have stopped coming.
    const habit = pick([0.8, 0.75, 0.6, 0.5, 0.35, 0.15]);
    const stoppedDaysAgo = lapses || chance(0.12) ? between(8, 25) : 0;
    let attendanceCount = 0;
    let lastAttendance = null;
    if (!inactive) {
      for (let back = 75; back >= 0; back--) {
        const day = addDays(today, -back);
        if (day < joinDate) continue;
        if (stoppedDaysAgo && back < stoppedDaysAgo) continue;
        const covered = memberships.some((m) => day >= m.start && day <= m.expiry);
        if (!covered) continue;
        const sunday = day.getDay() === 0;
        const p = back === 0 ? habit * 0.6 : sunday ? habit * 0.25 : habit;
        if (!chance(p)) continue;
        const date = toDateInput(day);
        const morning = chance(0.65);
        put('attendance', `${tid}_${date}`, {
          traineeId: tid,
          memberId,
          traineeName: fullName,
          date,
          day: ts(day),
          markedAt: ts(at(day, morning ? between(5, 9) : between(16, 20), between(0, 59))),
          markedBy: ACTOR.uid,
          markedByName: ACTOR.name,
        });
        attendanceCount++;
        lastAttendance = ts(day);
      }
    }

    // Plans for about half the members.
    const assign = (kind, templates) => {
      if (!chance(0.5)) return { id: null, name: '' };
      const t = pick(templates);
      const aid = nextId('a');
      const { id: templateId, name, createdAt: _c, updatedAt: _u, createdBy: _cb, updatedBy: _ub, nameLower: _n, ...content } = t;
      put(kind === 'workout' ? 'workoutAssignments' : 'dietAssignments', aid, {
        traineeId: tid,
        memberId,
        traineeName: fullName,
        templateId,
        templateName: name,
        customized: false,
        name,
        ...content,
        notes: '',
        active: true,
        assignedAt: ts(at(joinDate, 12)),
        assignedBy: ACTOR.uid,
        assignedByName: ACTOR.name,
        updatedAt: ts(at(joinDate, 12)),
      });
      return { id: aid, name };
    };
    const workout = assign('workout', workoutTemplates);
    const diet = assign('diet', dietTemplates);

    const profile = {
      fullName,
      nameLower: fullName.toLowerCase(),
      phone,
      altPhone: '',
      email: chance(0.5) ? `${fullName.split(' ')[0].toLowerCase()}${between(1, 99)}@example.com` : '',
      gender,
      dob: ts(new Date(today.getFullYear() - between(18, 48), between(0, 11), between(1, 28))),
      address: pick(['Gobichettipalayam', 'Erode', 'Sathyamangalam', 'Perundurai', 'Bhavani', 'Kavindapadi']),
      emergencyName: '',
      emergencyPhone: '',
      joiningDate: ts(joinDate),
      medicalNotes: chance(0.15) ? pick(['Mild lower-back pain — avoid heavy deadlifts.', 'Asthma — keep inhaler nearby.', 'Knee surgery in 2023.']) : '',
      trainerNotes: '',
      photoUrl: '',
      photoPath: '',
    };
    put('trainees', tid, {
      ...profile,
      memberNo,
      memberId,
      searchTokens: buildSearchTokens({ ...profile, memberId }),
      status: inactive ? 'inactive' : 'active',
      currentMembershipId: current.id,
      currentPlanId: current.plan.id,
      currentPlanName: current.plan.name,
      membershipStart: ts(current.start),
      membershipExpiry: ts(current.expiry),
      totalFee,
      totalPaid,
      pendingAmount,
      hasDues: pendingAmount > 0,
      feeDueDate: pendingAmount > 0 ? feeDueDate : null,
      paymentStatus: pendingAmount <= 0 ? 'paid' : partial ? 'partial' : 'pending',
      workoutAssignmentId: workout.id,
      workoutPlanName: workout.name,
      dietAssignmentId: diet.id,
      dietPlanName: diet.name,
      attendanceCount,
      lastAttendance,
      createdAt: ts(at(joinDate, 10)),
      updatedAt: ts(at(joinDate, 10)),
      createdBy: ACTOR.uid,
      updatedBy: ACTOR.uid,
    });
    log('Created trainee', 'trainee', tid, `${fullName} (${memberId})`, at(joinDate, 10));
  }

  put('counters', 'trainees', { value: memberNo });
  put('counters', 'receipts', { value: receiptNo });

  // ── Website enquiries ─────────────────────────────────────────────────────
  [
    ['Ashwin Kumar', 'Fat Loss', 'Looking to lose 10 kg before my wedding in March. What are the morning batch timings?', 'new', 0],
    ['Sowmya R', 'Personal Training', 'Do you have a female trainer available for personal training?', 'new', 1],
    ['Farhan Ali', 'Strength Training', 'Interested in the quarterly plan. Is there a joining fee?', 'contacted', 3],
    ['Gayathri M', 'Monthly', 'Can I take a trial session first?', 'follow-up', 6],
    ['Ravi Teja', 'Yearly', 'Want to join with my brother — any couple or family offer?', 'converted', 12],
    ['Test user', '', 'asdf', 'spam', 15],
  ].forEach(([name, interest, message, status, daysAgo]) => {
    put('enquiries', nextId('enq'), {
      name,
      phone: `9${between(100000000, 999999999)}`,
      email: '',
      interest,
      message,
      status,
      source: 'website',
      createdAt: ts(at(addDays(today, -daysAgo), between(8, 21), between(0, 59))),
    });
  });

  return db;
}
