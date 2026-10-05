/**
 * End-to-end scenarios (master prompt §91) driven through the real UI,
 * against the Firebase emulators.
 *
 * Prereqs: emulators running (project demo-k7) with a seeded admin, admin dev
 * server with VITE_DEV_AUTH_BYPASS=true, website dev server.
 *   ADMIN_URL=http://localhost:5176 SITE_URL=http://localhost:5175 node e2e.mjs
 */
import { chromium } from 'playwright';
import { resolve } from 'node:path';

const ADMIN = process.env.ADMIN_URL || 'http://localhost:5174';
const SITE = process.env.SITE_URL || 'http://localhost:5173';
const SHOTS = process.env.SHOTS || '.';
const run = Date.now().toString().slice(-5);
const MEMBER = `Test Member ${run}`;
const PHONE = `98${String(run).padStart(8, '7')}`.slice(0, 10);
const WORKOUT = `E2E Beginner Fat Loss ${run}`;
const DIET = `E2E High Protein ${run}`;

const results = [];
const pass = (name, detail = '') => {
  results.push({ name, ok: true });
  console.log(`✔ ${name}${detail ? ` (${detail})` : ''}`);
};
const fail = (name, err) => {
  results.push({ name, ok: false });
  console.log(`✖ ${name}: ${err.message.split('\n')[0]}`);
};
async function scenario(name, fn) {
  try {
    const detail = await fn();
    pass(name, detail);
  } catch (err) {
    fail(name, err);
    await page.screenshot({ path: `${SHOTS}/fail-${results.length}.png`, fullPage: true }).catch(() => {});
  }
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
const page = await ctx.newPage();
const consoleErrors = [];
page.on('pageerror', (e) => consoleErrors.push(e.message));
page.on('console', (m) => m.type() === 'error' && !/favicon|Outdated Optimize/.test(m.text()) && consoleErrors.push(m.text()));

const toast = (text) => page.getByRole('status').filter({ hasText: text }).first().waitFor({ timeout: 15000 });
const dialog = () => page.getByRole('dialog');

async function openProfileTab(tab) {
  await page.getByRole('tab', { name: tab, exact: true }).click();
}

let profileUrl = '';

// ── Login (dev bypass) ────────────────────────────────────────────────────
await page.goto(`${ADMIN}/`, { waitUntil: 'domcontentloaded' });
await page.waitForURL('**/dashboard', { timeout: 30000 });

// ── Scenario 1: add trainee ──────────────────────────────────────────────
await scenario('1. Add trainee "Test Member" on Monthly ₹1,500', async () => {
  await page.goto(`${ADMIN}/trainees/new`);
  await page.getByLabel('Full name').fill(MEMBER);
  await page.getByLabel('Phone number').fill(PHONE);
  const select = page.getByLabel('Membership plan');
  const value = await select.locator('option', { hasText: 'Monthly' }).first().getAttribute('value');
  await select.selectOption(value);
  await page.getByLabel('Membership fee').fill('1500');
  await page.getByRole('button', { name: 'Add trainee', exact: true }).last().click();
  await page.waitForURL(/\/trainees\/(?!new)[\w-]+$/, { timeout: 20000 });
  profileUrl = page.url();
  await page.getByRole('heading', { name: MEMBER }).waitFor();
  const memberId = await page.locator('text=/K7-\\d{4}/').first().innerText();
  // Appears in the list via search
  await page.goto(`${ADMIN}/trainees?q=${encodeURIComponent(MEMBER.toLowerCase())}`);
  await page.getByText(MEMBER).first().waitFor({ timeout: 15000 });
  return memberId;
});

async function recordPayment(amount) {
  await page.goto(profileUrl);
  await page.getByRole('button', { name: 'Record payment' }).first().click();
  const d = dialog();
  await d.getByLabel('Amount').fill(String(amount));
  await d.getByRole('button', { name: /^Record/ }).click();
  await d.getByText('Payment recorded').waitFor({ timeout: 15000 });
  await d.getByRole('button', { name: 'Done' }).click();
  await page.reload();
  await openProfileTab('Fees');
}

async function feeSummary() {
  // The three summary cards at the top of the Fees tab
  const card = (label) => page.locator('.grid.grid-cols-3 > .card', { has: page.getByText(label, { exact: true }) }).first();
  return {
    paid: (await card('Paid').innerText()).replace('Paid', '').trim(),
    pending: (await card('Outstanding').innerText()).replace('Outstanding', '').trim(),
  };
}

// ── Scenario 2 & 3: payments ─────────────────────────────────────────────
await scenario('2. Record ₹1,000 → Paid ₹1,000 / Pending ₹500 / Partial', async () => {
  await recordPayment(1000);
  await page.waitForTimeout(800);
  const s = await feeSummary();
  if (s.paid !== '₹1,000' || s.pending !== '₹500') throw new Error(`got paid=${s.paid} pending=${s.pending}`);
  await page.getByText('Partial', { exact: true }).first().waitFor();
  return `paid ${s.paid}, pending ${s.pending}, Partial`;
});

await scenario('3. Record ₹500 → Paid ₹1,500 / Pending ₹0 / Paid', async () => {
  await recordPayment(500);
  await page.waitForTimeout(800);
  const s = await feeSummary();
  if (s.paid !== '₹1,500' || s.pending !== '₹0') throw new Error(`got paid=${s.paid} pending=${s.pending}`);
  await page.locator('span', { hasText: /^Paid$/ }).first().waitFor();
  return `paid ${s.paid}, pending ${s.pending}, Paid`;
});

await scenario('   Receipt is printable', async () => {
  await page.locator('li', { hasText: /RCPT-\d{6}/ }).first().getByRole('button', { name: 'More actions' }).click();
  await page.getByRole('menuitem', { name: 'View receipt' }).click();
  await page.getByRole('heading', { name: 'Payment receipt' }).waitFor();
  await page.getByText(/RCPT-\d{6}/).first().waitFor();
  await page.screenshot({ path: `${SHOTS}/receipt.png`, fullPage: true });
});

// ── Scenario 4: workout ──────────────────────────────────────────────────
await scenario('4. Create workout template and assign to member', async () => {
  await page.goto(`${ADMIN}/workouts/new`);
  await page.getByLabel('Plan name').fill(WORKOUT);
  await page.getByLabel('Day 1 title').fill('Chest & Triceps');
  await page.getByLabel('Exercise name').first().fill('Bench press');
  await page.getByRole('button', { name: 'Add exercise' }).click();
  await page.getByLabel('Exercise name').nth(1).fill('Tricep dips');
  await page.getByRole('button', { name: 'Add day' }).click();
  await page.getByLabel('Day 2 title').fill('Back & Biceps');
  await page.getByLabel('Exercise name').nth(2).fill('Lat pulldown');
  await page.getByRole('button', { name: 'Create template' }).click();
  await toast('Workout template created');

  await page.goto(profileUrl);
  await page.getByRole('button', { name: 'Assign workout' }).first().click();
  await dialog().getByText(WORKOUT).click();
  await dialog().getByRole('button', { name: 'Assign plan' }).click();
  await toast('Workout assigned successfully');
  await openProfileTab('Workout');
  await page.getByText('Bench press').waitFor();
  await page.getByText(WORKOUT).first().waitFor();
});

await scenario('   Customising member workout does not change template', async () => {
  await page.getByRole('link', { name: 'Customise' }).click();
  await page.getByLabel('Exercise name').first().fill('Incline bench press');
  await page.getByRole('button', { name: 'Save for this member' }).click();
  await page.waitForURL(/tab=workout/);
  await page.getByText('Incline bench press').waitFor();
  await page.goto(`${ADMIN}/workouts`);
  await page.getByText(WORKOUT).click();
  const first = await page.getByLabel('Exercise name').first().inputValue();
  if (first !== 'Bench press') throw new Error(`template changed to "${first}"`);
});

// ── Scenario 5: diet ─────────────────────────────────────────────────────
await scenario('5. Create diet template and assign to member', async () => {
  await page.goto(`${ADMIN}/diets/new`);
  await page.getByLabel('Plan name').fill(DIET);
  await page.getByLabel('Calories (kcal)').fill('2400');
  await page.getByLabel('Food', { exact: true }).first().fill('Oats with milk');
  await page.getByLabel('Food', { exact: true }).nth(1).fill('Rice, dal & chicken');
  await page.getByLabel('Food', { exact: true }).nth(2).fill('Paneer & roti');
  await page.getByRole('button', { name: 'Create template' }).click();
  await toast('Diet template created');

  await page.goto(profileUrl);
  await page.getByRole('button', { name: 'Assign diet' }).first().click();
  await dialog().getByText(DIET).click();
  await dialog().getByRole('button', { name: 'Assign plan' }).click();
  await toast('Diet plan assigned successfully');
  await openProfileTab('Diet');
  await page.getByText('Oats with milk').waitFor();
});

// ── Scenario 6: approaching expiry appears in Renewals ───────────────────
await scenario('6. Membership near expiry appears in Renewals', async () => {
  await page.goto(profileUrl);
  await openProfileTab('Membership');
  await page.locator('li', { hasText: 'Monthly' }).first().getByRole('button', { name: 'More actions' }).click();
  await page.getByRole('menuitem', { name: 'Adjust fee / dates' }).click();
  const soon = new Date();
  soon.setDate(soon.getDate() + 2);
  const iso = `${soon.getFullYear()}-${String(soon.getMonth() + 1).padStart(2, '0')}-${String(soon.getDate()).padStart(2, '0')}`;
  await dialog().getByLabel('Expiry date').fill(iso);
  await dialog().getByRole('button', { name: 'Save changes' }).click();
  await toast('Membership updated');
  await page.goto(`${ADMIN}/renewals?within=3`);
  await page.getByText(MEMBER).first().waitFor({ timeout: 15000 });
  await page.screenshot({ path: `${SHOTS}/renewals.png`, fullPage: true });
  return 'listed under "Within 3 days"';
});

// ── Scenario 7: renew keeps history ──────────────────────────────────────
await scenario('7. Renew membership, history preserved', async () => {
  await page.getByRole('row', { name: new RegExp(MEMBER) }).getByRole('button', { name: 'Renew' }).click();
  await dialog().getByRole('button', { name: 'Renew membership' }).click();
  await toast('Membership renewed successfully');
  await page.goto(`${profileUrl}?tab=membership`);
  const items = page.locator('li', { hasText: 'Monthly' });
  await page.getByText('Renewal').first().waitFor();
  const n = await items.count();
  if (n < 2) throw new Error(`expected 2 memberships, found ${n}`);
  await page.screenshot({ path: `${SHOTS}/profile-membership.png`, fullPage: true });
  return `${n} membership records`;
});

// ── Scenario 8: plan price change reflects on website ────────────────────
let originalPrice = null;
await scenario('8. Change Monthly price → website shows it', async () => {
  await page.goto(`${ADMIN}/memberships`);
  await page.locator('li', { hasText: 'Monthly' }).first().getByRole('button', { name: 'More actions' }).click();
  await page.getByRole('menuitem', { name: 'Edit plan' }).click();
  originalPrice = await dialog().getByLabel('Price').inputValue();
  await dialog().getByLabel('Price').fill('1799');
  await dialog().getByRole('button', { name: 'Save plan' }).click();
  await toast('Membership plan updated');
  const site = await ctx.newPage();
  await site.goto(SITE, { waitUntil: 'domcontentloaded' });
  await site.locator('#membership').getByText('₹1,799').waitFor({ timeout: 20000 });
  await site.close();
  return `₹${originalPrice} → ₹1,799 visible publicly`;
});

// ── Scenario 9: gallery upload appears on website ────────────────────────
await scenario('9. Upload gallery image → website gallery shows it', async () => {
  await page.goto(`${ADMIN}/website/gallery`);
  await page.getByRole('button', { name: 'Upload images' }).first().waitFor();
  await page.waitForTimeout(2000);
  const before = await page.locator('li.card').count();
  await page.setInputFiles('input[type=file][multiple]', resolve('fixtures-photo.png'));
  await toast('added to the gallery');
  await page.waitForTimeout(800);
  const after = await page.locator('li.card').count();
  if (after !== before + 1) throw new Error(`gallery count ${before} → ${after}`);
  const site = await ctx.newPage();
  await site.goto(`${SITE}/#gallery`, { waitUntil: 'domcontentloaded' });
  await site.locator('#gallery img').first().waitFor({ timeout: 20000 });
  await site.close();
  return 'uploaded by staff (storage rule) and rendered publicly';
});

// ── Scenario 10: public enquiry visible to admin ─────────────────────────
const LEAD = `Lead ${run.replace(/\d/g, (d) => "abcdefghij"[d])}`;
await scenario('10. Visitor submits enquiry → admin sees it', async () => {
  const site = await ctx.newPage();
  await site.goto(`${SITE}/#contact`, { waitUntil: 'domcontentloaded' });
  await site.waitForTimeout(3000); // honeypot timer: humans don't submit in < 2.5s
  await site.getByLabel('Full name').fill(LEAD);
  await site.getByLabel('Mobile number').fill(`97${run}123`.slice(0, 10));
  await site.getByLabel('Message').fill('Interested in personal training.');
  await site.getByRole('button', { name: 'Send enquiry' }).click();
  await site.getByText('Enquiry received').waitFor({ timeout: 15000 });
  // Duplicate submission from the same number on the same day is rejected by rules
  await site.getByRole('button', { name: 'Send another enquiry' }).click();
  await site.waitForTimeout(3000);
  await site.getByLabel('Full name').fill(LEAD);
  await site.getByLabel('Mobile number').fill(`97${run}123`.slice(0, 10));
  await site.getByRole('button', { name: 'Send enquiry' }).click();
  await site.getByText('already received an enquiry').waitFor({ timeout: 15000 });
  await site.close();
  await page.goto(`${ADMIN}/enquiries?status=new`);
  await page.getByText(LEAD).first().waitFor({ timeout: 15000 });
  await page.screenshot({ path: `${SHOTS}/enquiries.png`, fullPage: true });
  return 'duplicate blocked by rules';
});

// ── Cleanup: restore plan price, remove the test gallery image ───────────
try {
  if (originalPrice) {
    await page.goto(`${ADMIN}/memberships`);
    await page.locator('li', { hasText: 'Monthly' }).first().getByRole('button', { name: 'More actions' }).click();
    await page.getByRole('menuitem', { name: 'Edit plan' }).click();
    await page.waitForTimeout(300);
    await dialog().getByLabel('Price').fill(originalPrice);
    await dialog().getByRole('button', { name: 'Save plan' }).click();
    await toast('Membership plan updated');
  }
  await page.goto(`${ADMIN}/website/gallery`);
  await page.getByRole('button', { name: 'Remove image' }).last().click();
  await dialog().getByRole('button', { name: 'Remove image' }).click();
  await toast('Image removed');
  console.log('• cleanup done (price restored, test image removed)');
} catch (err) {
  console.log('• cleanup incomplete:', err.message.split('\n')[0]);
}

console.log(`\n${results.filter((r) => r.ok).length}/${results.length} scenarios passed`);
console.log('Uncaught page errors:', consoleErrors.length ? consoleErrors : 'none');
await browser.close();
process.exit(results.every((r) => r.ok) ? 0 : 1);
