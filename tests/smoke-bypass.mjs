// Quick check: the admin dev server opens straight into the dashboard (dev bypass).
import { chromium } from 'playwright';

const out = process.argv[2] || '.';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(e.message));
await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' });
await page.waitForURL('**/dashboard', { timeout: 30000 });
await page.getByText('Total trainees').waitFor({ timeout: 30000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${out}/dashboard-desktop.png`, fullPage: true });
console.log('URL:', page.url());
console.log('Console errors:', errors.length ? errors : 'none');
await browser.close();
