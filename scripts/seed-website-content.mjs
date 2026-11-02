#!/usr/bin/env node
/**
 * Starter website content: About text, statistics, facilities, programs,
 * trainer cards, testimonials, an offer and opening hours, so every section
 * of the public website is populated from day one.
 *
 * Safe to re-run: each section is only filled if it is currently empty.
 * Edit or replace everything from Admin → Website.
 *
 *   node seed-website-content.mjs [--project id]
 *   (emulator: FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node seed-website-content.mjs --project demo-k7)
 */
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore';
import { initAdmin, parseArgs } from './firebase-admin-init.mjs';

const args = parseArgs();
initAdmin(args.project);
const db = getFirestore();
const now = FieldValue.serverTimestamp();
const inDays = (n) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return Timestamp.fromDate(d);
};

// ── About ──────────────────────────────────────────────────────────────────
const ABOUT = {
  eyebrow: 'About K7',
  images: [{ url: '/images/about-main.webp', path: '' }, { url: '/images/about-detail.webp', path: '' }],
  heading: 'Built for people who show up',
  description:
    'K7 Fitness Studio & Gym is a strength-first training space built for real results. With modern equipment, certified coaches and a focused, motivating atmosphere, we help beginners and experienced athletes alike train smarter, stay consistent and become their strongest selves.\n\nWhether your goal is fat loss, muscle gain, better health or a complete transformation, our coaches build a plan around you and keep you accountable every step of the way.',
  mission: 'To make expert coaching and a world-class training environment accessible to everyone who is ready to put in the work.',
  vision: 'To be the most trusted fitness community in our city, known for discipline, results and genuine care for every member.',
  stats: [
    { label: 'Happy members', value: '500', suffix: '+' },
    { label: 'Expert trainers', value: '8', suffix: '' },
    { label: 'Years of experience', value: '10', suffix: '+' },
    { label: 'Training programs', value: '6', suffix: '' },
  ],
  benefits: ['Certified, experienced trainers', 'Personalised workout & diet plans', 'Modern strength & cardio equipment', 'Clean, safe and motivating space', 'Flexible early-morning & evening timings', 'Regular progress assessments'],
  facilities: [
    { id: 'f1', title: 'Strength Training', description: 'Power racks, platforms, barbells and a full range of free weights.', icon: 'dumbbell', active: true },
    { id: 'f2', title: 'Cardio Zone', description: 'Treadmills, bikes, cross-trainers and rowers for endurance and fat burn.', icon: 'heart-pulse', active: true },
    { id: 'f3', title: 'Personal Training', description: 'One-to-one coaching with a plan built entirely around your goals.', icon: 'user-check', active: true },
    { id: 'f4', title: 'Weight Training', description: 'Machines and dumbbells for every muscle group and every level.', icon: 'weight', active: true },
    { id: 'f5', title: 'Functional Training', description: 'Kettlebells, battle ropes, sleds and turf for athletic movement.', icon: 'zap', active: true },
    { id: 'f6', title: 'Cross Training', description: 'High-intensity circuits that build strength and conditioning together.', icon: 'flame', active: true },
    { id: 'f7', title: 'General Fitness', description: 'Balanced routines to improve health, mobility and everyday energy.', icon: 'activity', active: true },
    { id: 'f8', title: 'Transformation Programs', description: 'Structured, coach-led programs with diet guidance and check-ins.', icon: 'trophy', active: true },
  ],
};

// ── Collections ────────────────────────────────────────────────────────────
const PROGRAMS = [
  {
    name: 'Strength Training',
    description: 'Build real, lasting strength with progressive barbell and dumbbell training guided by expert coaches.',
    duration: '12 weeks',
    imageUrl: '/images/program-strength.webp',
    benefits: ['Build muscle', 'Stronger lifts', 'Better posture'],
  },
  {
    name: 'Fat Loss',
    description: 'High-energy conditioning combined with diet coaching to burn fat and boost your stamina.',
    duration: '8 weeks',
    imageUrl: '/images/program-fat-loss.webp',
    benefits: ['Burn fat', 'Improve stamina', 'Diet guidance'],
  },
  {
    name: 'Personal Training',
    description: 'One-to-one sessions with a dedicated coach, a custom plan and complete accountability.',
    duration: 'Flexible',
    imageUrl: '/images/program-personal-training.webp',
    benefits: ['Custom plan', 'Form correction', 'Faster results'],
  },
  {
    name: 'Body Transformation',
    description: 'A complete coach-led transformation with training, nutrition and weekly progress check-ins.',
    duration: '16 weeks',
    imageUrl: '/images/program-transformation.webp',
    benefits: ['Full makeover', 'Nutrition plan', 'Weekly check-ins'],
  },
];

const TRAINERS = [
  {
    name: 'Head Coach',
    specialization: 'Strength & Conditioning',
    experience: '10+ years experience',
    bio: 'Leads the K7 coaching team, specialising in strength, powerlifting technique and long-term athletic development.',
    instagram: '',
  },
  {
    name: 'Fat Loss Coach',
    specialization: 'Fat Loss & Nutrition',
    experience: '6+ years experience',
    bio: 'Helps members lose fat sustainably with smart conditioning, simple nutrition habits and steady accountability.',
    instagram: '',
  },
  {
    name: 'Personal Trainer',
    specialization: 'Personal Training & Mobility',
    experience: '5+ years experience',
    bio: 'Focuses on one-to-one coaching, correct form, injury prevention and building confidence for beginners.',
    instagram: '',
  },
];

const TESTIMONIALS = [
  { name: 'Arun K.', rating: 5, message: 'Lost 12 kg in four months. The coaches planned both my workouts and diet and kept me consistent. Best decision I made this year.' },
  { name: 'Priya S.', rating: 5, message: 'As a beginner I was nervous, but the trainers made me feel comfortable from day one. Clean gym, great equipment and a really positive atmosphere.' },
  { name: 'Vignesh R.', rating: 5, message: 'My squat and deadlift have gone up massively since joining K7. The strength program is well structured and the coaching on form is excellent.' },
  { name: 'Meena D.', rating: 4, message: 'Flexible timings fit perfectly around my work. Personal attention from the trainers makes a huge difference.' },
];

const OFFERS = [
  {
    title: 'Festive Offer: 20% off yearly memberships',
    description: 'Join now and save 20% on yearly plans, with a free diet consultation included. Limited period only.',
    startDate: inDays(-1),
    endDate: inDays(30),
    ctaText: 'Claim offer',
    ctaLink: '#contact',
  },
];

const OPENING_HOURS = [
  { label: 'Monday – Saturday', hours: '5:30 AM – 10:00 PM' },
  { label: 'Sunday', hours: '6:00 AM – 12:00 PM' },
];

// ── Write (only where empty) ───────────────────────────────────────────────
async function fillCollection(name, items) {
  const existing = await db.collection(name).limit(1).get();
  if (!existing.empty) return console.log(`  skip   ${name} (already has content)`);
  for (const [i, item] of items.entries()) {
    await db.collection(name).add({ ...item, active: true, displayOrder: i, createdAt: now, updatedAt: now });
  }
  console.log(`  create ${name} (${items.length})`);
}

const aboutRef = db.doc('websiteSettings/about');
const about = await aboutRef.get();
if (about.exists && (about.data().description || about.data().stats?.length || about.data().facilities?.length)) {
  console.log('  skip   websiteSettings/about (already has content)');
} else {
  await aboutRef.set({ ...ABOUT, updatedAt: now }, { merge: true });
  console.log('  create websiteSettings/about');
}

const contactRef = db.doc('websiteSettings/contact');
const contact = await contactRef.get();
if (contact.exists && contact.data().openingHours?.length) {
  console.log('  skip   opening hours (already set)');
} else {
  await contactRef.set({ openingHours: OPENING_HOURS, updatedAt: now }, { merge: true });
  console.log('  create opening hours');
}

await fillCollection('programs', PROGRAMS);
await fillCollection('trainers', TRAINERS);
await fillCollection('testimonials', TESTIMONIALS);
await fillCollection('offers', OFFERS);

console.log('✔ Website content ready. Edit everything in Admin → Website.');
process.exit(0);
