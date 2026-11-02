/**
 * Dependency-free PNG generation:
 *  • PWA icons for the admin (K7 mark rasterised from the SVG polygons)
 *  • a sample photo used by the e2e gallery upload test
 *   node make-png.mjs
 */
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

function crc32(buf) {
  let c;
  let crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

export function encodePng(w, h, pixel) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    for (let x = 0; x < w; x++) {
      const [r, g, b, a] = pixel(x, y);
      const o = y * (w * 4 + 1) + 1 + x * 4;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
      raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const inside = (pts, x, y) => {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};

// Same geometry as public/brand/k7-mark.svg (viewBox 0 0 128 120)
const MARK = [
  { pts: [[8, 16], [27, 16], [27, 104], [8, 104]], color: [255, 255, 255] },
  { pts: [[27, 58], [56, 16], [77, 16], [41, 68]], color: [255, 255, 255] },
  { pts: [[39, 62], [52, 52], [78, 104], [57, 104]], color: [213, 213, 213] },
  { pts: [[74, 16], [124, 16], [124, 30], [98, 104], [78, 104], [102, 32], [70, 32]], color: [161, 8, 37] },
];

function icon(size) {
  const pad = size * 0.2; // maskable safe zone
  const scale = (size - pad * 2) / 128;
  const offY = (size - 120 * scale) / 2;
  const SS = 3; // supersampling for smooth edges
  return encodePng(size, size, (x, y) => {
    let acc = [0, 0, 0];
    for (let sy = 0; sy < SS; sy++) {
      for (let sx = 0; sx < SS; sx++) {
        const mx = (x + (sx + 0.5) / SS - pad) / scale;
        const my = (y + (sy + 0.5) / SS - offY) / scale;
        let col = [5, 5, 5];
        for (const p of MARK) if (inside(p.pts, mx, my)) col = p.color;
        acc = acc.map((v, i) => v + col[i]);
      }
    }
    return [...acc.map((v) => Math.round(v / (SS * SS))), 255];
  });
}

writeFileSync('../admin/public/brand/icon-192.png', icon(192));
writeFileSync('../admin/public/brand/icon-512.png', icon(512));

// Sample "gym photo": dark gradient with a crimson diagonal band.
writeFileSync(
  'fixtures-photo.png',
  encodePng(800, 600, (x, y) => {
    const band = Math.abs(x - y * 1.1 - 120) < 60;
    const base = 20 + Math.round((y / 600) * 40);
    return band ? [161, 8, 37, 255] : [base, base, base + 4, 255];
  }),
);
console.log('icons + fixture written');
