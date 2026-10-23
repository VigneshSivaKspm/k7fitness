const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const baseDir = path.join(__dirname, '../public/Major_Male_Exercise_GIFs');
const backupDir = path.join(__dirname, '../../raw_exercise_gifs_backup');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const manifestPath = path.join(baseDir, 'exercise_manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

async function processAll() {
  console.log(`Starting compression for ${manifest.length} exercise GIFs...`);
  let totalOrigBytes = 0;
  let totalGifBytes = 0;
  let totalWebpBytes = 0;

  for (const item of manifest) {
    const relativePath = item.gif_filename;
    const fullInputPath = path.join(baseDir, relativePath);

    if (!fs.existsSync(fullInputPath)) {
      console.warn(`File not found: ${fullInputPath}`);
      continue;
    }

    const origStat = fs.statSync(fullInputPath);
    totalOrigBytes += origStat.size;

    // Backup original
    const backupFile = path.join(backupDir, path.basename(relativePath));
    if (!fs.existsSync(backupFile)) {
      fs.copyFileSync(fullInputPath, backupFile);
    }

    // Read file to buffer first to release file lock on Windows
    const inputBuf = fs.readFileSync(fullInputPath);

    console.log(`Processing: ${item.exercise_name} (${Math.round(origStat.size / 1024)} KB)`);

    // 1. Generate optimized WebP animated
    const webpFilename = relativePath.replace(/\.gif$/i, '.webp');
    const fullWebpPath = path.join(baseDir, webpFilename);
    const webpBuf = await sharp(inputBuf, { animated: true })
      .resize(480, 480)
      .webp({ quality: 80, effort: 4 })
      .toBuffer();
    fs.writeFileSync(fullWebpPath, webpBuf);
    totalWebpBytes += webpBuf.length;

    // 2. Generate optimized GIF (resized 440x440 with optimized palette)
    const gifBuf = await sharp(inputBuf, { animated: true })
      .resize(440, 440)
      .gif({ colours: 80, reoptimise: true, effort: 7 })
      .toBuffer();
    fs.writeFileSync(fullInputPath, gifBuf);
    totalGifBytes += gifBuf.length;


    console.log(`  -> WebP: ${Math.round(webpBuf.length / 1024)} KB | Optimized GIF: ${Math.round(gifBuf.length / 1024)} KB`);
  }

  console.log('\n================ COMPRESSION SUMMARY ================');
  console.log(`Original total size : ${Math.round(totalOrigBytes / 1024 / 1024 * 10) / 10} MB`);
  console.log(`Optimized GIF total : ${Math.round(totalGifBytes / 1024 / 1024 * 10) / 10} MB (${Math.round((1 - totalGifBytes / totalOrigBytes) * 100)}% reduction)`);
  console.log(`Animated WebP total : ${Math.round(totalWebpBytes / 1024 / 1024 * 10) / 10} MB (${Math.round((1 - totalWebpBytes / totalOrigBytes) * 100)}% reduction)`);
  console.log('All files saved directly in public/Major_Male_Exercise_GIFs/');
}

processAll().catch(err => {
  console.error('Failed to compress GIFs:', err);
  process.exit(1);
});
