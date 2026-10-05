#!/usr/bin/env node
/**
 * OPTIONAL starter content for a brand-new project: typical membership plans
 * and website copy, so the owner edits instead of starting from blank.
 *
 * It never overwrites existing data: each document is written only if missing.
 * No fake members, payments, reviews or trainers are created.
 *
 *   node seed-starter-content.mjs [--project id]
 */
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { initAdmin, parseArgs } from './firebase-admin-init.mjs';

const args = parseArgs();
initAdmin(args.project);
const db = getFirestore();
const now = FieldValue.serverTimestamp();

const PLANS = [
  { name: 'Monthly', duration: 1, durationUnit: 'months', price: 1500, recommended: false, features: ['Full gym access', 'Cardio & strength zones', 'Locker access'] },
  { name: 'Quarterly', duration: 3, durationUnit: 'months', price: 4000, recommended: true, features: ['Full gym access', 'Cardio & strength zones', 'Diet consultation', 'Locker access'] },
  { name: 'Half-Yearly', duration: 6, durationUnit: 'months', price: 7500, recommended: false, features: ['Full gym access', 'Diet consultation', 'Workout plan', 'Body composition check'] },
  { name: 'Yearly', duration: 12, durationUnit: 'months', price: 13000, recommended: false, features: ['Full gym access', 'Diet & workout plans', 'Quarterly assessments', 'Best value'] },
];

const SETTINGS = {
  'settings/general': { currency: 'INR', memberIdPrefix: 'K7', expiryAlertDays: 7, feeDueDays: 7 },
  'websiteSettings/hero': {
    eyebrow: 'K7 Fitness Studio & Gym',
    heading: 'Train hard.\nLive strong.',
    highlight: 'Live strong.',
    subtitle: 'Strength, conditioning and real coaching under one roof. Build your strongest self with programs designed around your goals.',
    primaryCtaText: 'Join now',
    primaryCtaLink: '#contact',
    secondaryCtaText: 'View memberships',
    secondaryCtaLink: '#membership',
    imageUrl: '/images/hero.webp',
    imagePath: '',
    showBadge: false,
    badgeText: '',
  },
  'websiteSettings/contact': {
    gymName: 'K7 Fitness Studio & Gym',
    mapEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3910.3783877580004!2d77.44881127482853!3d11.452590688740303!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba93d736421928f%3A0x6222318f060d2f45!2sK7%20Fitness%20Studio!5e0!3m2!1sen!2sin!4v1791198399976!5m2!1sen!2sin',
    mapLink: 'https://www.google.com/maps/dir/?api=1&destination=11.4525907,77.4488113',
  },
};

async function createIfMissing(path, data) {
  const ref = db.doc(path);
  const snap = await ref.get();
  if (snap.exists) return console.log(`  skip   ${path} (exists)`);
  await ref.set({ ...data, createdAt: now, updatedAt: now });
  console.log(`  create ${path}`);
}

const existingPlans = await db.collection('membershipPlans').limit(1).get();
if (existingPlans.empty) {
  for (const [i, p] of PLANS.entries()) {
    await db.collection('membershipPlans').add({ ...p, description: '', active: true, showOnWebsite: true, displayOrder: i, createdAt: now, updatedAt: now });
    console.log(`  create membershipPlans/${p.name}`);
  }
} else console.log('  skip   membershipPlans (plans already exist)');

for (const [path, data] of Object.entries(SETTINGS)) await createIfMissing(path, data);
console.log('✔ Starter content ready. Edit everything from the admin panel.');
process.exit(0);
