/**
 * Converts the source images in website/public/images into web-optimised
 * WebP files (resized to their display size) and builds the branded social
 * share image. Uses Playwright's Chromium canvas, so no extra dependencies.
 *   node optimize-images.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const DIR = resolve('../website/public/images');
const JOBS = [
  { src: '01-hero.png', out: 'hero.webp', max: 1920, q: 0.8 },
  { src: '02-about-main.png', out: 'about-main.webp', max: 1400, q: 0.8 },
  { src: '03-about-detail.png', out: 'about-detail.webp', max: 640, q: 0.8 },
  { src: '04-strength.png', out: 'program-strength.webp', max: 1000, q: 0.78 },
  { src: '05-cardio.png', out: 'program-fat-loss.webp', max: 1000, q: 0.78 },
  { src: '06-personal-training.png', out: 'program-personal-training.webp', max: 1000, q: 0.78 },
  { src: '07-transformation.png', out: 'program-transformation.webp', max: 1000, q: 0.78 },
];

const dataUrl = (file) => {
  const ext = file.split('.').pop().replace('jpg', 'jpeg').replace('svg', 'svg+xml');
  return `data:image/${ext};base64,${readFileSync(file).toString('base64')}`;
};

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<html><body></body></html>');
await page.evaluate(() => document.fonts.ready);

for (const job of JOBS) {
  const out = await page.evaluate(
    async ({ src, max, q }) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const scale = Math.min(1, max / img.naturalWidth);
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * scale);
      c.height = Math.round(img.naturalHeight * scale);
      const ctx = c.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, c.width, c.height);
      return { data: c.toDataURL('image/webp', q), w: c.width, h: c.height };
    },
    { src: dataUrl(`${DIR}/${job.src}`), max: job.max, q: job.q },
  );
  const buf = Buffer.from(out.data.split(',')[1], 'base64');
  writeFileSync(`${DIR}/${job.out}`, buf);
  console.log(`${job.out.padEnd(32)} ${out.w}x${out.h}  ${(buf.length / 1024).toFixed(0)} KB`);
}

// Branded share image: K7 mark + name on the dark left side of og-image.jpg (1200×630).
await page.setContent(`
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@600;700&display=swap" rel="stylesheet">
  <div id="c" style="position:relative;width:1200px;height:630px;overflow:hidden;background:#050505">
    <img src="${dataUrl(`${DIR}/og-image.jpg`)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
    <div style="position:absolute;left:72px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;gap:22px">
      <img src="${dataUrl(resolve('../website/public/brand/k7-mark.svg'))}" style="height:120px;width:auto;align-self:flex-start">
      <div style="font-family:'Bebas Neue';font-size:92px;line-height:.9;color:#fff;letter-spacing:2px">K7 <span style="color:#D20A35">FITNESS</span></div>
      <div style="font-family:Manrope;font-weight:700;font-size:20px;letter-spacing:9px;color:#8B8B8B">STUDIO &amp; GYM</div>
      <div style="width:64px;height:4px;background:#A10825"></div>
      <div style="font-family:'Bebas Neue';font-size:46px;color:#fff;letter-spacing:2px">TRAIN HARD. <span style="color:#D20A35">LIVE STRONG.</span></div>
    </div>
  </div>`);
await page.waitForTimeout(1500);
await page.evaluate(() => document.fonts.ready);
const og = await page.locator('#c').screenshot({ type: 'jpeg', quality: 85 });
writeFileSync(`${DIR}/og.jpg`, og);
console.log(`og.jpg (branded share image)          1200x630  ${(og.length / 1024).toFixed(0)} KB`);
await browser.close();
