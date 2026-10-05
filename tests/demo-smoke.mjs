/**
 * Smoke test for the offline demo build (the Android debug APK's web bundle).
 *   cd admin && npx vite build --mode demo && npx vite preview --mode demo --port 4179
 *   cd tests && DEMO_URL=http://localhost:4179 SHOTS=dir node demo-smoke.mjs
 */
import { chromium } from 'playwright';

const URL = process.env.DEMO_URL || 'http://localhost:4179';
const SHOTS = process.env.SHOTS || '';

const PAGES = [
  '/dashboard', '/attendance', '/attendance?show=missing', '/trainees', '/memberships', '/fees', '/fees?view=payments',
  '/workouts', '/diets', '/renewals', '/renewals?within=expired', '/enquiries', '/reports', '/settings', '/website',
  '/website/hero', '/website/about', '/website/programs', '/website/memberships', '/website/trainers', '/website/gallery',
  '/website/testimonials', '/website/offers', '/website/contact',
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 380, height: 820 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const problems = [];
page.on('pageerror', (e) => problems.push(`pageerror @ ${page.url()}: ${e.message}`));
page.on('console', (m) => m.type() === 'error' && problems.push(`console @ ${page.url()}: ${m.text()}`));

const shot = async (name) => SHOTS && page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });
const check = async (label) => {
  await page.waitForTimeout(700);
  const err = await page.locator('text=/Something went wrong|Could not load|not be found/i').count();
  if (err) problems.push(`${label}: error text visible`);
};

// Login with the pre-filled demo account.
await page.goto(`${URL}/login`);
await page.getByRole('button', { name: /sign in/i }).click();
await page.waitForURL('**/dashboard');
await check('dashboard');
await shot('01-dashboard');

for (const [i, p] of PAGES.entries()) {
  await page.goto(URL + p);
  await check(p);
  await shot(`p${String(i).padStart(2, '0')}-${p.replace(/[/?=]/g, '_')}`);
}

// Attendance: mark the first absent member present, then undo.
await page.goto(`${URL}/attendance?show=absent`);
await page.waitForTimeout(700);
const before = await page.locator('button[aria-pressed="true"]').count();
await page.goto(`${URL}/attendance`);
await page.waitForTimeout(700);
const presentBefore = await page.locator('li button[aria-pressed="true"]').count();
await page.locator('li button[aria-pressed="false"]').first().click();
await page.waitForTimeout(700);
const presentAfter = await page.locator('li button[aria-pressed="true"]').count();
if (presentAfter !== presentBefore + 1) problems.push(`attendance mark: ${presentBefore} → ${presentAfter}`);
await shot('02-attendance-marked');

// Persisted after reload?
await page.reload();
await page.waitForTimeout(900);
const afterReload = await page.locator('li button[aria-pressed="true"]').count();
if (afterReload !== presentAfter) problems.push(`attendance not persisted: ${presentAfter} → ${afterReload}`);

// Trainee profile → attendance tab.
await page.locator('li a[href*="tab=attendance"]').first().click();
await page.waitForTimeout(900);
await check('profile attendance');
await shot('03-profile-attendance');
const calendarDays = await page.locator('button[aria-label*=": present"]').count();
if (!calendarDays) problems.push('profile calendar shows no present days');

// Search + record a new trainee flow sanity: open trainee list search.
await page.goto(`${URL}/trainees`);
await page.waitForTimeout(700);
await shot('04-trainees');

console.log(`absent-tab pressed buttons: ${before}, present: ${presentBefore} → ${presentAfter} (reload ${afterReload}), calendar present days: ${calendarDays}`);
console.log(problems.length ? `PROBLEMS:\n${problems.join('\n')}` : 'OK — no problems');
await browser.close();
process.exit(problems.length ? 1 : 0);
