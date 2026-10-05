/**
 * Mobile QA: screenshots every admin screen at phone width and reports
 * horizontal overflow (with the offending elements) and page errors.
 *   ADMIN_URL=… SHOTS=dir WIDTH=360 node mobile-audit.mjs
 */
import { chromium } from 'playwright';

const ADMIN = process.env.ADMIN_URL || 'http://localhost:5174';
const SHOTS = process.env.SHOTS || '.';
const W = Number(process.env.WIDTH || 360);
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;

const PAGES = [
  '/dashboard', '/trainees', '/trainees/new', '/memberships', '/fees', '/fees?view=payments', '/workouts', '/workouts/new',
  '/diets', '/diets/new', '/renewals', '/enquiries', '/reports', '/settings', '/website', '/website/hero', '/website/about',
  '/website/programs', '/website/memberships', '/website/trainers', '/website/gallery', '/website/testimonials',
  '/website/offers', '/website/contact',
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: W, height: 780 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const problems = [];
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));

async function audit(label, shot) {
  await page.waitForTimeout(1600);
  const res = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const overflow = document.documentElement.scrollWidth - vw;
    const offenders = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width && r.right > vw + 1 && !el.closest('.overflow-x-auto, .overflow-hidden, [role=tablist], .no-scrollbar')) {
        offenders.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} right=${Math.round(r.right)}`);
      }
    }
    return { overflow, offenders: offenders.slice(0, 5) };
  });
  if (res.overflow > 1 || res.offenders.length) problems.push(`${label}: overflow ${res.overflow}px\n    ${res.offenders.join('\n    ')}`);
  if (shot) await page.screenshot({ path: `${SHOTS}/${shot}.png`, fullPage: true });
}

await page.goto(`${ADMIN}/`, { waitUntil: 'domcontentloaded' });
await page.waitForURL('**/dashboard', { timeout: 30000 });

for (const path of ONLY || PAGES) {
  await page.goto(`${ADMIN}${path}`, { waitUntil: 'domcontentloaded' });
  await audit(path, `m${path.replace(/[/?=]/g, '-')}`);
}

if (!ONLY) {
  // Trainee profile + edit
  await page.goto(`${ADMIN}/trainees`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const first = page.locator('li [role=button]:visible').first();
  if (await first.count()) {
    await first.click();
    await page.waitForURL(/\/trainees\/[\w-]+$/);
    await audit('profile', 'm-profile');
    for (const tab of ['membership', 'fees', 'workout', 'diet', 'history']) {
      await page.goto(`${page.url().split('?')[0]}?tab=${tab}`, { waitUntil: 'domcontentloaded' });
      await audit(`profile ${tab}`, `m-profile-${tab}`);
    }
    // Dialogs
    await page.goto(page.url().split('?')[0], { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    const renew = page.getByRole('button', { name: /Renew|Start membership/ }).first();
    if (await renew.isVisible()) {
      await renew.click();
      await audit('renew dialog', 'm-dialog-renew');
      await page.keyboard.press('Escape');
    }
  }
  // Drawer
  await page.goto(`${ADMIN}/dashboard`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: /open menu/i }).click();
  await audit('drawer', 'm-drawer');
}

console.log(problems.length ? problems.join('\n') : `No overflow or page errors at ${W}px.`);
await browser.close();
