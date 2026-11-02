/**
 * Security rules tests. Requires the Firestore + Storage emulators:
 *   firebase emulators:start --only firestore,storage --project demo-k7-rules
 *   cd tests && npm run test:rules
 */
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, describe, it } from 'node:test';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, getDocs, collection, query, where, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getBytes } from 'firebase/storage';

let env;
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-k7-rules',
    firestore: { rules: readFileSync('../firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
    storage: { rules: readFileSync('../storage.rules', 'utf8'), host: '127.0.0.1', port: 9199 },
  });
});
after(() => env.cleanup());

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'admins/owner'), { role: 'owner', active: true, name: 'Owner' });
    await setDoc(doc(db, 'admins/staff'), { role: 'admin', active: true, name: 'Staff' });
    await setDoc(doc(db, 'admins/disabled'), { role: 'admin', active: false });
    await setDoc(doc(db, 'trainees/t1'), { fullName: 'Test Member', phone: '9876543210', status: 'active', totalFee: 1500, totalPaid: 0, pendingAmount: 1500 });
    await setDoc(doc(db, 'payments/p1'), { traineeId: 't1', membershipId: 'm1', amount: 500, method: 'cash', status: 'valid' });
    await setDoc(doc(db, 'enquiries/e1'), { name: 'Lead', phone: '9876543210', status: 'new' });
    await setDoc(doc(db, 'workoutAssignments/w1'), { traineeId: 't1' });
    await setDoc(doc(db, 'dietAssignments/d1'), { traineeId: 't1' });
    await setDoc(doc(db, 'membershipPlans/public'), { name: 'Monthly', active: true, showOnWebsite: true, duration: 1, durationUnit: 'months', price: 1500, displayOrder: 0 });
    await setDoc(doc(db, 'membershipPlans/hidden'), { name: 'Staff only', active: true, showOnWebsite: false, duration: 1, durationUnit: 'months', price: 0, displayOrder: 1 });
    await setDoc(doc(db, 'programs/on'), { name: 'Strength', active: true, displayOrder: 0 });
    await setDoc(doc(db, 'programs/off'), { name: 'Draft', active: false, displayOrder: 1 });
    await setDoc(doc(db, 'websiteSettings/hero'), { heading: 'Train hard' });
    await setDoc(doc(db, 'settings/general'), { currency: 'INR' });
  });
});

const visitor = () => env.unauthenticatedContext().firestore();
const randomUser = () => env.authenticatedContext('stranger').firestore();
const staff = () => env.authenticatedContext('staff').firestore();
const disabled = () => env.authenticatedContext('disabled').firestore();

const enquiry = (extra = {}) => ({
  name: 'Ravi Kumar',
  phone: '9876501234',
  email: '',
  interest: 'Monthly',
  message: 'Hi',
  status: 'new',
  source: 'website',
  createdAt: serverTimestamp(),
  ...extra,
});

describe('public visitor', () => {
  for (const path of ['trainees/t1', 'payments/p1', 'enquiries/e1', 'workoutAssignments/w1', 'dietAssignments/d1', 'settings/general', 'admins/owner']) {
    it(`cannot read ${path}`, () => assertFails(getDoc(doc(visitor(), path))));
  }
  it('cannot list trainees', () => assertFails(getDocs(collection(visitor(), 'trainees'))));
  it('cannot list enquiries', () => assertFails(getDocs(collection(visitor(), 'enquiries'))));

  it('can read website settings', () => assertSucceeds(getDoc(doc(visitor(), 'websiteSettings/hero'))));
  it('can query public plans', () =>
    assertSucceeds(getDocs(query(collection(visitor(), 'membershipPlans'), where('active', '==', true), where('showOnWebsite', '==', true)))));
  it('cannot read a plan hidden from the website', () => assertFails(getDoc(doc(visitor(), 'membershipPlans/hidden'))));
  it('can query active programs', () => assertSucceeds(getDocs(query(collection(visitor(), 'programs'), where('active', '==', true)))));
  it('cannot list all programs (incl. inactive)', () => assertFails(getDocs(collection(visitor(), 'programs'))));

  it('cannot modify website content', () => assertFails(setDoc(doc(visitor(), 'websiteSettings/hero'), { heading: 'Hacked' })));
  it('cannot change plan prices', () => assertFails(updateDoc(doc(visitor(), 'membershipPlans/public'), { price: 1 })));
  it('cannot create trainees', () => assertFails(setDoc(doc(visitor(), 'trainees/x'), { fullName: 'X', phone: '1', status: 'active', totalFee: 0, totalPaid: 0, pendingAmount: 0 })));

  it('can submit a valid enquiry', () => assertSucceeds(setDoc(doc(visitor(), 'enquiries/9876501234_20261005'), enquiry())));
  it('cannot submit a duplicate (same id) enquiry', async () => {
    await assertSucceeds(setDoc(doc(visitor(), 'enquiries/dup'), enquiry()));
    await assertFails(setDoc(doc(visitor(), 'enquiries/dup'), enquiry()));
  });
  it('cannot submit an enquiry with a forged status', () => assertFails(setDoc(doc(visitor(), 'enquiries/x1'), enquiry({ status: 'converted' }))));
  it('cannot submit an enquiry with extra fields', () => assertFails(setDoc(doc(visitor(), 'enquiries/x2'), enquiry({ internalNotes: 'x' }))));
  it('cannot submit an enquiry with an invalid phone', () => assertFails(setDoc(doc(visitor(), 'enquiries/x3'), enquiry({ phone: 'abc' }))));
  it('cannot submit an oversized message', () => assertFails(setDoc(doc(visitor(), 'enquiries/x4'), enquiry({ message: 'x'.repeat(1001) }))));
  it('cannot delete enquiries', () => assertFails(deleteDoc(doc(visitor(), 'enquiries/e1'))));
});

describe('signed-in non-admin / disabled admin', () => {
  it('random account cannot read trainees', () => assertFails(getDoc(doc(randomUser(), 'trainees/t1'))));
  it('random account cannot make itself admin', () => assertFails(setDoc(doc(randomUser(), 'admins/stranger'), { role: 'owner', active: true })));
  it('disabled admin cannot read trainees', () => assertFails(getDoc(doc(disabled(), 'trainees/t1'))));
});

describe('staff (active admin)', () => {
  it('can read trainees, payments, enquiries', async () => {
    await assertSucceeds(getDoc(doc(staff(), 'trainees/t1')));
    await assertSucceeds(getDoc(doc(staff(), 'payments/p1')));
    await assertSucceeds(getDocs(collection(staff(), 'enquiries')));
  });
  it('can update website content', () => assertSucceeds(setDoc(doc(staff(), 'websiteSettings/hero'), { heading: 'New' })));
  it('cannot set a negative pending amount', () => assertFails(updateDoc(doc(staff(), 'trainees/t1'), { pendingAmount: -10 })));
  it('cannot create a negative payment', () =>
    assertFails(setDoc(doc(staff(), 'payments/neg'), { traineeId: 't1', membershipId: 'm1', amount: -5, method: 'cash', status: 'valid' })));
  it('cannot delete payments', () => assertFails(deleteDoc(doc(staff(), 'payments/p1'))));
  it('can void but not re-price a payment', async () => {
    await assertSucceeds(updateDoc(doc(staff(), 'payments/p1'), { status: 'void', voidReason: 'dup' }));
    await assertFails(updateDoc(doc(staff(), 'payments/p1'), { amount: 1 }));
  });
  it('non-owner cannot promote themselves', () => assertFails(updateDoc(doc(staff(), 'admins/staff'), { role: 'owner' })));
  it('can change own display name', () => assertSucceeds(updateDoc(doc(staff(), 'admins/staff'), { name: 'New name' })));
  it('activity logs are append-only', async () => {
    await assertSucceeds(setDoc(doc(staff(), 'activityLogs/a1'), { adminUid: 'staff', action: 'x' }));
    await assertFails(updateDoc(doc(staff(), 'activityLogs/a1'), { action: 'y' }));
    await assertFails(setDoc(doc(staff(), 'activityLogs/a2'), { adminUid: 'someone-else', action: 'x' }));
  });
});

describe('storage', () => {
  it('visitor can read public images', async () => {
    await env.withSecurityRulesDisabled((ctx) => uploadBytes(ref(ctx.storage(), 'public/gallery/a.png'), PNG, { contentType: 'image/png' }));
    await assertSucceeds(getBytes(ref(env.unauthenticatedContext().storage(), 'public/gallery/a.png')));
  });
  it('visitor cannot upload', () =>
    assertFails(uploadBytes(ref(env.unauthenticatedContext().storage(), 'public/gallery/b.png'), PNG, { contentType: 'image/png' })));
  it('visitor cannot read private trainee photos', async () => {
    await env.withSecurityRulesDisabled((ctx) => uploadBytes(ref(ctx.storage(), 'private/trainees/a.png'), PNG, { contentType: 'image/png' }));
    await assertFails(getBytes(ref(env.unauthenticatedContext().storage(), 'private/trainees/a.png')));
  });
  // Staff uploads rely on a cross-service lookup of admins/{uid}, which the
  // emulator resolves against its running project. The successful upload path
  // is covered by the end-to-end gallery scenario (e2e.mjs).
  it('non-image uploads are rejected', () =>
    assertFails(uploadBytes(ref(env.authenticatedContext('staff').storage(), 'public/gallery/c.html'), PNG, { contentType: 'text/html' })));
});
