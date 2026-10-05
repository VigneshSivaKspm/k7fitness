/**
 * Visual QA: screenshots + horizontal-overflow detection across viewports.
 *   ADMIN_URL=… SITE_URL=… SHOTS=dir node visual.mjs
 */
import { chromium } from 'playwright';

const ADMIN = process.env.ADMIN_URL || 'http://localhost:5174';
const SITE = process.env.SITE_URL || 'http://localhost:5173';
const SHOTS = process.env.SHOTS || '.';
const VIEWPORTS = { desktop: [1366, 900], tablet: [768, 1024], mobile: [390, 844], small: [360, 740] };

const ADMIN_PAGES = ['/dashboard', '/trainees', '/trainees/new', '/fees', '/renewals', '/workouts', '/memberships', '/enquiries', '/website', '/website/hero', '/settings', '/reports'];

const browser = await chromium.launch();
const problems = [];

async function check(page, label, shot) {
  await page.waitForTimeout(1800);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 1) problems.push(`${label}: horizontal overflow ${overflow}px`);
  if (shot) await page.screenshot({ path: `${SHOTS}/${shot}.png`, fullPage: true });
}

for (const [name, [w, h]] of Object.entries(VIEWPORTS)) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => problems.push(`${name} pageerror: ${e.message}`));

  await page.goto(SITE, { waitUntil: 'domcontentloaded' });
  await check(page, `website ${name}`, `site-${name}`);

  await page.goto(`${ADMIN}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForURL('**/dashboard', { timeout: 30000 });
  for (const path of ADMIN_PAGES) {
    await page.goto(`${ADMIN}${path}`, { waitUntil: 'domcontentloaded' });
    const shot = name === 'mobile' || (name === 'desktop' && ['/trainees', '/fees'].includes(path)) ? `admin-${name}${path.replace(/\//g, '-')}` : null;
    await check(page, `admin ${name} ${path}`, shot);
  }
  // Trainee profile (first trainee in the list)
  await page.goto(`${ADMIN}/trainees`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const first = page.locator('tbody tr:visible, li [role=button]:visible').first();
  if (await first.count()) {
    await first.click();
    await page.waitForURL(/\/trainees\/[\w-]+$/);
    await check(page, `admin ${name} profile`, name === 'mobile' || name === 'desktop' ? `admin-${name}-profile` : null);
  }
  await ctx.close();
}

console.log(problems.length ? problems.join('\n') : 'No overflow or page errors across all viewports.');
await browser.close();
